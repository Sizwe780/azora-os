export const NUDGE_OPTOUT_PREFIX = 'nudge_optout:';

export const nudgesCatalog = [
  {
    id: 'save-5-percent',
    message: 'Setting aside 5% can help you reach goals faster.',
    forUserBenefit: 'Promotes long-term financial wellness.',
    transparencyNote: 'Suggested based on your balance. You can opt out anytime.',
    ctaLabel: 'Set aside 5%',
    optOutKey: 'save-5-percent',
    trigger: (ctx) => (ctx.balance ?? 0) >= 50,
    onAccept: async (ctx) => {
      // Integrate real action (e.g., move funds to savings)
      console.debug('Accepted nudge save-5-percent', ctx);
    }
  },
  {
    id: 'consolidate-small-txs',
    message: 'Consolidate small transactions to reduce fees.',
    forUserBenefit: 'Helps save on future network fees.',
    transparencyNote: 'Shown because of multiple small recent sends.',
    ctaLabel: 'Consolidate now',
    optOutKey: 'consolidate-small-txs',
    trigger: (ctx) => (ctx.smallTxCount ?? 0) >= 3,
    onAccept: async (ctx) => {
      console.debug('Accepted nudge consolidate-small-txs', ctx);
    }
  },
  {
    id: 'enable-2fa',
    message: 'Enable 2FA to protect your assets.',
    forUserBenefit: 'Reduces risk of unauthorized access.',
    transparencyNote: 'Security recommendation. Opt-out available.',
    ctaLabel: 'Enable 2FA',
    optOutKey: 'enable-2fa',
    trigger: (ctx) => !ctx.has2FA,
    onAccept: async () => {
      console.debug('Navigate to security settings');
    }
  }
];

export const isOptedOut = (key) => localStorage.getItem(NUDGE_OPTOUT_PREFIX + key) === 'true';
export const optOut = (key) => localStorage.setItem(NUDGE_OPTOUT_PREFIX + key, 'true');

const complianceUrl = import.meta?.env?.VITE_COMPLIANCE_SERVICE_URL || process.env.COMPLIANCE_SERVICE_URL || 'http://localhost:4081';

export async function auditNudgeEvent(event) {
  try {
    await fetch(`${complianceUrl}/api/nudge/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...event,
        anonSessionId: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
        timestamp: new Date().toISOString()
      })
    });
  } catch (e) {
    console.warn('Nudge audit failed', e);
  }
}

export function evaluateNudges(context = {}) {
  return nudgesCatalog.filter(n => n.trigger?.(context) && !isOptedOut(n.optOutKey));
}