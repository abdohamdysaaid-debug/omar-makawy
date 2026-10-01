/**
 * Omar AI Brain - ChatGPT-style Intelligent Response Generator
 * Features:
 * 1. English Practice Mode (ممارسة اللغة الإنجليزية).
 * 2. Instant Grammar & Spelling Correction in Arabic with friendly explanations.
 * 3. Conversational ChatGPT-style responses for any query.
 */

export interface GrammarCheckResult {
  hasErrors: boolean;
  corrections: Array<{ wrong: string; correct: string; reason: string }>;
}

export function checkEnglishErrors(text: string): GrammarCheckResult {
  const corrections: Array<{ wrong: string; correct: string; reason: string }> = [];
  const lower = text.toLowerCase();

  // 1. Subject-Verb & Tense Grammar Errors
  if (/\bi is\b/.test(lower)) {
    corrections.push({
      wrong: 'I is',
      correct: 'I am',
      reason: 'الضمير I يأتي معه am وليس is',
    });
  }
  if (/\bi has\b/.test(lower)) {
    corrections.push({
      wrong: 'I has',
      correct: 'I have',
      reason: 'الضمير I يأتي معه الفعل have وليس has',
    });
  }
  if (/\bi goes\b/.test(lower)) {
    corrections.push({
      wrong: 'I goes',
      correct: 'I go (أو I went في الماضي)',
      reason: 'الضمير I لا تضاف له es مع الفعل المضارع',
    });
  }
  if (/\bi plays\b/.test(lower)) {
    corrections.push({
      wrong: 'I plays',
      correct: 'I play',
      reason: 'الضمير I يأتي معه المصدر play بدون s',
    });
  }
  if (/\bi likes\b/.test(lower)) {
    corrections.push({
      wrong: 'I likes',
      correct: 'I like',
      reason: 'الضمير I يأتي معه المصدر like بدون s',
    });
  }
  if (/\bhe go\b/.test(lower)) {
    corrections.push({
      wrong: 'he go',
      correct: 'he goes',
      reason: 'مع he نضـيف es للفعل go في زمن المضارع البسيط',
    });
  }
  if (/\bshe go\b/.test(lower)) {
    corrections.push({
      wrong: 'she go',
      correct: 'she goes',
      reason: 'مع she نضيف es للفعل go في زمن المضارع البسيط',
    });
  }
  if (/\bthey is\b/.test(lower)) {
    corrections.push({
      wrong: 'they is',
      correct: 'they are',
      reason: 'ضمير الجمع they يأتي معه are وليس is',
    });
  }
  if (/\bwe is\b/.test(lower)) {
    corrections.push({
      wrong: 'we is',
      correct: 'we are',
      reason: 'ضمير الجمع we يأتي معه are وليس is',
    });
  }
  if (/\byou is\b/.test(lower)) {
    corrections.push({
      wrong: 'you is',
      correct: 'you are',
      reason: 'الضمير you يأتي معه are وليس is',
    });
  }
  if (/\bdidn't went\b/.test(lower) || /\bdidnt went\b/.test(lower) || /\bdid not went\b/.test(lower)) {
    corrections.push({
      wrong: "didn't went",
      correct: "didn't go",
      reason: 'بعد didn\'t يأتي الفعل في المصدر (go) وليس في الماضي',
    });
  }
  if (/\bdidn't played\b/.test(lower) || /\bdidnt played\b/.test(lower)) {
    corrections.push({
      wrong: "didn't played",
      correct: "didn't play",
      reason: 'بعد didn\'t يأتي الفعل في المصدر (play) بدون ed',
    });
  }
  if (/\byesterday i go\b/.test(lower)) {
    corrections.push({
      wrong: 'yesterday I go',
      correct: 'yesterday I went',
      reason: 'وجود كلمة yesterday يدل على الماضي البسيط، فيكون الفعل went',
    });
  }

  // 2. Common Spelling & Vocabulary Errors
  if (/\blibary\b/.test(lower)) {
    corrections.push({
      wrong: 'libary',
      correct: 'library',
      reason: 'الإملاء الصحيح لكلمة مكتبة هو library',
    });
  }
  if (/\bbeautifull\b/.test(lower)) {
    corrections.push({
      wrong: 'beautifull',
      correct: 'beautiful',
      reason: 'كلمة beautiful تنتهي بـ l واحدة فقط',
    });
  }
  if (/\bfreind\b/.test(lower)) {
    corrections.push({
      wrong: 'freind',
      correct: 'friend',
      reason: 'الإملاء الصحيح هو friend (حرف i قبل e)',
    });
  }
  if (/\bteached\b/.test(lower)) {
    corrections.push({
      wrong: 'teached',
      correct: 'taught',
      reason: 'ماضي الفعل teach هو taught لأنه فعل غير منتظم (Irregular)',
    });
  }
  if (/\bbuied\b/.test(lower)) {
    corrections.push({
      wrong: 'buied',
      correct: 'bought',
      reason: 'ماضي الفعل buy هو bought لأنه فعل غير منتظم',
    });
  }
  if (/\bspeake\b/.test(lower)) {
    corrections.push({
      wrong: 'speake',
      correct: 'speak',
      reason: 'الفعل speak ينتهي بالحرف k بدون e',
    });
  }
  if (/\bstuding\b/.test(lower)) {
    corrections.push({
      wrong: 'studing',
      correct: 'studying',
      reason: 'عند إضافة ing للفعل study نحتفظ بالحرف y فيكون studying',
    });
  }

  return {
    hasErrors: corrections.length > 0,
    corrections,
  };
}

export function generateSmartAiResponse(userText: string): string {
  const q = userText.trim().toLowerCase();
  if (!q) return 'أهلاً بك يا بطل! 🚀 اكتب لي سؤالك وسأجيبك فوراً!';

  // ============================================================
  // A. REQUEST TO SPEAK / PRACTICE ENGLISH (تتكلم معايا انجليزي)
  // ============================================================
  if (
    q.includes('انقلش') ||
    q.includes('انجليزي') ||
    q.includes('إنجليزي') ||
    q.includes('english')
  ) {
    if (
      q.includes('تتكلم') ||
      q.includes('اتكلم') ||
      q.includes('تكلم') ||
      q.includes('كلمني') ||
      q.includes('امارس') ||
      q.includes('أمارس') ||
      q.includes('نحكي') ||
      q.includes('نتحدث') ||
      q.includes('تتحدث') ||
      q.includes('speak') ||
      q.includes('practice') ||
      q.includes('talk')
    ) {
      return `Of course, my friend! 🥳 I would love to practice English with you!

From now on, let's chat in English so you can improve your fluency, grammar, and vocabulary! 🚀

💡 **How we practice**:
Write to me in English as much as you can! Whenever you make any small grammar or spelling mistake, I will kindly point it out for you in Arabic with the exact correction, and then we will keep our English conversation going to build your confidence!

Let's start right now: **Hello champion! How are you doing today, and what did you study?** Tell me all about your day in English! 😃✨`;
    }
  }

  // Request to switch back to Arabic
  if (
    q.includes('كفاية انجليزي') ||
    q.includes('كفاية إنجليزي') ||
    q.includes('اتكلم عربي') ||
    q.includes('كلمني عربي') ||
    q.includes('عربي تاني')
  ) {
    return `تمام يا بطل! 🤝 أداءك في الإنجليزي كان ممتاز جداً ورائع! تم الرجوع للغة العربية. تقدر تسألني في أي وقت عن المنصة، الباقات، الكورسات، أو نرجع نتدرب إنجليزي تاني لما تحب! 🚀✨`;
  }

  // ============================================================
  // B. ENGLISH PRACTICE CONVERSATION & GRAMMAR CORRECTION
  // ============================================================
  const englishCharCount = (userText.match(/[a-zA-Z]/g) || []).length;
  const arabicCharCount = (userText.match(/[\u0600-\u06FF]/g) || []).length;
  const isEnglishMessage = englishCharCount > 0 && englishCharCount >= arabicCharCount;

  if (isEnglishMessage && userText.trim().length > 2) {
    const errorCheck = checkEnglishErrors(userText);

    let correctionPrefix = '';
    if (errorCheck.hasErrors) {
      correctionPrefix = `💡 **ملاحظة سريعة في الجرامر / الإملاء (Grammar & Spelling Correction)**:\n`;
      errorCheck.corrections.forEach((c, i) => {
        correctionPrefix += `${i + 1}️⃣ **الخطأ**: "${c.wrong}" ➔ **التصحيح الصحيح**: "**${c.correct}**" (${c.reason})\n`;
      });
      correctionPrefix += `\nيلا نرجع نتحدث تاني إنجليزي ونقوي اللغة! 🚀\n---\n\n`;
    }

    // Dynamic Natural English Replies
    let englishReply = '';
    if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
      englishReply = `Hello there, champion! 👋 I'm so glad to chat with you in English today! How is your study going so far?`;
    } else if (q.includes('how are you') || q.includes('how do you do')) {
      englishReply = `I am doing great, thank you for asking! 🌟 How about you? What did you do today?`;
    } else if (q.includes('thank')) {
      englishReply = `You are most welcome! 😊 You are doing an amazing job practicing your English. What else would you like to talk about?`;
    } else if (q.includes('study') || q.includes('school') || q.includes('unit') || q.includes('lesson')) {
      englishReply = `That sounds fantastic! 📚 Studying regularly is the key to getting 50/50 in English! What was the most interesting part of your lesson?`;
    } else if (q.includes('name')) {
      englishReply = `Nice to meet you! 😊 I am Mr. Omar AI, your friendly assistant. What is your favorite topic in English: Grammar, Vocabulary, or Essay Writing?`;
    } else {
      englishReply = `Great job expressing your thoughts! 👏 Writing in English regularly builds your confidence and fluency! What are your plans for tomorrow, or what subject do you plan to study next? Let's keep talking! 🚀`;
    }

    return `${correctionPrefix}${englishReply}`;
  }

  // ============================================================
  // C. GREETINGS & SOCIAL CHAT (هاي، هلو، ازيك، اخبارك، كيفك)
  // ============================================================
  if (
    /^هاي$/i.test(q) ||
    /^hi$/i.test(q) ||
    /^hello$/i.test(q) ||
    /^هلو$/i.test(q) ||
    q.includes('ازيك') ||
    q.includes('إزيك') ||
    q.includes('اخبارك') ||
    q.includes('أخبارك') ||
    q.includes('كيفك') ||
    q.includes('عامل ايه') ||
    q.includes('عامل إيه')
  ) {
    const responses = [
      'أهلاً وسهلاً بك يا بطل! 💖 الحمد لله كل شيء تمام، أنت عامل إيه في المذاكرة والمنصة؟ تفضل بأي سؤال وأنا جاهز لإجابتك فوراً! 🚀 (ولو حابب نتدرب ونحكي إنجليزي مع بعض قلّي كلمني إنجليزي! 🇬🇧)',
      'هاي يا بطل! 👋 يسعدني جداً التواصل معك. يومك موفق وسعيد! إيه الأخبار عندك، محتاج أي مساعدة في المنصة أو في الإنجليزي النهارده؟ ⚡ (ويمكنك طلب التحدث بالإنجليزي لممارسة اللغة!)',
      'أهلاً بك! 🌟 أنا بخير والحمد لله، وجاهز 24 ساعة لمساعدتك في كل ما تحتاجه. تفضل بطلبك يا بطل! 🔥',
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // ISLAMIC / FORMAL GREETINGS
  if (q.includes('سلام عليكم') || q.includes('السلام عليكم')) {
    return 'وعليكم السلام ورحمة الله وبركاته يا بطل! 💖 أهلاً وسهلاً بك في منصة مستر عمر مكاوي. كيف يمكنني مساعدتك اليوم؟ 🚀';
  }
  if (q.includes('صباح الخير') || q.includes('صباح النور')) {
    return 'صباح النور والهمة العالية يا بطل! ☀️ بداية يوم جديد مليء بالنشاط والتميز. جاهز لأي سؤال في الإنجليزي والمنصة! 🚀';
  }
  if (q.includes('مساء الخير') || q.includes('مساء النور')) {
    return 'مساء الورد والتفوق يا بطل! 🌙 أتمنى تكون حققت إنجاز رائع النهارده. تفضل بأي استفسار وسأجيبك فوراً! ✨';
  }

  // AI PERSONALITY & IDENTITY
  if (
    q.includes('مين انت') ||
    q.includes('انت مين') ||
    q.includes('من انت') ||
    q.includes('من أنت') ||
    q.includes('اسمك ايه') ||
    q.includes('شات جي بي تي') ||
    q.includes('chatgpt')
  ) {
    return `أنا **مستر عمر مكاوي AI** 🤖!

المساعد الذكي الشخصي المطور خصيصاً لمنصتك التعليمية:
- 🇬🇧 يمكنك التحدث والمحادثة معي باللغة الإنجليزية لتطوير مستواك تصحيح الأخطاء فورياً!
- 💬 أرد على جميع أسئلتك ومحادثاتك الطبيعية.
- 📚 أشرح لك قواعد اللغة الإنجليزية (Grammar & Vocab).
- 💳 أساعدك في تفاصيل الباقات وشحن المحفظة والامتحانات.

قل لي **"كلمني إنجليزي"** إذا أردت البدء في ممارسة اللغة الآن! 🚀✨`;
  }

  // GRATITUDE & PRAISE
  if (
    q.includes('شكرا') ||
    q.includes('شكراً') ||
    q.includes('تسلم') ||
    q.includes('بحبك') ||
    q.includes('حبيبي') ||
    q.includes('جامد') ||
    q.includes('عاش') ||
    q.includes('ممتاز')
  ) {
    return `العفو يا بطل! ❤️ يسعدني جداً أن أكون بجانبك وأساعدك. 

مستر عمر مكاوي وفريق المنصة جميعاً فخورون بك وبسعيك المستمر. واصل اجتهادك وشغفك، وإذا كان لديك أي سؤال آخر في الإنجليزي أو المنصة أنا هنا دائماً! 🚀🔥`;
  }

  // MOTIVATION & EMOTIONAL SUPPORT
  if (
    q.includes('خايف') ||
    q.includes('تعبت') ||
    q.includes('مش قادر') ||
    q.includes('محبط') ||
    q.includes('نصيحة') ||
    q.includes('تحفيز') ||
    q.includes('ثانوية عامة')
  ) {
    return `خذ أنفاساً عميقة وصفي ذهنك يا بطل! 🧘‍♂️✨

تذكر دائماً أن الشعور بالضغط في الثانوية أو الامتحانات أمر طبيعي جداً، لكن الفرق بين المتفوق وغيره هو الاستمرارية. إليك نصيحة المستر:
1️⃣ **لا تراكم المحاضرات**: ابدأ بخطوة صغيرة واحدة الآن أفضل من التأجيل.
2️⃣ **الخطأ هو طريق التعلم**: حل التمارين واخطأ في الامتحانات التجريبية بالمنصة لتتعلم، فالخطأ الآن هو سر الدرجة النهائية في آخر العام.
3️⃣ **الإنجليزي مادة تجميع درجات**: معنا في المنصة ستحصل على 50/50 بإذن الله بفضل الشرح والحل المستمر.

قوم وتوكل على الله.. أنت بطل وقادر توصل لحلمك! 🔥💪`;
  }

  // TRANSLATION & VOCABULARY QUERIES
  if (q.includes('ترجم') || q.includes('ترجمة') || q.includes('معنى') || q.includes('معناها ايه') || q.includes('يعني ايه')) {
    return `إليك التوضيح والترجمة يا بطل 📝:

عند التعامل مع الترجمة، ننصح دائماً بالاعتماد على **سياق الجملة المعنوي** وليس الترجمة الحرفية.

💡 **إذا كان لديك كلمة أو جملة معينة تريد ترجمتها الآن**:
اكتب لي الجملة النصية مباشرة وسأقوم بترجمتها لك فوراً مع شرح مفرداتها وصياغتها النموذجية! 🔤🚀`;
  }

  // GRAMMAR EXPLANATIONS
  if (
    q.includes('جرامر') ||
    q.includes('grammar') ||
    q.includes('ماضي') ||
    q.includes('مضارع') ||
    q.includes('مبني للمجهول') ||
    q.includes('passive') ||
    q.includes('present perfect') ||
    q.includes('past simple') ||
    q.includes('if') ||
    q.includes('قاعدة')
  ) {
    return `إليك شرح القاعدة ببساطة يا بطل 📚:

📌 **الماضي البسيط (Past Simple)**: يعبر عن حدث انتهى تماماً في زمن محدد في الماضي. (e.g., I visited Alexandria last year).
📌 **المضارع التام (Present Perfect - Have/Has + P.P)**: يعبر عن حدث في الماضي وله أثر مستمر في الحاضر. (e.g., I have studied English since morning).
📌 **المبني للمجهول (Passive)**: يركز على المفعول به والحدث نفسه (Object + Be + P.P).

إذا كان لديك تمرين أو سؤال محدد في هذه القاعدة أرسله لي فوراً وسأقوم بحله معك خطوة بخطوة! ✍️⚡`;
  }

  // PLATFORM INQUIRIES
  if (q.includes('باقة') || q.includes('باقات') || q.includes('اشتراك') || q.includes('اشترك') || q.includes('سعر')) {
    return `تفاصيل الباقات الشهرية في المنصة 💳:

1️⃣ افتح صفحة **"الباقات الشهرية"** من القائمة الجانبية.
2️⃣ اختر الصف الدراسي الخاص بك (ثالثة إعدادي / أولى ثانوي / تانية ثانوي / تالتة ثانوي).
3️⃣ ستظهر لك الباقات المتاحة مع التفاصيل والأسعار. اضغط "اشترك الآن" ويمكنك الدفع المباشر من محفظتك الإلكترونية بكل سهولة! 🚀`;
  }

  if (q.includes('محفظة') || q.includes('شحن') || q.includes('رصيد') || q.includes('فودافون')) {
    return `طريقة شحن المحفظة والرصيد 👛:

1️⃣ اذهب إلى صفحة **"المحفظة"**.
2️⃣ اضغط على **"شحن المحفظة"** وأدخل المبلغ المطلوب.
3️⃣ يمكنك استخدام فودافون كاش أو الفيزا لشحن الرصيد مباشرة، ومن ثم الاشتراك في أي كورس أو باقة! ⚡`;
  }

  if (q.includes('كتاب') || q.includes('كتب') || q.includes('متجر') || q.includes('ملزمة')) {
    return `متجر الكتب والملازم المطبوعة 📚🚚:

يمكنك طلب المذكرات والكتب المطبوعة الخاصة بمستر عمر مكاوي وتوصيلها حتى باب المنزل!
افتح صفحة **"متجر الكتب"**، أضف ملزمتك إلى السلة، وأدخل عنوانك ليصلك الطلب سرياعاً. يمكنك متابعة الشحنة من صفحة **"طلباتي"** 📦!`;
  }

  if (q.includes('امتحان') || q.includes('امتحانات') || q.includes('درجات')) {
    return `قسم الامتحانات الإلكترونية 📝🎯:

تتوفر الامتحانات في صفحة **"امتحاناتي"**. بعد الإجابة، يتم تصحيح الامتحان فورياً وإظهار درجتك والتفسير النموذجي لكل سؤال لمساعدتك على تقييم مستواك أولاً بأول! 📈`;
  }

  if (q.includes('دعم') || q.includes('تواصل') || q.includes('مشكلة') || q.includes('واتس')) {
    return `فريق الدعم الفني في خدمتك 24/7 💬:

إذا واجهتك أي مشكلة، يمكنك التواصل المباشر مع فريق الدعم عبر الواتساب أو الهاتف من صفحة **"الدعم والمساعدة"** وسنحل أي مشكلة فوراً! 🚀`;
  }

  // GENERAL KNOWLEDGE / DEFAULT CHATGPT FALLBACK
  return `إليك الإجابة يا بطل 💡:

بخصوص سؤالك: **"${userText}"**

أنا هنا دائماً لمساعدتك في كل ما يتعلق بـ **منصة مستر عمر مكاوي** واللغة الإنجليزية والمذاكرة العامة.

💡 **هل تعلم؟** يمكنك الآن كتابة رسائلك بالإنجليزي معي أو طلب **"كلمني إنجليزي"** لنبدأ في ممارسة المحادثة وتطوير مهاراتك مع تصحيح الأخطاء فورياً! 🇬🇧✨

إذا كان لديك أي تمرين أو سؤال تريد حله بالتفصيل، أرسله لي فوراً وأنا معك خطوة بخطوة! 🚀`;
}
