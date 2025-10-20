import express from 'express';
import abTestApi from './abTestApi';

const app = express();
app.use(express.json());
app.use('/abtest', abTestApi);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`ABTest service running on port ${PORT}`);
});
