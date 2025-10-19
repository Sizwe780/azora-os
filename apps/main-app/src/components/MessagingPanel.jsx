import React, { useState } from "react";
import { useMessages, sendMessage } from "../hooks/useMessaging";

export default function MessagingPanel({ user }) {
  const [to, setTo] = useState("");
  const [text, setText] = useState("");
  const messages = useMessages(user);
  function send() {
    sendMessage(user, to, text).then(()=>setText(""));
  }
  return (
    <div className="card fade-in">
      <h2>In-App Messaging</h2>
      <input className="input" value={to} onChange={e=>setTo(e.target.value)} placeholder="To (user id)"/>
      <input className="input" value={text} onChange={e=>setText(e.target.value)} placeholder="Message"/>
      <button className="btn-primary" onClick={send}>Send</button>
      <ul>
        {messages.map((m,i) => (
          <li key={i}><b>{m.from}</b> → <b>{m.to}</b>: {m.text}</li>
        ))}
      </ul>
    </div>
  );
}
