'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Trash2, RefreshCw, GraduationCap, CheckCircle2, HelpCircle, BookOpen, Lightbulb, MessageSquare } from 'lucide-react';
import StudentLayout from '@/components/layout/StudentLayout';
import { generateSmartAiResponse } from '@/lib/ai/aiBrain';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

const PRESET_QUESTIONS = [
  { label: '🔥 رسالة تشجيعية من مستر عمر', question: 'محتاج رسالة تشجيعية وطاقة إيجابية للثانوية العامة!' },
  { label: '💳 تفاصيل الباقات وشحن المحفظة', question: 'كيف أشترك في الباقات الشهرية وأشحن المحفظة؟' },
  { label: '📝 شرح الفرق بين Past Simple & Present Perfect', question: 'اشرح لي الفرق بين المضارع التام والماضي البسيط مع أمثلة' },
  { label: '📚 طلب كتب وملازم المستر', question: 'كيف اطلب كتب وملازم مستر عمر وتصلني للمنزل؟' },
];

export default function OmarAiChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'أهلاً بك يا بطل! 🚀 أنا المساعد الذكي لمستر عمر مكاوي (Mr. Omar Meckawy AI).\n\nأنا هنا لمساعدتك في كل ما يخص المنصة (الباقات، شحن المحفظة، الكتب، الامتحانات) وتوضيح أي قاعدة في الإنجليزي وتوفير الدعم والتشجيع المستمر لك! اكتب لي سؤالك وسأجيبك فوراً! 🎓',
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateAiResponse = (userQuestion: string): string => {
    const q = userQuestion.toLowerCase();

    // 1. Motivational & Emotional Encouragement
    if (q.includes('تحفيز') || q.includes('تشجيع') || q.includes('خائف') || q.includes('خايف') || q.includes('قلقان') || q.includes('ضغط') || q.includes('احباط') || q.includes('صعب') || q.includes('تعبت')) {
      return `يا بطل الثانوية العامة، اسمعني كويس! ❤️⚡

طبيعي جداً تحس بشوية قلق أو ضغط، لأنك بتسعى لهدف عظيم! افتكر دايماً إن التعب والجهد اللي بتبذله النهاردة هو اللي هيصنع فرحتك وفرحة أهلك يوم النتيجة 🎓.

مستر عمر مكاوي بيقولك:
1️⃣ **نظم وقتك وصفي ذهنك**: خذ أنفاس عميقة وابدأ خطوة بخطوة.
2️⃣ **الالتزام والاستمرارية**: المذاكرة اليومية البسيطة أفضل من الضغط المفاجئ.
3️⃣ **أنت قدها**: الإنجليزي مادة التجميع والدرجات النهائية، وأنا ومعك المستر خطوة بخطوة للـ 50/50!

قم، توكل على الله، وابدأ دلوقتي.. أنت بطل وهتوصل لإحلامك بإذن الله! 🔥💪`;
    }

    if (q.includes('شكرا') || q.includes('شكراً') || q.includes('ممتاز') || q.includes('بحبك') || q.includes('جامد') || q.includes('عاش') || q.includes('حبيبي')) {
      return `العفو يا بطل! ❤️ يسعدني جداً مساعدتك. مستر عمر وفريق العمل دائماً فخورين بيك وبسيعك المستمر. 

استمر بنفس الشغف والعزيمة، وإذا احتجت أي استفسار آخر في المنصة أو في مادة الإنجليزي، أنا هنا دايماً بجانبك! 🚀✨`;
    }

    // 2. Platform Inquiries (Subscriptions, Wallet, Recharge, Vodafone Cash)
    if (q.includes('باقة') || q.includes('باقات') || q.includes('اشتراك') || q.includes('اشترك') || q.includes('سعر') || q.includes('أسعار')) {
      return `تفاصيل الباقات الشهرية وكورسات مستر عمر مكاوي 💳:

📌 **ماذا تشمل الباقة الشهرية؟**:
- جميع محاضرات الشرح المباشرة والمسجلة عالية الجودة.
- ملفات الـ PDF والملازم الخاصة بالشرح والحل.
- امتحانات الكترونية دورية بعد كل درس مع تصحيح وتوضيح الإجابات.
- متابعة وتواصل مع فريق المستر والدعم الفني.

💡 **طريقة الاشتراك**:
1️⃣ توجه إلى صفحة **"الباقات الشهرية"** من القايمة الجانبية.
2️⃣ اختر الباقة المناسبة لصفك الدراسي اضغط على "اشترك الآن".
3️⃣ يمكنك الدفع المباشر عن طريق المحفظة الإلكترونية أو فودافون كاش! 📱✨`;
    }

    if (q.includes('محفظة') || q.includes('شحن') || q.includes('رصيد') || q.includes('فودافون') || q.includes('كاش')) {
      return `طريقة شحن المحفظة والرصيد في المنصة 👛:

1️⃣ افتح صفحة **"المحفظة"** من قائمة التصفح.
2️⃣ اضغط على **"شحن المحفظة"** واختر المبلغ المطلوبة لشحنه.
3️⃣ يمكنك اختيار الوسيلة المتاحة (فودافون كاش / كروت الشحن / الفيزا).
4️⃣ بعد إتمام التحويل يتم إضافة الرصيد لحسابك فوراً لتتمكن من الاشتراك في الكورسات والباقات بكل سهولة! ⚡`;
    }

    if (q.includes('كتاب') || q.includes('كتب') || q.includes('متجر') || q.includes('ملزمة') || q.includes('شحن كتب') || q.includes('توصيل')) {
      return `خدمة متجر الكتب والملازم المطبوعة 📚🚚:

- تتيح لك المنصة طلب ملازم وكتب مستر عمر مكاوي المطبوعة عالية الجودة ليصلك الكتاب حتى باب المنزل!
- **كيف تطلب؟**:
  1️⃣ اذهب لصفحة **"متجر الكتب"**.
  2️⃣ اختر الكتاب أو المجموعة المطلوبة وأضفها للسلة.
  3️⃣ أدخل عنوانك ورقم الهاتف واضغط "تأكيد الطلب".
- يمكنك متابعة حالة شحنتك من صفحة **"طلباتي"** 📦!`;
    }

    if (q.includes('امتحان') || q.includes('امتحانات') || q.includes('درجة') || q.includes('تصحيح') || q.includes('واجب')) {
      return `نظام الامتحانات التفاعلية في منصة مستر عمر 📝🎯:

- تتوفر الامتحانات الإلكترونية في قسم **"امتحاناتي"**.
- يتم تصحيح الامتحان فورياً فور إرسال إجاباتك مع إظهار الإجابة النموذجية وتفسير كل نقطة.
- يمكنك متابعة تطور مستواك ودرجاتك السابقة في صفحة **"تقدمي في الدراسة"** 📈.

نصيحة المستر: اختبر نفسك بانتظام ولا تخف من الخطأ، فالخطأ في الامتحان التجريبي هو طريقك للدرجة النهائية في امتحان آخر العام! ✨`;
    }

    if (q.includes('دعم') || q.includes('تواصل') || q.includes('واتس') || q.includes('مشكلة') || q.includes('رقم')) {
      return `فريق الدعم الفني لمستر عمر مكاوي في خدمتك 24/7 💬:

إذا واجهتك أي مشكلة في فتح الفيديوهات، تفعيل الباقات، أو الشحن:
- يمكنك التواصل المباشر عبر الواتساب من صفحة **"الدعم والمساعدة"**.
- أو الاتصال برقم الدعم المباشر الموضح في صفحة الدعم.

فريقنا جاهز لمساعدتك وحل أي عقبة فوراً لضمان تجربة تعليمية سلسة! 🚀`;
    }

    if (q.includes('تسجيل') || q.includes('حساب') || q.includes('دخول') || q.includes('إنشاء')) {
      return `طريقة إنشاء حساب جديد في المنصة 👤:

1️⃣ اضغط على **"إنشاء حساب جديد"** في الصفحة الرئيسية أو قائمة التصفح.
2️⃣ قم بإدخال اسمك الثلاثي، رقم هاتفك، والبريد الإلكتروني.
3️⃣ اختر صفك الدراسي (الأول / الثاني / الثالث الثانوي).
4️⃣ انقر على "سجل الآن" وسيتم تفعيل حسابك مباشرة للاستمتاع بخدمات المنصة! 🎓`;
    }

    // 3. Subject Knowledge & Grammar Queries
    if (q.includes('مذاكرة') || q.includes('أذاكر') || q.includes('طريقة')) {
      return `إليك خطة المذاكرة الذكية في اللغة الإنجليزية مع مستر عمر مكاوي 🎯:

1️⃣ **الفهم أولاً**: شاهد فيديو الشرح بتركيز ودون ملاحظاتك في ملزمة المستر.
2️⃣ **التطبيق الفوري**: قم بحل التدريبات مباشرة بعد الدرس لتثبيت القاعدة.
3️⃣ **جدول الكلمات**: قسم الكلمات اليومية إلى مجموعات صغيرة (15-20 كلمة) واستخدمها في جمل مفيدة.
4️⃣ **المراجعة الدورية**: استغل امتحانات المنصة الدورية للتقييم المستمر.

تذكر دائماً: "الاستمرارية هي سر التميز!" 💪`;
    }

    if (q.includes('ماضي') || q.includes('مضارع') || q.includes('present perfect') || q.includes('past simple') || q.includes('جرامر') || q.includes('قاعدة')) {
      return `إليك توضيح القاعدة ببساطة 📝:

📌 **المضارع التام (Present Perfect - Have/Has + P.P)**:
- يعبر عن حدث تم في الماضي وله أثر في الحاضر، أو حدث بدأ في الماضي وما زال مستمراً.
- *مثال*: I have learned English for 3 years. (ما زلت أتعلم)

📌 **الماضي البسيط (Past Simple - Verb + ed)**:
- يعبر عن حدث انتهى تماماً في وقت محدد في الماضي.
- *مثال*: I learned English in 2020. (حدث انتهى بالكامل)

💡 **الكلمات الدالة**:
- المضارع التام: just, already, ever, never, since, for
- الماضي البسيط: yesterday, ago, last week, in 2020

إذا كان لديك جملة معينة تريد الإجابة عنها، أرسلها لي فوراً! 🚀`;
    }

    if (q.includes('كلمات') || q.includes('حفظ') || q.includes('أنسى')) {
      return `سر حفظ الكلمات بدون نسيان 🧠:

1️⃣ **الحفظ بالسياق**: لا تحفظ الكلمة مفردة، بل ضعها في جملة كاملة.
2️⃣ **الربط البصري والسمعي**: اسمع نطق الكلمة الصحيح واستحضر صورتها.
3️⃣ **التكرار المتباعد (Spaced Repetition)**: راجع الكلمات بعد (يوم - 3 أيام - أسبوع).
4️⃣ **استخدام الكلمات في كتابة Essay أو الترجمة**.

منصة مستر عمر مكاوي نوفر لك بنك كلمات تفاعلي في الكورسات للمراجعة المستمرة! 📚`;
    }

    // Default Fallback
    return `شكراً لسؤالك يا بطل! 💡

أنا هنا دائماً لمساعدتك في كل ما يتعلق بـ **منصة مستر عمر مكاوي (Mr. Omar Meckawy)** ومادة اللغة الإنجليزية.
يمكنك سؤالي عن:
- 💳 الاشتراك في الباقات وشحن المحفظة
- 📚 طلب كتب وملازم المستر المطبوعة
- 📝 نظام الامتحانات والدرجات
- 💡 شرح وتوضيح أي قاعدة في الإنجليزي (Grammar & Vocabulary)
- 🔥 الحصول على نصائح وطاقة تشجيعية للثانوية العامة

أرسل استفسارك وسأكون سعيداً بإجابتك فوراً! 🚀`;
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const currentQuery = inputText.trim();
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: currentQuery,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        (typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)
          ? 'http://localhost:3000/api/v1'
          : 'https://api.omarmeckawy.com/api/v1');

      const res = await fetch(`${apiBase}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentQuery,
          history: messages.map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      let replyText = '';
      if (res.ok) {
        const data = await res.json();
        replyText = data.reply;
      }

      if (!replyText) {
        replyText = generateSmartAiResponse(currentQuery);
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const fallbackText = generateSmartAiResponse(currentQuery);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handlePresetClick = (q: string) => {
    setInputText(q);
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'ai',
        text: 'تم إعادة ضبط المحادثة! 🤖 كيف يمكنني مساعدتك الآن في الإنجليزي؟',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-4 animate-fade-in font-cairo">
        
        {/* Header Banner */}
        <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-[#0d6e4f] via-[#0a523b] to-emerald-950 text-white shadow-xl flex items-center justify-between border border-emerald-500/30">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/80 shadow-md shrink-0 bg-white">
              <img src="/assets/omar-ai-avatar.jpg" alt="Mr. Omar AI Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="text-start">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight">مساعد مستر عمر مكاوي AI</h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-extrabold text-[10px] border border-emerald-400/30">
                  ذكاء اصطناعي 🟢
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">مساعدك الذكي للإجابة عن أسئلة الإنجليزي والشرح والتوجيه الدراسي على مدار 24 ساعة</p>
            </div>
          </div>

          <button
            onClick={clearChat}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
            title="مسح المحادثة"
          >
            <Trash2 className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {PRESET_QUESTIONS.map((pq, idx) => (
            <button
              key={idx}
              onClick={() => handlePresetClick(pq.question)}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#121620] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 text-xs font-extrabold shrink-0 shadow-2xs transition-all hover:border-emerald-500/50"
            >
              {pq.label}
            </button>
          ))}
        </div>

        {/* Chat Box Container */}
        <div className="rounded-3xl bg-white dark:bg-[#0c1017] border border-stone-200/90 dark:border-stone-800/90 shadow-lg flex flex-col h-[520px] overflow-hidden">
          
          {/* Message Area */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-stone-50/50 dark:bg-[#080b11]/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[88%] sm:max-w-[80%] ${
                  msg.sender === 'user' ? 'ms-auto flex-row-reverse' : 'me-auto'
                }`}
              >
                {/* Avatar */}
                {msg.sender === 'user' ? (
                  <div className="w-9 h-9 rounded-2xl bg-[#0d6e4f] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-emerald-500/50 shrink-0 shadow-sm bg-white">
                    <img src="/assets/omar-ai-avatar.jpg" alt="Mr. Omar AI Avatar" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Message Content */}
                <div
                  className={`p-4 rounded-2xl space-y-1 text-sm font-bold leading-relaxed shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-[#0d6e4f] text-white rounded-te-xs'
                      : 'bg-white dark:bg-[#131926] text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-stone-800 rounded-ts-xs'
                  }`}
                >
                  <p className="whitespace-pre-line text-start">{msg.text}</p>
                  <span className={`text-[10px] block text-end mt-1 ${msg.sender === 'user' ? 'text-emerald-100/80' : 'text-stone-400 dark:text-stone-500'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 max-w-[80%] me-auto">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-emerald-500/50 shrink-0 shadow-sm bg-white animate-pulse">
                  <img src="/assets/omar-ai-avatar.jpg" alt="Mr. Omar AI Avatar" className="w-full h-full object-cover" />
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-[#131926] border border-stone-200/80 dark:border-stone-800 rounded-ts-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0d6e4f] animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-[#0d6e4f] animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-[#0d6e4f] animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 me-2">جاري الكتابة...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-[#0c1017] border-t border-stone-200/90 dark:border-stone-800/90 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="اكتب سؤالك هنا لمساعدك الذكي..."
              className="flex-1 px-4 py-3.5 rounded-2xl bg-stone-100 dark:bg-stone-900/80 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0d6e4f] border border-stone-200/80 dark:border-stone-800 transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="p-3.5 rounded-2xl bg-[#0d6e4f] hover:bg-[#0a523b] disabled:opacity-50 text-white font-black transition-all shadow-md active:scale-95 shrink-0 flex items-center justify-center"
            >
              <Send className="w-4.5 h-4.5 text-white" />
            </button>
          </form>

        </div>
      </div>
    </StudentLayout>
  );
}
