import { NextRequest, NextResponse } from 'next/server';
import { generateSmartAiResponse } from '@/lib/ai/aiBrain';

const GEMINI_SYSTEM_INSTRUCTION = `أنت المساعد الذكي الرسمي لمنصة مستر عمر مكاوي (معلم اللغة الإنجليزية للشهادة الثانوية العامة والإعدادية في مصر).

شخصيتك ومهامك:
1. شرح قواعد ومفردات اللغة الإنجليزية (Grammar, Vocabulary, Translation, Skills, Writing, Reading) بأسلوب مبسط وشيق مع أمثلة واضحة واحترافية.
2. تصحيح أي جملة إنجليزية يكتبها الطالب مع توضيح سبب الخطأ والقاعدة الصحيحة.
3. الإجابة على استفسارات المنصة:
   - الباقات الشهرية والشاملة: تتيح المحاضرات والواجبات والامتحانات الدورية ومتابعة المستر.
   - الكورسات: تصفح الحصص والشروحات لكل مرحلة دراسية.
   - متجر الكتب والمذكرات: طلب الملازم وتوصيلها للمنزل.
   - شحن المحفظة: شحن الرصيد عبر فودافون كاش وبطاقات الدفع للاشتراك الفوري.
4. أسلوبك دائماً محفز ومشجع ومليء بالطاقة الإيجابية (تخاطب الطالب بـ "يا بطل"، "يا دكتور"، "يا بطل الثانوية").
5. استخدم تنسيقاً منسقاً مع علامات توضيحية ونقاط (Bullet points) وإيموجيز مناسبة.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { message, history } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'الرسالة مطلوبة' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;

    if (!apiKey) {
      // Graceful fallback to smart local AI brain when API key is not yet set
      const localResponse = generateSmartAiResponse(message.trim());
      return NextResponse.json({
        reply: localResponse,
        source: 'local_brain',
        notice: 'تمت الإجابة عبر النظام الذكي الداخلي. لتفعيل محرك Gemini الكامل، أضف GEMINI_API_KEY في إعدادات Railway.',
      });
    }

    // Prepare contents history for Gemini API
    const formattedContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      for (const item of history.slice(-6)) {
        if (item.sender === 'user' && item.text) {
          formattedContents.push({ role: 'user', parts: [{ text: item.text }] });
        } else if (item.sender === 'ai' && item.text) {
          formattedContents.push({ role: 'model', parts: [{ text: item.text }] });
        }
      }
    }

    formattedContents.push({
      role: 'user',
      parts: [{ text: message.trim() }],
    });

    const modelsToTry = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-2.0-flash', 'gemini-pro'];
    let aiText = '';

    for (const model of modelsToTry) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const res = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: formattedContents,
            systemInstruction: {
              parts: [{ text: GEMINI_SYSTEM_INSTRUCTION }],
            },
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1200,
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText && typeof candidateText === 'string') {
            aiText = candidateText.trim();
            break;
          }
        }
      } catch {
        // Try next model
      }
    }

    if (!aiText) {
      aiText = generateSmartAiResponse(message.trim());
    }

    return NextResponse.json({
      reply: aiText,
      source: 'gemini',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        reply: generateSmartAiResponse('تحفيز'),
        source: 'fallback',
        error: error?.message || 'Error communicating with AI engine',
      },
      { status: 200 }
    );
  }
}
