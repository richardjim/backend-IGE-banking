// ────────────────────────────────────────────────────────────────────────────
// IGE Banking — Canonical seed data
// Numbers here MUST match the UI prototype and the build spec exactly.
// All money values are stored in NAIRA (display) plus kobo where the schema needs it.
// ────────────────────────────────────────────────────────────────────────────

export function buildSeed() {
  return {
    // ── Institutions (multi-bank architecture) ──────────────────────────────
    institutions: [
      { id: 'uba', name: 'UBA Nigeria', customers: 32000000, tier: 'Enterprise+' },
      { id: 'firstbank', name: 'FirstBank Nigeria', customers: 31000000, tier: 'Enterprise+' },
      { id: 'access', name: 'Access Bank', customers: 28000000, tier: 'Growth' },
      { id: 'gtb', name: 'GTBank', customers: 24000000, tier: 'Growth' },
      { id: 'zenith', name: 'Zenith Bank', customers: 22000000, tier: 'Growth' }
    ],
    activeInstitution: 'uba',

    // ── Demo personas for quick login ───────────────────────────────────────
    personas: [
      { id: 'adaeze', name: 'Adaeze Okonkwo', role: 'GMM', institution: 'firstbank', email: 'adaeze.okonkwo@firstbank.ng' },
      { id: 'tunde', name: 'Tunde Adebiyi', role: 'Digital Banking Director', institution: 'access', email: 'tunde.adebiyi@accessbank.ng' }
    ],

    // ── Dashboard KPI grid ──────────────────────────────────────────────────
    dashboard: {
      totalLeads: 48292,
      leadsThisWeek: 2841,
      conversionsMTD: 9641,
      conversionRate: 19.9,
      revenueRecovered: 4800000000,        // ₦4.8B (platform-level pilot)
      avgCampaignCAC: 1240,
      industryCAC: 15000,
      // Spec-level "single bank" KPIs (FirstBank demo persona)
      totalAccounts: 2341,
      accountsThisMonth: 142,
      dormantCount: 847,
      dormantPct: 36,
      revenueRecovered30d: 84200000,       // ₦84.2M
      revenueDeltaPct: 18,
      kycUpgradeNeeded: 124,
      platformRoi: 168,                    // 168:1
      walletBalance: 150000,
      walletSpend: 42800,
      walletLimit: 150000
    },

    // ── Segments (RFM) ──────────────────────────────────────────────────────
    segments: [
      { id: 'champions', name: 'Champions', count: 327, pct: 14, color: 'emerald', arpu: 98400, lastTxn: '≤14 days', kyc: 'Tier 2–3', recommendation: 'VIP product upsell' },
      { id: 'loyal', name: 'Loyal Regulars', count: 655, pct: 28, color: 'brand', arpu: 48200, lastTxn: 'Stable', kyc: 'Tier 2–3', recommendation: 'Investment product / loan pre-qualification' },
      { id: 'promising', name: 'Promising', count: 257, pct: 11, color: 'sky', arpu: 18600, lastTxn: '15–30 days', kyc: 'Tier 1–2', recommendation: 'Activation nudge' },
      { id: 'atrisk', name: 'At Risk', count: 235, pct: 10, color: 'rose', arpu: 24800, lastTxn: '28–89 days', kyc: 'Tier 1–2', recommendation: 'Win-back · 72-hour window' },
      { id: 'pricesensitive', name: 'Price Sensitive', count: 235, pct: 10, color: 'violet', arpu: 12400, lastTxn: '30–60 days', kyc: 'Tier 1', recommendation: 'Fee-waiver offer' },
      { id: 'dormant', name: 'Dormant', count: 847, pct: 36, color: 'gray', arpu: 0, lastTxn: '90+ days', kyc: 'Mixed', recommendation: '₦42.3M projected recovery at 10%' }
    ],

    // ── Account intelligence table (8 seeded rows from the spec) ────────────
    accounts: [
      { customerId: 'ACC-00012345', accountType: 'Savings',  kycTier: 3, arpu: 128400, lastTxn: 'Today',        daysSince: 0,   rfm: 98, segment: 'Champion', rfmColor: 'emerald', consent: 'Given',   branch: 'Victoria Island Lagos' },
      { customerId: 'ACC-00023456', accountType: 'Current',  kycTier: 1, arpu: 18200,  lastTxn: '94 days ago',  daysSince: 94,  rfm: 12, segment: 'Dormant',  rfmColor: 'gray',    consent: 'Given',   branch: 'Ikeja Lagos' },
      { customerId: 'ACC-00034567', accountType: 'Salary',   kycTier: 3, arpu: 64800,  lastTxn: '3 days ago',   daysSince: 3,   rfm: 74, segment: 'Loyal',    rfmColor: 'brand',   consent: 'Given',   branch: 'Wuse II Abuja' },
      { customerId: 'ACC-00045678', accountType: 'Savings',  kycTier: 1, arpu: 8400,   lastTxn: '112 days ago', daysSince: 112, rfm: 6,  segment: 'Dormant',  rfmColor: 'rose',    consent: 'Pending', branch: 'GRA Port Harcourt' },
      { customerId: 'ACC-00056789', accountType: 'Current',  kycTier: 2, arpu: 34600,  lastTxn: '28 days ago',  daysSince: 28,  rfm: 39, segment: 'At Risk',  rfmColor: 'rose',    consent: 'Given',   branch: 'Lekki Lagos' },
      { customerId: 'ACC-00067890', accountType: 'Savings',  kycTier: 3, arpu: 92100,  lastTxn: 'Yesterday',    daysSince: 1,   rfm: 91, segment: 'Champion', rfmColor: 'emerald', consent: 'Given',   branch: 'Garki Abuja' },
      { customerId: 'ACC-00078901', accountType: 'Business', kycTier: 2, arpu: 218000, lastTxn: '5 days ago',   daysSince: 5,   rfm: 85, segment: 'Loyal',    rfmColor: 'brand',   consent: 'Given',   branch: 'Sabon Gari Kano' },
      { customerId: 'ACC-00089012', accountType: 'Savings',  kycTier: 1, arpu: 4200,   lastTxn: '2 days ago',   daysSince: 2,   rfm: 52, segment: 'Promising',rfmColor: 'sky',     consent: 'Given',   branch: 'Owerri Imo' }
    ],

    // ── Campaigns (seeded + launched at runtime) ────────────────────────────
    campaigns: [
      { id: 'cmp-dorm60',  name: 'Dormant Reactivation — Day 60 Wave', segment: 'dormant',   channel: 'Email', sent: 847, opened: 356, openRate: 42, responded: 84, attributed: 4200000,  status: 'Live',      template: 'TPL-DORM-001', createdAt: isoDaysAgo(7) },
      { id: 'cmp-champ',   name: 'Champions VIP — Investment Offer',   segment: 'champions', channel: 'Email', sent: 327, opened: 298, openRate: 91, responded: 47, attributed: 28400000, status: 'Live',      template: 'TPL-CHAMP-001', createdAt: isoDaysAgo(5) },
      { id: 'cmp-kyc1',    name: 'KYC Tier 1 Upgrade Invitation',       segment: 'kyc-tier1', channel: 'Email', sent: 0,   opened: 0,   openRate: 0,  responded: 0,  attributed: 0,        status: 'Scheduled', template: 'TPL-KYC-001',  createdAt: isoDaysAgo(2) },
      { id: 'cmp-atrisk',  name: 'At Risk — Win-Back Bundle Offer',     segment: 'atrisk',    channel: 'Email', sent: 0,   opened: 0,   openRate: 0,  responded: 0,  attributed: 0,        status: 'Draft',     template: 'TPL-RISK-001', createdAt: isoDaysAgo(1) }
    ],

    // ── WhatsApp / Email conversion flows ───────────────────────────────────
    flows: [
      { id: 'debit',   name: 'Debit Card Acquisition',   conversion: 22.4, status: 'Live',     reward: '₦500 airtime' },
      { id: 'dormant', name: 'Dormant Reactivation',     conversion: 38.1, status: 'Live',     reward: '₦500 airtime' },
      { id: 'kyc',     name: 'KYC Self-Service Update',   conversion: 61.2, status: 'Live',     reward: '₦150 data bundle' },
      { id: 'salary',  name: 'Salary Account Enrolment',  conversion: 14.7, status: 'Live',     reward: '₦2,000 welcome' },
      { id: 'bnpl',    name: 'BNPL Quick Accept',         conversion: 0,    status: 'Draft',    reward: 'None' },
      { id: 'fx',      name: 'FX Travel Activation',      conversion: 0,    status: 'Draft',    reward: '₦1,000 activation' }
    ],

    // ── Email flow copy (used by /api/flows/:id/email-preview) ──────────────
    emailFlows: {
      debit:   { subject: 'Your UBA debit card is ready — activate in 2 minutes', p1: 'Hi {FirstName}, your UBA debit card is pre-approved and ready for pickup.', p2: 'Reply to this message to book a branch appointment and receive ₦500 airtime instantly on activation.', cta: 'Book my appointment →' },
      dormant: { subject: 'We miss you, {FirstName} — come back to UBA', p1: 'Hi {FirstName}, we noticed your account has been quiet since {LastTransactionDate}.', p2: 'Reactivate today and enjoy zero-fee transfers for 30 days, plus ₦500 airtime on your first transaction.', cta: 'Reactivate now →' },
      kyc:     { subject: 'Action required: complete your KYC before the CBN deadline', p1: 'Hi {FirstName}, your account currently has transaction limits because your KYC is incomplete.', p2: 'Upload your documents via WhatsApp in under 5 minutes to unlock full access. Reply STOP to opt out.', cta: 'Update my KYC →' },
      salary:  { subject: 'Your salary account upgrade is approved', p1: 'Hi {FirstName}, your employer has enabled salary account benefits for you.', p2: 'Self-enrol now and receive a ₦2,000 welcome bonus once your first salary lands.', cta: 'Enrol now →' },
      bnpl:    { subject: 'You are pre-approved for Buy Now Pay Later', p1: 'Hi {FirstName}, you qualify for a pre-approved BNPL limit.', p2: 'Accept in one tap for instant disbursement to your account.', cta: 'Accept offer →' },
      fx:      { subject: 'Activate your card for travel', p1: 'Hi {FirstName}, planning a trip? Activate FX on your debit card today.', p2: 'Get live rate alerts and avoid airport queues. Reply STOP to opt out.', cta: 'Activate FX →' }
    },

    // ── Branches (routing) ──────────────────────────────────────────────────
    branches: [
      { id: 'vi',    name: 'Victoria Island', state: 'Lagos',     queue: 14, capacity: 40, leads: 14 },
      { id: 'ikeja', name: 'Ikeja',           state: 'Lagos',     queue: 9,  capacity: 35, leads: 9 },
      { id: 'lekki', name: 'Lekki',           state: 'Lagos',     queue: 6,  capacity: 30, leads: 6 },
      { id: 'wuse',  name: 'Wuse II',         state: 'Abuja',     queue: 11, capacity: 32, leads: 11 },
      { id: 'gra',   name: 'GRA',             state: 'Port Harcourt', queue: 4, capacity: 25, leads: 4 }
    ],

    // ── Dormant reactivation 3-step sequence ────────────────────────────────
    dormantSequence: {
      steps: [
        { step: 1, label: 'Welcome back',       day: 60,  framing: 'Warm, personalised. Zero-fee transfer offer for 30 days.', sent: 847, opened: 356, openRate: 42, reactivated: 84, attributed: 4200000, status: 'Active — Step 1 complete' },
        { step: 2, label: 'Urgency trigger',    day: 90,  framing: 'Account quiet for 90 days. Moderate urgency, support contact.', pending: 763, status: 'Pending — awaiting Step 1 window close' },
        { step: 3, label: 'Final expiry alert', day: 105, framing: 'Maximum urgency. Dormancy management fee risk after 120 days (CBN).', status: 'Pending' }
      ],
      byType: { Savings: 491, Current: 237, Salary: 119 },
      projection: { accounts: 847, rate: 10, recovered: 85, avgArpu: 49800, projected: 42300000 },
      igeFee: 500000,
      roi: 84.6
    },

    // ── KYC compliance ──────────────────────────────────────────────────────
    kyc: {
      tiers: [
        { tier: 1, count: 890, color: 'rose',    limit: '₦50K/txn' },
        { tier: 2, count: 560, color: 'amber',   limit: '₦200K/txn' },
        { tier: 3, count: 891, color: 'emerald', limit: 'No limit' }
      ],
      pipeline: [
        { customerId: 'ACC-00023456', current: 1, eligible: 2, missing: 'Utility bill',       status: 'Pending outreach' },
        { customerId: 'ACC-00045678', current: 1, eligible: 2, missing: 'NIN verification',    status: 'Contacted' },
        { customerId: 'ACC-00089012', current: 1, eligible: 2, missing: 'Passport / ID',       status: 'Doc submitted' },
        { customerId: 'ACC-00056789', current: 2, eligible: 3, missing: 'Proof of address',    status: 'Verified' }
      ],
      bulk: { eligible: 124, channel: 'Email', expectedRate: '30–40%', consent: 'NDPC verified' },
      documents: [
        { type: 'Utility bills',     submitted: 47, verified: 38, pending: 9 },
        { type: 'NIN verification',  submitted: 62, verified: 38, pending: 24 },
        { type: 'Passport / ID',     submitted: 29, verified: 17, pending: 12 }
      ]
    },

    // ── Revenue attribution ─────────────────────────────────────────────────
    attribution: {
      totalImpact30d: 84200000,
      platformRoi: 168,
      attributionWindow: 7,
      annualProjected: 1010000000,
      igeFee: 500000,
      rows: [
        { campaign: 'Dormant reactivation', attributed: 4200000,  roi: 8.4 },
        { campaign: 'Champions VIP',        attributed: 28400000, roi: 56.8 },
        { campaign: 'At Risk win-back',     attributed: 13500000, roi: 27.0 },
        { campaign: 'KYC upgrade',          attributed: 0,        roi: null, note: 'Pending' }
      ]
    },

    // ── Live activity feed (rotates client-side every 5s) ───────────────────
    feed: [
      { type: 'send',    title: 'Reactivation email delivered',   sub: 'ACC-00023456 · Dormant Day 60 complete',          value: '+₦18,400',  color: 'emerald' },
      { type: 'kyc',     title: 'KYC doc submitted',              sub: 'ACC-00234567 · Passport + proof of address',      value: 'Tier 2→3',  color: 'amber' },
      { type: 'system',  title: 'RFM scores updated',             sub: '2,341 accounts rescored · 6 segment changes',     value: 'Daily',     color: 'brand' },
      { type: 'alert',   title: 'At Risk alert',                  sub: 'ACC-00056789 · 28 days inactive · 72hr window',   value: '72hr',      color: 'rose' },
      { type: 'open',    title: 'Champions campaign opened',      sub: 'ACC-00067890 · 91% open rate',                    value: '+₦92,400',  color: 'emerald' },
      { type: 'consent', title: 'Consent verified',               sub: '124 accounts · NDPC registry checked',            value: 'Compliant', color: 'violet' }
    ],

    // ── Audit log (immutable; appends at runtime) ───────────────────────────
    audit: [
      auditEntry('send',    'Campaign sent — Dormant Day 60 · 847 emails · Template: TPL-DORM-001', 'GMM: A.Okonkwo', isoMinsAgo(420)),
      auditEntry('consent', 'Consent check — 124 accounts validated against NDPC registry',          'System (consent)', isoMinsAgo(390)),
      auditEntry('approval','Campaign approved — Champions VIP (Draft→Approved→Sending)',             'GMM: A.Okonkwo', isoMinsAgo(360)),
      auditEntry('segment', 'Segment reclassification — 6 accounts moved (At Risk→Dormant)',          'System (RFM engine)', isoMinsAgo(300)),
      auditEntry('system',  'KYC campaign created — Tier 1 Upgrade Invitation (124 recipients)',      'GMM: A.Okonkwo', isoMinsAgo(240)),
      auditEntry('send',    'Reactivation attribution confirmed — ACC-00023456 · +₦18,400',           'System (attribution)', isoMinsAgo(180)),
      auditEntry('optout',  'Opt-out processed — ACC-00045678 removed from marketing sends',          'System (consent)', isoMinsAgo(120)),
      auditEntry('system',  'Daily RFM batch — 2,341 accounts rescored',                              'System (RFM engine)', isoMinsAgo(60))
    ],

    // ── Wallet ──────────────────────────────────────────────────────────────
    wallet: {
      balance: 150000,
      monthlySpend: 42800,
      monthlyLimit: 150000,
      points: 342,
      history: [
        { type: 'fund',     label: 'Wallet funded — bank transfer',        amount: 100000,  ts: isoDaysAgo(6) },
        { type: 'spend',    label: 'Campaign cost — Dormant Day 60',        amount: -28400,  ts: isoDaysAgo(5) },
        { type: 'spend',    label: 'Airtime sent — ₦500 × 28',              amount: -14000,  ts: isoDaysAgo(4) },
        { type: 'reward',   label: 'Reward points earned',                  amount: 0,       points: 120, ts: isoDaysAgo(3) },
        { type: 'fund',     label: 'Wallet funded — USSD',                  amount: 50000,   ts: isoDaysAgo(2) },
        { type: 'spend',    label: 'Data bundle sent — ₦150 × 22',          amount: -3300,   ts: isoDaysAgo(1) },
        { type: 'reward',   label: 'Reward points earned',                  amount: 0,       points: 222, ts: isoDaysAgo(0) }
      ]
    },

    // ── Commercial tiers ─────────────────────────────────────────────────────
    plans: [
      { id: 'starter',    name: 'Starter',    flows: 3,        messages: 5000,   features: ['Basic analytics'] },
      { id: 'growth',     name: 'Growth',     flows: 12,       messages: 150000, features: ['Full analytics', 'Campaign management', 'Branch routing'] },
      { id: 'enterprise', name: 'Enterprise+',flows: 'Unlimited', messages: 'Unlimited', features: ['Webhooks', 'AI churn prediction', 'White-label', 'Dedicated support'] }
    ]
  };
}

// ── helpers ───────────────────────────────────────────────────────────────
function isoDaysAgo(n)  { return new Date(Date.now() - n * 86400000).toISOString(); }
function isoMinsAgo(n)  { return new Date(Date.now() - n * 60000).toISOString(); }
function auditEntry(type, event, user, ts) {
  return { id: cryptoId(), type, event, user, ts: ts || new Date().toISOString() };
}
function cryptoId() { return 'evt_' + Math.random().toString(36).slice(2, 10); }
