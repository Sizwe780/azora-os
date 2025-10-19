const express = require('express');
const app = express();
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "sk-demo";
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

app.post('/api/llm/completions', async (req,res) => {
  const { prompt, model } = req.body;
  // Call OpenAI API, or return demo data
  if (OPENAI_API_KEY.startsWith("sk-demo")) {
    // demo response
    return res.json({ completion: `Pretend AI says: ${prompt}` });
  }
  try {
    const r = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model || "text-davinci-003",
        prompt,
        max_tokens: 100
      })
    });
    const data = await r.json();
    res.json({ completion: data.choices?.[0]?.text || "" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(4500, () => console.log("[llm] running on 4500"));
