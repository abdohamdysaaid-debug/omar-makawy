'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Sparkles, X, MessageSquare, Send, Bot, ExternalLink, ChevronLeft } from 'lucide-react';

export default function FloatingAiWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: 'أهلاً بك يا بطل! 🚀 أنا مستر عمر AI. عندك أي سؤال في الإنجليزي أو استفسار في المنصة؟ اسألني فوراً!',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });

  // Set default initial position on client side
  useEffect(() => {
    const defaultX = Math.max(15, window.innerWidth - 75);
    const defaultY = Math.max(15, window.innerHeight - 130);
    setPosition({ x: defaultX, y: defaultY });

    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return null;
        const newX = Math.max(15, Math.min(window.innerWidth - 75, prev.x));
        const newY = Math.max(15, Math.min(window.innerHeight - 130, prev.y));
        return { x: newX, y: newY };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDragStart = (clientX: number, clientY: number) => {
    if (!position) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      initialX: position.x,
      initialY: position.y,
    };

    const handleDragMove = (moveClientX: number, moveClientY: number) => {
      if (!isDraggingRef.current) return;
      const dx = moveClientX - dragStartRef.current.startX;
      const dy = moveClientY - dragStartRef.current.startY;

      if (Math.hypot(dx, dy) > 5) {
        hasMovedRef.current = true;
      }

      const newX = Math.max(10, Math.min(window.innerWidth - 70, dragStartRef.current.initialX + dx));
      const newY = Math.max(10, Math.min(window.innerHeight - 70, dragStartRef.current.initialY + dy));
      setPosition({ x: newX, y: newY });
    };

    const handleDragEnd = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };

    const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY);
    const onMouseUp = () => handleDragEnd();

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => handleDragEnd();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = 'أهلاً بك يا بطل! 🎓 أنا هنا دايماً لمساعدتك في كل القواعد، استفسارات الباقات، والمحفظة. تفضل بزيارة صفحة AI الكاملة للمزيد من الشرح والإجابات!';
      const q = userText.toLowerCase();
      if (q.includes('باقة') || q.includes('اشتراك') || q.includes('سعر')) {
        reply = 'يمكنك الدخول لصفحة "الباقات الشهرية" للاشتراك في أفضل كورسات المستر وتفعيل المحاضرات فوراً 💳!';
      } else if (q.includes('تحفيز') || q.includes('خائف') || q.includes('تعبت')) {
        reply = 'يا بطل أنت قادر توصل لأحلامك وتجيب 50/50 في الإنجليزي! توكل على الله وكمل، المستر معاك دايماً 🔥💪!';
      }
      setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
      setIsTyping(false);
    }, 800);
  };

  const handleButtonClick = () => {
    if (hasMovedRef.current) return; // Ignore click if user was dragging
    setIsOpen(!isOpen);
    setShowTooltip(false);
  };

  // Determine popup placement based on current widget screen position
  const isPopupOnLeft = position ? position.x < window.innerWidth / 2 : false;
  const isPopupOnTop = position ? position.y > window.innerHeight / 2 : true;

  return (
    <div
      className="fixed z-50 font-cairo touch-none select-none"
      style={
        position
          ? { left: `${position.x}px`, top: `${position.y}px` }
          : { bottom: '20px', right: '20px' }
      }
    >
      {/* Floating Chat Box Popup */}
      {isOpen && (
        <div
          className={`absolute w-80 sm:w-96 rounded-3xl bg-white dark:bg-[#0d121d] border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col h-[420px] animate-in fade-in zoom-in-95 duration-200 ${
            isPopupOnTop ? '-top-[430px]' : 'top-[70px]'
          } ${isPopupOnLeft ? 'left-0' : 'right-0'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-[#0d6e4f] to-emerald-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-xs shrink-0 bg-white">
                <img src="/assets/omar-ai-avatar.jpg" alt="Mr. Omar AI Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="text-start">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-xs text-white">مستر عمر مكاوي AI</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <p className="text-[10px] text-emerald-200">المساعد الذكي للمنصة والإنجليزي ⚡</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Link
                href="/student/ai"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
                title="فتح الشاشة الكاملة"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-stone-50/60 dark:bg-[#080b11]/60">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 max-w-[85%] ${
                  m.sender === 'user' ? 'ms-auto flex-row-reverse' : 'me-auto'
                }`}
              >
                {m.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-emerald-500/40 shrink-0 bg-white shadow-2xs">
                    <img src="/assets/omar-ai-avatar.jpg" alt="Mr. Omar AI Avatar" className="w-full h-full object-cover" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl text-xs font-extrabold leading-relaxed text-start ${
                    m.sender === 'user'
                      ? 'bg-[#0d6e4f] text-white rounded-te-xs'
                      : 'bg-white dark:bg-[#131926] text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-stone-800 rounded-ts-xs shadow-2xs'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2 max-w-[80%] me-auto items-center">
                <div className="w-7 h-7 rounded-full overflow-hidden border border-emerald-500/40 shrink-0 bg-white shadow-2xs animate-pulse">
                  <img src="/assets/omar-ai-avatar.jpg" alt="Mr. Omar AI Avatar" className="w-full h-full object-cover" />
                </div>
                <span className="text-[11px] font-bold text-gray-500">جاري الكتابة... ✍️</span>
              </div>
            )}
          </div>

          {/* Quick Input Bar */}
          <form onSubmit={handleSend} className="p-2.5 bg-white dark:bg-[#0d121d] border-t border-stone-200 dark:border-stone-800 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب سؤالك هنا..."
              className="flex-1 px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs font-extrabold focus:outline-none focus:ring-1 focus:ring-[#0d6e4f] border border-stone-200 dark:border-stone-800"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2.5 rounded-xl bg-[#0d6e4f] text-white hover:bg-[#0a523b] disabled:opacity-50 transition-all shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Circular Trigger Button (Draggable via Mouse or Touch) */}
      <div className="relative flex items-center gap-2">
        {showTooltip && !isOpen && (
          <div
            className={`flex items-center gap-2 bg-stone-900/95 text-white dark:bg-white dark:text-stone-900 px-3.5 py-2 rounded-2xl shadow-xl border border-stone-800 dark:border-stone-200 animate-bounce duration-1000 absolute top-1/2 -translate-y-1/2 whitespace-nowrap z-20 ${
              isPopupOnLeft ? 'start-[calc(100%+12px)]' : 'end-[calc(100%+12px)]'
            }`}
          >
            <span className="text-xs font-black whitespace-nowrap">اسأل مستر عمر AI 🤖</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="p-0.5 rounded-md hover:bg-white/20 dark:hover:bg-stone-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div
          onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
          onTouchStart={(e) => {
            if (e.touches.length > 0) {
              handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          onClick={handleButtonClick}
          className="relative group w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px] rounded-full bg-white dark:bg-[#0d121d] p-0.5 border-2 border-[#0d6e4f] dark:border-emerald-400 shadow-2xl hover:scale-105 active:scale-95 transition-transform duration-150 cursor-grab active:cursor-grabbing flex items-center justify-center shrink-0 aspect-square"
          title="عمر مكاوي AI - اضغط أو اسحب لتحريك الأيقونة"
        >
          {/* Avatar Image in Circular Crop */}
          <div className="w-full h-full rounded-full overflow-hidden relative pointer-events-none bg-white">
            <img src="/assets/omar-ai-avatar.jpg" alt="Mr. Omar AI Avatar" className="w-full h-full object-cover rounded-full" />
          </div>

          {/* Online Indicator Badge */}
          <span className="absolute top-0 end-0 flex h-3.5 w-3.5 pointer-events-none">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-stone-900"></span>
          </span>

          {/* AI Badge Chip */}
          <span className="absolute -bottom-1.5 px-1.5 py-0.2 rounded-full bg-[#0d6e4f] text-white font-black text-[9px] shadow-xs border border-white dark:border-stone-900 pointer-events-none whitespace-nowrap">
            AI ✨
          </span>
        </div>
      </div>

    </div>
  );
}
