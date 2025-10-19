import React, { useState } from "react";
import { useSpeechToText, useTextToSpeech } from "../hooks/useSpeech";

export default function VoicePanel() {
  const [text, startListening] = useSpeechToText();
  const speak = useTextToSpeech();
  const [toSpeak, setToSpeak] = useState("");
  return (
    <div className="card fade-in">
      <h3>Voice Panel</h3>
      <button className="btn-primary" onClick={startListening}>Start Listening</button>
      <div>Heard: <b>{text}</b></div>
      <input className="input" value={toSpeak} onChange={e=>setToSpeak(e.target.value)} placeholder="Say this..." />
      <button className="btn-secondary" onClick={()=>speak(toSpeak)}>Speak</button>
    </div>
  );
}
