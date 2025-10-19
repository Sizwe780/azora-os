const express = require('express');
const { OpenAI } = require('openai');
const app = express();
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/ai/generate', async (req, res) => {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: req.body.prompt }],
  });
  res.json({ response: completion.choices[0].message.content });
});

app.listen(3007, () => console.log('Advanced AI running on port 3007'));
