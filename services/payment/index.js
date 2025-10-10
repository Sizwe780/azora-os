require('dotenv').config();
const express = require('express');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3005;

app.get('/api/v1/payment/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'payment' });
});

// Create a subscription
app.post('/api/v1/payment/subscriptions', async (req, res) => {
    try {
        const { customerId, priceId } = req.body;
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            expand: ['latest_invoice.payment_intent'],
        });
        res.json(subscription);
    } catch (error) {
        res.status(400).json({ error: { message: error.message } });
    }
});

// Get subscription details
app.get('/api/v1/payment/subscriptions/:id', async (req, res) => {
    try {
        const subscription = await stripe.subscriptions.retrieve(req.params.id);
        res.json(subscription);
    } catch (error) {
        res.status(400).json({ error: { message: error.message } });
    }
});


app.listen(PORT, () => {
    console.log(`💳 Payment service running on port ${PORT}`);
});

