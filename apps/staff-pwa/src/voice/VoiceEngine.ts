type STTListener = (text: string, isFinal: boolean) => void;
export class VoiceEngine {
  private recognition?: SpeechRecognition; private sttListener?: STTListener; private wakeActive = true; private listening = false;
  private wakeWord = /^\s*(hey\s+azora|azora)\b/i;
  constructor() {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      this.recognition = new SR(); this.recognition.lang = "en-US"; this.recognition.interimResults = true; this.recognition.continuous = true;
      this.recognition.onresult = (e: SpeechRecognitionEvent) => {
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i]; const text = r[0].transcript.trim(); const isFinal = r.isFinal;
          if (this.wakeActive && this.wakeWord.test(text)) { this.wakeActive = false; this.speak("Yes, I'm listening."); continue; }
          if (!this.wakeActive) { this.sttListener?.(text, isFinal); if (isFinal) this.wakeActive = true; }
        }
      };
      this.recognition.onerror = () => { this.stop(); setTimeout(() => this.start(), 500); };
      this.recognition.onend = () => { if (this.listening) this.start(); };
    }
  }
  start(){ try{ this.recognition?.start(); this.listening = true; }catch{} }
  stop(){ try{ this.recognition?.stop(); this.listening = false; this.wakeActive = true; }catch{} }
  onTranscript(fn: STTListener){ this.sttListener = fn; }
  speak(text: string){ const u = new SpeechSynthesisUtterance(text); window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); }
}
