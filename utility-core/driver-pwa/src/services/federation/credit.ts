export type Loan = {
    id: string;
    borrower: string;
    amount: number;
    interestRate: number;
    collateral?: number;
    dueDate: Date;
    repaid: boolean;
  };
  
  let loans: Loan[] = [];
  
  export function requestLoan(borrower: string, amount: number, interestRate: number, collateral?: number, termDays = 30) {
    const loan: Loan = {
      id: Math.random().toString(36).slice(2),
      borrower,
      amount,
      interestRate,
      collateral,
      dueDate: new Date(Date.now() + termDays * 86400000),
      repaid: false,
    };
    loans.push(loan);
    return loan;
  }
  
  export function repayLoan(id: string) {
    const loan = loans.find(l => l.id === id);
    if (!loan || loan.repaid) throw new Error("Invalid loan");
    loan.repaid = true;
    const repayment = loan.amount * (1 + loan.interestRate);
    return repayment;
  }
  
  export function listLoans(borrower: string) {
    return loans.filter(l => l.borrower === borrower);
  }