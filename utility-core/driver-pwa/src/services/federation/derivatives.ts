export type Derivative = {
    id: string;
    referenceLoan: string;
    buyer: string;
    seller: string;
    notional: number;
    payoffCondition: 'default' | 'repay';
    active: boolean;
  };
  
  let derivatives: Derivative[] = [];
  
  export function createDerivative(referenceLoan: string, buyer: string, seller: string, notional: number, payoffCondition: 'default' | 'repay') {
    const d: Derivative = {
      id: Math.random().toString(36).slice(2),
      referenceLoan,
      buyer,
      seller,
      notional,
      payoffCondition,
      active: true,
    };
    derivatives.push(d);
    return d;
  }
  
  export function settleDerivative(referenceLoan: string, outcome: 'default' | 'repay') {
    const ds = derivatives.filter(d => d.referenceLoan === referenceLoan && d.active);
    ds.forEach(d => {
      if (d.payoffCondition === outcome) {
        console.log(`Pay ${d.notional} to ${d.buyer} from ${d.seller}`);
      }
      d.active = false;
    });
  }