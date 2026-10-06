import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../models/academic_year.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();

  UserModel? _currentUser;
  bool _isLoading = false;
  bool _isInitialLoading = true;
  String? _errorMessage;
  String? _selectedAcademicYearId;
  List<AcademicYear> _academicYears = [];

  UserModel? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  bool get isInitialLoading => _isInitialLoading;
  bool get isAuthenticated => _currentUser != null;
  String? get errorMessage => _errorMessage;
  String? get selectedAcademicYearId => _selectedAcademicYearId ?? _currentUser?.academicYearId;
  List<AcademicYear> get academicYears => _academicYears;

  AuthProvider() {
    _apiService.onUnauthorized = _handleUnauthorized;
    _checkAuth();
  }

  void _handleUnauthorized() {
    _currentUser = null;
    _selectedAcademicYearId = null;
    notifyListeners();
  }

  Future<void> _checkAuth() async {
    _isInitialLoading = true;
    notifyListeners();

    try {
      final token = await _apiService.getAccessToken();
      if (token != null && token.isNotEmpty) {
        await fetchCurrentUser();
      }
    } catch (_) {
      await _apiService.clearTokens();
      _currentUser = null;
    } finally {
      _isInitialLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchAcademicYears() async {
    try {
      final data = await _apiService.get('/auth/academic-years', requiresAuth: false);
      if (data is List) {
        _academicYears = data
            .map((item) => AcademicYear.fromJson(item as Map<String, dynamic>))
            .where((year) => year.isActive)
            .toList();
        _academicYears.sort((a, b) => a.orderIndex.compareTo(b.orderIndex));
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Failed to load academic years: $e');
    }
  }

  Future<bool> login(String phone, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final deviceUuid = await _apiService.getOrCreateDeviceUuid();

      final payload = <String, dynamic>{
        'phone': phone.trim(),
        'password': password,
        'device_uuid': deviceUuid,
        'device_type': 'ANDROID',
        'os_info': 'Android',
        'model_name': 'Android Mobile Device',
      };

      final response = await _apiService.post(
        '/auth/login',
        body: payload,
        requiresAuth: false,
      );

      String? accessToken;
      String? refreshToken;

      if (response is Map<String, dynamic>) {
        final tokens = response['tokens'] is Map<String, dynamic>
            ? response['tokens'] as Map<String, dynamic>
            : response;
        accessToken = tokens['access_token']?.toString() ??
            tokens['accessToken']?.toString() ??
            response['token']?.toString();
        refreshToken = tokens['refresh_token']?.toString() ??
            tokens['refreshToken']?.toString() ??
            '';

        if (response['user'] is Map<String, dynamic>) {
          _currentUser = UserModel.fromJson(response['user'] as Map<String, dynamic>);
        }
      }

      if (accessToken != null && accessToken.isNotEmpty) {
        await _apiService.saveTokens(
          accessToken: accessToken,
          refreshToken: refreshToken ?? '',
        );
        await fetchCurrentUser();
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        throw ApiException('استجابة غير صحيحة من الخادم');
      }
    } on ApiException catch (e) {
      _errorMessage = e.message;
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _errorMessage = 'حدث خطأ في الاتصال بالخادم';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> fetchCurrentUser() async {
    try {
      final data = await _apiService.get('/auth/me');
      if (data is Map<String, dynamic>) {
        _currentUser = UserModel.fromJson(data);
        if (_currentUser?.academicYearId != null) {
          _selectedAcademicYearId = _currentUser!.academicYearId;
        }
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Failed to fetch user profile: $e');
      rethrow;
    }
  }

  Future<void> refreshProfile() async {
    if (isAuthenticated) {
      try {
        await fetchCurrentUser();
      } catch (_) {}
    }
  }

  void selectAcademicYear(String yearId) {
    // If student has a fixed assigned academic year, prevent changing to unauthorized stages
    if (_currentUser != null && _currentUser!.academicYearId != null) {
      _selectedAcademicYearId = _currentUser!.academicYearId;
    } else {
      _selectedAcademicYearId = yearId;
    }
    notifyListeners();
  }

  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();

    try {
      await _apiService.post('/auth/logout');
    } catch (_) {
      // Ignore network errors on logout
    } finally {
      await _apiService.clearTokens();
      _currentUser = null;
      _selectedAcademicYearId = null;
      _isLoading = false;
      notifyListeners();
    }
  }
}
