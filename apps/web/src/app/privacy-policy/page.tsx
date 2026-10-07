import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: { absolute: 'Privacy Policy | سياسة الخصوصية - Mr. Omar Makawy Educational Platform' },
  description: 'Privacy Policy and Data Safety declaration for Mr. Omar Makawy Educational Platform and Mobile Application.',
  alternates: { canonical: '/privacy-policy/' },
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#f8fafc] px-4 py-10 font-cairo dark:bg-stone-950 sm:py-16">
      <article className="mx-auto max-w-4xl rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-12">
        {/* Header */}
        <header className="mb-10 border-b border-stone-200 pb-8 dark:border-stone-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                منصة تعليمية رسمية
              </span>
              <h1 className="mt-3 text-3xl font-black text-gray-950 dark:text-white sm:text-4xl">
                سياسة الخصوصية | Privacy Policy
              </h1>
              <p className="mt-2 text-base font-semibold text-emerald-700 dark:text-emerald-400">
                منصة الأستاذ عمر مكاوي التعليمية — Mr. Omar Makawy Educational Platform
              </p>
            </div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              <p>تاريخ آخر تحديث:</p>
              <p className="font-bold text-gray-700 dark:text-gray-300">7 أكتوبر 2026</p>
              <p className="text-xs text-gray-400">October 7, 2026</p>
            </div>
          </div>
        </header>

        {/* Overview Banner */}
        <div className="mb-10 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 leading-8 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">
          <p className="font-bold">
            مرحباً بك في منصة الأستاذ عمر مكاوي (Mr. Omar Makawy) التعليمية المتخصصة في تدريس اللغة الإنجليزية. تلتزم المنصة بحماية خصوصية وأمان بيانات الطلاب وأولياء الأمور وفقاً لأعلى المعايير، وامتثالاً لسياسات بيانات المستخدم في Google Play (Google Play User Data & Data Safety Policies).
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-10 text-gray-800 dark:text-gray-200">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-black text-emerald-800 dark:text-emerald-300">
              1. الجهة المسؤولة ونطاق التطبيق (Scope & Data Controller)
            </h2>
            <p className="leading-8">
              تنطبق هذه السياسة على تطبيق الهاتف الذكي (Android App: <code className="rounded bg-stone-100 px-1.5 py-0.5 text-sm dark:bg-stone-800">com.omarmakawy.student</code>) وعلى الموقع الإلكتروني والخدمات التعليمية التابعة لمنصة الأستاذ عمر مكاوي التعليمية.
            </p>
            <p className="leading-8">
              الجهة المسؤولة عن معالجة البيانات هي: <strong>إدارة منصة الأستاذ عمر مكاوي التعليمية</strong>. للتواصل بشأن الخصوصية وحماية البيانات: <a href="mailto:support@omarmakawy.com" className="font-bold text-emerald-700 underline dark:text-emerald-400">support@omarmakawy.com</a>.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-xl font-black text-emerald-800 dark:text-emerald-300">
              2. البيانات التي يتم جمعها وسبب الجمع (Data Collected & Purpose)
            </h2>
            <p className="leading-8">
              نقوم بجمع الحد الأدنى الضروري من البيانات فقط لتقديم الخدمة التعليمية بكفاءة وأمان:
            </p>
            <div className="space-y-3">
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-900/50">
                <h3 className="font-bold text-gray-900 dark:text-white">أ. البيانات الشخصية وبيانات الحساب (Personal & Account Data)</h3>
                <ul className="mt-2 list-disc space-y-1.5 pe-6 leading-7 text-sm">
                  <li><strong>اسم الطالب الثلاثي / الرباعي:</strong> لعرض هوية الطالب داخل حسابه وعلى نتائج الاختبارات.</li>
                  <li><strong>رقم الهاتف المحمول (11 رقم):</strong> المعرف الأساسي لتسجيل الدخول، والتحقق، ومكافحة الحسابات المكررة.</li>
                  <li><strong>رقم واتساب ورقم ولي الأمر:</strong> للمتابعة الدراسية وإرسال تقارير الدرجات والتنبيهات التعليمية الهامة.</li>
                  <li><strong>البريد الإلكتروني (اختياري):</strong> للتواصل الفني واستعادة بيانات الدخول عند الحاجة.</li>
                  <li><strong>الصف والمرحلة الدراسية والمحافظة:</strong> لتخصيص المنهج التعليمي والكورسات والاختبارات المناسبة لصف الطالب الدراسي.</li>
                </ul>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-900/50">
                <h3 className="font-bold text-gray-900 dark:text-white">ب. بيانات الأمان وتسجيل الدخول (Security & Device Info)</h3>
                <ul className="mt-2 list-disc space-y-1.5 pe-6 leading-7 text-sm">
                  <li><strong>كلمة المرور:</strong> تُخزن على خوادمنا في صورة مشفرة ومجزأة غير قابلة للقراءة (Argon2 Hashed).</li>
                  <li><strong>معرّف الجهاز الثابت (Device UUID):</strong> ينشئه التطبيق تلقائياً برمجياً لربط حساب الطالب بجهازه المصرح به ومنع تسريب الحسابات.</li>
                  <li><strong>رموز الجلسة (Session Tokens):</strong> تُخزن داخل الذاكرة الآمنة للجهاز (Android Encrypted Keystore / FlutterSecureStorage).</li>
                </ul>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-900/50">
                <h3 className="font-bold text-gray-900 dark:text-white">ج. بيانات الاستخدام والنشاط التعليمي (Educational Activity Data)</h3>
                <ul className="mt-2 list-disc space-y-1.5 pe-6 leading-7 text-sm">
                  <li><strong>سجل مشاهدة المحاضرات والـ Heartbeat:</strong> لحفظ نسبة تقدم الطالب في الدروس واستئناف المشاهدة.</li>
                  <li><strong>إجابات ونتائج الامتحانات:</strong> لتصحيح الاختبارات، واستخراج الدرجات، وإظهار تقييم المستوى للطالب وولي الأمر.</li>
                  <li><strong>سجل الاشتراكات وتفعيل الأكواد:</strong> لإدارة الصلاحيات وتمكين الوصول للمحتوى المشترك فيه.</li>
                </ul>
              </div>
            </div>
            <p className="text-sm font-semibold text-stone-600 dark:text-stone-400">
              * التطبيق لا يطلب ولا يصل إلى: الموقع الجغرافي (GPS)، جهات الاتصال (Contacts)، الكاميرا، الميكروفون، أو مساحة التخزين الخاصة بالصور الشخصية.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-black text-emerald-800 dark:text-emerald-300">
              3. مشاركة البيانات والأطراف الثالثة (Third-Party Services)
            </h2>
            <p className="leading-8">
              نحن <strong>لا نبيع</strong> بيانات الطلاب ولا نشاركها مع أي وسيط تجاري أو جهات تسويقية إطلاقاً. تقتصر المشاركة على الأطراف التقنية الضرورية لتشغيل المنصة:
            </p>
            <ul className="list-disc space-y-2 pe-6 leading-8">
              <li><strong>مشغل فيديوهات YouTube (YouTube Player API):</strong> لعرض الشروحات والمحاضرات التعليمية. عند تشغيل الفيديو تسري شروط خدمة وخصوصية Google/YouTube.</li>
              <li><strong>الخوادم والبنية السحابية:</strong> خوادم استضافة آمنة ومحمية تستخدم لتخزين قواعد بيانات المنصة السحابية.</li>
              <li><strong>شبكات الإعلانات:</strong> التطبيق <strong>لا يحتوي</strong> على أي إعلانات تجارية (Ad-free) ولا يستخدم SDKs إعلانية أو تتبعية مثل AdMob أو Facebook SDK.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-black text-emerald-800 dark:text-emerald-300">
              4. حماية وتشفير البيانات (Data Security & Encryption)
            </h2>
            <ul className="list-disc space-y-2 pe-6 leading-8">
              <li><strong>التشفير أثناء النقل (Encryption in Transit):</strong> جميع الاتصالات بين تطبيق الموبايل والخوادم مشفرة بالكامل عبر بروتوكول HTTPS المشفر بمعايير TLS 1.3 الحديثة.</li>
              <li><strong>التخزين المحلي الآمن (On-Device Security):</strong> يتم حفظ رموز المصادقة الحساسة داخل Android Keystore الآمن عبر تقنية FlutterSecureStorage.</li>
              <li><strong>صلاحيات محدودة (RBAC):</strong> لا يمكن لأحد الوصول إلى سجلات الطلاب إلا المدرس وفريق الإدارة والدعم المصرح لهم فقط.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-black text-emerald-800 dark:text-emerald-300">
              5. مدة الاحتفاظ بالبيانات (Data Retention)
            </h2>
            <p className="leading-8">
              يتم الاحتفاظ ببيانات حساب الطالب ونشاطه طوال فترة اشتراكه واستخدامه الفعلي للمنصة خلال العام الدراسي. عند التخرج أو الانقطاع أو بناءً على طلب رسمي لحذف الحساب، يتم حذف كافة البيانات الشخصية وسجلات النشاط من قواعد البيانات بصورة نهائية خلال 30 يوماً من تأكيد الطلب.
            </p>
          </section>

          {/* Section 6 - Account and Data Deletion */}
          <section id="deletion" className="space-y-4 rounded-2xl border border-rose-200 bg-rose-50/60 p-6 dark:border-rose-900/60 dark:bg-rose-950/30">
            <h2 className="text-xl font-black text-rose-900 dark:text-rose-200">
              6. طلب حذف الحساب والبيانات (Account and Data Deletion)
            </h2>
            <p className="leading-8 text-rose-950 dark:text-rose-100">
              يحق لأي طالب أو ولي أمر طلب الحذف الكامل والنهائي للحساب وجميع البيانات المرتبطة به في أي وقت، ودون الحاجة لتسجيل الدخول إلى التطبيق.
            </p>
            <div className="rounded-xl bg-white p-4 dark:bg-stone-900">
              <h3 className="font-bold text-gray-900 dark:text-white">خطوات إرسال طلب الحذف:</h3>
              <ol className="mt-2 list-decimal space-y-2 pe-6 leading-7 text-sm text-gray-700 dark:text-gray-300">
                <li>زيارة صفحة <Link href="/delete-account/" className="font-bold text-emerald-700 underline dark:text-emerald-400">طلب حذف الحساب والبيانات</Link> المتاحة للعامة.</li>
                <li>أو مراسلتنا مباشرة عبر البريد الإلكتروني: <a href="mailto:support@omarmakawy.com?subject=%D8%B7%D9%84%D8%A8%20%D8%AD%D8%B0%D9%81%20%D8%AD%D8%B3%D8%A7%D8%A8" className="font-bold text-rose-700 underline dark:text-rose-400">support@omarmakawy.com</a> متضمناً رقم هاتف الحساب واسم الطالب.</li>
                <li>سيقوم فريق الدعم بالتحقق من ملكية الحساب وتنفيذ عملية المسح الكامل للبيانات خلال مدة أقصاها 30 يوماً.</li>
              </ol>
            </div>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl font-black text-emerald-800 dark:text-emerald-300">
              7. بيانات الطلاب القُصّر (Children & Minor Students Policy)
            </h2>
            <p className="leading-8">
              المنصة موجهة للطلاب في مراحل التعليم الإعدادي والثانوي (الفئة العمرية من 13 إلى 18 عاماً وما فوق). نحن نلزم بتسجيل رقم هاتف ولي الأمر ضمن بيانات الطالب، ونحث أولياء الأمور على مراجعة هذه السياسة والإشراف على استخدام أبنائهم للمنصة. في حال رغبة ولي الأمر في مراجعة أو تعديل أو حذف بيانات ابنه، يسعدنا تواصله معنا عبر بريد الدعم.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-xl font-black text-emerald-800 dark:text-emerald-300">
              8. الإشعارات (Push Notifications)
            </h2>
            <p className="leading-8">
              يستخدم التطبيق نظام الإشعارات لإرسال تنبيهات خدمية وتعليمية فقط (مثل: نزول حصة جديدة، اقتراب موعد امتحان، أو رسائل المتابعة الدراسية). يمكن للطالب تعطيل الإشعارات في أي وقت من خلال إعدادات هاتفه.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className="text-xl font-black text-emerald-800 dark:text-emerald-300">
              9. التحديثات والتواصل (Updates & Contact Information)
            </h2>
            <p className="leading-8">
              نحتفظ بالحق في تحديث سياسة الخصوصية هذه لمواكبة التحديثات البرمجية أو المتطلبات القانونية. يُنشر أي تعديل على هذه الصفحة مباشرة.
            </p>
            <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm leading-7 dark:border-stone-800 dark:bg-stone-900/50">
              <p><strong>المنصة:</strong> منصة الأستاذ عمر مكاوي التعليمية (Mr. Omar Makawy Educational Platform)</p>
              <p><strong>الموقع الرسمي:</strong> <a href="https://omarmeckawy.com" className="font-bold text-emerald-700 underline dark:text-emerald-400">https://omarmeckawy.com</a></p>
              <p><strong>البريد الإلكتروني المعتمد للدعم والخصوصية:</strong> <a href="mailto:support@omarmakawy.com" className="font-bold text-emerald-700 underline dark:text-emerald-400">support@omarmakawy.com</a></p>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <nav aria-label="روابط سريعة" className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 pt-6 text-sm font-bold dark:border-stone-800">
          <div className="flex flex-wrap gap-4">
            <Link className="text-rose-700 underline dark:text-rose-400" href="/delete-account/">
              طلب حذف الحساب (Account Deletion)
            </Link>
            <Link className="text-emerald-700 underline dark:text-emerald-300" href="/support/">
              مركز الدعم والمساعدة
            </Link>
          </div>
          <Link className="text-stone-600 underline dark:text-stone-400" href="/">
            العودة للرئيسية
          </Link>
        </nav>
      </article>
    </main>
  );
}
