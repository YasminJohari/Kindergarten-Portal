import { NextResponse } from 'next/server';

/**
 * Server-side AI proxy.
 *
 * The earlier build read NEXT_PUBLIC_GEMINI_API_KEY directly inside a client
 * component, so the secret was bundled into the browser JS and could be
 * harvested by any visitor. All AI calls now go through this route and the keys
 * stay on the server.
 *
 * Free-tier providers supported (both work without a credit card):
 *   1. Google Gemini -> https://aistudio.google.com/apikey
 *   2. Groq (Llama)  -> https://console.groq.com/keys
 *
 * If neither key is set the client falls back to the built-in offline engine.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export type AiProvider = 'gemini' | 'groq';

interface AssistantContext {
  role?: 'parent' | 'admin';
  userName?: string;
  childName?: string;
  childClass?: string;
  outstanding?: number;
  unpaidCount?: number;
  paidCount?: number;
  presentToday?: number;
  totalStudents?: number;
  latestPostTitle?: string;
  latestPostCategory?: string;
}

// NEXT_PUBLIC_GEMINI_API_KEY is still honoured so existing .env.local files keep
// working, but prefer the plain (server-only) variable name going forward.
const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const GROQ_KEY = process.env.GROQ_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

const RATE_LIMIT = Number(process.env.AI_RATE_LIMIT || 12); // requests / minute / IP
const MAX_QUESTION = 600;
const REQUEST_TIMEOUT_MS = 20000;

function providerList(): AiProvider[] {
  const list: AiProvider[] = [];
  if (GEMINI_KEY) list.push('gemini');
  if (GROQ_KEY) list.push('groq');
  return list;
}

/** Lightweight in-memory fixed-window limiter — good enough for a free-tier key. */
const buckets = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(ip);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(ip, { count: 1, resetAt: now + 60_000 });
    if (buckets.size > 5000) buckets.clear();
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_LIMIT;
}

function systemPrompt(ctx: AssistantContext): string {
  const audience = ctx.role === 'admin' ? 'guru/pentadbir tadika' : 'ibu bapa/waris';
  return (
    `Anda ialah asisten mesra bagi portal prasekolah Malaysia "Tadika Cahaya Bintang" ` +
    `(Shah Alam, Selangor). Anda berinteraksi dengan seorang ${audience} bernama ` +
    `${ctx.userName || 'pengguna'}. ` +
    `Jawab dalam Bahasa Melayu yang ringkas dan mesra; istilah Inggeris biasa ` +
    `(FPX, DuitNow, eWallet) boleh dicampur. Maksimum 120 patah perkataan. ` +
    `Guna bullet point "•" bila sesuai. Jangan mereka data yang tiada dalam konteks; ` +
    `arahkan pengguna ke tab portal yang betul jika perlu. ` +
    `Konteks semasa portal (JSON): ${JSON.stringify(ctx)}`
  );
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function askGemini(question: string, ctx: AssistantContext): Promise<string> {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent` +
    `?key=${encodeURIComponent(GEMINI_KEY)}`;
  const res = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: `${systemPrompt(ctx)}\n\nSoalan: ${question}` }] }],
      generationConfig: { temperature: 0.6, maxOutputTokens: 500 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('').trim();
  if (!text) throw new Error('Gemini returned an empty response');
  return text;
}

async function askGroq(question: string, ctx: AssistantContext): Promise<string> {
  const res = await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.6,
      max_tokens: 500,
      messages: [
        { role: 'system', content: systemPrompt(ctx) },
        { role: 'user', content: question },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Groq HTTP ${res.status}`);
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Groq returned an empty response');
  return text;
}

/** GET /api/ai — lets the UI badge show "live AI" vs "offline engine". */
export async function GET() {
  return NextResponse.json({ configured: providerList().length > 0, providers: providerList() });
}

/** POST /api/ai — body { question, context } -> { answer, provider }. */
export async function POST(request: Request) {
  const providers = providerList();
  if (providers.length === 0) {
    return NextResponse.json({ answer: null, provider: 'none' });
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'local';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      {
        answer: null,
        provider: 'none',
        error: 'Kadar permintaan AI terlalu tinggi. Sila tunggu sebentar.',
      },
      { status: 429 }
    );
  }

  let question = '';
  let context: AssistantContext = {};
  try {
    const body = (await request.json()) as { question?: string; context?: AssistantContext };
    question = String(body.question || '').slice(0, MAX_QUESTION).trim();
    context = body.context && typeof body.context === 'object' ? body.context : {};
  } catch {
    return NextResponse.json(
      { answer: null, provider: 'none', error: 'Bad request body' },
      { status: 400 }
    );
  }

  if (!question) {
    return NextResponse.json(
      { answer: null, provider: 'none', error: 'Soalan kosong' },
      { status: 400 }
    );
  }

  // Try each configured provider in order; first success wins.
  for (const provider of providers) {
    try {
      const answer =
        provider === 'gemini' ? await askGemini(question, context) : await askGroq(question, context);
      return NextResponse.json({ answer, provider });
    } catch (err) {
      console.error(`[api/ai] ${provider} failed:`, err instanceof Error ? err.message : err);
    }
  }

  // All providers failed — the client answers with its offline engine instead.
  return NextResponse.json({ answer: null, provider: 'none' }, { status: 503 });
}
