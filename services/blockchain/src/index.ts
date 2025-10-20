import express from 'express';
import cors from 'cors';
import blockchainApi from './blockchainApi.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/blockchain', blockchainApi);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'blockchain' });
});

const PORT = process.env.PORT || 4800;
app.listen(PORT, () => {
  console.log(`[blockchain] running on ${PORT}`);
});