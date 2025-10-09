// Google STT integration (mock)
const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();

async function transcribeAudio(audioBuffer) {
  // Placeholder: In production, configure audio format and credentials
  const request = {
    audio: { content: audioBuffer.toString('base64') },
    config: { encoding: 'LINEAR16', sampleRateHertz: 16000, languageCode: 'en-US' },
  };
  try {
    const [response] = await client.recognize(request);
    return response.results.map(r => r.alternatives[0].transcript).join(' ');
  } catch (err) {
    console.error('STT error:', err);
    return '';
  }
}

module.exports = { transcribeAudio };
