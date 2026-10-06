import 'package:flutter/material.dart';

class AppLocalizations {
  final Locale locale;

  AppLocalizations(this.locale);

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations) ??
        AppLocalizations(const Locale('ar'));
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  static final Map<String, Map<String, String>> _localizedValues = {
    'ar': {
      'app_name': 'منصة مستر عمر مكاوي',
      'welcome': 'أهلاً بك',
      'login': 'تسجيل الدخول',
      'logout': 'تسجيل الخروج',
      'mobile_number': 'رقم الموبايل',
      'password': 'كلمة المرور',
      'login_btn': 'دخول للمنصة',
      'home': 'الرئيسية',
      'subscriptions': 'اشتراكاتي',
      'courses': 'الكورسات',
      'packages': 'الباقات الشهرية',
      'exams': 'الامتحانات',
      'profile': 'الحساب',
      'notifications': 'الإشعارات',
      'academic_year': 'السنة الدراسية',
      'continue_learning': 'تابع المشاهدة',
      'my_wallet': 'محفظتي',
      'egp': 'ج.م',
      'retry': 'إعادة المحاولة',
      'error_occurred': 'حدث خطأ ما',
      'no_data': 'لا توجد بيانات متاحة حالياً',
      'loading': 'جاري التحميل...',
      'lecture': 'محاضرة',
      'lectures': 'محاضرات',
      'exam': 'امتحان',
      'score': 'الدرجة',
      'status': 'الحالة',
      'completed': 'مكتمل',
      'in_progress': 'قيد التقدم',
      'not_started': 'لم يبدأ',
      'watch_video': 'مشاهدة الفيديو',
      'solution_video': 'فيديو الحل',
      'main_video': 'فيديو الشرح',
      'attachments': 'المذكرات والملفات',
      'submit_exam': 'تسليم الامتحان',
      'confirm_logout': 'هل أنت متأكد من تسجيل الخروج؟',
      'yes': 'نعم',
      'no': 'إلغاء',
    },
    'en': {
      'app_name': 'Mr. Omar Meckawy Platform',
      'welcome': 'Welcome',
      'login': 'Login',
      'logout': 'Logout',
      'mobile_number': 'Mobile Number',
      'password': 'Password',
      'login_btn': 'Login to Platform',
      'home': 'Home',
      'subscriptions': 'My Subscriptions',
      'courses': 'Courses',
      'packages': 'Monthly Packages',
      'exams': 'Exams',
      'profile': 'Profile',
      'notifications': 'Notifications',
      'academic_year': 'Academic Year',
      'continue_learning': 'Continue Learning',
      'my_wallet': 'My Wallet',
      'egp': 'EGP',
      'retry': 'Retry',
      'error_occurred': 'An error occurred',
      'no_data': 'No data available',
      'loading': 'Loading...',
      'lecture': 'Lecture',
      'lectures': 'Lectures',
      'exam': 'Exam',
      'score': 'Score',
      'status': 'Status',
      'completed': 'Completed',
      'in_progress': 'In Progress',
      'not_started': 'Not Started',
      'watch_video': 'Watch Video',
      'solution_video': 'Solution Video',
      'main_video': 'Main Explanation Video',
      'attachments': 'Notes & Attachments',
      'submit_exam': 'Submit Exam',
      'confirm_logout': 'Are you sure you want to logout?',
      'yes': 'Yes',
      'no': 'Cancel',
    },
  };

  String translate(String key) {
    return _localizedValues[locale.languageCode]?[key] ?? key;
  }
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) => ['ar', 'en'].contains(locale.languageCode);

  @override
  Future<AppLocalizations> load(Locale locale) async {
    return AppLocalizations(locale);
  }

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}
