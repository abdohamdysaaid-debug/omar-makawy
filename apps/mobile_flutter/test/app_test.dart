import 'package:flutter_test/flutter_test.dart';
import 'package:omar_makawy_student/models/user_model.dart';
import 'package:omar_makawy_student/models/course_model.dart';
import 'package:omar_makawy_student/models/package_model.dart';
import 'package:omar_makawy_student/models/exam_model.dart';
import 'package:omar_makawy_student/models/subscription_model.dart';

void main() {
  group('Data Models Parity Tests', () {
    test('UserModel parse json with academic year and wallet balance', () {
      final json = {
        'id': 'usr-123',
        'full_name': 'أحمد محمد',
        'phone': '01012345678',
        'role': 'STUDENT',
        'academic_year': {
          'id': 'year-1',
          'name_ar': 'الصف الثالث الثانوي',
        },
        'wallet_balance': 150.0,
      };

      final user = UserModel.fromJson(json);
      expect(user.id, 'usr-123');
      expect(user.name, 'أحمد محمد');
      expect(user.mobileNumber, '01012345678');
      expect(user.academicYearId, 'year-1');
      expect(user.walletBalance, 150.0);
    });

    test('UserModel parse backend /auth/me student_profile format', () {
      final meJson = {
        'id': 'usr-456',
        'full_name': 'سارة أحمد',
        'phone': '01123456789',
        'role': 'STUDENT',
        'status': 'ACTIVE',
        'student_profile': {
          'academic_year_id': 'ay-3',
          'academic_year_name_ar': 'الصف الثاني الثانوي',
          'wallet_balance': 250.0,
          'guardian_phone': '01234567890',
          'governorate_name_ar': 'القاهرة',
        }
      };

      final user = UserModel.fromJson(meJson);
      expect(user.id, 'usr-456');
      expect(user.name, 'سارة أحمد');
      expect(user.mobileNumber, '01123456789');
      expect(user.academicYearId, 'ay-3');
      expect(user.academicYearName, 'الصف الثاني الثانوي');
      expect(user.walletBalance, 250.0);
      expect(user.parentMobileNumber, '01234567890');
      expect(user.governorate, 'القاهرة');
    });

    test('CourseModel parse json with lectures', () {
      final json = {
        'id': 'crs-1',
        'name': 'كورس التفاضل والتكامل',
        'price': 200,
        'discount_price': 150,
        'lectures_count': 5,
        'lectures': [
          {
            'id': 'lec-1',
            'title': 'المحاضرة الأولى: النهايات',
            'duration_minutes': 45,
            'is_free': true,
          }
        ]
      };

      final course = CourseModel.fromJson(json);
      expect(course.id, 'crs-1');
      expect(course.price, 200.0);
      expect(course.discountPrice, 150.0);
      expect(course.lectures.length, 1);
      expect(course.lectures[0].title, 'المحاضرة الأولى: النهايات');
      expect(course.lectures[0].isFree, true);
    });

    test('PackageModel parse json with month number and courses', () {
      final json = {
        'id': 'pkg-1',
        'name': 'باقة شهر أكتوبر',
        'price': 350,
        'month_number': 10,
        'courses': [],
      };

      final pkg = PackageModel.fromJson(json);
      expect(pkg.id, 'pkg-1');
      expect(pkg.monthNumber, 10);
      expect(pkg.price, 350.0);
    });

    test('ExamModel parse json with questions and passing criteria', () {
      final json = {
        'id': 'ex-1',
        'title': 'امتحان الجبر والمصفوفات',
        'duration_minutes': 60,
        'total_score': 100,
        'passing_score': 50,
        'questions': [
          {
            'id': 'q-1',
            'text': 'ما هي قيمة محدد المصفوفة؟',
            'score': 5,
            'options': [
              {'id': 'opt-1', 'text': 'صفر'},
              {'id': 'opt-2', 'text': 'واحد'},
            ],
          }
        ]
      };

      final exam = ExamModel.fromJson(json);
      expect(exam.id, 'ex-1');
      expect(exam.durationMinutes, 60);
      expect(exam.questions.length, 1);
      expect(exam.questions[0].options.length, 2);
    });

    test('SubscriptionModel parse json', () {
      final json = {
        'id': 'sub-1',
        'item_type': 'COURSE',
        'item_id': 'crs-1',
        'item_name': 'كورس الاستاتيكا',
        'status': 'ACTIVE',
        'price_paid': 150,
      };

      final sub = SubscriptionModel.fromJson(json);
      expect(sub.itemType, 'COURSE');
      expect(sub.itemName, 'كورس الاستاتيكا');
      expect(sub.status, 'ACTIVE');
    });
  });
}
