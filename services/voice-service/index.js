/**
 * @file index.js
 * @author Sizwe Ngwenya
 * @description The ears of Azora. Provides advanced, real-time speech-to-text transcription for full accessibility.
 */
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4900;

app.get('/health', (req, res) => res.status(200).json({ status: 'online' }));

// Simulate transcribing audio data to text
app.post('/api/transcribe', (req, res) => {
    const { audio_data } = req.body;
    if (!audio_data) {
        return res.status(400).json({ error: 'No audio data provided.' });
    }
    // In a real system, this would be a complex model. Here, we simulate it.
    const transcription = "Show me the latest high-value bounties";
    console.log(`VOICE: Transcribed audio to: "${transcription}"`);
    res.json({ transcription });
});

app.listen(PORT, () => {
    console.log(`🎤 Voice Service is online on port ${PORT}, listening for commands.`);
});