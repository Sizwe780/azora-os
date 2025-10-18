const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000; // Port should be managed by orchestrator
const SERVICE_NAME = 'payment';

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: SERVICE_NAME,
    timestamp: new Date().toISOString()
  });
});

// Add service-specific routes below this line

app.listen(PORT, () => {
  console.log();
});

// --- Existing code from original file ---

require('dotenv').config();
const express = require('express');
const Paystack = require('paystack-api')(process.env.PAYSTACK_SECRET_KEY);

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3005;

app.get('/api/v1/payment/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'payment', provider: 'paystack' });
});

// Initialize a transaction
app.post('/api/v1/payment/initialize', async (req, res) => {
    try {
        const { email, amount, reference, callback_url } = req.body;
        const response = await Paystack.transaction.initialize({
            email,
            amount: amount * 100, // Paystack expects amount in kobo (multiply by 100)
            reference,
            callback_url
        });
        res.json(response);
    } catch (error) {
        res.status(400).json({ error: { message: error.message } });
    }
});

// Verify a transaction
app.get('/api/v1/payment/verify/:reference', async (req, res) => {
    try {
        const { reference } = req.params;
        const response = await Paystack.transaction.verify(reference);
        res.json(response);
    } catch (error) {
        res.status(400).json({ error: { message: error.message } });
    }
});

// Create a subscription plan
app.post('/api/v1/payment/plans', async (req, res) => {
    try {
        const { name, amount, interval } = req.body;
        const response = await Paystack.plan.create({
            name,
            amount: amount * 100, // Paystack expects amount in kobo
            interval
        });
        res.json(response);
    } catch (error) {
        res.status(400).json({ error: { message: error.message } });
    }
});

// List transactions
app.get('/api/v1/payment/transactions', async (req, res) => {
    try {
        const response = await Paystack.transaction.list();
        res.json(response);
    } catch (error) {
        res.status(400).json({ error: { message: error.message } });
    }
});


app.listen(PORT, () => {
    console.log(`💳 Payment service running on port ${PORT}`);
});
