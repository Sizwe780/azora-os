import React, { useState } from "react";
import { charge, getPayments } from "../hooks/usePayments";

export default function PaymentsPanel({ user }) {
  const [amount, setAmount] = useState(50);
  const [status, setStatus] = useState("");
  const [payments, setPayments] = useState([]);
  function makePayment() {
    charge(user, amount).then(p=>setStatus(p.status));
  }
  function fetchPayments() {
    getPayments(user).then(setPayments);
  }
  return (
    <div className="card fade-in">
      <h3>Payments</h3>
      <input className="input" type="number" value={amount} onChange={e=>setAmount(e.target.value)}/>
      <button className="btn-primary" onClick={makePayment}>Pay</button>
      <div>Status: {status}</div>
      <button className="btn-secondary" onClick={fetchPayments}>My Payments</button>
      <ul>
        {payments.map((p,i)=><li key={i}>#{p.paymentId}: ${p.amount}</li>)}
      </ul>
    </div>
  );
}
