#!/bin/bash
# filepath: /workspaces/azora-os/marketing/scripts/run_fintech_campaign.sh
"""
Fintech Campaign Launcher - Executes the complete outreach workflow
Follows Azora Constitutional principles:
- Value Creation (Art.1): Automates high-value partnership acquisition
- Truth (Art.3): Uses real data for tracking and analytics
- Growth (Art.4): Directly contributes to API user acquisition
"""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║    🚀 AZORA FINTECH OUTREACH CAMPAIGN LAUNCHER 🚀         ║"
echo "║                                                            ║"
echo "║       Building Strategic B2B API Partnerships              ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Base directory setup
BASE_DIR="$(dirname "$(dirname "$(realpath "$0")")")"
API_KEYS_DIR="${BASE_DIR}/output/api_keys"
TRACKING_FILE="${BASE_DIR}/output/outreach_tracking.csv"
EMAIL_DIR="${BASE_DIR}/output/fintech_emails"
API_ENDPOINT_DIR="${BASE_DIR}/api_endpoints"

# Create necessary directories
mkdir -p "${API_KEYS_DIR}"
mkdir -p "${API_ENDPOINT_DIR}"

# Step 1: Generate personalized emails
echo "📧 Step 1/4: Generating personalized fintech outreach emails..."
python3 "${BASE_DIR}/marketing/scripts/generate_fintech_emails.py"
if [ $? -ne 0 ]; then
  echo "❌ Email generation failed. Check errors above."
  exit 1
fi
echo "✅ Email generation complete!"
echo ""

# Step 2: Create API key generator
echo "🔑 Step 2/4: Setting up API key provisioning system..."
cat > "${API_ENDPOINT_DIR}/api_key_provisioner.js" << 'EOL'
// API Key Provisioning System for Fintech Partners
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const express = require('express');
const csvParser = require('csv-parser');
const fastCsv = require('fast-csv');

const app = express();
app.use(express.json());

const BASE_DIR = path.resolve(__dirname, '..');
const TRACKING_FILE = path.join(BASE_DIR, 'output', 'outreach_tracking.csv');
const API_KEYS_DIR = path.join(BASE_DIR, 'output', 'api_keys');

// Generate a secure API key
function generateApiKey(companyName) {
  const prefix = 'azr_live_';
  const randomBytes = crypto.randomBytes(16).toString('hex');
  return `${prefix}${randomBytes}`;
}

// Generate welcome package with API key
function generateWelcomePackage(company, apiKey) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `${company.company_name.replace(/\s+/g, '_')}_welcome_${timestamp}.md`;
  const filePath = path.join(API_KEYS_DIR, fileName);
  
  const welcomeContent = `# Welcome to Azora API, ${company.company_name}!

Thank you for partnering with Azora OS. Your API access is now active.

## API Credentials
- **API Key**: \`${apiKey}\`
- **Environment**: Production
- **Rate Limit**: 1000 requests/minute
- **Support Tier**: Premium

## Getting Started
1. Review our [API Documentation](https://api.azora.world/docs)
2. Test your integration with our sandbox
3. Deploy to production with your live key

## Support Contact
For technical assistance, contact api-support@azora.world or call +27 73 234 7232.

We're excited to have ${company.company_name} join the Azora ecosystem!

—
Sizwe Ngwenya
Founder & Chief Architect
Azora OS
`;

  fs.writeFileSync(filePath, welcomeContent);
  return filePath;
}

// Update tracking CSV when a company responds
function updateTrackingFile(companyName, apiKeyProvisioned) {
  const records = [];
  
  // Read existing records
  fs.createReadStream(TRACKING_FILE)
    .pipe(csvParser())
    .on('data', (row) => records.push(row))
    .on('end', () => {
      // Update the matching record
      const updatedRecords = records.map(record => {
        if (record.company_name === companyName) {
          return {
            ...record,
            responded: 'Yes',
            api_key_provisioned: apiKeyProvisioned ? 'Yes' : 'No',
            date_responded: new Date().toISOString().split('T')[0]
          };
        }
        return record;
      });
      
      // Write updated records back to CSV
      const ws = fs.createWriteStream(TRACKING_FILE, { flags: 'w' });
      fastCsv.write(updatedRecords, { headers: true })
        .pipe(ws);
    });
}

// API endpoint for handling responses
app.post('/api/partner/response', (req, res) => {
  const { companyName, contactEmail, interested } = req.body;
  
  if (!companyName || !contactEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  console.log(`📣 Response received from ${companyName}: ${interested ? 'INTERESTED' : 'NOT INTERESTED'}`);
  
  if (interested) {
    const apiKey = generateApiKey(companyName);
    const welcomePackagePath = generateWelcomePackage({ company_name: companyName }, apiKey);
    
    // Store API key securely
    const apiKeyRecord = {
      key: apiKey,
      company: companyName,
      email: contactEmail,
      created: new Date().toISOString(),
      active: true
    };
    
    const keyFilePath = path.join(API_KEYS_DIR, `${companyName.replace(/\s+/g, '_')}_apikey.json`);
    fs.writeFileSync(keyFilePath, JSON.stringify(apiKeyRecord, null, 2));
    
    updateTrackingFile(companyName, true);
    
    return res.status(201).json({ 
      message: 'API key provisioned successfully',
      welcomePackage: path.basename(welcomePackagePath)
    });
  } else {
    updateTrackingFile(companyName, false);
    return res.status(200).json({ message: 'Response recorded' });
  }
});

// API endpoint to get campaign analytics
app.get('/api/campaign/analytics', (req, res) => {
  const records = [];
  
  fs.createReadStream(TRACKING_FILE)
    .pipe(csvParser())
    .on('data', (row) => records.push(row))
    .on('end', () => {
      const total = records.length;
      const responded = records.filter(r => r.responded === 'Yes').length;
      const apiProvisioned = records.filter(r => r.api_key_provisioned === 'Yes').length;
      
      res.json({
        totalCompanies: total,
        responseRate: `${((responded / total) * 100).toFixed(1)}%`,
        conversionRate: `${((apiProvisioned / responded) * 100).toFixed(1)}%`,
        apiKeysProvisioned: apiProvisioned
      });
    });
});

const PORT = process.env.PORT || 3456;
app.listen(PORT, () => {
  console.log(`✅ API Key Provisioning Service running on port ${PORT}`);
  console.log(`📊 Campaign analytics available at http://localhost:${PORT}/api/campaign/analytics`);
});
EOL
echo "✅ API key provisioning system created!"
echo ""

# Step 3: Create campaign monitoring dashboard
echo "📊 Step 3/4: Setting up campaign monitoring dashboard..."
cat > "${API_ENDPOINT_DIR}/campaign_dashboard.html" << 'EOL'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Azora Fintech Outreach Campaign Dashboard</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f7fa;
      color: #333;
    }
    .dashboard {
      max-width: 1000px;
      margin: 0 auto;
      background: white;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 20px;
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
      margin-bottom: 30px;
    }
    h1 {
      color: #1a73e8;
      margin-bottom: 5px;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .metric-card {
      background: #f9f9f9;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    .metric-value {
      font-size: 36px;
      font-weight: bold;
      color: #1a73e8;
      margin: 10px 0;
    }
    .metric-label {
      font-size: 14px;
      color: #666;
    }
    .company-list {
      border-top: 1px solid #eee;
      padding-top: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    th {
      background-color: #f5f7fa;
      font-weight: 600;
    }
    .tag {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    .tag-yes {
      background-color: #e6f4ea;
      color: #137333;
    }
    .tag-no {
      background-color: #fce8e6;
      color: #c5221f;
    }
    .refresh-btn {
      display: block;
      margin: 20px auto;
      padding: 10px 20px;
      background-color: #1a73e8;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
    }
    .refresh-btn:hover {
      background-color: #1557b0;
    }
  </style>
</head>
<body>
  <div class="dashboard">
    <div class="header">
      <h1>🚀 Azora Fintech Outreach Campaign</h1>
      <p>Real-time tracking of fintech partnership acquisition</p>
    </div>
    
    <div class="metrics">
      <div class="metric-card">
        <div class="metric-label">Total Companies</div>
        <div class="metric-value" id="totalCompanies">-</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Response Rate</div>
        <div class="metric-value" id="responseRate">-</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Conversion Rate</div>
        <div class="metric-value" id="conversionRate">-</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">API Keys Issued</div>
        <div class="metric-value" id="apiKeysProvisioned">-</div>
      </div>
    </div>
    
    <div class="company-list">
      <h2>Company Status</h2>
      <table id="companyTable">
        <thead>
          <tr>
            <th>Company</th>
            <th>Contact</th>
            <th>Email Sent</th>
            <th>Responded</th>
            <th>API Key</th>
          </tr>
        </thead>
        <tbody id="companyTableBody">
          <!-- Data will be loaded here -->
        </tbody>
      </table>
    </div>
    
    <button class="refresh-btn" id="refreshBtn">Refresh Data</button>
  </div>

  <script>
    // Function to load analytics data
    async function loadAnalytics() {
      try {
        const response = await fetch('http://localhost:3456/api/campaign/analytics');
        const data = await response.json();
        
        document.getElementById('totalCompanies').textContent = data.totalCompanies;
        document.getElementById('responseRate').textContent = data.responseRate;
        document.getElementById('conversionRate').textContent = data.conversionRate;
        document.getElementById('apiKeysProvisioned').textContent = data.apiKeysProvisioned;
      } catch (error) {
        console.error('Error loading analytics:', error);
      }
    }
    
    // Function to load company data
    async function loadCompanyData() {
      try {
        const response = await fetch('/marketing/scripts/get_tracking_data.php');
        const data = await response.json();
        const tableBody = document.getElementById('companyTableBody');
        
        // Clear existing rows
        tableBody.innerHTML = '';
        
        // Add company rows
        data.forEach(company => {
          const row = document.createElement('tr');
          
          const respondedTag = company.responded === 'Yes' 
            ? '<span class="tag tag-yes">Yes</span>' 
            : '<span class="tag tag-no">No</span>';
            
          const apiKeyTag = company.api_key_provisioned === 'Yes' 
            ? '<span class="tag tag-yes">Issued</span>' 
            : '<span class="tag tag-no">None</span>';
          
          row.innerHTML = `
            <td>${company.company_name}</td>
            <td>${company.contact_name}</td>
            <td>${company.date_sent || 'Pending'}</td>
            <td>${respondedTag}</td>
            <td>${apiKeyTag}</td>
          `;
          
          tableBody.appendChild(row);
        });
      } catch (error) {
        console.error('Error loading company data:', error);
      }
    }
    
    // Initial load
    loadAnalytics();
    loadCompanyData();
    
    // Refresh button event
    document.getElementById('refreshBtn').addEventListener('click', () => {
      loadAnalytics();
      loadCompanyData();
    });
    
    // Auto refresh every 5 minutes
    setInterval(() => {
      loadAnalytics();
      loadCompanyData();
    }, 5 * 60 * 1000);
  </script>
</body>
</html>
EOL

# Create the PHP script to read tracking data for the dashboard
cat > "${BASE_DIR}/marketing/scripts/get_tracking_data.php" << 'EOL'
<?php
header('Content-Type: application/json');

$file = '../../output/outreach_tracking.csv';
$data = [];

if (($handle = fopen($file, "r")) !== FALSE) {
    // Get headers
    $headers = fgetcsv($handle);
    
    // Get data
    while (($row = fgetcsv($handle)) !== FALSE) {
        $company = [];
        foreach ($headers as $i => $header) {
            $company[$header] = $row[$i];
        }
        $data[] = $company;
    }
    fclose($handle);
}

echo json_encode($data);
EOL
chmod +x "${BASE_DIR}/marketing/scripts/get_tracking_data.php"
echo "✅ Campaign monitoring dashboard created!"
echo ""

# Step 4: Create response simulation script for testing
echo "🔄 Step 4/4: Creating response simulation script for testing..."
cat > "${BASE_DIR}/marketing/scripts/simulate_responses.js" << 'EOL'
// Script to simulate company responses for testing
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const csv = require('csv-parser');

const BASE_DIR = path.resolve(__dirname, '../..');
const TRACKING_FILE = path.join(BASE_DIR, 'output', 'outreach_tracking.csv');

// Read the tracking file
const companies = [];
fs.createReadStream(TRACKING_FILE)
  .pipe(csv())
  .on('data', (data) => companies.push(data))
  .on('end', async () => {
    console.log(`Found ${companies.length} companies in tracking file`);
    
    // Simulate responses for some companies
    const simulatedCompanies = companies
      .filter(() => Math.random() > 0.3) // Simulate that 70% respond
      .slice(0, 5); // Only take up to 5 for testing
    
    console.log(`Simulating responses for ${simulatedCompanies.length} companies...`);
    
    for (const company of simulatedCompanies) {
      const interested = Math.random() > 0.4; // 60% are interested
      
      try {
        const response = await axios.post('http://localhost:3456/api/partner/response', {
          companyName: company.company_name,
          contactEmail: company.email,
          interested
        });
        
        console.log(`✓ ${company.company_name}: ${interested ? 'INTERESTED' : 'NOT INTERESTED'}`);
        if (interested) {
          console.log(`  → API Key provisioned: ${response.data.welcomePackage}`);
        }
      } catch (error) {
        console.error(`✗ Error simulating response for ${company.company_name}:`, error.message);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n✅ Response simulation complete!');
    console.log('📊 Check the campaign dashboard to see the results.');
  });
EOL

# Create launch script for the entire campaign
cat > "${BASE_DIR}/marketing/scripts/launch_campaign.sh" << 'EOL'
#!/bin/bash

# Start the API Key provisioning server
cd "$(dirname "$0")/../.."
echo "🚀 Starting API Key Provisioning Server..."
node api_endpoints/api_key_provisioner.js &
API_SERVER_PID=$!

# Wait a moment for the server to start
sleep 2

echo "📊 Starting local PHP server for dashboard..."
cd marketing/scripts
php -S localhost:8000 &
PHP_SERVER_PID=$!

echo "🌐 Opening campaign dashboard..."
if command -v xdg-open &> /dev/null; then
  xdg-open http://localhost:8000/../../api_endpoints/campaign_dashboard.html
elif command -v open &> /dev/null; then
  open http://localhost:8000/../../api_endpoints/campaign_dashboard.html
fi

echo "Press CTRL+C to stop the campaign servers"

# Wait for user to press CTRL+C
trap "kill $API_SERVER_PID $PHP_SERVER_PID; exit" INT
wait
EOL
chmod +x "${BASE_DIR}/marketing/scripts/launch_campaign.sh"

echo "✅ Response simulation script created!"
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║       ✅ FINTECH CAMPAIGN SETUP COMPLETE ✅                ║"
echo "║                                                            ║"
echo "║       To launch the campaign:                              ║"
echo "║       1. cd ${BASE_DIR}/marketing/scripts                   ║"
echo "║       2. ./launch_campaign.sh                              ║"
echo "║                                                            ║"
echo "║       To simulate responses for testing:                   ║"
echo "║       node ${BASE_DIR}/marketing/scripts/simulate_responses.js ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"

# Create a package.json file for the required Node.js dependencies
cat > "${API_ENDPOINT_DIR}/package.json" << 'EOL'
{
  "name": "azora-fintech-campaign",
  "version": "1.0.0",
  "description": "API endpoints for Azora fintech outreach campaign",
  "main": "api_key_provisioner.js",
  "dependencies": {
    "express": "^4.18.2",
    "csv-parser": "^3.0.0",
    "fast-csv": "^4.3.6",
    "axios": "^1.3.4"
  }
}
EOL

echo "📝 Note: Run 'npm install' in ${API_ENDPOINT_DIR} to install required dependencies."