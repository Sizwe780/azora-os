const app = require('./api');

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`AI Orchestrator running on port ${PORT}`);
});
