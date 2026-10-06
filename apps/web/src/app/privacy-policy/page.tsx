import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: { absolute: 'سياسة الخصوصية | منصة مستر عمر مكاوي' },
  description: 'سياسة الخصوصية لتطبيق وخدمات منصة مستر عمر مكاوي التعليمية.',
  alternates: { canonical: '/privacy-policy/' },
  robots: { index: true, follow: true },
};

const sectionClass = 'space-y-3';
const headingClass = 'text-xl font-extrabold text-emerald-800 dark:text-emerald-300';
const paragraphClass = 'leading-8 text-gray-700 dark:text-gray-300';
const listClass = 'list-disc space-y-2 pe-6 leading-8 text-gray-700 dark:text-gray-300';

export default function PrivacyPolicyPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#f4f7f4] px-4 py-10 font-cairo dark:bg-black sm:py-16">
      <article className="mx-auto max-w-4xl rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-10">
        <header className="mb-10 border-b border-stone-200 pb-7 dark:border-stone-800">
          <p className="mb-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">منصة مستر عمر مكاوي</p>
          <h1 className="text-3xl font-black text-gray-950 dark:text-white">سياسة الخصوصية</h1>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">آخر تحديث: 7 أكتوبر 2026</p>
        </header>

        <div className="space-y-9">
          <section className={sectionClass}>
            <h2 className={headingClass}>نطاق السياسة والجهة المسؤولة</h2>
            <p className={paragraphClass}>
              توضح هذه السياسة طريقة تعامل منصة مستر عمر مكاوي مع البيانات عند استخدام تطبيق Android والخدمات المرتبطة بحساب المنصة، مثل الموقع الإلكتروني والدروس والامتحانات والدعم. للاستفسارات أو طلبات الخصوصية، تواصل معنا عبر{' '}
              <a className="font-bold text-emerald-700 underline dark:text-emerald-300" href="mailto:support@omarmakawy.com">support@omarmakawy.com</a>.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>البيانات التي قد نعالجها</h2>
            <ul className={listClass}>
              <li>بيانات الحساب التي تقدمها: اسم الطالب، رقم الهاتف، رقم واتساب، رقم ولي الأمر، والبريد الإلكتروني الاختياري.</li>
              <li>بيانات الدراسة التي تختارها: الصف والمرحلة والشعبة والمحافظة، وأي بيانات دراسية أخرى لازمة لتقديم المحتوى.</li>
              <li>بيانات تسجيل الدخول والأمان: كلمة المرور (تُحفظ على الخادم بصيغة مشفّرة/مجزّأة للتحقق منها)، ومعرّف عشوائي ثابت للتطبيق على الجهاز، وبيانات الجلسة اللازمة لإبقاء الحساب آمنًا.</li>
              <li>بيانات استخدام المنصة: الكورسات والاشتراكات، تقدم مشاهدة المحاضرات، نتائج وإجابات الامتحانات، الإشعارات التي تظهر في الحساب، وطلبات الدعم التي ترسلها.</li>
              <li>بيانات المعاملات: سجل المشتريات أو المحفظة والطلبات المرتبطة بحسابك عند استخدام هذه الخدمات.</li>
              <li>بيانات تقنية أساسية قد تظهر في سجلات الخادم لأغراض التشغيل والحماية، مثل وقت الطلب ومعلومات الاتصال والجهاز اللازمة لتشخيص الأعطال ومنع إساءة الاستخدام.</li>
            </ul>
            <p className={paragraphClass}>
              لا يطلب التطبيق صلاحيات الموقع الجغرافي أو جهات الاتصال أو الكاميرا أو الميكروفون وفق إعداداته الحالية. لا نستخدم بياناتك لبيعها أو لعرض إعلانات مخصصة داخل التطبيق.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>كيف نستخدم البيانات</h2>
            <ul className={listClass}>
              <li>إنشاء حسابك والتحقق من هويتك وتقديم الدروس والامتحانات المناسبة لمرحلتك الدراسية.</li>
              <li>حفظ تقدمك الدراسي والاشتراكات وسجل المعاملات، وإظهارها لك ولموظفي الدعم المصرح لهم عند الحاجة.</li>
              <li>تأمين الحساب، معالجة الأعطال وطلبات الدعم، ومنع الاحتيال أو الاستخدام المخالف.</li>
              <li>إرسال إشعارات خدمية متعلقة بحسابك أو دراستك عندما تكون هذه الميزة مفعّلة.</li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>مشاركة البيانات والخدمات الخارجية</h2>
            <p className={paragraphClass}>
              لا نبيع بياناتك الشخصية. نشارك الحد الضروري منها مع مزودي الخدمات الذين يشغّلون المنصة أو يستضيفون بياناتها، ومع Google Play عند تثبيت التطبيق أو إتمام عملية شراء داخل التطبيق. وقد يستخدم تشغيل بعض المحاضرات مشغل YouTube؛ عند تشغيل فيديو، تخضع البيانات التي يجمعها YouTube لسياسة الخصوصية الخاصة به.
            </p>
            <p className={paragraphClass}>
              إذا أُتيح شراء محتوى رقمي من التطبيق عبر Google Play، تتولى Google معالجة وسيلة الدفع. قد تصل إلى المنصة بيانات إثبات الشراء ومعرّف المنتج والطلب للتحقق ومنح الوصول؛ لا نطلب رقم بطاقة الدفع الكامل ولا نخزنه.
            </p>
            <p className={paragraphClass}>
              قد تتم معالجة البيانات التقنية لدى مزودي الاستضافة والتخزين خارج بلد إقامتك بحسب مكان تشغيل خدماتهم. نستخدم هذه الخدمات لتقديم المنصة وحمايتها فقط.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>حماية البيانات والاحتفاظ بها</h2>
            <p className={paragraphClass}>
              نستخدم اتصال HTTPS بين التطبيق وخوادم المنصة، ويخزن التطبيق رموز الجلسة ومعرّف الجهاز في التخزين الآمن المتاح على Android. نقيّد الوصول إلى بيانات الحساب بحسب الحاجة إلى تشغيل الخدمة والدعم.
            </p>
            <p className={paragraphClass}>
              نحتفظ ببيانات الحساب ما دام الحساب مستخدمًا، ثم نحذف أو نزيل ما يمكن ربطه به عند قبول طلب الحذف. قد نحتفظ بقدر محدود من سجلات المعاملات أو الأمان عندما يكون ذلك لازمًا لتسوية معاملة أو منع الاحتيال أو الامتثال لالتزام نظامي، ونحذفها عندما ينتهي الغرض من الاحتفاظ بها.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>الطلاب القُصّر</h2>
            <p className={paragraphClass}>
              المنصة موجهة لطلاب المرحلتين الإعدادية والثانوية، وقد يستخدمها طلاب دون 18 عامًا. نطلب رقم ولي الأمر ضمن بيانات التسجيل. نوصي بأن يراجع ولي الأمر هذه السياسة ويشرف على استخدام الطالب للمنصة. إذا كنت ولي أمر وتعتقد أن بيانات طالب عولجت على نحو غير مناسب، تواصل معنا على بريد الدعم أعلاه.
            </p>
          </section>

          <section id="deletion" className={sectionClass}>
            <h2 className={headingClass}>الوصول إلى بياناتك وطلب حذف الحساب</h2>
            <p className={paragraphClass}>
              يمكنك طلب تصحيح بيانات الحساب أو حذف الحساب والبيانات المرتبطة به من خلال صفحة{' '}
              <Link className="font-bold text-emerald-700 underline dark:text-emerald-300" href="/delete-account/">طلب حذف الحساب</Link>، أو مراسلتنا على{' '}
              <a className="font-bold text-emerald-700 underline dark:text-emerald-300" href="mailto:support@omarmakawy.com">support@omarmakawy.com</a>. سنطلب ما يلزم للتحقق من ملكية الحساب، ولا ترسل كلمة مرورك أو رمز تحقق.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>التغييرات والتواصل</h2>
            <p className={paragraphClass}>
              قد نحدّث هذه السياسة عند تغيير خصائص التطبيق أو طريقة معالجة البيانات، وسننشر النسخة الجديدة على هذه الصفحة مع تاريخ التحديث. للاستفسارات: <a className="font-bold text-emerald-700 underline dark:text-emerald-300" href="mailto:support@omarmakawy.com">support@omarmakawy.com</a>.
            </p>
          </section>
        </div>

        <nav aria-label="روابط مهمة" className="mt-10 flex flex-wrap gap-4 border-t border-stone-200 pt-6 text-sm font-bold dark:border-stone-800">
          <Link className="text-emerald-700 underline dark:text-emerald-300" href="/delete-account/">طلب حذف الحساب</Link>
          <Link className="text-emerald-700 underline dark:text-emerald-300" href="/support/">الدعم والمساعدة</Link>
          <Link className="text-emerald-700 underline dark:text-emerald-300" href="/">العودة إلى المنصة</Link>
        </nav>
      </article>
    </main>
  );
}
