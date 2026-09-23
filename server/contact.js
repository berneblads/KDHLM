import { createHash } from 'node:crypto';

const recipient = 'hassleholm@kristdemokraterna.se';
const emailPattern = /^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/;
const reply = (status, code) => Response.json({ ok: status === 200, code }, {
  status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
});

// A bounded, per-instance throttle. No message content or email addresses are stored.
// Add platform-wide rate limiting before opening a high-traffic public deployment.
export function createContactHandler({ env = process.env, fetchImpl = fetch, now = Date.now } = {}) {
  const attempts = new Map();
  return async function handle(request) {
    if (request.method !== 'POST') return reply(405, 'method');
    const origin = request.headers.get('origin');
    if (!origin || origin !== new URL(request.url).origin) return reply(403, 'origin');
    if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') return reply(415, 'format');
    let input;
    try {
      const reader = request.body?.getReader();
      if (!reader) return reply(400, 'invalid');
      const chunks = []; let length = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        length += value.byteLength;
        if (length > 32768) { await reader.cancel(); return reply(413, 'too_large'); }
        chunks.push(value);
      }
      input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch { return reply(400, 'invalid'); }
    if (!input || typeof input !== 'object' || Array.isArray(input)) return reply(400, 'invalid');
    if (input.website) return reply(400, 'invalid');
    const { name, email, message, submissionId } = input;
    if (typeof name !== 'string' || !name.trim() || name.length > 100 || /[\r\n\x00-\x1f]/.test(name)
      || typeof email !== 'string' || email.length > 200 || !emailPattern.test(email.trim())
      || typeof message !== 'string' || !message.trim() || message.length > 5000 || message.includes('\0')
      || typeof submissionId !== 'string' || !/^[a-f0-9-]{36}$/i.test(submissionId)) return reply(400, 'invalid');
    if (!env.RESEND_API_KEY || !env.CONTACT_FROM_EMAIL) return reply(503, 'unavailable');

    const time = now();
    for (const [key, value] of attempts) if (value.expires <= time) attempts.delete(key);
    // Vercel sets x-vercel-forwarded-for; the local adapter strips client-supplied values.
    const ip = request.headers.get('x-vercel-forwarded-for') || 'local';
    const key = createHash('sha256').update(ip).digest('hex');
    const attempt = attempts.get(key) || { count: 0, expires: time + 600000 };
    if (attempt.count >= 5 || (!attempts.has(key) && attempts.size >= 10000)) return reply(429, 'rate_limit');
    attempt.count++; attempts.set(key, attempt);
    const payload = {
      from: env.CONTACT_FROM_EMAIL, to: [recipient], reply_to: email.trim(),
      subject: 'Meddelande från kontaktformuläret – KD Hässleholm',
      text: `Namn: ${name.trim()}\nE-post: ${email.trim()}\n\n${message.trim()}`,
    };
    const digest = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    try {
      const response = await fetchImpl('https://api.resend.com/emails', {
        method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json',
          'Idempotency-Key': `contact-${submissionId}-${digest}` },
        body: JSON.stringify(payload), signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) { console.error('Contact mail provider rejected request:', response.status); return reply(502, 'send_failed'); }
      const result = await response.json();
      if (typeof result.id !== 'string' || !result.id) return reply(502, 'send_failed');
      return reply(200, 'sent');
    } catch {
      console.error('Contact mail provider unavailable');
      return reply(502, 'send_failed');
    }
  };
}
