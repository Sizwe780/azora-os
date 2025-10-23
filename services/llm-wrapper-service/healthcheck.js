const http = require('http');

const options = {
  hostname: 'localhost',
  port: 8084,
  path: '/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('LLM Wrapper Service is healthy');
    process.exit(0);
  } else {
    console.log(`LLM Wrapper Service returned status: ${res.statusCode}`);
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.error('Health check failed:', err.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('Health check timed out');
  req.destroy();
  process.exit(1);
});

req.end();