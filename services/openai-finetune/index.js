const express = require('express');
const multer = require('multer');
const { Configuration, OpenAIApi } = require("openai");
const fs = require('fs');
const app = express();
const upload = multer({ dest: "/tmp" });

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const configuration = new Configuration({ apiKey: OPENAI_KEY });
const openai = new OpenAIApi(configuration);

let jobs = {};

app.post('/api/finetune/data', upload.single('file'), async (req, res) => {
  if (!OPENAI_KEY) return res.status(403).json({ error: "No OpenAI API key" });
  try {
    const file = await openai.createFile(fs.createReadStream(req.file.path), "fine-tune");
    fs.unlinkSync(req.file.path);
    res.json({ fileId: file.data.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/finetune/job', express.json(), async (req, res) => {
  const { fileId, base_model } = req.body;
  try {
    const job = await openai.createFineTune({
      training_file: fileId,
      model: base_model || "gpt-3.5-turbo"
    });
    jobs[job.data.id] = { status: "pending", job: job.data };
    res.json({ jobId: job.data.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/finetune/job/:id', async (req, res) => {
  try {
    const job = await openai.retrieveFineTune(req.params.id);
    jobs[req.params.id] = { status: job.data.status, job: job.data };
    res.json(jobs[req.params.id]);
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});

app.post('/api/finetune/predict', express.json(), async (req, res) => {
  const { prompt, model } = req.body;
  try {
    const r = await openai.createCompletion({ model, prompt, max_tokens: 50 });
    res.json({ result: r.data.choices[0]?.text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(5500, () => console.log("[openai-finetune] running on 5500"));
