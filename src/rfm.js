// ────────────────────────────────────────────────────────────────────────────
// IGE Banking — CSV import + RFM scoring (Section 4 of the build spec)
// All money in the CSV is in KOBO. Compliance hard-stops enforced.
// ────────────────────────────────────────────────────────────────────────────

const REQUIRED = ['customer_id', 'account_type', 'kyc_tier', 'last_transaction_date', 'transaction_count_12m', 'total_value_12m', 'consent_status'];
const BVN_PATTERN = /\b2\d{10}\b/; // 11 consecutive digits starting with 2

export function parseCsv(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n').filter(l => l.trim().length);
  if (!lines.length) throw httpErr(400, 'Empty file.');
  const headers = splitCsvLine(lines[0]).map(h => h.trim().toLowerCase());
  const rows = lines.slice(1).map(line => {
    const cells = splitCsvLine(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (cells[i] ?? '').trim(); });
    return obj;
  });
  return { headers, rows };
}

export function validateImport({ headers, rows, rawText }) {
  // Hard-stop: consent column absent → reject (cannot infer consent, PR-BANK-003)
  if (!headers.includes('consent_status')) {
    throw httpErr(422, 'consent_status column is missing. IGE cannot infer consent — file rejected.');
  }
  // Hard-stop: required fields present
  const missing = REQUIRED.filter(f => !headers.includes(f));
  if (missing.length) throw httpErr(422, `Missing required columns: ${missing.join(', ')}`);

  // Hard-stop: BVN/NIN-pattern values anywhere → reject (PR-BANK-003)
  if (BVN_PATTERN.test(rawText)) {
    throw httpErr(422, 'File contains values matching a BVN pattern (11 digits starting with 2). For compliance, remove BVN/NIN/account numbers and re-upload.');
  }

  // Warning: >50% blank last_transaction_date
  const blankDates = rows.filter(r => !r.last_transaction_date).length;
  const warnings = [];
  if (rows.length && blankDates / rows.length > 0.5) {
    warnings.push('Over 50% of rows have a blank last_transaction_date — RFM scoring will be unreliable.');
  }
  return { warnings, total: rows.length };
}

// ── RFM scoring ─────────────────────────────────────────────────────────────
export function scoreAccounts(rows) {
  const today = Date.now();
  const enriched = rows.map(r => {
    const days = r.days_since_last_txn
      ? Number(r.days_since_last_txn)
      : daysBetween(r.last_transaction_date, today);
    return {
      customerId: r.customer_id,
      accountType: titleCase(r.account_type),
      kycTier: Number(r.kyc_tier) || 1,
      daysSince: isFinite(days) ? days : 999,
      freq: Number(r.transaction_count_12m) || 0,
      monetaryKobo: Number(r.total_value_12m) || 0,
      consent: /^true$/i.test(r.consent_status) ? 'Given' : 'Pending',
      branch: r.branch_name || '',
      avgBalanceKobo: Number(r.average_balance) || 0
    };
  });

  const rQuint = quintiles(enriched.map(e => -e.daysSince)); // recent = better
  const fQuint = quintiles(enriched.map(e => e.freq));
  const mQuint = quintiles(enriched.map(e => e.monetaryKobo));

  return enriched.map(e => {
    const R = quintScore(-e.daysSince, rQuint);
    const F = quintScore(e.freq, fQuint);
    const M = quintScore(e.monetaryKobo, mQuint);
    const rfm = Math.round(((R + F + M) / 15) * 100); // 0–100
    const segment = classify({ days: e.daysSince, R, F, M });
    return {
      customerId: e.customerId,
      accountType: e.accountType,
      kycTier: e.kycTier,
      arpu: Math.round(e.monetaryKobo / 12 / 100), // ₦/month
      lastTxn: relativeDays(e.daysSince),
      daysSince: e.daysSince,
      rfm,
      rfmColor: rfm >= 70 ? 'emerald' : rfm >= 40 ? 'brand' : 'rose',
      segment,
      consent: e.consent,
      branch: e.branch
    };
  });
}

function classify({ days, R, F, M }) {
  if (days >= 90) return 'Dormant';
  if (R >= 4 && F >= 4 && M >= 4) return 'Champion';
  if (F >= 3 && M >= 3) return 'Loyal';
  if (days >= 28) return 'At Risk';
  if (M <= 2 && F >= 3) return 'Price Sensitive';
  return 'Promising';
}

export function summarize(scored) {
  const total = scored.length;
  const dormant = scored.filter(s => s.segment === 'Dormant').length;
  const atRisk = scored.filter(s => s.segment === 'At Risk').length;
  const tier1 = scored.filter(s => s.kycTier === 1).length;
  const bySeg = {};
  scored.forEach(s => { bySeg[s.segment] = (bySeg[s.segment] || 0) + 1; });
  const segments = Object.entries(bySeg).map(([name, count]) => ({
    name, count, pct: Math.round((count / total) * 100)
  }));
  return { total, dormant, atRisk, tier1, segments };
}

// ── helpers ─────────────────────────────────────────────────────────────────
function splitCsvLine(line) {
  const out = []; let cur = ''; let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { if (q && line[i + 1] === '"') { cur += '"'; i++; } else q = !q; }
    else if (c === ',' && !q) { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out;
}
function daysBetween(dateStr, now) {
  const t = Date.parse(dateStr);
  if (isNaN(t)) return NaN;
  return Math.max(0, Math.floor((now - t) / 86400000));
}
function quintiles(arr) {
  const s = [...arr].sort((a, b) => a - b);
  const at = p => s[Math.min(s.length - 1, Math.floor(p * s.length))];
  return [at(0.2), at(0.4), at(0.6), at(0.8)];
}
function quintScore(v, q) {
  if (v <= q[0]) return 1; if (v <= q[1]) return 2; if (v <= q[2]) return 3; if (v <= q[3]) return 4; return 5;
}
function relativeDays(d) {
  if (d <= 0) return 'Today'; if (d === 1) return 'Yesterday'; return `${d} days ago`;
}
function titleCase(s) { return (s || '').charAt(0).toUpperCase() + (s || '').slice(1).toLowerCase(); }
function httpErr(status, message) { const e = new Error(message); e.status = status; return e; }