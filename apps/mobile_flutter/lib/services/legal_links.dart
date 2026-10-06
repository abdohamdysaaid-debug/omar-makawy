import 'package:url_launcher/url_launcher.dart';

class LegalLinks {
  static final Uri privacyPolicy = Uri.parse('https://omarmeckawy.com/privacy-policy/');
  static final Uri deleteAccount = Uri.parse('https://omarmeckawy.com/delete-account/');

  static Future<void> openPrivacyPolicy() async {
    await launchUrl(privacyPolicy, mode: LaunchMode.externalApplication);
  }

  static Future<void> openDeleteAccount() async {
    await launchUrl(deleteAccount, mode: LaunchMode.externalApplication);
  }
}
