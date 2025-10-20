import express from 'express';
import cors from 'cors';
import voiceApi from './voiceApi.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', voiceApi);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'voice' });
});

const PORT = process.env.PORT || 4900;
app.listen(PORT, () => {
  console.log(`🎤 Voice Service is online on port ${PORT}, listening for commands.`);
});