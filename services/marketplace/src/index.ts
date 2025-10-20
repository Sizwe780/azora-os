import express from 'express';
import cors from 'cors';
import marketplaceApi from './marketplaceApi';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/marketplace', marketplaceApi);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'marketplace' }));

const PORT = process.env.PORT || 4130;
app.listen(PORT, () => {
  console.log(`🛒 Marketplace Service running on port ${PORT}`);
});