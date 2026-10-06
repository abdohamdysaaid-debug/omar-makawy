# 📱 تطبيق منصة مستر عمر مكاوي (نسخة Flutter)

تطبيق الموبايل الرسمي لمنصة **مستر عمر مكاوي** للطلاب، تم بناؤه بالكامل باستخدام **Flutter** بأحدث المعايير البرمجية والتصميم المتجاوب مع اللغة العربية (RTL) والـ Dark & Light Mode.

---

## 🎯 معلومات التطبيق الأساسية
- **اسم التطبيق**: منصة مستر عمر مكاوي
- **Package Name / Application ID**: `com.omarmakawy.student`
- **الإصدار (Version)**: `1.0.0`
- **رقم البناء (Version Code)**: `1` (`1.0.0+1`)
- **الخادم الإنتاجي (Production API)**: `https://api.omarmeckawy.com/api/v1`

---

## 📂 الهيكل المعماري للمشروع
```
apps/mobile_flutter/
├── android/
│   ├── app/
│   │   ├── build.gradle        # إعدادات الحزمة com.omarmakawy.student
│   │   └── src/main/AndroidManifest.xml
├── lib/
│   ├── config/
│   │   └── theme.dart          # ثيمات التطبيق (Dark/Light) وألوان الهوية البصرية
│   ├── models/
│   │   ├── academic_year.dart  # نموذج المراحل الدراسية
│   │   ├── course_model.dart   # نموذج الكورسات والمحاضرات
│   │   ├── package_model.dart  # نموذج الباقات الشهرية
│   │   ├── notification_model.dart # نموذج الإشعارات
│   │   └── user_model.dart     # نموذج بيانات الطالب
│   ├── providers/
│   │   ├── auth_provider.dart  # إدارة جلسة الدخول والمصادقة
│   │   └── theme_provider.dart # إدارة تبديل الثيم الليلي/النهاري
│   ├── services/
│   │   └── api_service.dart    # عميل HTTP للاتصال بـ NestJS API وتمرير Bearer Token
│   ├── widgets/
│   │   ├── academic_year_selector.dart # فلتر اختيار المرحلة الدراسية
│   │   └── app_header.dart     # الشريط العلوي مع عداد الإشعارات وتبديل الثيم
│   ├── screens/
│   │   ├── login_screen.dart   # شاشة تسجيل الدخول والتحقق
│   │   ├── home_screen.dart    # الشاشة الرئيسية وأحدث الكورسات والباقات
│   │   ├── courses_screen.dart # شاشة تصفح والبحث في الكورسات
│   │   ├── packages_screen.dart# شاشة الباقات الشهرية والعروض
│   │   ├── notifications_screen.dart # شاشة مركز الإشعارات
│   │   ├── profile_screen.dart # شاشة الحساب، الإعدادات، وتسجيل الخروج
│   │   └── main_navigation_screen.dart # شريط التنقل السفلي
│   └── main.dart               # نقطة الانطلاق الرئيسية للتطبيق
└── pubspec.yaml                # ملف التبعيات والمكتبات
```

---

## 🚀 كيفية التشغيل والبناء (Commands)

### 1. تثبيت الحزم (Get Dependencies):
```bash
flutter pub get
```

### 2. تشغيل التطبيق في وضع التطوير (Debug):
```bash
flutter run
```

### 3. بناء ملف APK للتجربة (Release APK):
```bash
flutter build apk --release
```
*المسار الناتج:* `build/app/outputs/flutter-apk/app-release.apk`

### 4. بناء حزمة أندرويد لمتجر جوجل بلاي (Production Android App Bundle - .aab):
```bash
flutter build appbundle --release
```
*المسار الناتج:* `build/app/outputs/bundle/release/app-release.aab`
