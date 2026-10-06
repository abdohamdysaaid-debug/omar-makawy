import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final String? errorCode;

  ApiException(this.message, {this.statusCode, this.errorCode});

  @override
  String toString() => message;
}

class ApiService {
  static const String baseUrl = 'https://api.omarmeckawy.com/api/v1';

  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;

  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  static const String _accessTokenKey = 'secure_access_token';
  static const String _refreshTokenKey = 'secure_refresh_token';
  static const String _deviceUuidKey = 'secure_device_uuid';

  VoidCallback? onUnauthorized;

  bool _isRefreshing = false;
  Completer<bool>? _refreshCompleter;

  ApiService._internal();

  // Stable Device UUID management
  Future<String> getOrCreateDeviceUuid() async {
    try {
      String? deviceUuid = await _secureStorage.read(key: _deviceUuidKey);
      if (deviceUuid != null && deviceUuid.trim().isNotEmpty) {
        return deviceUuid.trim();
      }
      final newUuid = _generateUuidV4();
      await _secureStorage.write(key: _deviceUuidKey, value: newUuid);
      return newUuid;
    } catch (_) {
      // Fallback: generate deterministic or random UUID if secure storage fails temporarily
      return _generateUuidV4();
    }
  }

  String _generateUuidV4() {
    final random = Random.secure();
    final bytes = List<int>.generate(16, (_) => random.nextInt(256));
    // Set version to 4 (0100)
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    // Set variant to RFC 4122 (10xx)
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    final hex = bytes.map((b) => b.toRadixString(16).padLeft(2, '0')).join();
    return '${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20, 32)}';
  }

  // Secure Token Storage Methods
  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await _secureStorage.write(key: _accessTokenKey, value: accessToken);
    await _secureStorage.write(key: _refreshTokenKey, value: refreshToken);
  }

  Future<String?> getAccessToken() async {
    return await _secureStorage.read(key: _accessTokenKey);
  }

  Future<String?> getRefreshToken() async {
    return await _secureStorage.read(key: _refreshTokenKey);
  }

  Future<void> clearTokens() async {
    await _secureStorage.delete(key: _accessTokenKey);
    await _secureStorage.delete(key: _refreshTokenKey);
  }

  Future<Map<String, String>> _getHeaders({
    bool requiresAuth = true,
    String? academicYearId,
  }) async {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (requiresAuth) {
      final token = await getAccessToken();
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
    }

    if (academicYearId != null && academicYearId.isNotEmpty) {
      headers['x-academic-year-id'] = academicYearId;
    }

    return headers;
  }

  Future<dynamic> get(
    String endpoint, {
    Map<String, String>? queryParams,
    bool requiresAuth = true,
    String? academicYearId,
  }) async {
    return _sendWithRetry(
      () async {
        var uri = Uri.parse('$baseUrl$endpoint');
        if (queryParams != null && queryParams.isNotEmpty) {
          uri = uri.replace(queryParameters: queryParams);
        }
        final headers = await _getHeaders(
          requiresAuth: requiresAuth,
          academicYearId: academicYearId,
        );
        return await http
            .get(uri, headers: headers)
            .timeout(const Duration(seconds: 25));
      },
      requiresAuth: requiresAuth,
    );
  }

  Future<dynamic> post(
    String endpoint, {
    dynamic body,
    bool requiresAuth = true,
    String? academicYearId,
  }) async {
    return _sendWithRetry(
      () async {
        final uri = Uri.parse('$baseUrl$endpoint');
        final headers = await _getHeaders(
          requiresAuth: requiresAuth,
          academicYearId: academicYearId,
        );
        return await http
            .post(
              uri,
              headers: headers,
              body: body != null ? jsonEncode(body) : null,
            )
            .timeout(const Duration(seconds: 25));
      },
      requiresAuth: requiresAuth,
    );
  }

  Future<dynamic> patch(
    String endpoint, {
    dynamic body,
    bool requiresAuth = true,
    String? academicYearId,
  }) async {
    return _sendWithRetry(
      () async {
        final uri = Uri.parse('$baseUrl$endpoint');
        final headers = await _getHeaders(
          requiresAuth: requiresAuth,
          academicYearId: academicYearId,
        );
        return await http
            .patch(
              uri,
              headers: headers,
              body: body != null ? jsonEncode(body) : null,
            )
            .timeout(const Duration(seconds: 25));
      },
      requiresAuth: requiresAuth,
    );
  }

  Future<dynamic> delete(
    String endpoint, {
    dynamic body,
    bool requiresAuth = true,
    String? academicYearId,
  }) async {
    return _sendWithRetry(
      () async {
        final uri = Uri.parse('$baseUrl$endpoint');
        final headers = await _getHeaders(
          requiresAuth: requiresAuth,
          academicYearId: academicYearId,
        );
        return await http
            .delete(
              uri,
              headers: headers,
              body: body != null ? jsonEncode(body) : null,
            )
            .timeout(const Duration(seconds: 25));
      },
      requiresAuth: requiresAuth,
    );
  }

  Future<dynamic> _sendWithRetry(
    Future<http.Response> Function() requestFn, {
    required bool requiresAuth,
  }) async {
    try {
      final response = await requestFn();

      if (response.statusCode == 401 && requiresAuth) {
        final refreshed = await _handleTokenRefresh();
        if (refreshed) {
          final retryResponse = await requestFn();
          return _processResponse(retryResponse);
        } else {
          await clearTokens();
          onUnauthorized?.call();
          throw ApiException('انتهت صلاحية الجلسة، برجاء تسجيل الدخول مجدداً',
              statusCode: 401, errorCode: 'UNAUTHORIZED');
        }
      }

      return _processResponse(response);
    } on SocketException {
      throw ApiException('لا يوجد اتصال بالإنترنت، يرجى التحقق من الشبكة');
    } on TimeoutException {
      throw ApiException('انتهت مهلة الطلب، يرجى المحاولة لاحقاً');
    } on ApiException {
      rethrow;
    } catch (e) {
      throw ApiException('حدث خطأ غير متوقع: ${e.toString()}');
    }
  }

  Future<bool> _handleTokenRefresh() async {
    if (_isRefreshing) {
      return await _refreshCompleter!.future;
    }

    _isRefreshing = true;
    _refreshCompleter = Completer<bool>();

    try {
      final refreshToken = await getRefreshToken();
      if (refreshToken == null || refreshToken.isEmpty) {
        _finishRefresh(false);
        return false;
      }

      final uri = Uri.parse('$baseUrl/auth/refresh');
      final response = await http
          .post(
            uri,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: jsonEncode({'refresh_token': refreshToken}),
          )
          .timeout(const Duration(seconds: 15));

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        final tokenData = data['data'] ?? data;
        final newAccessToken = tokenData['access_token'] ?? tokenData['accessToken'];
        final newRefreshToken =
            tokenData['refresh_token'] ?? tokenData['refreshToken'] ?? refreshToken;

        if (newAccessToken != null) {
          await saveTokens(
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          );
          _finishRefresh(true);
          return true;
        }
      }

      _finishRefresh(false);
      return false;
    } catch (e) {
      _finishRefresh(false);
      return false;
    }
  }

  void _finishRefresh(bool success) {
    _isRefreshing = false;
    _refreshCompleter?.complete(success);
  }

  dynamic _processResponse(http.Response response) {
    dynamic body;
    try {
      body = jsonDecode(response.body);
    } catch (_) {
      body = null;
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (body is Map<String, dynamic>) {
        if (body.containsKey('data')) {
          return body['data'];
        }
      }
      return body;
    }

    String errorMessage = 'حدث خطأ في الخادم';
    String? errorCode;

    if (body is Map<String, dynamic>) {
      final msg = body['message'];
      if (msg is List) {
        errorMessage = msg.map((e) => e.toString()).join('\n');
      } else if (msg != null && msg.toString().isNotEmpty) {
        errorMessage = msg.toString();
      } else {
        errorMessage = body['error']?.toString() ?? errorMessage;
      }
      errorCode = body['error_code']?.toString();
    }

    throw ApiException(
      errorMessage,
      statusCode: response.statusCode,
      errorCode: errorCode,
    );
  }
}
