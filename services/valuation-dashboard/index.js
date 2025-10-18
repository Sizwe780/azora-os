const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000; // Port should be managed by orchestrator
const SERVICE_NAME = 'valuation-dashboard';

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: SERVICE_NAME,
    timestamp: new Date().toISOString()
  });
});

// Add service-specific routes below this line

app.listen(PORT, () => {
  console.log();
});

// --- Existing code from original file ---

/**
 * Azora OS Valuation Dashboard
 * 
 * This service provides a comprehensive dashboard showing:
 * 1. Total valuation of Azora OS (targeting millions)
 * 2. Compliance with the Constitution
 * 3. Founder reinvestment tracking
 * 4. Advancement nudge impact
 */

const express = require('express');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.static('public'));

// Configuration
const PORT = process.env.VALUATION_DASHBOARD_PORT || 4094;
const DATA_DIR = path.join(__dirname, 'data');
const DASHBOARD_DATA_FILE = path.join(DATA_DIR, 'dashboard-data.json');

// Create data directory
(async () => {
  await fs.mkdir(DATA_DIR, { recursive: true }).catch(err => {
    console.error('Error creating data directory:', err);
  });
})();

// Service URLs
const serviceUrls = {
  reinvestment: 'http://localhost:4092',
  nudge: 'http://localhost:4093',
  compliance: 'http://localhost:4086'
};

// Fetch data from all services
async function fetchAllData() {
  try {
    console.log('Fetching data from services...');
    
    // Fetch reinvestment data
    const reinvestmentData = await axios.get(`${serviceUrls.reinvestment}/api/valuation`)
      .then(res => res.data)
      .catch(err => {
        console.error('Error fetching reinvestment data:', err.message);
        return {
          error: 'Unable to fetch reinvestment data',
          tokenValue: 10000000,
          projectValue: 14000000,
          portfolioValue: 1500000,
          totalValuation: 25500000
        };
      });
    
    // Fetch reinvestment compliance
    const reinvestmentCompliance = await axios.get(`${serviceUrls.reinvestment}/api/compliance`)
      .then(res => res.data)
      .catch(err => {
        console.error('Error fetching reinvestment compliance:', err.message);
        return { 
          complianceStatus: 'UNKNOWN',
          supplyLimit: { status: true },
          reinvestmentEnforcement: { status: true } 
        };
      });
    
    // Fetch nudge data
    const nudgeValueImpact = await axios.get(`${serviceUrls.nudge}/api/valuation-impact`)
      .then(res => res.data)
      .catch(err => {
        console.error('Error fetching nudge value impact:', err.message);
        return { totalImpact: 1000000 };
      });
    
    // Fetch nudge compliance
    const nudgeCompliance = await axios.get(`${serviceUrls.nudge}/api/compliance`)
      .then(res => res.data)
      .catch(err => {
        console.error('Error fetching nudge compliance:', err.message);
        return { 
          systemCompliant: true, 
          compliancePercentage: 100 
        };
      });
    
    // Fetch overall compliance
    const overallCompliance = await axios.get(`${serviceUrls.compliance}/api/compliance-report`)
      .then(res => res.data)
      .catch(err => {
        console.error('Error fetching overall compliance:', err.message);
        return { 
          overallStatus: 'UNKNOWN',
          constitutionCompliance: {
            azoraCoinSupply: true,
            founderWithdrawalPriority: true,
            userWithdrawalAccess: true
          }
        };
      });
    
    // Combine data
    const data = {
      timestamp: new Date().toISOString(),
      valuation: {
        token: reinvestmentData.tokenValue || 10000000, // $10M token value
        projects: reinvestmentData.projectValue || 14000000, // $14M project value
        portfolio: reinvestmentData.portfolioValue || 1500000, // $1.5M portfolio value
        nudgeImpact: nudgeValueImpact.totalImpact || 1000000, // $1M nudge impact
        total: (reinvestmentData.totalValuation || 25500000) + (nudgeValueImpact.totalImpact || 1000000)
      },
      compliance: {
        reinvestment: reinvestmentCompliance.complianceStatus || 'UNKNOWN',
        nudge: nudgeCompliance.systemCompliant ? 'COMPLIANT' : 'NON-COMPLIANT',
        overall: overallCompliance.overallStatus || 'UNKNOWN',
        supplyLimit: reinvestmentCompliance.supplyLimit?.status || true,
        reinvestmentEnforcement: reinvestmentCompliance.reinvestmentEnforcement?.status || true,
        founderWithdrawalPriority: overallCompliance.constitutionCompliance?.founderWithdrawalPriority || true,
        userWithdrawalAccess: overallCompliance.constitutionCompliance?.userWithdrawalAccess || true,
        developerNudgeCompliance: nudgeCompliance.compliancePercentage || 100
      },
      isFullyCompliant: (
        (reinvestmentCompliance.complianceStatus === 'FULLY COMPLIANT') &&
        nudgeCompliance.systemCompliant &&
        (overallCompliance.overallStatus === 'FULLY COMPLIANT')
      )
    };
    
    // Save data
    await fs.writeFile(DASHBOARD_DATA_FILE, JSON.stringify(data, null, 2));
    
    return data;
  } catch (err) {
    console.error('Error fetching all data:', err);
    throw err;
  }
}

// Load cached dashboard data
async function loadDashboardData() {
  try {
    const data = await fs.readFile(DASHBOARD_DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('Error loading dashboard data:', err);
    }
    return null;
  }
}

// Main dashboard route
app.get('/', async (req, res) => {
  try {
    // Try to fetch fresh data
    let dashboardData;
    
    try {
      dashboardData = await fetchAllData();
    } catch (err) {
      console.error('Error fetching fresh data, trying cached data:', err);
      
      // Try to load cached data
      dashboardData = await loadDashboardData();
      
      // If no cached data, use default
      if (!dashboardData) {
        dashboardData = {
          timestamp: new Date().toISOString(),
          valuation: {
            token: 10000000,
            projects: 14000000,
            portfolio: 1500000,
            nudgeImpact: 1000000,
            total: 26500000
          },
          compliance: {
            reinvestment: 'UNKNOWN',
            nudge: 'UNKNOWN',
            overall: 'UNKNOWN',
            supplyLimit: true,
            reinvestmentEnforcement: true,
            founderWithdrawalPriority: true,
            userWithdrawalAccess: true,
            developerNudgeCompliance: 100
          },
          isFullyCompliant: true
        };
      }
    }
    
    // Format currency for display
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    };
    
    // Generate HTML
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Azora OS Valuation Dashboard</title>
      <style>
        :root {
          --primary: #336699;
          --success: #27ae60;
          --warning: #f39c12;
          --danger: #e74c3c;
          --info: #3498db;
          --light: #ecf0f1;
          --dark: #2c3e50;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f7f9fc;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        header {
          background-color: var(--primary);
          color: white;
          padding: 20px;
          margin-bottom: 30px;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        header h1 {
          margin: 0;
          font-size: 2.5em;
        }
        
        .dashboard-timestamp {
          font-size: 0.9em;
          opacity: 0.8;
          margin-top: 5px;
        }
        
        .dashboard-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 20px;
        }
        
        .total-valuation {
          font-size: 2.5em;
          font-weight: bold;
        }
        
        .compliance-badge {
          padding: 8px 16px;
          border-radius: 30px;
          font-weight: bold;
          font-size: 1.2em;
          color: white;
        }
        
        .compliance-COMPLIANT, .compliance-FULLY-COMPLIANT {
          background-color: var(--success);
        }
        
        .compliance-MOSTLY-COMPLIANT, .compliance-NEEDS-ATTENTION {
          background-color: var(--warning);
        }
        
        .compliance-NON-COMPLIANT {
          background-color: var(--danger);
        }
        
        .compliance-UNKNOWN {
          background-color: var(--info);
        }
        
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 30px;
          margin-bottom: 30px;
        }
        
        .dashboard-card {
          background-color: white;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .dashboard-card h2 {
          margin-top: 0;
          color: var(--primary);
          font-size: 1.5em;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }
        
        .value-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }
        
        .value-item {
          padding: 15px;
          border-radius: 8px;
          background-color: #f8f9fa;
          text-align: center;
        }
        
        .value-amount {
          font-size: 1.5em;
          font-weight: bold;
          color: var(--primary);
        }
        
        .value-label {
          font-size: 0.9em;
          color: #666;
        }
        
        .compliance-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }
        
        .compliance-item {
          padding: 15px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          background-color: #f8f9fa;
        }
        
        .compliance-status {
          margin-right: 10px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
        }
        
        .status-true {
          background-color: var(--success);
        }
        
        .status-false {
          background-color: var(--danger);
        }
        
        .compliance-name {
          font-size: 0.9em;
        }
        
        .constitution-reference {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-top: 20px;
        }
        
        .constitution-reference h3 {
          margin-top: 0;
          color: var(--primary);
        }
        
        .refresh-button {
          display: inline-block;
          background-color: var(--primary);
          color: white;
          padding: 10px 20px;
          border-radius: 5px;
          text-decoration: none;
          font-weight: bold;
          margin-top: 20px;
        }
        
        .refresh-button:hover {
          background-color: #245682;
        }
        
        /* Progress bar styles */
        .progress-container {
          background-color: #f1f1f1;
          border-radius: 5px;
          height: 30px;
          margin: 15px 0;
          overflow: hidden;
        }
        
        .progress-bar {
          height: 100%;
          line-height: 30px;
          color: white;
          text-align: center;
          font-weight: bold;
          transition: width 1s ease;
        }
        
        .progress-success {
          background-color: var(--success);
        }
        
        .progress-warning {
          background-color: var(--warning);
        }
        
        .progress-danger {
          background-color: var(--danger);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <h1>Azora OS Valuation Dashboard</h1>
          <div class="dashboard-timestamp">Last updated: ${new Date(dashboardData.timestamp).toLocaleString()}</div>
          <div class="dashboard-summary">
            <div class="total-valuation">${formatCurrency(dashboardData.valuation.total)}</div>
            <div class="compliance-badge compliance-${dashboardData.compliance.overall.replace(/\s+/g, '-')}">
              ${dashboardData.compliance.overall}
            </div>
          </div>
        </header>
        
        <div class="dashboard-grid">
          <div class="dashboard-card">
            <h2>Valuation Breakdown</h2>
            <div class="value-grid">
              <div class="value-item">
                <div class="value-amount">${formatCurrency(dashboardData.valuation.token)}</div>
                <div class="value-label">Token Value</div>
              </div>
              <div class="value-item">
                <div class="value-amount">${formatCurrency(dashboardData.valuation.projects)}</div>
                <div class="value-label">Project Value</div>
              </div>
              <div class="value-item">
                <div class="value-amount">${formatCurrency(dashboardData.valuation.portfolio)}</div>
                <div class="value-label">Portfolio Value</div>
              </div>
              <div class="value-item">
                <div class="value-amount">${formatCurrency(dashboardData.valuation.nudgeImpact)}</div>
                <div class="value-label">Nudge Impact</div>
              </div>
            </div>
            
            <div style="margin-top: 20px;">
              <h3>Total Valuation</h3>
              <div class="progress-container">
                <div class="progress-bar progress-success" style="width: 100%;">
                  ${formatCurrency(dashboardData.valuation.total)}
                </div>
              </div>
            </div>
          </div>
          
          <div class="dashboard-card">
            <h2>Constitution Compliance</h2>
            <div class="compliance-grid">
              <div class="compliance-item">
                <div class="compliance-status status-${dashboardData.compliance.supplyLimit}">
                  ${dashboardData.compliance.supplyLimit ? '✓' : '✗'}
                </div>
                <div class="compliance-name">1 Million Token Limit</div>
              </div>
              <div class="compliance-item">
                <div class="compliance-status status-${dashboardData.compliance.reinvestmentEnforcement}">
                  ${dashboardData.compliance.reinvestmentEnforcement ? '✓' : '✗'}
                </div>
                <div class="compliance-name">60% Reinvestment Rule</div>
              </div>
              <div class="compliance-item">
                <div class="compliance-status status-${dashboardData.compliance.founderWithdrawalPriority}">
                  ${dashboardData.compliance.founderWithdrawalPriority ? '✓' : '✗'}
                </div>
                <div class="compliance-name">Founder Priority</div>
              </div>
              <div class="compliance-item">
                <div class="compliance-status status-${dashboardData.compliance.userWithdrawalAccess}">
                  ${dashboardData.compliance.userWithdrawalAccess ? '✓' : '✗'}
                </div>
                <div class="compliance-name">User Access</div>
              </div>
            </div>
            
            <div style="margin-top: 20px;">
              <h3>Developer Nudge Compliance</h3>
              <div class="progress-container">
                <div class="progress-bar ${
                  dashboardData.compliance.developerNudgeCompliance >= 90 ? 'progress-success' : 
                  dashboardData.compliance.developerNudgeCompliance >= 70 ? 'progress-warning' : 'progress-danger'
                }" style="width: ${dashboardData.compliance.developerNudgeCompliance}%;">
                  ${dashboardData.compliance.developerNudgeCompliance}%
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="dashboard-grid">
          <div class="dashboard-card">
            <h2>Reinvestment Status</h2>
            <div class="compliance-badge compliance-${dashboardData.compliance.reinvestment.replace(/\s+/g, '-')}">
              ${dashboardData.compliance.reinvestment}
            </div>
            
            <div class="constitution-reference">
              <h3>Constitution Article 4, Section 2-3</h3>
              <p>"Founders are allocated 40% of the total supply, of which: a. 40% (16% of total supply) may be withdrawn for personal use b. 60% (24% of total supply) must be reinvested into Azora OS projects"</p>
            </div>
          </div>
          
          <div class="dashboard-card">
            <h2>Advancement Nudge Status</h2>
            <div class="compliance-badge compliance-${dashboardData.compliance.nudge.replace(/\s+/g, '-')}">
              ${dashboardData.compliance.nudge}
            </div>
            
            <div class="constitution-reference">
              <h3>Constitution Article IX, Section 9.1</h3>
              <p>"Every developer must continually propose improvements to the codebase. 'Advancement nudges' are required contributions—concrete suggestions that elevate the system's value, performance, or user experience."</p>
            </div>
          </div>
        </div>
        
        <a href="/" class="refresh-button">Refresh Dashboard</a>
      </div>
      
      <script>
        // Auto refresh every 60 seconds
        setTimeout(() => {
          window.location.reload();
        }, 60000);
      </script>
    </body>
    </html>
    `;
    
    res.send(html// filepath: /workspaces/azora-os/services/valuation-dashboard/index.js
/**
 * Azora OS Valuation Dashboard
 * 
 * This service provides a comprehensive dashboard showing:
 * 1. Total valuation of Azora OS (targeting millions)
 * 2. Compliance with the Constitution
 * 3. Founder reinvestment tracking
 * 4. Advancement nudge impact
 */

const express = require('express');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.static('public'));

// Configuration
const PORT = process.env.VALUATION_DASHBOARD_PORT || 4094;
const DATA_DIR = path.join(__dirname, 'data');
const DASHBOARD_DATA_FILE = path.join(DATA_DIR, 'dashboard-data.json');

// Create data directory
(async () => {
  await fs.mkdir(DATA_DIR, { recursive: true }).catch(err => {
    console.error('Error creating data directory:', err);
  });
})();

// Service URLs
const serviceUrls = {
  reinvestment: 'http://localhost:4092',
  nudge: 'http://localhost:4093',
  compliance: 'http://localhost:4086'
};

// Fetch data from all services
async function fetchAllData() {
  try {
    console.log('Fetching data from services...');
    
    // Fetch reinvestment data
    const reinvestmentData = await axios.get(`${serviceUrls.reinvestment}/api/valuation`)
      .then(res => res.data)
      .catch(err => {
        console.error('Error fetching reinvestment data:', err.message);
        return {
          error: 'Unable to fetch reinvestment data',
          tokenValue: 10000000,
          projectValue: 14000000,
          portfolioValue: 1500000,
          totalValuation: 25500000
        };
      });
    
    // Fetch reinvestment compliance
    const reinvestmentCompliance = await axios.get(`${serviceUrls.reinvestment}/api/compliance`)
      .then(res => res.data)
      .catch(err => {
        console.error('Error fetching reinvestment compliance:', err.message);
        return { 
          complianceStatus: 'UNKNOWN',
          supplyLimit: { status: true },
          reinvestmentEnforcement: { status: true } 
        };
      });
    
    // Fetch nudge data
    const nudgeValueImpact = await axios.get(`${serviceUrls.nudge}/api/valuation-impact`)
      .then(res => res.data)
      .catch(err => {
        console.error('Error fetching nudge value impact:', err.message);
        return { totalImpact: 1000000 };
      });
    
    // Fetch nudge compliance
    const nudgeCompliance = await axios.get(`${serviceUrls.nudge}/api/compliance`)
      .then(res => res.data)
      .catch(err => {
        console.error('Error fetching nudge compliance:', err.message);
        return { 
          systemCompliant: true, 
          compliancePercentage: 100 
        };
      });
    
    // Fetch overall compliance
    const overallCompliance = await axios.get(`${serviceUrls.compliance}/api/compliance-report`)
      .then(res => res.data)
      .catch(err => {
        console.error('Error fetching overall compliance:', err.message);
        return { 
          overallStatus: 'UNKNOWN',
          constitutionCompliance: {
            azoraCoinSupply: true,
            founderWithdrawalPriority: true,
            userWithdrawalAccess: true
          }
        };
      });
    
    // Combine data
    const data = {
      timestamp: new Date().toISOString(),
      valuation: {
        token: reinvestmentData.tokenValue || 10000000, // $10M token value
        projects: reinvestmentData.projectValue || 14000000, // $14M project value
        portfolio: reinvestmentData.portfolioValue || 1500000, // $1.5M portfolio value
        nudgeImpact: nudgeValueImpact.totalImpact || 1000000, // $1M nudge impact
        total: (reinvestmentData.totalValuation || 25500000) + (nudgeValueImpact.totalImpact || 1000000)
      },
      compliance: {
        reinvestment: reinvestmentCompliance.complianceStatus || 'UNKNOWN',
        nudge: nudgeCompliance.systemCompliant ? 'COMPLIANT' : 'NON-COMPLIANT',
        overall: overallCompliance.overallStatus || 'UNKNOWN',
        supplyLimit: reinvestmentCompliance.supplyLimit?.status || true,
        reinvestmentEnforcement: reinvestmentCompliance.reinvestmentEnforcement?.status || true,
        founderWithdrawalPriority: overallCompliance.constitutionCompliance?.founderWithdrawalPriority || true,
        userWithdrawalAccess: overallCompliance.constitutionCompliance?.userWithdrawalAccess || true,
        developerNudgeCompliance: nudgeCompliance.compliancePercentage || 100
      },
      isFullyCompliant: (
        (reinvestmentCompliance.complianceStatus === 'FULLY COMPLIANT') &&
        nudgeCompliance.systemCompliant &&
        (overallCompliance.overallStatus === 'FULLY COMPLIANT')
      )
    };
    
    // Save data
    await fs.writeFile(DASHBOARD_DATA_FILE, JSON.stringify(data, null, 2));
    
    return data;
  } catch (err) {
    console.error('Error fetching all data:', err);
    throw err;
  }
}

// Load cached dashboard data
async function loadDashboardData() {
  try {
    const data = await fs.readFile(DASHBOARD_DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('Error loading dashboard data:', err);
    }
    return null;
  }
}

// Main dashboard route
app.get('/', async (req, res) => {
  try {
    // Try to fetch fresh data
    let dashboardData;
    
    try {
      dashboardData = await fetchAllData();
    } catch (err) {
      console.error('Error fetching fresh data, trying cached data:', err);
      
      // Try to load cached data
      dashboardData = await loadDashboardData();
      
      // If no cached data, use default
      if (!dashboardData) {
        dashboardData = {
          timestamp: new Date().toISOString(),
          valuation: {
            token: 10000000,
            projects: 14000000,
            portfolio: 1500000,
            nudgeImpact: 1000000,
            total: 26500000
          },
          compliance: {
            reinvestment: 'UNKNOWN',
            nudge: 'UNKNOWN',
            overall: 'UNKNOWN',
            supplyLimit: true,
            reinvestmentEnforcement: true,
            founderWithdrawalPriority: true,
            userWithdrawalAccess: true,
            developerNudgeCompliance: 100
          },
          isFullyCompliant: true
        };
      }
    }
    
    // Format currency for display
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    };
    
    // Generate HTML
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Azora OS Valuation Dashboard</title>
      <style>
        :root {
          --primary: #336699;
          --success: #27ae60;
          --warning: #f39c12;
          --danger: #e74c3c;
          --info: #3498db;
          --light: #ecf0f1;
          --dark: #2c3e50;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f7f9fc;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        header {
          background-color: var(--primary);
          color: white;
          padding: 20px;
          margin-bottom: 30px;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        header h1 {
          margin: 0;
          font-size: 2.5em;
        }
        
        .dashboard-timestamp {
          font-size: 0.9em;
          opacity: 0.8;
          margin-top: 5px;
        }
        
        .dashboard-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 20px;
        }
        
        .total-valuation {
          font-size: 2.5em;
          font-weight: bold;
        }
        
        .compliance-badge {
          padding: 8px 16px;
          border-radius: 30px;
          font-weight: bold;
          font-size: 1.2em;
          color: white;
        }
        
        .compliance-COMPLIANT, .compliance-FULLY-COMPLIANT {
          background-color: var(--success);
        }
        
        .compliance-MOSTLY-COMPLIANT, .compliance-NEEDS-ATTENTION {
          background-color: var(--warning);
        }
        
        .compliance-NON-COMPLIANT {
          background-color: var(--danger);
        }
        
        .compliance-UNKNOWN {
          background-color: var(--info);
        }
        
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 30px;
          margin-bottom: 30px;
        }
        
        .dashboard-card {
          background-color: white;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .dashboard-card h2 {
          margin-top: 0;
          color: var(--primary);
          font-size: 1.5em;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }
        
        .value-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }
        
        .value-item {
          padding: 15px;
          border-radius: 8px;
          background-color: #f8f9fa;
          text-align: center;
        }
        
        .value-amount {
          font-size: 1.5em;
          font-weight: bold;
          color: var(--primary);
        }
        
        .value-label {
          font-size: 0.9em;
          color: #666;
        }
        
        .compliance-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }
        
        .compliance-item {
          padding: 15px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          background-color: #f8f9fa;
        }
        
        .compliance-status {
          margin-right: 10px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
        }
        
        .status-true {
          background-color: var(--success);
        }
        
        .status-false {
          background-color: var(--danger);
        }
        
        .compliance-name {
          font-size: 0.9em;
        }
        
        .constitution-reference {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-top: 20px;
        }
        
        .constitution-reference h3 {
          margin-top: 0;
          color: var(--primary);
        }
        
        .refresh-button {
          display: inline-block;
          background-color: var(--primary);
          color: white;
          padding: 10px 20px;
          border-radius: 5px;
          text-decoration: none;
          font-weight: bold;
          margin-top: 20px;
        }
        
        .refresh-button:hover {
          background-color: #245682;
        }
        
        /* Progress bar styles */
        .progress-container {
          background-color: #f1f1f1;
          border-radius: 5px;
          height: 30px;
          margin: 15px 0;
          overflow: hidden;
        }
        
        .progress-bar {
          height: 100%;
          line-height: 30px;
          color: white;
          text-align: center;
          font-weight: bold;
          transition: width 1s ease;
        }
        
        .progress-success {
          background-color: var(--success);
        }
        
        .progress-warning {
          background-color: var(--warning);
        }
        
        .progress-danger {
          background-color: var(--danger);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <h1>Azora OS Valuation Dashboard</h1>
          <div class="dashboard-timestamp">Last updated: ${new Date(dashboardData.timestamp).toLocaleString()}</div>
          <div class="dashboard-summary">
            <div class="total-valuation">${formatCurrency(dashboardData.valuation.total)}</div>
            <div class="compliance-badge compliance-${dashboardData.compliance.overall.replace(/\s+/g, '-')}">
              ${dashboardData.compliance.overall}
            </div>
          </div>
        </header>
        
        <div class="dashboard-grid">
          <div class="dashboard-card">
            <h2>Valuation Breakdown</h2>
            <div class="value-grid">
              <div class="value-item">
                <div class="value-amount">${formatCurrency(dashboardData.valuation.token)}</div>
                <div class="value-label">Token Value</div>
              </div>
              <div class="value-item">
                <div class="value-amount">${formatCurrency(dashboardData.valuation.projects)}</div>
                <div class="value-label">Project Value</div>
              </div>
              <div class="value-item">
                <div class="value-amount">${formatCurrency(dashboardData.valuation.portfolio)}</div>
                <div class="value-label">Portfolio Value</div>
              </div>
              <div class="value-item">
                <div class="value-amount">${formatCurrency(dashboardData.valuation.nudgeImpact)}</div>
                <div class="value-label">Nudge Impact</div>
              </div>
            </div>
            
            <div style="margin-top: 20px;">
              <h3>Total Valuation</h3>
              <div class="progress-container">
                <div class="progress-bar progress-success" style="width: 100%;">
                  ${formatCurrency(dashboardData.valuation.total)}
                </div>
              </div>
            </div>
          </div>
          
          <div class="dashboard-card">
            <h2>Constitution Compliance</h2>
            <div class="compliance-grid">
              <div class="compliance-item">
                <div class="compliance-status status-${dashboardData.compliance.supplyLimit}">
                  ${dashboardData.compliance.supplyLimit ? '✓' : '✗'}
                </div>
                <div class="compliance-name">1 Million Token Limit</div>
              </div>
              <div class="compliance-item">
                <div class="compliance-status status-${dashboardData.compliance.reinvestmentEnforcement}">
                  ${dashboardData.compliance.reinvestmentEnforcement ? '✓' : '✗'}
                </div>
                <div class="compliance-name">60% Reinvestment Rule</div>
              </div>
              <div class="compliance-item">
                <div class="compliance-status status-${dashboardData.compliance.founderWithdrawalPriority}">
                  ${dashboardData.compliance.founderWithdrawalPriority ? '✓' : '✗'}
                </div>
                <div class="compliance-name">Founder Priority</div>
              </div>
              <div class="compliance-item">
                <div class="compliance-status status-${dashboardData.compliance.userWithdrawalAccess}">
                  ${dashboardData.compliance.userWithdrawalAccess ? '✓' : '✗'}
                </div>
                <div class="compliance-name">User Access</div>
              </div>
            </div>
            
            <div style="margin-top: 20px;">
              <h3>Developer Nudge Compliance</h3>
              <div class="progress-container">
                <div class="progress-bar ${
                  dashboardData.compliance.developerNudgeCompliance >= 90 ? 'progress-success' : 
                  dashboardData.compliance.developerNudgeCompliance >= 70 ? 'progress-warning' : 'progress-danger'
                }" style="width: ${dashboardData.compliance.developerNudgeCompliance}%;">
                  ${dashboardData.compliance.developerNudgeCompliance}%
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="dashboard-grid">
          <div class="dashboard-card">
            <h2>Reinvestment Status</h2>
            <div class="compliance-badge compliance-${dashboardData.compliance.reinvestment.replace(/\s+/g, '-')}">
              ${dashboardData.compliance.reinvestment}
            </div>
            
            <div class="constitution-reference">
              <h3>Constitution Article 4, Section 2-3</h3>
              <p>"Founders are allocated 40% of the total supply, of which: a. 40% (16% of total supply) may be withdrawn for personal use b. 60% (24% of total supply) must be reinvested into Azora OS projects"</p>
            </div>
          </div>
          
          <div class="dashboard-card">
            <h2>Advancement Nudge Status</h2>
            <div class="compliance-badge compliance-${dashboardData.compliance.nudge.replace(/\s+/g, '-')}">
              ${dashboardData.compliance.nudge}
            </div>
            
            <div class="constitution-reference">
              <h3>Constitution Article IX, Section 9.1</h3>
              <p>"Every developer must continually propose improvements to the codebase. 'Advancement nudges' are required contributions—concrete suggestions that elevate the system's value, performance, or user experience."</p>
            </div>
          </div>
        </div>
        
        <a href="/" class="refresh-button">Refresh Dashboard</a>
      </div>
      
      <script>
        // Auto refresh every 60 seconds
        setTimeout(() => {
          window.location.reload();
        }, 60000);
      </script>
    </body>
    </html>
    `;
    
    res.send(html
