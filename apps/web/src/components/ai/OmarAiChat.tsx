'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Trash2, RefreshCw, GraduationCap, CheckCircle2, HelpCircle, BookOpen, Lightbulb, MessageSquare } from 'lucide-react';
import StudentLayout from '@/components/layout/StudentLayout';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

const PRESET_QUESTIONS = [
  { label: '📌 طريقة مذاكرة الإنجليزي', question: 'ما هي أفضل طريقة لمذاكرة اللغة الإنجليزية للثانوية العامة؟' },
  { label: '📝 الفرق بين Past Simple & Present Perfect', question: 'اشرح لي الفرق بين المضارع التام والماضي البسيط مع أمثلة' },
  { label: '💡 حفظ الكلمات بدون نسيان', question: 'كيف أحفظ كلمات الإنجليزي بسرعة وبدون ما أنساها؟' },
  { label: '🎯 نصائح للترجمة والحل', question: 'كيف أتعامل مع أسئلة الترجمة والقطعة في الامتحان؟' },
];

export default function OmarAiChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'أهلاً بك يا بطل! 🚀 أنا المساعد الذكي لمستر عمر مكاوي (Mr. Omar Meckawy AI).\n\nأنا هنا لمساعدتك في شرح القواعد، توضيح معاني الكلمات، نصائح المذاكرة للثانوية العامة، وتوجيهك في المنصة. اكتب لي سؤالك وسأجيبك فوراً! 🎓',
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

    if (q.includes('ترجمة') || q.includes('قطعة') || q.includes('حل') || q.includes('امتحان')) {
      return `نصائح ذهبية للتعامل مع التعبير والترجمة والقطعة 🎯:

1️⃣ **الترجمة**: لا تترجم حرفياً! ابحث عن المعنى العام واصنع جملة صحيحة قواعدياً (Subject + Verb + Object).
2️⃣ **القطعة (Comprehension)**: اقرأ الأسئلة أولاً قبل قراءة القطعة لتحديد ما تبحث عنه بدقة.
3️⃣ **إدارة الوقت**: درب نفسك في الامتحانات الإلكترونية على المنصة للحفاظ على سرعة الحل.

بالتوفيق يا بطل! 🌟`;
    }

    if (q.includes('باقة') || q.includes('اشتراك') || q.includes('كورس') || q.includes('محفظة')) {
      return `لأي استفسار بخصوص الباقات والاشتراكات والمحفظة 💳:

- يمكنك التوجه لصفحة **"الباقات الشهرية"** لترقية حسابك.
- متابعة رصيدك في **"المحفظة"**.
- جميع كورساتك المشترك بها متوفرة في **"اشتراكاتي"** و **"الكورسات"**.

وإذا واجهتك أي مشكلة تقنية، تواصل مع فريق الدعم عبر الواتساب فوراً من صفحة الدعم! 📱`;
    }

    return `شكراً لسؤالك يا بطل! 💡

أنا هنا دائماً لمساعدتك في كل ما يتعلق بمادة اللغة الإنجليزية مع **Mr. Omar Meckawy**.
يمكنك سؤالي عن:
- شرح أي قاعدة في Grammer
- معاني وفروق الكلمات Vocabulary
- نصائح وإرشادات امتحانات الثانوية العامة

أرسل سؤالك بالتفصيل وسأكون سعيداً بإجابتك! 🚀`;
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentQuery = inputText;
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const aiReplyText = generateAiResponse(currentQuery);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 900);
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
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md text-emerald-300 flex items-center justify-center border border-white/20 shadow-inner shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
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
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#121622] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 text-xs font-extrabold shrink-0 shadow-2xs transition-all hover:border-emerald-500/50"
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
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#0d6e4f] text-white'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4.5 h-4.5" />}
                </div>

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
                <div className="w-9 h-9 rounded-2xl bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4.5 h-4.5 animate-pulse" />
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
