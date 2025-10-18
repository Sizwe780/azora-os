import React from 'react';

export default function NudgeBanner({ nudge, onAccept, onDismiss }) {
  return (
    <div style={{ border: '1px solid #444', padding: 12, borderRadius: 8, margin: '12px 0' }}>
      <div style={{ fontWeight: 600 }}>{nudge.message}</div>
      <div style={{ fontSize: 12, opacity: 0.8 }} className="forUserBenefit">Benefit: {nudge.forUserBenefit}</div>
      <div style={{ fontSize: 12, opacity: 0.8 }} className="transparencyNote">{nudge.transparencyNote}</div>
      <div style={{ marginTop: 8 }}>
        <button onClick={() => onAccept(nudge)} className="primary-action">{nudge.ctaLabel}</button>
        <button onClick={() => onDismiss(nudge, { dontShowAgain: false })} style={{ marginLeft: 8 }} className="secondary-action">Not now</button>
        <button onClick={() => onDismiss(nudge, { dontShowAgain: true })} style={{ marginLeft: 8 }} className="optOut">Don’t show again</button>
      </div>
    </div>
  );
}