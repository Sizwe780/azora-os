import express from 'express';
import cors from 'cors';
import advancedAiApi from './advancedAiApi.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/advanced-ai', advancedAiApi);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'advanced-ai' });
});

const PORT = process.env.PORT || 4870; // Unique port
app.listen(PORT, () => {
  console.log(`🤖 Advanced AI Service is online on port ${PORT}, processing complex AI tasks.`);
});