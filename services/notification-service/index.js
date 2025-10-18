/**
 * @file index.js
 * @description The Voice of Azora. Delivers proactive notifications from the AI to citizens.
 */
const express = require('express');
const cors =require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const PORT = 5300;

app.get('/health', (req, res) => res.status(200).json({ status: 'online' }));

app.post('/api/notify', (req, res) => {
    const { userId, title, message, action } = req.body;
    if (!userId || !title || !message) {
        return res.status(400).json({ error: 'userId, title, and message are required.' });
    }
    // In a real system, this would use WebSockets, push notifications, or email.
    console.log(`📣 NOTIFICATION for ${userId}: "${title}" - "${message}"`);
    res.status(202).json({ success: true, message: "Notification dispatched." });
});

app.listen(PORT, () => console.log(`📣 Notification Service is online on port ${PORT}.`));