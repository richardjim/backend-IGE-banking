// ────────────────────────────────────────────────────────────────────────────
// IGE Banking — Messaging service
// Pluggable EMAIL + SMS providers. Picks provider from env. Falls back to a
// "console" provider so the demo NEVER errors even with zero credentials.
//
// EMAIL providers:  brevo | smtp | console   (set EMAIL_PROVIDER)
// SMS   providers:  brevo | termii | console  (set SMS_PROVIDER)
//
// FREE options used here:
//   • Brevo  — 300 emails/day + SMS + WhatsApp, one free API key  (recommended)
//   • SMTP   — Gmail App Password / Mailtrap sandbox (free)
//   • Termii — Nigeria-based SMS/OTP, free trial credits
// ────────────────────────────────────────────────────────────────────────────
import nodemailer from 'nodemailer';

const {
  EMAIL_PROVIDER = 'console',
  SMS_PROVIDER = 'console',

  // Brevo
  BREVO_API_KEY,
  BREVO_SENDER_EMAIL = 'campaigns@ige-banking.ng',
  BREVO_SENDER_NAME = 'IGE Banking',
  BREVO_SMS_SENDER = 'IGEBank',

  // SMTP (Gmail App Password / Mailtrap)
  SMTP_HOST,
  SMTP_PORT = '587',
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM = 'IGE Banking <campaigns@ige-banking.ng>',

  // Termii (Nigeria SMS)
  TERMII_API_KEY,
  TERMII_SENDER_ID = 'IGEBank'
} = process.env;

// ── In-memory outbox so the UI can show "what was sent" in the demo ─────────
export const outbox = { emails: [], sms: [] };

// ── EMAIL ───────────────────────────────────────────────────────────────────
let smtpTransport = null;
function getSmtpTransport() {
  if (!smtpTransport) {
    smtpTransport = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
    });
  }
  return smtpTransport;
}

export async function sendEmail({ to, subject, html, text }) {
  const record = { to, subject, provider: EMAIL_PROVIDER, ts: new Date().toISOString() };
  try {
    if (EMAIL_PROVIDER === 'brevo' && BREVO_API_KEY) {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          sender: { email: BREVO_SENDER_EMAIL, name: BREVO_SENDER_NAME },
          to: [{ email: to }],
          subject,
          htmlContent: html || `<p>${text || ''}</p>`,
          textContent: text
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || `Brevo ${res.status}`);
      record.status = 'sent';
      record.messageId = data.messageId;
    } else if (EMAIL_PROVIDER === 'smtp' && SMTP_HOST) {
      const info = await getSmtpTransport().sendMail({ from: SMTP_FROM, to, subject, html, text });
      record.status = 'sent';
      record.messageId = info.messageId;
    } else {
      // console fallback — never fails
      console.log(`\n📧 [EMAIL → ${to}] ${subject}\n${(text || stripHtml(html) || '').slice(0, 240)}\n`);
      record.status = 'simulated';
      record.messageId = 'sim_' + Date.now();
    }
  } catch (err) {
    // Spec rule: no error states in a demo — fall back silently.
    console.warn(`Email provider failed (${EMAIL_PROVIDER}), simulating:`, err.message);
    record.status = 'simulated';
    record.error = err.message;
    record.messageId = 'sim_' + Date.now();
  }
  outbox.emails.unshift(record);
  outbox.emails = outbox.emails.slice(0, 200);
  return record;
}

// ── SMS ───────────────────────────────────────────────────────────────────
export async function sendSms({ to, message }) {
  const record = { to, message: message?.slice(0, 160), provider: SMS_PROVIDER, ts: new Date().toISOString() };
  try {
    if (SMS_PROVIDER === 'brevo' && BREVO_API_KEY) {
      const res = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
        method: 'POST',
        headers: { 'api-key': BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ sender: BREVO_SMS_SENDER, recipient: normalizeMsisdn(to), content: message, type: 'transactional' })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || `Brevo SMS ${res.status}`);
      record.status = 'sent';
      record.reference = data.reference;
    } else if (SMS_PROVIDER === 'termii' && TERMII_API_KEY) {
      const res = await fetch('https://api.ng.termii.com/api/sms/send', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          to: normalizeMsisdn(to),
          from: TERMII_SENDER_ID,
          sms: message,
          type: 'plain',
          channel: 'generic',
          api_key: TERMII_API_KEY
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || `Termii ${res.status}`);
      record.status = 'sent';
      record.reference = data.message_id;
    } else {
      console.log(`\n📱 [SMS → ${to}] ${message}\n`);
      record.status = 'simulated';
      record.reference = 'sim_' + Date.now();
    }
  } catch (err) {
    console.warn(`SMS provider failed (${SMS_PROVIDER}), simulating:`, err.message);
    record.status = 'simulated';
    record.error = err.message;
    record.reference = 'sim_' + Date.now();
  }
  outbox.sms.unshift(record);
  outbox.sms = outbox.sms.slice(0, 200);
  return record;
}

export function messagingStatus() {
  return {
    email: { provider: EMAIL_PROVIDER, configured: EMAIL_PROVIDER === 'brevo' ? !!BREVO_API_KEY : EMAIL_PROVIDER === 'smtp' ? !!SMTP_HOST : true },
    sms:   { provider: SMS_PROVIDER,   configured: SMS_PROVIDER === 'brevo' ? !!BREVO_API_KEY : SMS_PROVIDER === 'termii' ? !!TERMII_API_KEY : true }
  };
}

// ── helpers ─────────────────────────────────────────────────────────────────
function stripHtml(s) { return (s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }
function normalizeMsisdn(n) {
  let d = String(n).replace(/\D/g, '');
  if (d.startsWith('0')) d = '234' + d.slice(1);     // Nigeria
  if (!d.startsWith('234') && d.length === 10) d = '234' + d;
  return d;
}
