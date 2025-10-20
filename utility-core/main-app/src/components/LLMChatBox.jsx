import React, { useState } from "react";
import useLLM from "../hooks/useLLM";
export default function LLMChatBox() {
  const [input, setInput] = useState("");
  const [result, complete] = useLLM();
  function send() { complete(input); }
  return (
    <div className="card fade-in">
      <h3>AI/LLM Chat</h3>
      <input className="input" value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask me anything..." />
      <button className="btn-primary" onClick={send}>Send</button>
      <div style={{marginTop:8}}>{result}</div>
    </div>
  );
}
