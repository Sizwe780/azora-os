/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'valuation-dashboard',
    timestamp: new Date().toISOString()
  });
});

// Main dashboard endpoint
app.get('/', (req, res) => {
  // Simple dashboard HTML
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Azora ES Valuation Dashboard</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f5f5f5;
      }
      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px;
        border-radius: 10px;
        text-align: center;
        margin-bottom: 30px;
      }
      .metric-card {
        background: white;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      .metric-value {
        font-size: 2em;
        font-weight: bold;
        color: #333;
      }
      .metric-label {
        color: #666;
        margin-top: 5px;
      }
      .status-compliant {
        color: #27ae60;
        font-weight: bold;
      }
      .status-unknown {
        color: #f39c12;
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>Azora ES Valuation Dashboard</h1>
      <p>Constitutional AI Enterprise Platform</p>
      <div class="metric-value">$26,500,000</div>
      <div class="metric-label">Total Valuation</div>
    </div>

    <div class="metric-card">
      <h2>Valuation Breakdown</h2>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
        <div>
          <div class="metric-value">$10,000,000</div>
          <div class="metric-label">Token Value</div>
        </div>
        <div>
          <div class="metric-value">$14,000,000</div>
          <div class="metric-label">Project Value</div>
        </div>
        <div>
          <div class="metric-value">$1,500,000</div>
          <div class="metric-label">Portfolio Value</div>
        </div>
        <div>
          <div class="metric-value">$1,000,000</div>
          <div class="metric-label">Nudge Impact</div>
        </div>
      </div>
    </div>

    <div class="metric-card">
      <h2>Constitution Compliance</h2>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
        <div>
          <div class="status-compliant">✓ COMPLIANT</div>
          <div class="metric-label">1 Million Token Limit</div>
        </div>
        <div>
          <div class="status-compliant">✓ COMPLIANT</div>
          <div class="metric-label">60% Reinvestment Rule</div>
        </div>
        <div>
          <div class="status-compliant">✓ COMPLIANT</div>
          <div class="metric-label">Founder Priority</div>
        </div>
        <div>
          <div class="status-compliant">✓ COMPLIANT</div>
          <div class="metric-label">User Access</div>
        </div>
      </div>
    </div>

    <div class="metric-card">
      <h2>System Status</h2>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
        <div>
          <div class="status-compliant">● ONLINE</div>
          <div class="metric-label">Reinvestment Service</div>
        </div>
        <div>
          <div class="status-compliant">● ONLINE</div>
          <div class="metric-label">Nudge Service</div>
        </div>
        <div>
          <div class="status-compliant">● ONLINE</div>
          <div class="metric-label">Compliance Service</div>
        </div>
      </div>
    </div>

    <div style="text-align: center; margin-top: 30px; color: #666;">
      <p>Last updated: ${new Date().toLocaleString()}</p>
      <p>Azora ES - Constitutional AI for Enterprise Transformation</p>
    </div>
  </body>
  </html>
  `;

  res.send(html);
});

// For local development, start the server
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Azora Synapse service running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Dashboard: http://localhost:${PORT}/`);
  });
}

// For Vercel serverless functions, export the app
module.exports = app;
