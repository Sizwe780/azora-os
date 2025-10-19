const express = require('express');
const app = express();
app.use(express.json());

let docs = [
  { id: 1, text: "Welcome to Azora OS, your AI-powered cloud platform." },
  { id: 2, text: "The dashboard lets you monitor all your services in real time." },
  { id: 3, text: "Try the new AI Assistant for recommendations and automation." }
];
// TODO: Plug in real vector/embedding search (e.g. OpenAI, Pinecone, Elasticsearch, etc.)

app.post('/api/search', (req, res) => {
  const { query } = req.body;
  // Simple lexical+semantic: match by inclusion or similar phrase
  const results = docs.filter(d =>
    d.text.toLowerCase().includes(query.toLowerCase())
    || query.toLowerCase().split(" ").some(w => d.text.toLowerCase().includes(w))
  );
  res.json({ results });
});

app.listen(3900, () => console.log("[ai-search] running on 3900"));
