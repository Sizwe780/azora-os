const app = require('./app');
const config = require('./config');

app.listen(config.port, () => {
  console.log(`Shield service listening on port ${config.port}`);
});
