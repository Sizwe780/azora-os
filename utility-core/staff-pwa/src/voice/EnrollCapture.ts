export async function capturePCM(seconds = 4): Promise<{ pcm: Float32Array; sampleRate: number }> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const ctx = new AudioContext(); const source = ctx.createMediaStreamSource(stream); const proc = ctx.createScriptProcessor(4096,1,1);
  const chunks: Float32Array[] = []; let ms = 0;
  return new Promise((resolve) => {
    proc.onaudioprocess = (e) => {
      const buf = e.inputBuffer.getChannelData(0); chunks.push(new Float32Array(buf)); ms += (buf.length / ctx.sampleRate) * 1000;
      if (ms >= seconds * 1000) {
        proc.disconnect(); source.disconnect(); stream.getTracks().forEach(t => t.stop());
        const len = chunks.reduce((a,c)=>a+c.length,0); const pcm = new Float32Array(len); let off=0; for(const c of chunks){ pcm.set(c, off); off += c.length; }
        resolve({ pcm, sampleRate: ctx.sampleRate });
      }
    };
    source.connect(proc); proc.connect(ctx.destination);
  });
}
