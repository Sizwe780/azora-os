// name=src/lib/sa/tax.ts
export function calcVatTotals(amountZar: number, vatPercent = 15) {
    const vat = +(amountZar * vatPercent / 100).toFixed(2);
    const total = +(amountZar + vat).toFixed(2);
    return { vat, total };
  }
  