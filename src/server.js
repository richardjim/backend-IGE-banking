// ────────────────────────────────────────────────────────────────────────────
// IGE Banking v2 — API server (matches build spec)
// All spec endpoints + working Brevo email + Postgres persistence.
// Drop-in replacement for backend/src/server.js
// ────────────────────────────────────────────────────────────────────────────
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import multer from 'multer';
import { nanoid } from 'nanoid';

import { buildSeed } from './seed.js';
import { sendEmail, sendSms, messagingStatus, outbox } from './messaging.js';
import { generateMessage, renderEmailHtml } from './ai.js';
import { parseCsv, validateImport, scoreAccounts, summarize } from './rfm.js';
import { initDb, dbStatus, persist, read } from './db.js';

const app = express();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB hard cap (spec)

app.use(cors());
app.use(express.json({ limit: '12mb' }));
app.use(morgan('tiny'));

// Persist every API request (fire-and-forget)
app.use((req, res, next) => {
  res.on('finish', () => {
    if (req.path.startsWith('/api')) {
      persist.request({
        method: req.method, path: req.path, status: res.statusCode,
        ip: req.headers['x-forwarded-for'] || req.ip,
        body: req.method === 'GET' ? null : sanitizeBody(req.body)
      });
    }
  });
  next();
});

// ── In-memory state ─────────────────────────────────────────────────────────
let DB = buildSeed();
function audit(type, event, user = 'GMM: A.Okonkwo') {
  const entry = { id: 'evt_' + nanoid(8), type, event, user, ts: new Date().toISOString() };
  DB.audit.unshift(entry);
  persist.audit(entry);
}
function sanitizeBody(b) { if (!b || typeof b !== 'object') return null; const c = { ...b }; if (c.password) c.password = '***'; return c; }
const money = n => '₦' + Number(n || 0).toLocaleString('en-NG');

// ── Health & config ─────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', messaging: messagingStatus(), db: dbStatus(), time: new Date().toISOString() }));
app.get('/api/config', (_req, res) => res.json({ messaging: messagingStatus(), db: dbStatus(), institution: DB.institutions.find(i => i.id === DB.activeInstitution) }));

// ── Auth (spec Screen 0) ────────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { email, password, persona } = req.body || {};
  if (persona) {
    const p = DB.personas.find(x => x.id === persona);
    if (p) { DB.activeInstitution = p.institution; return res.json({ token: 'demo_' + nanoid(10), user: p }); }
  }
  if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });
  res.json({ token: 'demo_' + nanoid(10), user: { name: email.split('@')[0], email, role: 'User', institution: DB.activeInstitution } });
});
app.get('/api/personas', (_req, res) => res.json(DB.personas));

// ── Institutions ────────────────────────────────────────────────────────────
app.get('/api/institutions', (_req, res) => res.json({ list: DB.institutions, active: DB.activeInstitution }));
app.post('/api/institutions/switch', (req, res) => {
  const { id } = req.body || {};
  if (!DB.institutions.find(i => i.id === id)) return res.status(404).json({ error: 'Unknown institution.' });
  DB.activeInstitution = id; res.json({ active: id });
});

// ── Dashboard (spec Screen 1) ───────────────────────────────────────────────
app.get('/api/dashboard/summary', (_req, res) => res.json(DB.dashboard));
app.get('/api/dashboard/feed', (_req, res) => res.json(DB.feed));

// ── Segments (spec Screen 3) ────────────────────────────────────────────────
app.get('/api/segments', (_req, res) => res.json(DB.segments));

// ── Accounts — RFM table (spec Screen 2) ────────────────────────────────────
app.get('/api/accounts', (req, res) => {
  const { segment, accountType, kycTier, page = 1, limit = 50 } = req.query;
  let rows = DB.accounts;
  if (segment)     rows = rows.filter(a => a.segment.toLowerCase() === String(segment).toLowerCase());
  if (accountType) rows = rows.filter(a => a.accountType.toLowerCase() === String(accountType).toLowerCase());
  if (kycTier)     rows = rows.filter(a => a.kycTier === Number(kycTier));
  const p = Math.max(1, Number(page)); const l = Math.max(1, Number(limit));
  res.json({ total: rows.length, page: p, limit: l, accounts: rows.slice((p - 1) * l, p * l) });
});

// ── Campaigns (spec Screen 4) ───────────────────────────────────────────────
app.get('/api/campaigns', (_req, res) => res.json(DB.campaigns));

// ── WhatsApp & Email flows (Conversion Flows) ───────────────────────────────
app.get('/api/flows', (_req, res) => res.json(DB.flows || []));
app.get('/api/flows/:id/email-preview', (req, res) => {
  const f = (DB.emailFlows || {})[req.params.id];
  if (!f) return res.status(404).json({ error: 'Unknown flow.' });
  const firstName = req.query.firstName || 'Ngozi';
  res.json({
    subject: f.subject.replace(/\{FirstName\}/g, firstName),
    html: renderEmailHtml({
      subject: f.subject, body: `${f.p1}\n\n${f.p2}`, firstName,
      tokens: { LastTransactionDate: '14 March 2026', AccountType: 'Savings', BranchName: 'Marina Lagos' }
    })
  });
});

// AI message generation — ≥1.4s visible loading (spec)
app.post('/api/campaigns/generate-message', async (req, res) => {
  const { segment, customerCount } = req.body || {};
  const start = Date.now();
  const msg = await generateMessage({ segment, customerCount });
  const elapsed = Date.now() - start;
  if (elapsed < 1400) await sleep(1400 - elapsed);
  res.json(msg);
});

// Launch campaign → persist + audit + optional real send
app.post('/api/campaigns/launch', async (req, res) => {
  const { segmentId, name, subject, body, channel = 'Email', testRecipient } = req.body || {};
  if (!segmentId || !name) return res.status(400).json({ error: 'segmentId and name are required.' });
  const seg = DB.segments.find(s => s.id === segmentId) || { count: 0, name: segmentId };
  const eligible = DB.accounts.filter(a => a.consent === 'Given');
  const reach = seg.count || eligible.length;
  const campaign = {
    id: 'cmp-' + nanoid(6), name, segment: segmentId, channel,
    sent: reach, opened: 0, openRate: 0, responded: 0, attributed: 0,
    status: 'Live', template: 'TPL-' + segmentId.toUpperCase().slice(0, 6), createdAt: new Date().toISOString()
  };
  DB.campaigns.unshift(campaign);
  persist.campaign(campaign);
  audit('send', `Campaign launched — ${name} · ${reach} ${channel.toLowerCase()} · consent-verified`);
  let delivery = null;
  if (testRecipient) {
    if (channel === 'SMS') delivery = await sendSms({ to: testRecipient, message: `${subject ? subject + ' — ' : ''}${stripTokens(body)}`.slice(0, 320) });
    else delivery = await sendEmail({ to: testRecipient, subject: subject || name, html: renderEmailHtml({ subject: subject || name, body: body || 'Your IGE Banking offer.', firstName: 'Customer' }) });
  }
  res.json({ campaignId: campaign.id, sent: reach, failed: 0, delivery });
});

// ── Engage single account (spec Screen 2 modal) ─────────────────────────────
app.post('/api/accounts/:id/engage', async (req, res) => {
  const acct = DB.accounts.find(a => a.customerId === req.params.id);
  if (!acct) return res.status(404).json({ error: 'Account not found.' });
  if (acct.consent !== 'Given') return res.status(403).json({ error: 'Consent not given — cannot send (PR-BANK-003).' });
  const { type = 'dormant', email, phone } = req.body || {};
  const copy = await generateMessage({ segment: type });
  let delivery = null;
  if (email) delivery = await sendEmail({ to: email, subject: copy.subject.replace(/\[FirstName\]/g, 'Customer'), html: renderEmailHtml({ subject: copy.subject, body: copy.body, firstName: 'Customer' }) });
  else if (phone) delivery = await sendSms({ to: phone, message: stripTokens(copy.body).slice(0, 320) });
  audit('send', `Single engage — ${acct.customerId} · ${type}`);
  res.json({ ok: true, account: acct.customerId, preview: copy, delivery });
});

// ── Dormant reactivation (spec Screen 5) ────────────────────────────────────
app.get('/api/dormant', (_req, res) => res.json(DB.dormantSequence));
app.post('/api/dormant/launch', (_req, res) => { audit('send', 'Dormant win-back sequence launched — Step 1 (Day 60) dispatched'); res.json({ ok: true, step: 1, sent: DB.dormantSequence.steps[0].sent }); });

// ── KYC (spec Screen 6) ─────────────────────────────────────────────────────
app.get('/api/kyc', (_req, res) => res.json(DB.kyc));
app.post('/api/kyc/launch', (_req, res) => { audit('send', `KYC upgrade campaign launched — ${DB.kyc.bulk.eligible} Tier 1 accounts`); res.json({ ok: true, eligible: DB.kyc.bulk.eligible }); });

// ── Audit (spec Screen 7) ───────────────────────────────────────────────────
app.get('/api/audit', (_req, res) => res.json(DB.audit));

// ── Revenue attribution (spec Screen 8) ─────────────────────────────────────
app.get('/api/reports/attribution', (_req, res) => res.json(DB.attribution));
app.post('/api/reports/export', (req, res) => {
  const { type = 'Monthly GMM Impact Report' } = req.body || {};
  audit('system', `Report generated — ${type}`);
  res.json({ ok: true, type, message: `${type} generated and downloaded ✓` });
});

// ── Wallet (spec Screen 1) ──────────────────────────────────────────────────
app.get('/api/wallet', (_req, res) => res.json(DB.wallet));
app.post('/api/wallet/fund', (req, res) => {
  const amount = Number(req.body?.amount) || 0;
  if (amount <= 0) return res.status(400).json({ error: 'Amount must be positive.' });
  DB.wallet.balance += amount;
  DB.wallet.history.unshift({ type: 'fund', label: `Wallet funded — ${req.body?.method || 'bank transfer'}`, amount, ts: new Date().toISOString() });
  audit('system', `Wallet funded — ${money(amount)}`);
  res.json({ balance: DB.wallet.balance });
});
app.post('/api/wallet/airtime', async (req, res) => {
  const { phone, amount = 500, network = 'MTN' } = req.body || {};
  if (!phone) return res.status(400).json({ error: 'Phone required.' });
  DB.wallet.balance -= Number(amount);
  DB.wallet.history.unshift({ type: 'spend', label: `Airtime sent — ${network} ₦${amount}`, amount: -Number(amount), ts: new Date().toISOString() });
  const delivery = await sendSms({ to: phone, message: `You have received ₦${amount} ${network} airtime from FirstBank Nigeria as a reward. Thank you for banking with us.` });
  audit('send', `Reward airtime — ₦${amount} → ${phone}`);
  res.json({ balance: DB.wallet.balance, delivery });
});

// ── Messaging outbox + persisted history ────────────────────────────────────
app.get('/api/messages/outbox', (_req, res) => res.json(outbox));
app.get('/api/history/requests',  async (_req, res) => res.json(await read.requests(200)));
app.get('/api/history/messages',  async (_req, res) => res.json(await read.messages(200)));
app.get('/api/history/campaigns', async (_req, res) => res.json(await read.campaigns()));
app.get('/api/history/audit',     async (_req, res) => res.json(await read.audit(200)));
app.get('/api/history/leads',     async (_req, res) => res.json(await read.leads(200)));

// ── Data import (spec Screen 9) ─────────────────────────────────────────────
app.get('/api/import/template', (_req, res) => {
  const headers = 'customer_id,account_type,kyc_tier,last_transaction_date,transaction_count_12m,total_value_12m,consent_status,average_balance,branch_name,days_since_last_txn';
  const sample = [
    'ACC-00010001,Savings,3,2026-05-20,42,1850000000,true,320000000,Marina Lagos,20',
    'ACC-00010002,Current,1,2026-02-18,3,45000000,false,12000000,Ikeja Lagos,111',
    'ACC-00010003,Salary,2,2026-06-01,18,640000000,true,88000000,Wuse II Abuja,8'
  ].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="ige_customer_template.csv"');
  res.send(headers + '\n' + sample + '\n');
});
app.post('/api/import', upload.single('file'), (req, res) => {
  try {
    const rawText = req.file ? req.file.buffer.toString('utf8') : (req.body?.csv || '');
    if (!rawText) return res.status(400).json({ error: 'No file or csv content provided.' });
    if (Buffer.byteLength(rawText) > 10 * 1024 * 1024) return res.status(413).json({ error: 'File exceeds 10MB — split into batches.' });
    const { headers, rows } = parseCsv(rawText);
    const { warnings, total } = validateImport({ headers, rows, rawText });
    const scored = scoreAccounts(rows);
    const summary = summarize(scored);
    DB.accounts = scored;
    audit('system', `CSV import — ${total} accounts parsed, RFM scored, NDPC checked`);
    audit('consent', `Consent check — ${scored.filter(s => s.consent === 'Given').length} of ${total} accounts marketable`);
    res.json({ ok: true, total, warnings, summary, preview: scored.slice(0, 5) });
  } catch (err) { res.status(err.status || 500).json({ error: err.message }); }
});

// ── Plans + demo reset ──────────────────────────────────────────────────────
app.get('/api/plans', (_req, res) => res.json(DB.plans));

// ── Leads (manual entry form) ───────────────────────────────────────────────
if (!DB.leads) DB.leads = [];
app.get('/api/leads', (_req, res) => res.json(DB.leads));
app.post('/api/leads', async (req, res) => {
  const { firstName, surname, phone, email, state, campaign, source } = req.body || {};
  if (!firstName || !surname || !phone) return res.status(400).json({ error: 'First name, surname and phone are required.' });
  const lead = {
    id: 'lead-' + nanoid(6), name: (firstName + ' ' + surname).trim(),
    phone, email: email || '', state: state || '', campaign: campaign || '', source: source || 'Manual',
    stage: 'New', createdAt: new Date().toISOString()
  };
  DB.leads.unshift(lead);
  persist.lead(lead);
  audit('system', `Lead captured — ${lead.name} · ${lead.campaign || 'no campaign'} · ${lead.source}`);
  // If an email was given, send a real welcome/confirmation
  let delivery = null;
  if (email) {
    const copy = await generateMessage({ segment: 'promising' });
    delivery = await sendEmail({ to: email, subject: copy.subject.replace(/\[FirstName\]/g, firstName), html: renderEmailHtml({ subject: copy.subject, body: copy.body, firstName: firstName }) });
  }
  res.json({ ok: true, lead, delivery });
});

// ── Branch routing ──────────────────────────────────────────────────────────
app.post('/api/branches/route', (req, res) => {
  const { name, branch, campaign } = req.body || {};
  if (!name || !branch) return res.status(400).json({ error: 'name and branch are required.' });
  audit('system', `Lead routed — ${name} → ${branch}${campaign ? ' · ' + campaign : ''}`);
  res.json({ ok: true, name, branch, appointment: 'Tomorrow 10:00 AM' });
});
app.post('/api/branches/auto-route', (_req, res) => {
  audit('system', 'Auto-routed 14 inbound leads across branches');
  res.json({ ok: true, routed: 14 });
});

// ── Reminders (generic, can send real email) ────────────────────────────────
app.post('/api/reminders', async (req, res) => {
  const { name, campaign, email, type = 'dormant' } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name is required.' });
  audit('send', `Reminder sent — ${name}${campaign ? ' · ' + campaign : ''}`);
  let delivery = null;
  if (email) {
    const copy = await generateMessage({ segment: type });
    delivery = await sendEmail({ to: email, subject: copy.subject.replace(/\[FirstName\]/g, name.split(' ')[0]), html: renderEmailHtml({ subject: copy.subject, body: copy.body, firstName: name.split(' ')[0] }) });
  }
  res.json({ ok: true, name, delivery });
});

app.post('/api/demo/reset', (_req, res) => { DB = buildSeed(); res.json({ status: 'reset' }); });

// ── Fallback + error handler ────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: `No route: ${req.method} ${req.path}` }));
app.use((err, _req, res, _next) => { console.error(err); res.status(err.status || 500).json({ error: err.message || 'Server error' }); });

// ── helpers ─────────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function stripTokens(s) { return (s || '').replace(/\[(\w+)\]/g, (_, k) => ({ FirstName: 'Customer', AccountType: 'account', BranchName: 'your branch', LastTransactionDate: 'recently', DaysDormant: 'some' }[k] || '')); }

const PORT = process.env.PORT || 4000;
initDb().then(async (ok) => {
  if (ok) {
    try {
      const saved = await read.campaigns();
      const seeded = new Set(DB.campaigns.map(c => c.id));
      saved.forEach(c => { if (c && !seeded.has(c.id)) DB.campaigns.unshift(c); });
      const sa = await read.audit(200);
      const seededA = new Set(DB.audit.map(a => a.id));
      sa.reverse().forEach(a => { if (a && !seededA.has(a.id)) DB.audit.unshift(a); });
      if (!DB.leads) DB.leads = [];
      const sl = await read.leads(200);
      const seededL = new Set(DB.leads.map(l => l.id));
      sl.forEach(l => { if (l && !seededL.has(l.id)) DB.leads.unshift(l); });
    } catch (e) { console.warn('Rehydrate skipped:', e.message); }
  }
  app.listen(PORT, () => console.log(`\n🏦 IGE Banking v2 API on http://localhost:${PORT}\n   Email: ${messagingStatus().email.provider}  ·  SMS: ${messagingStatus().sms.provider}  ·  DB: ${dbStatus().connected ? 'connected' : 'in-memory'}\n`));
});

export default app;