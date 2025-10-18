import React, { useEffect, useState } from 'react';

const BILLING_URL = import.meta?.env?.VITE_BILLING_SERVICE_URL || process.env.BILLING_SERVICE_URL || 'http://localhost:4095';

export default function Pricing() {
  const [quote, setQuote] = useState(null);
  const [userId, setUserId] = useState('demo-user-za');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [popiaConsent, setPopiaConsent] = useState(false);

  const load = async () => {
    const r = await fetch(`${BILLING_URL}/api/billing/quote?country=ZA&currency=ZAR`);
    setQuote(await r.json());
  };
  useEffect(() => { load(); }, []);

  const symbol = quote?.symbol || 'R';

  const startTrial = async (startTomorrow = false) => {
    const resp = await fetch(`${BILLING_URL}/api/billing/subscribe`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, country: 'ZA', currency: 'ZAR', startTomorrow, acceptedTerms, popiaConsent })
    });
    const data = await resp.json();
    if (!resp.ok) return alert(data?.message || 'Unable to start trial');
    alert('Trial started' + (startTomorrow ? ' (begins tomorrow)' : ''));
  };

  const prepayIntro = async () => {
    const r = await fetch(`${BILLING_URL}/api/billing/prepay`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, country: 'ZA', currency: 'ZAR' })
    });
    const data = await r.json();
    if (data.ok) alert(`Prepaid ${symbol}${data.inv.total}. Refundable during trial.`);
  };

  if (!quote) return <div>Loading pricing...</div>;

  return (
    <div style={{ maxWidth: 720, margin: '24px auto', padding: 16 }}>
      <h1>Azora OS Pricing (South Africa)</h1>
      <p className="transparencyNote">{quote.transparencyNote}</p>
      <ul>
        <li>Free trial: {quote.trialDays} days</li>
        <li>
          Intro: {quote.introMonths} months at {symbol}{quote.prices.intro.total} / month
          <small> (incl. VAT {Math.round(quote.prices.intro.taxRate*100)}%)</small>
        </li>
        <li>
          Then standard: {symbol}{quote.prices.standard.total} / month
          <small> (incl. VAT {Math.round(quote.prices.standard.taxRate*100)}%)</small>
        </li>
      </ul>

      <div style={{ margin: '12px 0' }}>
        <label>
          <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} />
          I accept the Terms and Conditions (ZA)
        </label>
        <br/>
        <label>
          <input type="checkbox" checked={popiaConsent} onChange={e => setPopiaConsent(e.target.checked)} />
          I consent to processing my personal information (POPIA)
        </label>
      </div>

      <div style={{ marginTop: 8 }}>
        <button onClick={() => startTrial(false)} disabled={!acceptedTerms || !popiaConsent}>Start free month now</button>
        <button onClick={() => startTrial(true)} style={{ marginLeft: 8 }} disabled={!acceptedTerms || !popiaConsent}>Start free month tomorrow</button>
        <button onClick={prepayIntro} style={{ marginLeft: 8 }}>Lock intro price now (optional prepay)</button>
      </div>

      <small className="forUserBenefit">For your benefit: VAT‑inclusive pricing, cancel anytime during trial.</small>
    </div>
  );
}