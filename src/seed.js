// ────────────────────────────────────────────────────────────────────────────
// IGE Banking v2 — Seed data matching the BUILD SPEC exactly
// FirstBank persona · ₦84.2M recovered · 168:1 ROI · 847 dormant
// All money in NAIRA for display. Nigerian financial-services context.
// Drop-in replacement for backend/src/seed.js
// ────────────────────────────────────────────────────────────────────────────

export function buildSeed() {
  return {
    // ── Institutions (multi-bank, Nigerian) ─────────────────────────────────
    institutions: [
      { id: 'firstbank', name: 'FirstBank Nigeria', customers: 31000000, tier: 'Enterprise+' },
      { id: 'uba',       name: 'UBA Nigeria',       customers: 32000000, tier: 'Enterprise+' },
      { id: 'access',    name: 'Access Bank',       customers: 28000000, tier: 'Growth' },
      { id: 'gtb',       name: 'GTBank',            customers: 24000000, tier: 'Growth' },
      { id: 'zenith',    name: 'Zenith Bank',       customers: 22000000, tier: 'Growth' }
    ],
    activeInstitution: 'firstbank',

    // ── Demo personas (spec Screen 0) ───────────────────────────────────────
    personas: [
      { id: 'adaeze', name: 'Adaeze Okonkwo', role: 'GMM',                         institution: 'firstbank', email: 'adaeze.okonkwo@firstbank.ng' },
      { id: 'tunde',  name: 'Tunde Adebiyi',  role: 'Digital Banking Director',     institution: 'access',    email: 'tunde.adebiyi@accessbank.ng' }
    ],

    // ── Dashboard KPI grid (spec Screen 1) ──────────────────────────────────
    dashboard: {
      totalAccounts: 2341,
      accountsThisMonth: 142,
      dormantCount: 847,
      dormantPct: 36,
      revenueRecovered30d: 84200000,    // ₦84.2M — THE number
      revenueDeltaPct: 18,
      kycUpgradeNeeded: 124,
      atRiskCount: 235,
      platformRoi: 168,                 // 168:1
      walletBalance: 150000,
      walletSpend: 42800,
      walletLimit: 150000
    },

    // ── Segments — 6 RFM segments (spec Screen 3) ───────────────────────────
    segments: [
      { id: 'champions',      name: 'Champions',       count: 327, pct: 14, color: 'emerald', arpu: 98400, lastTxn: '≤14 days',  kyc: 'Tier 2–3', recommendation: 'VIP product upsell' },
      { id: 'loyal',          name: 'Loyal Regulars',  count: 655, pct: 28, color: 'brand',   arpu: 48200, lastTxn: 'Stable',    kyc: 'Tier 2–3', recommendation: 'Investment product / loan pre-qualification' },
      { id: 'promising',      name: 'Promising',       count: 257, pct: 11, color: 'sky',     arpu: 18600, lastTxn: '15–30 days', kyc: 'Tier 1–2', recommendation: 'Activation nudge' },
      { id: 'atrisk',         name: 'At Risk',         count: 235, pct: 10, color: 'rose',    arpu: 24800, lastTxn: '28–89 days', kyc: 'Tier 1–2', recommendation: 'Win-back · 72-hour window' },
      { id: 'pricesensitive', name: 'Price Sensitive', count: 235, pct: 10, color: 'violet',  arpu: 12400, lastTxn: '30–60 days', kyc: 'Tier 1',   recommendation: 'Fee-waiver offer' },
      { id: 'dormant',        name: 'Dormant',         count: 847, pct: 36, color: 'gray',    arpu: 0,     lastTxn: '90+ days',   kyc: 'Mixed',    recommendation: '₦42.3M projected recovery at 10%' }
    ],

    // ── Account intelligence — 8 seeded rows (spec Section 6) ────────────────
    accounts: [
      { customerId: 'ACC-00012345', accountType: 'Savings',  kycTier: 3, arpu: 128400, lastTxn: 'Today',        daysSince: 0,   rfm: 98, segment: 'Champion',  rfmColor: 'emerald', consent: 'Given',   branch: 'Marina Lagos' },
      { customerId: 'ACC-00023456', accountType: 'Current',  kycTier: 1, arpu: 18200,  lastTxn: '94 days ago',  daysSince: 94,  rfm: 12, segment: 'Dormant',   rfmColor: 'gray',    consent: 'Given',   branch: 'Ikeja Lagos' },
      { customerId: 'ACC-00034567', accountType: 'Salary',   kycTier: 3, arpu: 64800,  lastTxn: '3 days ago',   daysSince: 3,   rfm: 74, segment: 'Loyal',     rfmColor: 'brand',   consent: 'Given',   branch: 'Wuse II Abuja' },
      { customerId: 'ACC-00045678', accountType: 'Savings',  kycTier: 1, arpu: 8400,   lastTxn: '112 days ago', daysSince: 112, rfm: 6,  segment: 'Dormant',   rfmColor: 'rose',    consent: 'Pending', branch: 'GRA Port Harcourt' },
      { customerId: 'ACC-00056789', accountType: 'Current',  kycTier: 2, arpu: 34600,  lastTxn: '28 days ago',  daysSince: 28,  rfm: 39, segment: 'At Risk',   rfmColor: 'rose',    consent: 'Given',   branch: 'Lekki Lagos' },
      { customerId: 'ACC-00067890', accountType: 'Savings',  kycTier: 3, arpu: 92100,  lastTxn: 'Yesterday',    daysSince: 1,   rfm: 91, segment: 'Champion',  rfmColor: 'emerald', consent: 'Given',   branch: 'Garki Abuja' },
      { customerId: 'ACC-00078901', accountType: 'Business', kycTier: 2, arpu: 218000, lastTxn: '5 days ago',   daysSince: 5,   rfm: 85, segment: 'Loyal',     rfmColor: 'brand',   consent: 'Given',   branch: 'Sabon Gari Kano' },
      { customerId: 'ACC-00089012', accountType: 'Savings',  kycTier: 1, arpu: 4200,   lastTxn: '2 days ago',   daysSince: 2,   rfm: 52, segment: 'Promising', rfmColor: 'sky',     consent: 'Given',   branch: 'Owerri Imo' }
    ],

    // ── Campaigns — seeded (spec Screen 4) ──────────────────────────────────
    campaigns: [
      { id: 'cmp-dorm60', name: 'Dormant Reactivation — Day 60 Wave',       segment: 'dormant',   channel: 'Email', sent: 847, opened: 356, openRate: 42, responded: 84, attributed: 4200000,  status: 'Live',      template: 'TPL-DORM-001',  createdAt: isoDaysAgo(7) },
      { id: 'cmp-champ',  name: 'Champions VIP — Investment Product Offer',  segment: 'champions', channel: 'Email', sent: 327, opened: 298, openRate: 91, responded: 47, attributed: 28400000, status: 'Live',      template: 'TPL-CHAMP-001', createdAt: isoDaysAgo(5) },
      { id: 'cmp-kyc1',   name: 'KYC Tier 1 Upgrade — Tier 2 Invitation',    segment: 'kyc-tier1', channel: 'Email', sent: 0,   opened: 0,   openRate: 0,  responded: 0,  attributed: 0,        status: 'Scheduled', template: 'TPL-KYC-001',   createdAt: isoDaysAgo(2) },
      { id: 'cmp-atrisk', name: 'At Risk — Win-Back Bundle Offer',           segment: 'atrisk',    channel: 'Email', sent: 0,   opened: 0,   openRate: 0,  responded: 0,  attributed: 0,        status: 'Draft',     template: 'TPL-RISK-001',  createdAt: isoDaysAgo(1) }
    ],

    // ── WhatsApp / Email conversion flows ───────────────────────────────────
    flows: [
      { id: 'debit',   name: 'Debit Card Acquisition',  conversion: 22.4, status: 'Live',  reward: '₦500 airtime' },
      { id: 'dormant', name: 'Dormant Reactivation',    conversion: 38.1, status: 'Live',  reward: '₦500 airtime' },
      { id: 'kyc',     name: 'KYC Self-Service Update',  conversion: 61.2, status: 'Live',  reward: '₦150 data bundle' },
      { id: 'salary',  name: 'Salary Account Enrolment', conversion: 14.7, status: 'Live',  reward: '₦2,000 welcome' },
      { id: 'bnpl',    name: 'BNPL Quick Accept',        conversion: 0,    status: 'Draft', reward: 'None' },
      { id: 'fx',      name: 'FX Travel Activation',     conversion: 0,    status: 'Draft', reward: '₦1,000 activation' }
    ],

    // ── Email flow templates (CBN-compliant copy) ───────────────────────────
    emailFlows: {
      dormant:    { subject: 'We miss you, {FirstName} — come back to FirstBank', p1: 'Hi {FirstName}, we noticed your {AccountType} account has been quiet since {LastTransactionDate}.', p2: 'Reactivate today and enjoy zero-fee transfers for 30 days. Your relationship manager at {BranchName} is ready to help.', cta: 'Reactivate now →' },
      kyc:        { subject: 'Action required: complete your KYC before the CBN deadline', p1: 'Hi {FirstName}, your account currently has Tier 1 limits (max ₦300K/day).', p2: 'Upgrade your KYC in under 5 minutes to unlock higher limits. Reply STOP to opt out.', cta: 'Update my KYC →' },
      champions:  { subject: '{FirstName}, an exclusive investment offer for you', p1: 'Hi {FirstName}, as one of our most valued customers, you are invited to our VIP investment product.', p2: 'Preferential rates apply. Speak to your dedicated manager at {BranchName}.', cta: 'View offer →' },
      atrisk:     { subject: '{FirstName}, here is something to welcome you back', p1: 'Hi {FirstName}, we have noticed less activity lately.', p2: 'For the next 72 hours, enjoy our win-back bundle: zero transfer fees and bonus airtime. Reply STOP to opt out.', cta: 'Claim bundle →' }
    },

    // ── Dormant reactivation 3-step sequence (spec Screen 5) ─────────────────
    dormantSequence: {
      steps: [
        { step: 1, label: 'Welcome back',       day: 60,  framing: 'Warm, personalised. Zero-fee transfer offer for 30 days.',                  sent: 847, opened: 356, openRate: 42, reactivated: 84, attributed: 4200000, status: 'Active — Step 1 complete' },
        { step: 2, label: 'Urgency trigger',    day: 90,  framing: 'Account quiet for 90 days. Moderate urgency, support contact. CBN opt-out.', pending: 763, status: 'Pending — awaiting Step 1 window close' },
        { step: 3, label: 'Final expiry alert', day: 105, framing: 'Maximum urgency. Dormancy management fee risk after 120 days (CBN).',         status: 'Pending' }
      ],
      byType: { Savings: 491, Current: 237, Salary: 119 },
      projection: { accounts: 847, rate: 10, recovered: 85, avgArpu: 49800, projected: 42300000 },
      igeFee: 500000,
      roi: 84.6
    },

    // ── KYC compliance — 3 tiers (spec Screen 6) ────────────────────────────
    kyc: {
      tiers: [
        { tier: 1, count: 890, color: 'rose',    limit: '₦50K/txn · ₦300K/day' },
        { tier: 2, count: 560, color: 'amber',   limit: '₦200K/txn' },
        { tier: 3, count: 891, color: 'emerald', limit: 'No limit' }
      ],
      pipeline: [
        { customerId: 'ACC-00023456', current: 1, eligible: 2, missing: 'Utility bill',    status: 'Pending outreach' },
        { customerId: 'ACC-00045678', current: 1, eligible: 2, missing: 'NIN verification', status: 'Contacted' },
        { customerId: 'ACC-00089012', current: 1, eligible: 2, missing: 'Passport / ID',    status: 'Doc submitted' },
        { customerId: 'ACC-00056789', current: 2, eligible: 3, missing: 'Proof of address', status: 'Verified' }
      ],
      bulk: { eligible: 124, channel: 'Email', expectedRate: '30–40%', consent: 'NDPC verified' },
      documents: [
        { type: 'Utility bills',    submitted: 47, verified: 38, pending: 9 },
        { type: 'NIN verification', submitted: 62, verified: 38, pending: 24 },
        { type: 'Passport / ID',    submitted: 29, verified: 17, pending: 12 }
      ]
    },

    // ── Revenue attribution (spec Screen 8) ─────────────────────────────────
    attribution: {
      totalImpact30d: 84200000,        // ₦84.2M
      platformRoi: 168,                // 168:1
      attributionWindow: 7,
      annualProjected: 1010000000,     // ₦1.01B
      igeFee: 500000,
      rows: [
        { campaign: 'Dormant reactivation', attributed: 4200000,  roi: 8.4 },
        { campaign: 'Champions VIP',        attributed: 28400000, roi: 56.8 },
        { campaign: 'At Risk win-back',     attributed: 13500000, roi: 27.0 },
        { campaign: 'KYC upgrade',          attributed: 0,        roi: null, note: 'Pending' }
      ]
    },

    // ── Live activity feed — rotates every 5s (spec Screen 1) ───────────────
    feed: [
      { type: 'send',    title: 'Reactivation email delivered', sub: 'ACC-00023456 · Dormant Day 60 complete',     value: '+₦18,400',  color: 'emerald' },
      { type: 'kyc',     title: 'KYC doc submitted',            sub: 'ACC-00234567 · Passport + proof of address', value: 'Tier 2→3',  color: 'amber' },
      { type: 'system',  title: 'RFM scores updated',           sub: '2,341 accounts rescored · 6 segment changes', value: 'Daily',    color: 'brand' },
      { type: 'alert',   title: 'At Risk alert',                sub: 'ACC-00056789 · 28 days inactive · 72hr window', value: '72hr',   color: 'rose' },
      { type: 'open',    title: 'Champions campaign opened',    sub: 'ACC-00067890 · 91% open rate',               value: '+₦92,400',  color: 'emerald' },
      { type: 'consent', title: 'Consent verified',             sub: '124 accounts · NDPC registry checked',       value: 'Compliant', color: 'violet' }
    ],

    // ── Audit log — 8 seeded entries (spec Screen 7) ────────────────────────
    audit: [
      auditEntry('send',     'Campaign sent — Dormant Day 60 · 847 emails · Template: TPL-DORM-001', 'GMM: A.Okonkwo',        isoMinsAgo(420)),
      auditEntry('consent',  'Consent check — 124 accounts validated against NDPC registry',          'System (consent)',      isoMinsAgo(390)),
      auditEntry('approval', 'Campaign approved — Champions VIP (Draft→Approved→Sending)',             'GMM: A.Okonkwo',        isoMinsAgo(360)),
      auditEntry('segment',  'Segment reclassification — 6 accounts moved (At Risk→Dormant)',          'System (RFM engine)',   isoMinsAgo(300)),
      auditEntry('system',   'KYC campaign created — Tier 1 Upgrade Invitation (124 recipients)',      'GMM: A.Okonkwo',        isoMinsAgo(240)),
      auditEntry('send',     'Reactivation attribution confirmed — ACC-00023456 · +₦18,400',           'System (attribution)',  isoMinsAgo(180)),
      auditEntry('optout',   'Opt-out processed — ACC-00045678 removed from marketing sends',          'System (consent)',      isoMinsAgo(120)),
      auditEntry('system',   'Daily RFM batch — 2,341 accounts rescored',                              'System (RFM engine)',   isoMinsAgo(60))
    ],

    // ── Wallet (spec Screen 1 + Wallet modal) ───────────────────────────────
    wallet: {
      balance: 150000,
      monthlySpend: 42800,
      monthlyLimit: 150000,
      points: 342,
      history: [
        { type: 'fund',   label: 'Wallet funded — bank transfer',  amount: 100000, ts: isoDaysAgo(6) },
        { type: 'spend',  label: 'Campaign cost — Dormant Day 60',  amount: -28400, ts: isoDaysAgo(5) },
        { type: 'spend',  label: 'Airtime sent — ₦500 × 28',        amount: -14000, ts: isoDaysAgo(4) },
        { type: 'reward', label: 'Reward points earned',            amount: 0, points: 120, ts: isoDaysAgo(3) },
        { type: 'fund',   label: 'Wallet funded — USSD',            amount: 50000,  ts: isoDaysAgo(2) },
        { type: 'spend',  label: 'Data bundle sent — ₦150 × 22',    amount: -3300,  ts: isoDaysAgo(1) },
        { type: 'reward', label: 'Reward points earned',            amount: 0, points: 222, ts: isoDaysAgo(0) }
      ]
    },

    // ── Commercial tiers (concept note §7) ──────────────────────────────────
    plans: [
      { id: 'starter',    name: 'Starter',     flows: 3,           messages: 5000,        features: ['Basic analytics'] },
      { id: 'growth',     name: 'Growth',      flows: 12,          messages: 150000,      features: ['Full analytics', 'Campaign management', 'Branch routing'] },
      { id: 'enterprise', name: 'Enterprise+', flows: 'Unlimited', messages: 'Unlimited', features: ['Webhooks', 'AI churn prediction', 'White-label', 'Dedicated support'] }
    ]
  };
}

// ── helpers ───────────────────────────────────────────────────────────────
function isoDaysAgo(n) { return new Date(Date.now() - n * 86400000).toISOString(); }
function isoMinsAgo(n) { return new Date(Date.now() - n * 60000).toISOString(); }
function auditEntry(type, event, user, ts) {
  return { id: 'evt_' + Math.random().toString(36).slice(2, 10), type, event, user, ts: ts || new Date().toISOString() };
}