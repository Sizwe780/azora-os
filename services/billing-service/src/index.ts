import express from 'express';
import cors from 'cors';
import billingApi from './billingApi.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', billingApi);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'billing' });
});

const PORT = process.env.PORT || 4801; // Different port
app.listen(PORT, () => {
  console.log(`💵 Billing Service is online on port ${PORT}, managing citizen tiers.`);
});