import { formatCurrencyMYR } from './utils';

/**
 * AI client for the assistant.
 *
 * Live answers are produced by the server-side proxy at /api/ai (Google Gemini
 * or Groq free tier). Secrets live in server-only env vars — never NEXT_PUBLIC_*
 * — so they are no longer shipped to the browser. When no key is configured, or
 * the provider/network fails, the offline engine below answers from live portal
 * data so the assistant always works.
 */
export type AiProvider = 'gemini' | 'groq' | 'offline' | 'none';

export interface AiStatus {
  configured: boolean;
  providers: AiProvider[];
}

export interface AssistantReply {
  answer: string;
  usedLiveAi: boolean;
  provider: AiProvider;
}

export interface AssistantContext {
  role: 'parent' | 'admin';
  userName: string;
  childName: string;
  childClass: string;
  outstanding: number;
  unpaidCount: number;
  paidCount: number;
  presentToday: number;
  totalStudents: number;
  latestPostTitle: string;
  latestPostCategory: string;
}

export interface AssistantMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  /** Set on AI replies so the UI can show live-model vs offline answers. */
  provider?: AiProvider;
}

export const PARENT_SUGGESTIONS = [
  'Ringkasan aktiviti anak hari ini',
  'Bila saya perlu bayar yuran bulan ini?',
  'Draf mesej cuti sakit untuk Cikgu',
  'Tip jaga kesihatan anak di tadika',
];

export const ADMIN_SUGGESTIONS = [
  'Ringkasan kehadiran kelas hari ini',
  'Status kutipan yuran sekolah',
  'Draf pengumuman untuk ibu bapa',
  'Tip urus bilik darjah 4 tahun',
];

function buildSummary(ctx: AssistantContext): string {
  const lines: string[] = [];
  if (ctx.role === 'parent') {
    lines.push(`Ringkasan hari ini untuk ${ctx.childName} (${ctx.childClass}):`);
    lines.push(`• Aktiviti terkini: "${ctx.latestPostTitle}" [${ctx.latestPostCategory}]`);
    lines.push(
      ctx.unpaidCount > 0
        ? `• Baki yuran belum dibayar: ${formatCurrencyMYR(ctx.outstanding)} (${ctx.unpaidCount} invois). Bayar sebelum 07 haribulan bagi elak caj lewat.`
        : '• Semua yuran telah diselesaikan. Tahniah!'
    );
    lines.push('• Kehadiran direkodkan pagi ini dengan pemeriksaan suhu seperti biasa.');
    lines.push('• Tips: tanya anak tentang aktiviti sains hari ini untuk galakkan komunikasi harian.');
  } else {
    lines.push('Ringkasan sekolah hari ini:');
    lines.push(
      `• Kehadiran murid: ${ctx.presentToday}/${ctx.totalStudents} hadir (${
        ctx.totalStudents - ctx.presentToday
      } tidak hadir/lewat/sakit).`
    );
    lines.push(
      ctx.unpaidCount > 0
        ? `• Kutipan: ${ctx.paidCount} invois dibayar, ${ctx.unpaidCount} menunggu (${formatCurrencyMYR(
            ctx.outstanding
          )} belum dikutip).`
        : '• Semua invois telah dikutip penuh.'
    );
    lines.push(`• Pos terkini dikongsi: "${ctx.latestPostTitle}".`);
    lines.push('• Cadangan: hantar peringatan WhatsApp kepada waris yang belum membayar hari ini.');
  }
  return lines.join('\n');
}
function localAnswer(question: string, ctx: AssistantContext): string {
  const q = question.toLowerCase();

  if (/(ringkasan|summary|hari ini|today|overview)/.test(q)) {
    return buildSummary(ctx);
  }
  if (/(yuran|bayar|invoice|invois|bili?l|fee|payment|due)/.test(q)) {
    if (ctx.role === 'parent') {
      return ctx.unpaidCount > 0
        ? `Anda mempunyai ${ctx.unpaidCount} invois tertunggak berjumlah ${formatCurrencyMYR(
            ctx.outstanding
          )}. Kaedah bayaran disokong: FPX (Maybank2u, CIMB Clicks, RHB), DuitNow QR, dan Touch 'n Go eWallet. Resit PDF dijana automatik selepas bayaran berjaya.`
        : `Tiada baki tertunggak buat masa ini. ${ctx.paidCount} invois telah dibayar sepenuhnya. Terima kasih!`;
    }
    return `Status kutipan: ${ctx.paidCount} invois dibayar dan ${ctx.unpaidCount} menunggu (${formatCurrencyMYR(
      ctx.outstanding
    )} belum dikutip). Gunakan butang "Peringatan WhatsApp" dalam tab Pengurusan Yuran untuk mengingatkan waris.`;
  }
  if (/(kehadiran|hadir|absen|attendance|suhu|temperature|demam|fever)/.test(q)) {
    return `Kehadiran hari ini: ${ctx.presentToday}/${ctx.totalStudents} murid hadir. Pemeriksaan suhu dijalankan setiap pagi (paras normal 36.0-37.4 C). Murid dengan suhu 37.5 C ke atas perlu diasingkan dan waris dimaklumkan segera.`;
  }
  if (/(mesej|message|cikgu|teacher|cuti|sakit|absen|hantar)/.test(q)) {
    return ctx.role === 'parent'
      ? `Draf mesej untuk Cikgu:\n"Assalamualaikum Cikgu Sarah, mohon maaf ${ctx.childName} tidak dapat hadir hari ini kerana demam. Kami akan berikan ubat dan sijil sakit esok. Terima kasih."\n(Salin dari templat dalam tab Mesej Guru.)`
      : `Cadangan mesej waris: "Yth. Tuan/Puan, murid kelas ${ctx.childClass} tidak hadir pada sesi pagi hari ini. Sila maklumkan sebab melalui portal. Terima kasih."`;
  }
  if (/(tip|tips|saran|cadangan|advice|suggest|idea)/.test(q)) {
    return ctx.role === 'parent'
      ? 'Tip hari ini: kekalkan waktu tidur tetap, sediakan bekal bertenaga, dan semak papan notis portal setiap pagi bagi memastikan tiada acara sekolah terlepas.'
      : 'Tip bilik darjah: gunakan sistem nombor meja untuk peralihan pantas, kekalkan sistem "2 bintang" untuk tingkah laku positif, dan raikan setiap pencapaian kecil murid 4-6 tahun.';
  }
  if (/(hai|hello|hi|assalam|terima kasih|thanks)/.test(q)) {
    return `Hai ${ctx.userName}! Saya Asisten AI Tadika Cahaya Bintang. Tanya saya tentang kehadiran, yuran, mesej guru, atau tip penjagaan anak.`;
  }
  return buildSummary(ctx);
}

/**
 * Ask the assistant. The server-side proxy (/api/ai) holds the API keys and
 * tries Google Gemini then Groq; on any failure we answer from the offline
 * engine so the feature never breaks for the user.
 */
export async function askAssistant(
  question: string,
  ctx: AssistantContext
): Promise<AssistantReply> {
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, context: ctx }),
    });
    if (res.ok) {
      const data = (await res.json()) as { answer?: string | null; provider?: AiProvider };
      if (data.answer) {
        return { answer: data.answer, usedLiveAi: true, provider: data.provider || 'gemini' };
      }
    }
  } catch {
    // Proxy unreachable — answer locally instead.
  }
  return { answer: localAnswer(question, ctx), usedLiveAi: false, provider: 'offline' };
}

/** Which providers the server holds keys for — drives the assistant UI badge. */
export async function fetchAiStatus(): Promise<AiStatus> {
  try {
    const res = await fetch('/api/ai');
    if (!res.ok) return { configured: false, providers: [] };
    const data = (await res.json()) as Partial<AiStatus>;
    return { configured: Boolean(data.configured), providers: data.providers || [] };
  } catch {
    return { configured: false, providers: [] };
  }
}

