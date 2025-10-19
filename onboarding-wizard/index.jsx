import React, { useState } from "react";
const steps = [
  { label: "Welcome", content: "Welcome to Azora OS! Let's get you set up." },
  { label: "Install", content: "Run `npm install` and `docker-compose up`." },
  { label: "Configure", content: "Copy `.env.example` to `.env` and customize." },
  { label: "Explore", content: "Browse the UI and test microservices." },
  { label: "Launch", content: "Run production scripts and check monitoring." }
];

export default function OnboardingWizard() {
  const [step, setStep] = useState(0);
  return (
    <div className="card fade-in" style={{maxWidth:380, margin:"auto"}}>
      <h3>{steps[step].label}</h3>
      <p>{steps[step].content}</p>
      <button className="btn-primary" onClick={()=>setStep(Math.max(0,step-1))} disabled={step===0}>Back</button>
      <button className="btn-primary" onClick={()=>setStep(Math.min(steps.length-1,step+1))} disabled={step===steps.length-1}>Next</button>
      <div style={{fontSize:12,marginTop:8}}>Step {step+1} of {steps.length}</div>
    </div>
  );
}