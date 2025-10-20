import express from 'express';
import marketplaceApi from './marketplaceApi';

const app = express();
app.use(express.json());
app.use('/api/marketplace', marketplaceApi);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4130;
app.listen(PORT, () => {
  console.log(`🛒 Marketplace Service running on port ${PORT}`);
});