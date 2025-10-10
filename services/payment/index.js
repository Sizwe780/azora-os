require('dotenv').config();require('dotenv').config();

const express = require('express');const express = require('express');

const Stripe = require('stripe');const Stripe = require('stripe');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);const stripe = Stripe(process.env.STRIPE_SECRET_KEY);



const app = express();const app = express();

app.use(express.json());app.use(express.json());



const PORT = process.env.PORT || 3005;const PORT = process.env.PORT || 3005;



app.get('/api/v1/payment/health', (req, res) => {app.get('/api/v1/payment/health', (req, res) => {

    res.status(200).json({ status: 'ok', service: 'payment' });    res.status(200).json({ status: 'ok', service: 'payment' });

});});



// Create a subscription// Create a subscription

app.post('/api/v1/payment/subscriptions', async (req, res) => {app.post('/api/v1/payment/subscriptions', async (req, res) => {

    try {    try {

        const { customerId, priceId } = req.body;        const { customerId, priceId } = req.body;

        const subscription = await stripe.subscriptions.create({        const subscription = await stripe.subscriptions.create({

            customer: customerId,            customer: customerId,

            items: [{ price: priceId }],            items: [{ price: priceId }],

            expand: ['latest_invoice.payment_intent'],            expand: ['latest_invoice.payment_intent'],

        });        });

        res.json(subscription);        res.json(subscription);

    } catch (error) {    } catch (error) {

        res.status(400).json({ error: { message: error.message } });        res.status(400).json({ error: { message: error.message } });

    }    }

});});



// Get subscription details// Get subscription details

app.get('/api/v1/payment/subscriptions/:id', async (req, res) => {app.get('/api/v1/payment/subscriptions/:id', async (req, res) => {

    try {    try {

        const subscription = await stripe.subscriptions.retrieve(req.params.id);        const subscription = await stripe.subscriptions.retrieve(req.params.id);

        res.json(subscription);        res.json(subscription);

    } catch (error) {    } catch (error) {

        res.status(400).json({ error: { message: error.message } });        res.status(400).json({ error: { message: error.message } });

    }    }

});});





app.listen(PORT, () => {app.listen(PORT, () => {

    console.log(`💳 Payment service running on port ${PORT}`);    console.log(`💳 Payment service running on port ${PORT}`);

});});

