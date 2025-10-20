import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authApi from './authApi.js';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/auth', authApi);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🔐 Auth Service is online on port ${PORT}, securing Azora OS.`);
});