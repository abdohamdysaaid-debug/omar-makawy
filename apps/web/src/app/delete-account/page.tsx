import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: { absolute: 'طلب حذف الحساب | منصة مستر عمر مكاوي' },
  description: 'طريقة إرسال طلب حذف حسابك وبياناتك من تطبيق منصة مستر عمر مكاوي.',
  alternates: { canonical: '/delete-account/' },
  robots: { index: true, follow: true },
};

export default function DeleteAccountPage() {
  const subject = encodeURIComponent('طلب حذف حساب منصة مستر عمر مكاوي');
  return (
    <main dir="rtl" className="min-h-screen bg-[#f4f7f4] px-4 py-10 font-cairo dark:bg-black sm:py-16">
      <article className="mx-auto max-w-3xl rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-10">
        <p className="mb-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">تطبيق منصة مستر عمر مكاوي</p>
        <h1 className="text-3xl font-black text-gray-950 dark:text-white">طلب حذف الحساب والبيانات</h1>
        <p className="mt-4 leading-8 text-gray-700 dark:text-gray-300">
          يمكنك طلب حذف حسابك وبياناته حتى إذا لم يعد بإمكانك تسجيل الدخول. هذه الصفحة متاحة لطلاب منصة مستر عمر مكاوي وأولياء أمورهم.
        </p>

        <section className="mt-8 space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
          <h2 className="text-xl font-extrabold text-emerald-900 dark:text-emerald-200">إرسال طلب الحذف</h2>
          <ol className="list-decimal space-y-2 pe-6 leading-8 text-gray-700 dark:text-gray-300">
            <li>اضغط زر مراسلة الدعم أدناه.</li>
            <li>اكتب رقم هاتف الطالب المسجل واطلب حذف الحساب والبيانات المرتبطة به.</li>
            <li>لا ترسل كلمة المرور أو رموز التحقق أو بيانات بطاقة الدفع.</li>
          </ol>
          <a
            href={`mailto:support@omarmakawy.com?subject=${subject}`}
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            إرسال طلب حذف الحساب إلى الدعم
          </a>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            أو أرسل رسالة مباشرة إلى <a className="font-bold underline" href="mailto:support@omarmakawy.com">support@omarmakawy.com</a>.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-xl font-extrabold text-emerald-800 dark:text-emerald-300">ماذا يحدث بعد إرسال الطلب؟</h2>
          <p className="leading-8 text-gray-700 dark:text-gray-300">
            سيتحقق فريق الدعم من ملكية الحساب قبل تنفيذ الطلب، وقد يتواصل معك عبر بيانات التواصل المسجلة. عند قبول الطلب، تُحذف بيانات الحساب المرتبطة به أو تُزال إمكانية ربطها بك، مع احتمال الاحتفاظ بالحد الأدنى من سجلات المعاملات أو الأمان عندما يلزم ذلك لتسوية المعاملات أو منع الاحتيال أو الامتثال لالتزام نظامي.
          </p>
          <p className="leading-8 text-gray-700 dark:text-gray-300">
            لا يتطلب تقديم الطلب تنزيل التطبيق أو تسجيل الدخول. لمزيد من التفاصيل حول البيانات، راجع <Link className="font-bold text-emerald-700 underline dark:text-emerald-300" href="/privacy-policy/">سياسة الخصوصية</Link>.
          </p>
        </section>

        <nav aria-label="روابط مهمة" className="mt-10 border-t border-stone-200 pt-6 text-sm font-bold dark:border-stone-800">
          <Link className="text-emerald-700 underline dark:text-emerald-300" href="/">العودة إلى منصة مستر عمر مكاوي</Link>
        </nav>
      </article>
    </main>
  );
}
