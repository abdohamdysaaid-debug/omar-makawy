import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../config/theme.dart';
import '../models/package_model.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../widgets/app_header.dart';
import 'package_detail_screen.dart';

class PackagesScreen extends StatefulWidget {
  const PackagesScreen({super.key});

  @override
  State<PackagesScreen> createState() => _PackagesScreenState();
}

class _PackagesScreenState extends State<PackagesScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  String? _errorMessage;
  List<PackageModel> _packages = [];

  @override
  void initState() {
    super.initState();
    _fetchPackages();
  }

  Future<void> _fetchPackages() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final yearId = auth.selectedAcademicYearId;

    try {
      final query = <String, String>{};
      if (yearId != null && yearId.isNotEmpty) {
        query['academic_year_id'] = yearId;
      }

      final response = await _apiService.get('/packages', queryParams: query);
      List<PackageModel> list = [];
      if (response is List) {
        list = response.map((item) => PackageModel.fromJson(item as Map<String, dynamic>)).toList();
      }

      if (mounted) {
        setState(() {
          _packages = list;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: const AppHeader(
        title: 'الباقات الشهرية',
        showBackButton: false,
      ),
      body: RefreshIndicator(
        onRefresh: _fetchPackages,
        color: AppColors.primary,
        child: _isLoading
            ? const Center(
                child: CircularProgressIndicator(
                  color: AppColors.primary,
                  strokeWidth: 2.8,
                ),
              )
            : _errorMessage != null
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.error_outline_rounded, size: 48, color: AppColors.error),
                          const SizedBox(height: 14),
                          Text(_errorMessage!, textAlign: TextAlign.center),
                          const SizedBox(height: 18),
                          ElevatedButton(
                            onPressed: _fetchPackages,
                            child: const Text('إعادة المحاولة'),
                          ),
                        ],
                      ),
                    ),
                  )
                : _packages.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(20),
                              decoration: BoxDecoration(
                                color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                Icons.view_carousel_rounded,
                                size: 48,
                                color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                              ),
                            ),
                            const SizedBox(height: 14),
                            Text(
                              'لا توجد باقات شهرية متاحة حالياً',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                              ),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                        itemCount: _packages.length,
                        itemBuilder: (context, index) {
                          final pkg = _packages[index];
                          return Container(
                            margin: const EdgeInsets.only(bottom: 16),
                            decoration: BoxDecoration(
                              color: isDark ? AppColors.darkCard : AppColors.lightCard,
                              borderRadius: BorderRadius.circular(22),
                              border: Border.all(
                                color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                                width: 1.2,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(isDark ? 0.25 : 0.04),
                                  blurRadius: 14,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(22),
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => PackageDetailScreen(packageId: pkg.id),
                                  ),
                                ).then((_) => _fetchPackages());
                              },
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  ClipRRect(
                                    borderRadius: const BorderRadius.vertical(top: Radius.circular(21)),
                                    child: Container(
                                      height: 130,
                                      width: double.infinity,
                                      color: const Color(0xFF8B5CF6).withOpacity(0.12),
                                      child: Stack(
                                        fit: StackFit.expand,
                                        children: [
                                          pkg.thumbnailUrl != null && pkg.thumbnailUrl!.isNotEmpty
                                              ? CachedNetworkImage(
                                                  imageUrl: pkg.thumbnailUrl!,
                                                  fit: BoxFit.cover,
                                                  errorWidget: (_, __, ___) => const Icon(
                                                    Icons.view_carousel_rounded,
                                                    color: Color(0xFF8B5CF6),
                                                    size: 44,
                                                  ),
                                                )
                                              : const Icon(
                                                  Icons.view_carousel_rounded,
                                                  color: Color(0xFF8B5CF6),
                                                  size: 44,
                                                ),
                                          Positioned(
                                            top: 12,
                                            right: 12,
                                            child: Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                              decoration: BoxDecoration(
                                                gradient: AppColors.goldGradient,
                                                borderRadius: BorderRadius.circular(12),
                                                boxShadow: [
                                                  BoxShadow(
                                                    color: Colors.black.withOpacity(0.3),
                                                    blurRadius: 8,
                                                  ),
                                                ],
                                              ),
                                              child: Text(
                                                '${pkg.price} ج.م',
                                                style: const TextStyle(
                                                  color: Colors.white,
                                                  fontSize: 13,
                                                  fontWeight: FontWeight.w900,
                                                ),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                  Padding(
                                    padding: const EdgeInsets.all(16),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          pkg.name,
                                          style: TextStyle(
                                            fontWeight: FontWeight.w900,
                                            fontSize: 16,
                                            color: isDark ? Colors.white : AppColors.textDark,
                                            letterSpacing: -0.3,
                                          ),
                                        ),
                                        if (pkg.description != null && pkg.description!.isNotEmpty) ...[
                                          const SizedBox(height: 6),
                                          Text(
                                            pkg.description!,
                                            style: TextStyle(
                                              fontSize: 13,
                                              color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                                              height: 1.4,
                                            ),
                                            maxLines: 2,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ],
                                        const SizedBox(height: 12),
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Row(
                                              children: [
                                                const Icon(Icons.school_outlined, size: 14, color: AppColors.primary),
                                                const SizedBox(width: 6),
                                                Text(
                                                  pkg.academicYearName ?? 'المرحلة الدراسية',
                                                  style: TextStyle(
                                                    fontSize: 12,
                                                    fontWeight: FontWeight.w700,
                                                    color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                                                  ),
                                                ),
                                              ],
                                            ),
                                            Row(
                                              children: [
                                                Text(
                                                  'عرض التفاصيل',
                                                  style: TextStyle(
                                                    fontSize: 12.5,
                                                    fontWeight: FontWeight.w800,
                                                    color: AppColors.primary,
                                                  ),
                                                ),
                                                const SizedBox(width: 4),
                                                const Icon(Icons.arrow_forward_ios_rounded, size: 12, color: AppColors.primary),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
      ),
    );
  }
}
