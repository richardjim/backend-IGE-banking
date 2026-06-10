// ────────────────────────────────────────────────────────────────────────────
// IGE Banking — AI message generation + email HTML rendering
// Uses Anthropic API when ANTHROPIC_API_KEY is present; otherwise a
// deterministic, CBN-compliant fallback so the demo always produces copy.
// ────────────────────────────────────────────────────────────────────────────
const { ANTHROPIC_API_KEY, ANTHROPIC_MODEL = 'claude-sonnet-4-20250514' } = process.env;

const SEGMENT_BRIEF = {
  dormant:    'A dormant customer (90+ days inactive). Warm, personalised win-back. Offer zero-fee transfers for 30 days. Reference their last transaction date. Empathetic, not pushy.',
  champions:  'A top-tier "Champion" customer. VIP tone. Offer an exclusive investment / wealth product. Make them feel valued.',
  atrisk:     'An "At Risk" customer whose activity dropped ~60%. Gentle urgency, 72-hour win-back bundle. Acknowledge them as valued.',
  loyal:      'A loyal regular. Offer investment product or loan pre-qualification. Confident, appreciative.',
  promising:  'A promising newer customer. Encourage deeper engagement with a small activation incentive.',
  'kyc-tier1':'A Tier 1 customer who must upgrade KYC to lift transaction limits. Explain the benefit (higher limits), simple steps, reference the CBN deadline. Reassuring.',
  kyc:        'A customer who must complete KYC to unlock full account access. Simple steps, CBN deadline, reassuring.'
};

const CBN_OPTOUT = 'Reply STOP to opt out. UBA Nigeria · CBN-licensed · T&Cs apply.';

export async function generateMessage({ segment, customerCount = 0 }) {
  const key = (segment || 'dormant').toLowerCase();
  const brief = SEGMENT_BRIEF[key] || SEGMENT_BRIEF.dormant;

  if (ANTHROPIC_API_KEY) {
    try {
      const prompt = `You are a Nigerian retail-bank campaign copywriter for IGE Banking.
Write a SHORT marketing email for this audience: ${brief}
Audience size: ${customerCount} accounts.
Rules:
- Use the personalisation token [FirstName] near the start.
- Where relevant use [LastTransactionDate], [AccountType], [BranchName] tokens.
- Keep the body under 90 words.
- End with a one-line CBN opt-out: "${CBN_OPTOUT}"
Return ONLY raw JSON, no markdown, with keys: subject, body.`;
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: 600,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await res.json();
      const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      if (parsed.subject && parsed.body) return parsed;
    } catch (err) {
      console.warn('Anthropic generation failed, using fallback:', err.message);
    }
  }
  return fallbackCopy(key);
}

function fallbackCopy(key) {
  const map = {
    dormant: {
      subject: 'We miss you, [FirstName] — come back to UBA',
      body: `Hi [FirstName],\n\nWe noticed your [AccountType] account has been quiet since [LastTransactionDate]. We'd love to welcome you back.\n\nReactivate today and enjoy zero-fee transfers for the next 30 days, plus ₦500 airtime on your first transaction. Your relationship manager at [BranchName] is ready to help.\n\n${CBN_OPTOUT}`
    },
    champions: {
      subject: '[FirstName], an exclusive offer for our most valued customers',
      body: `Hi [FirstName],\n\nAs one of our most valued customers, you're invited to our VIP investment product with preferential rates.\n\nSpeak to your dedicated manager at [BranchName] to get started.\n\n${CBN_OPTOUT}`
    },
    atrisk: {
      subject: "[FirstName], here's something to welcome you back",
      body: `Hi [FirstName],\n\nWe've missed your activity lately. For the next 72 hours, enjoy our win-back bundle: zero transfer fees and bonus airtime.\n\n${CBN_OPTOUT}`
    },
    loyal: {
      subject: '[FirstName], you may qualify for pre-approved financing',
      body: `Hi [FirstName],\n\nThank you for banking with us. Based on your activity, you may qualify for a pre-approved loan or our investment product.\n\n${CBN_OPTOUT}`
    },
    promising: {
      subject: 'Get more from your UBA account, [FirstName]',
      body: `Hi [FirstName],\n\nUnlock more from your [AccountType] account. Complete one more transaction this week and earn ₦500 airtime.\n\n${CBN_OPTOUT}`
    },
    'kyc-tier1': {
      subject: 'Action required: lift your transaction limits, [FirstName]',
      body: `Hi [FirstName],\n\nYour account currently has Tier 1 limits. Upgrade your KYC before the CBN deadline to unlock higher transaction limits.\n\nUpload your documents via WhatsApp in under 5 minutes.\n\n${CBN_OPTOUT}`
    }
  };
  return map[key] || map.dormant;
}

// ── Email HTML renderer (matches the in-app preview styling) ────────────────
export function renderEmailHtml({ subject, body, firstName = 'Customer', tokens = {} }) {
  const sub = { FirstName: firstName, ...tokens };
  const fill = s => (s || '').replace(/\[(\w+)\]/g, (_, k) => sub[k] != null ? sub[k] : `[${k}]`);
  const paragraphs = fill(body).split('\n').filter(Boolean)
    .map(p => `<p style="font-size:13px;color:#444;line-height:1.7;margin:0 0 10px">${escapeHtml(p)}</p>`).join('');
  return `<div style="max-width:560px;margin:0 auto;border:1px solid #E2E8F0;border-radius:10px;overflow:hidden;font-family:Arial,Helvetica,sans-serif">
    <div style="background:#05192D;padding:14px 18px;color:#fff;font-size:13px"><strong>UBA Nigeria</strong> &lt;campaigns@uba.ng&gt;</div>
    <div style="background:#F1F5F9;padding:10px 18px;font-size:13px;font-weight:700;color:#05192D">${escapeHtml(fill(subject))}</div>
    <div style="background:#fff;padding:18px">${paragraphs}
      <div style="text-align:center;margin:14px 0"><a href="#" style="background:#0EA5A0;color:#fff;padding:11px 26px;border-radius:6px;font-size:13px;font-weight:700;text-decoration:none;display:inline-block">Get started →</a></div>
    </div>
  </div>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
