import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/api/v1'
    : 'https://api.omarmeckawy.com/api/v1');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { message, history, conversation_id } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { success: false, message: 'نص الرسالة مطلوب' },
        { status: 400 },
      );
    }

    // Forward to NestJS API backend
    const authHeader = req.headers.get('authorization') || '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const backendRes = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: message.trim(),
        history,
        conversation_id,
      }),
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error_code: 'AI_BACKEND_UNAVAILABLE',
        message: 'تعذر الاتصال بخادم المساعد الذكي، يرجى المحاولة مرة أخرى.',
      },
      { status: 503 },
    );
  }
}
