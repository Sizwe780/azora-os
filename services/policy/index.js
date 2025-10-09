type Action = { type: string; payload: any; confidence: number; risk: number; context: any };
type Decision = { allow: boolean; requireConfirm?: boolean; reason: string; severity: "low" | "medium" | "high" };

const rules = {
  POS_UNDERSCAN: (a: Action): Decision => {
    const c = a.confidence; const delta = a.payload.delta;
    if (c >= 0.9 && delta >= 1) return { allow: true, requireConfirm: true, reason: "High-confidence under-scan", severity: "medium" };
    return { allow: false, reason: "Insufficient confidence", severity: "low" };
  },
  REPLENISH_TASK: (a: Action): Decision => {
    const hasBackroom = a.context.backroom > 0;
    if (hasBackroom) return { allow: true, reason: "Backroom stock available", severity: "low" };
    return { allow: false, reason: "No backroom stock", severity: "low" };
  },
  MARKDOWN: (a: Action): Decision => {
    const { discountPct, category } = a.payload;
    if (discountPct > 40) return { allow: false, reason: "Exceeds policy cap", severity: "high" };
    if (["baby","pharmacy"].includes(category)) return { allow: false, reason: "Restricted category", severity: "high" };
    return { allow: true, requireConfirm: true, reason: "Policy-compliant markdown", severity: "medium" };
  }
};

export function decide(action: Action): Decision {
  const fn = (rules as any)[action.type];
  if (!fn) return { allow: false, reason: "No policy", severity: "low" };
  return fn(action);
}
