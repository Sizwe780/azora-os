import { useState, useRef } from "react";

// Speech-to-Text
export function useSpeechToText() {
  const [text, setText] = useState("");
  const recognition = useRef(null);
  function start() {
    if (!('webkitSpeechRecognition' in window)) return alert("No Speech API");
    recognition.current = new window.webkitSpeechRecognition();
    recognition.current.lang = "en-US";
    recognition.current.onresult = e => setText(e.results[0][0].transcript);
    recognition.current.start();
  }
  return [text, start];
}

// Text-to-Speech
export function useTextToSpeech() {
  return (text) => {
    const synth = window.speechSynthesis;
    const utter = new window.SpeechSynthesisUtterance(text);
    synth.speak(utter);
  };
}
