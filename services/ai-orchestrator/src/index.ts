import express from 'express';
import cors from 'cors';
import orchestratorApi from './orchestratorApi';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api', orchestratorApi);

app.get('/health', (req, res) => res.status(200).json({ status: 'online', service: 'ai-orchestrator' }));

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`🤖 AI Orchestrator running on port ${PORT}`);
});