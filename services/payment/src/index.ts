import express from 'express';
import cors from 'cors';
import paymentApi from './paymentApi';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/v1/payment', paymentApi);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'payment',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`💳 Payment Service running on port ${PORT}`);
});