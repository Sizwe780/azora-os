export type Bond = {
    id: string;
    buyer: string;
    principal: number;
    rate: number;
    maturity: Date;
    redeemed: boolean;
  };
  
  let bonds: Bond[] = [];
  
  export function issueBond(buyer: string, principal: number, rate: number, termDays: number) {
    const maturity = new Date(Date.now() + termDays * 86400000);
    const bond: Bond = { id: Math.random().toString(36).slice(2), buyer, principal, rate, maturity, redeemed: false };
    bonds.push(bond);
    return bond;
  }
  
  export function redeemBond(id: string) {
    const bond = bonds.find(b => b.id === id);
    if (!bond || bond.redeemed) throw new Error("Invalid bond");
    if (new Date() < bond.maturity) throw new Error("Bond not matured yet");
    bond.redeemed = true;
    const payout = bond.principal * (1 + bond.rate);
    return payout;
  }
  
  export function listBonds(citizenId: string) {
    return bonds.filter(b => b.buyer === citizenId);
  }