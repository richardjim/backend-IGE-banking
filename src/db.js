// ────────────────────────────────────────────────────────────────────────────
// IGE Banking — persistence layer (Render PostgreSQL)
// Safe by design: if DATABASE_URL is missing or the DB is down/expired/restarting,
// every function degrades to a no-op and the API keeps serving in-memory + seed.
// This means the demo NEVER breaks because of the database.
// ────────────────────────────────────────────────────────────────────────────
import pg from 'pg';

const { DATABASE_URL } = process.env;
let pool = null;
let ready = false;

export function dbEnabled() { return ready; }
export function dbStatus() {
  return { configured: !!DATABASE_URL, connected: ready };
}

export async function initDb() {
  if (!DATABASE_URL) {
    console.log('ℹ️  No DATABASE_URL — running in-memory only (data resets on restart).');
    return false;
  }
  try {
    pool = new pg.Pool({
      connectionString: DATABASE_URL,
      ssl: process.env.PGSSL === 'disable' ? false : { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 8000
    });
    pool.on('error', (e) => { console.warn('PG pool error (continuing in-memory):', e.message); ready = false; });

    await pool.query('SELECT 1');
    await createTables();
    ready = true;
    console.log('🗄️  PostgreSQL connected — requests will be persisted.');
    return true;
  } catch (err) {
    console.warn('⚠️  DB connect failed — continuing in-memory only:', err.message);
    ready = false;
    return false;
  }
}

async function createTables() {
  // One generic event table captures EVERY backend request the app cares about,
  // plus dedicated tables for the records the UI lists back.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS requests (
      id          BIGSERIAL PRIMARY KEY,
      ts          TIMESTAMPTZ NOT NULL DEFAULT now(),
      method      TEXT,
      path        TEXT,
      status      INT,
      ip          TEXT,
      body        JSONB
    );
    CREATE TABLE IF NOT EXISTS campaigns (
      id          TEXT PRIMARY KEY,
      ts          TIMESTAMPTZ NOT NULL DEFAULT now(),
      name        TEXT,
      segment     TEXT,
      channel     TEXT,
      sent        INT,
      status      TEXT,
      data        JSONB
    );
    CREATE TABLE IF NOT EXISTS messages (
      id          BIGSERIAL PRIMARY KEY,
      ts          TIMESTAMPTZ NOT NULL DEFAULT now(),
      kind        TEXT,            -- 'email' | 'sms'
      recipient   TEXT,
      subject     TEXT,
      provider    TEXT,
      status      TEXT,
      reference   TEXT,
      data        JSONB
    );
    CREATE TABLE IF NOT EXISTS audit (
      id          TEXT PRIMARY KEY,
      ts          TIMESTAMPTZ NOT NULL DEFAULT now(),
      type        TEXT,
      event       TEXT,
      app_user    TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_requests_ts ON requests(ts DESC);
    CREATE INDEX IF NOT EXISTS idx_messages_ts ON messages(ts DESC);
  `);
}

// ── safe writers (never throw) ──────────────────────────────────────────────
async function safe(fn) {
  if (!ready || !pool) return null;
  try { return await fn(); }
  catch (err) { console.warn('DB write skipped:', err.message); return null; }
}

export const persist = {
  request: (r) => safe(() => pool.query(
    'INSERT INTO requests(method,path,status,ip,body) VALUES($1,$2,$3,$4,$5)',
    [r.method, r.path, r.status, r.ip, r.body ? JSON.stringify(r.body) : null]
  )),
  campaign: (c) => safe(() => pool.query(
    `INSERT INTO campaigns(id,name,segment,channel,sent,status,data) VALUES($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (id) DO UPDATE SET status=EXCLUDED.status, sent=EXCLUDED.sent, data=EXCLUDED.data`,
    [c.id, c.name, c.segment, c.channel, c.sent, c.status, JSON.stringify(c)]
  )),
  message: (m) => safe(() => pool.query(
    'INSERT INTO messages(kind,recipient,subject,provider,status,reference,data) VALUES($1,$2,$3,$4,$5,$6,$7)',
    [m.kind, m.to, m.subject || null, m.provider, m.status, m.reference || m.messageId || null, JSON.stringify(m)]
  )),
  audit: (a) => safe(() => pool.query(
    'INSERT INTO audit(id,type,event,app_user) VALUES($1,$2,$3,$4) ON CONFLICT (id) DO NOTHING',
    [a.id, a.type, a.event, a.user]
  ))
};

// ── readers (return [] on any failure so routes still respond) ──────────────
export const read = {
  requests: async (limit = 100) => (await safe(() => pool.query('SELECT method,path,status,ts FROM requests ORDER BY ts DESC LIMIT $1', [limit])))?.rows || [],
  campaigns: async () => (await safe(() => pool.query('SELECT data FROM campaigns ORDER BY ts DESC')))?.rows?.map(r => r.data) || [],
  messages: async (limit = 200) => (await safe(() => pool.query('SELECT data FROM messages ORDER BY ts DESC LIMIT $1', [limit])))?.rows?.map(r => r.data) || [],
  audit: async (limit = 200) => (await safe(() => pool.query('SELECT id,type,event,app_user AS user,ts FROM audit ORDER BY ts DESC LIMIT $1', [limit])))?.rows || []
};