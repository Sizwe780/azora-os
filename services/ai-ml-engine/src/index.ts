import express from 'express';
import cors from 'cors';
import aiMlApi from './aiMlApi.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/ai-ml', aiMlApi);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ai-ml-engine' });
});

const PORT = process.env.PORT || 4880; // Unique port
app.listen(PORT, () => {
  console.log(`🧠 AI ML Engine is online on port ${PORT}, training machine learning models.`);
});