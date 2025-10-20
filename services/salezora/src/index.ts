import express from 'express';
import salezoraApi from './salezoraApi';

const app = express();
app.use(express.json());
app.use('/api/salezora', salezoraApi);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5400;
app.listen(PORT, () => {
  console.log(`💼 Salezora Sales AI Service running on port ${PORT}`);
});