import express from 'express';
import cors from 'cors';
import aiEvolutionApi from './aiEvolutionApi.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/ai-evolution', aiEvolutionApi);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ai-evolution-engine' });
});

const PORT = process.env.PORT || 4860; // Unique port
app.listen(PORT, () => {
  console.log(`🧬 AI Evolution Engine is online on port ${PORT}, evolving AI with genetic algorithms.`);
});