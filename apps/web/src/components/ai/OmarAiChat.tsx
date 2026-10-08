'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  User,
  Trash2,
  RefreshCw,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import StudentLayout from '@/components/layout/StudentLayout';
import { apiClient } from '@/lib/api';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  isError?: boolean;
}

const PRESET_QUESTIONS = [
  { label: '🔥 رسالة تشجيعية من المستر', question: 'محتاج رسالة تشجيعية ونصيحة للمذاكرة وتنظيم الوقت' },
  { label: '📝 شرح الفرق بين Past Simple و Present Perfect', question: 'اشرحلي الفرق بين الماضي البسيط والمضارع التام مع أمثلة واضحة' },
  { label: '💡 قاعدة المبني للمجهول Passive', question: 'اشرحلي قاعدة الـ Passive المبني للمجهول بالتفصيل وكيف أحل أسئلتها' },
  { label: '💳 تفاصيل الباقات وشحن المحفظة', question: 'كيف أشترك في الباقات الشهرية وما هي طرق شحن المحفظة؟' },
  { label: '📚 طلب كتب ومذكرات المستر', question: 'كيف أطلب كتب ومذكرات مستر عمر المطبوعة وتوصيلها للمنزل؟' },
];

export default function OmarAiChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'أهلاً بك يا بطل! 🚀 أنا المساعد الذكي الرسمي لمنصة مستر عمر مكاوي (Mr. Omar Meckawy AI).\n\nأنا هنا لمساعدتك في شرح ومناقشة أي قاعدة أو مفردات في اللغة الإنجليزية، تصحيح الجمل، وتوجيهك في كل ما يخص المنصة. تفضل بكتابة سؤالك وسأجيبك فوراً! 🎓',
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = async (textToSend: string) => {
    const query = textToSend.trim();
    if (!query || isTyping) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    setLastFailedMessage(null);

    // Build recent conversation history excluding welcome message and errors
    const historyPayload = messages
      .filter((m) => m.id !== 'welcome' && !m.isError)
      .slice(-8)
      .map((m) => ({
        sender: m.sender === 'user' ? ('user' as const) : ('ai' as const),
        text: m.text,
      }));

    try {
      const res: any = await apiClient.post('/ai/chat', {
        message: query,
        history: historyPayload,
      });

      const replyText = res?.reply || res?.message || res?.data?.reply || res?.data?.message || '';

      if (replyText && typeof replyText === 'string') {
        const aiMsg: Message = {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: replyText.trim(),
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error('لم يتم استلام نص استجابة صالح من الخادم');
      }
    } catch (err: any) {
      const errorMsg =
        err?.message ||
        err?.response?.data?.message ||
        'حدث خطأ أثناء التواصل مع المساعد الذكي. يرجى المحاولة مرة أخرى.';

      const errorReply: Message = {
        id: `err_${Date.now()}`,
        sender: 'ai',
        text: `⚠️ ${errorMsg}`,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };

      setMessages((prev) => [...prev, errorReply]);
      setLastFailedMessage(query);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    sendMessage(inputText);
  };

  const handlePresetClick = (q: string) => {
    setInputText(q);
    inputRef.current?.focus();
  };

  const handleRetry = () => {
    if (lastFailedMessage) {
      sendMessage(lastFailedMessage);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: 'تم بدء محادثة جديدة! 🤖 كيف يمكنني مساعدتك الآن في الإنجليزي أو المنصة؟',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setLastFailedMessage(null);
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
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-extrabold text-[10px] border border-emerald-400/30 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Gemini AI</span>
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">مساعدك الذكي للإجابة عن أسئلة الإنجليزي، القواعد، والشرح الدراسي على مدار 24 ساعة</p>
            </div>
          </div>

          <button
            onClick={clearChat}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10 cursor-pointer flex items-center gap-1 text-xs font-bold"
            title="مسح المحادثة"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">محادثة جديدة</span>
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {PRESET_QUESTIONS.map((pq, idx) => (
            <button
              key={idx}
              onClick={() => handlePresetClick(pq.question)}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#121620] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 text-xs font-extrabold shrink-0 shadow-2xs transition-all hover:border-emerald-500/50 cursor-pointer"
            >
              {pq.label}
            </button>
          ))}
        </div>

        {/* Chat Box Container */}
        <div className="rounded-3xl bg-white dark:bg-[#0c1017] border border-stone-200/90 dark:border-stone-800/90 shadow-lg flex flex-col h-[560px] overflow-hidden">
          
          {/* Message Area */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-stone-50/50 dark:bg-[#080b11]/50">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              // Check if English predominates to adjust text direction
              const englishChars = (msg.text.match(/[a-zA-Z]/g) || []).length;
              const arabicChars = (msg.text.match(/[\u0600-\u06FF]/g) || []).length;
              const isLtr = englishChars > 0 && englishChars > arabicChars;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[90%] sm:max-w-[82%] ${
                    isUser ? 'ms-auto flex-row-reverse' : 'me-auto'
                  }`}
                >
                  {/* Avatar */}
                  {isUser ? (
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
                    className={`p-4 rounded-2xl space-y-1 text-sm leading-relaxed shadow-2xs ${
                      isUser
                        ? 'bg-[#0d6e4f] text-white font-bold rounded-te-xs'
                        : msg.isError
                        ? 'bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 border border-red-200 dark:border-red-900/50 rounded-ts-xs font-bold'
                        : 'bg-white dark:bg-[#131926] text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-stone-800 rounded-ts-xs font-semibold'
                    }`}
                    dir={isLtr ? 'ltr' : 'rtl'}
                  >
                    <div className={`whitespace-pre-wrap ${isLtr ? 'text-start' : 'text-start'}`}>
                      {msg.text}
                    </div>

                    {msg.isError && lastFailedMessage && (
                      <div className="pt-2">
                        <button
                          onClick={handleRetry}
                          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>إعادة المحاولة</span>
                        </button>
                      </div>
                    )}

                    <span
                      className={`text-[10px] block text-end mt-1 ${
                        isUser ? 'text-emerald-100/80' : 'text-stone-400 dark:text-stone-500'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 max-w-[80%] me-auto">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-emerald-500/50 shrink-0 shadow-sm bg-white animate-pulse">
                  <img src="/assets/omar-ai-avatar.jpg" alt="Mr. Omar AI Avatar" className="w-full h-full object-cover" />
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-[#131926] border border-stone-200/80 dark:border-stone-800 rounded-ts-xs flex items-center gap-2 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#0d6e4f] animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-[#0d6e4f] animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-[#0d6e4f] animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 me-2">جاري التفكير والكتابة...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-[#0c1017] border-t border-stone-200/90 dark:border-stone-800/90 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="اكتب سؤالك هنا باللغة العربية أو الإنجليزية..."
              disabled={isTyping}
              className="flex-1 px-4 py-3.5 rounded-2xl bg-stone-100 dark:bg-stone-900/80 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0d6e4f] border border-stone-200/80 dark:border-stone-800 transition-all disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="p-3.5 rounded-2xl bg-[#0d6e4f] hover:bg-[#0a523b] disabled:opacity-50 text-white font-black transition-all shadow-md active:scale-95 shrink-0 flex items-center justify-center cursor-pointer"
            >
              <Send className="w-4.5 h-4.5 text-white" />
            </button>
          </form>

        </div>
      </div>
    </StudentLayout>
  );
}
