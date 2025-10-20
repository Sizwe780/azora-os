import React, { useState } from "react";
import { useAccount, transfer } from "../hooks/useOpenBanking";
export default function OpenBankingPanel({ user }) {
  const acct = useAccount(user);
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState(10);
  const [msg, setMsg] = useState("");
  function doTransfer() {
    transfer(user, to, amount).then(()=>setMsg("Transfer complete")).catch(e=>setMsg(e.response.data.error));
  }
  return (
    <div className="card fade-in">
      <h3>Open Banking</h3>
      <div>Balance: ${acct.balance}</div>
      <div>
        <input className="input" value={to} onChange={e=>setTo(e.target.value)} placeholder="To user"/>
        <input className="input" type="number" value={amount} onChange={e=>setAmount(e.target.value)}/>
        <button className="btn-primary" onClick={doTransfer}>Transfer</button>
      </div>
      <div>{msg}</div>
      <h4>History</h4>
      <ul>
        {acct.history?.map((h,i)=><li key={i}>{JSON.stringify(h)}</li>)}
      </ul>
    </div>
  );
}
