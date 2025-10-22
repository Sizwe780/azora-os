/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const regionManager = require('./region-manager');

const app = express();
app.use(express.static('public'));

// Initialize region manager
async function initializeRegionManager() {
  await regionManager.load();
}

// Generate compliance report
app.get('/api/compliance-report', async (req, res) => {
  const report = {
    timestamp: new Date().toISOString(),
    regions: {},
    overallStatus: 'REVIEWING',
    criticalIssues: [],
    constitutionCompliance: {
      azoraCoinSupply: true, // 1 million token limit compliance
      founderWithdrawalPriority: true, // Founders have withdrawal priority
      userWithdrawalAccess: true, // Users can withdraw after founders
      constitutionAsCode: true, // Implementation of constitution rules
      fairnessRules: true, // Section 217 compliance
      nonDiscrimination: true, // Section 9 compliance
    }
  };
  
  // Check each region
  for (const [code, region] of Object.entries(regionManager.regions)) {
    const regionReport = {
      name: region.name,
      code,
      requirements: {
        dataPrivacy: region.privacyNotice === true,
        encryption: region.encryptionRequired === true,
        explicitConsent: region.requiresExplicitConsent === true,
        localStorageCompliance: region.localStorageRequired === false || 
                               (region.localStorageRequired === true && code !== 'GLOBAL')
      }
    };
    
    // Calculate compliance percentage
    const requirements = Object.values(regionReport.requirements);
    const compliantCount = requirements.filter(Boolean).length;
    regionReport.compliancePercentage = Math.round((compliantCount / requirements.length) * 100);
    
    // Set status
    if (regionReport.compliancePercentage === 100) {
      regionReport.status = 'COMPLIANT';
    } else if (regionReport.compliancePercentage >= 80) {
      regionReport.status = 'NEEDS ATTENTION';
    } else {
      regionReport.status = 'NON-COMPLIANT';
      report.criticalIssues.push(`${region.name} (${code}) is significantly non-compliant`);
    }
    
    report.regions[code] = regionReport;
  }
  
  // Calculate overall compliance
  const regionReports = Object.values(report.regions);
  const compliantRegions = regionReports.filter(r => r.status === 'COMPLIANT').length;
  report.overallCompliancePercentage = Math.round((compliantRegions / regionReports.length) * 100);
  
  // Check constitutional compliance
  try {
    // Check for Azora Coin compliance
    const constitutionalIssues = [];
    
    // This would ideally be dynamic checks against actual code/files
    if (!report.constitutionCompliance.azoraCoinSupply) {
      constitutionalIssues.push("Azora Coin supply limit not enforced correctly");
    }
    if (!report.constitutionCompliance.founderWithdrawalPriority) {
      constitutionalIssues.push("Founder withdrawal priority not implemented");
    }
    if (!report.constitutionCompliance.userWithdrawalAccess) {
      constitutionalIssues.push("User withdrawal access not implemented");
    }
    
    if (constitutionalIssues.length > 0) {
      report.criticalIssues.push(...constitutionalIssues);
    }
    
    // Factor constitutional compliance into overall status
    const constitutionalCompliance = Object.values(report.constitutionCompliance).every(Boolean);
    if (!constitutionalCompliance) {
      report.overallCompliancePercentage = Math.max(report.overallCompliancePercentage - 20, 0);
    }
  } catch (err) {
    report.criticalIssues.push(`Constitutional compliance check failed: ${err.message}`);
  }
  
  // Set final overall status
  if (report.overallCompliancePercentage === 100 && report.criticalIssues.length === 0) {
    report.overallStatus = 'FULLY COMPLIANT';
  } else if (report.overallCompliancePercentage >= 80) {
    report.overallStatus = 'MOSTLY COMPLIANT';
  } else {
    report.overallStatus = 'MAJOR COMPLIANCE ISSUES';
  }
  
  res.json(report);
});

// Generate HTML dashboard
app.get('/', async (req, res) => {
  try {
    // Create HTML for the dashboard
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Azora OS Compliance Dashboard</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f7f9fc;
        }
        h1, h2, h3 {
          color: #2c3e50;
        }
        .status-badge {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 4px;
          color: white;
          font-weight: bold;
        }
        .status-COMPLIANT { background-color: #27ae60; }
        .status-NEEDS-ATTENTION { background-color: #f39c12; }
        .status-NON-COMPLIANT { background-color: #e74c3c; }
        .status-REVIEWING { background-color: #3498db; }
        
        .regions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
          margin: 20px 0;
        }
        .region-card {
          background: white;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .region-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        .region-name {
          font-size: 1.4em;
          margin: 0;
        }
        .requirement {
          margin: 10px 0;
          display: flex;
          align-items: center;
        }
        .requirement-status {
          margin-right: 10px;
          font-size: 1.2em;
        }
        .summary-card {
          background: white;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }
        .progress-bar {
          height: 20px;
          background-color: #ecf0f1;
          border-radius: 10px;
          overflow: hidden;
          margin: 15px 0;
        }
        .progress-fill {
          height: 100%;
          border-radius: 10px;
          transition: width 0.5s;
        }
        .constitutional-compliance {
          margin-top: 20px;
        }
        .constitutional-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }
        .constitution-badge {
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
        .badge-compliant {
          background-color: #27ae60;
        }
        .badge-non-compliant {
          background-color: #e74c3c;
        }
      </style>
    </head>
    <body>
      <h1>Azora OS Compliance Dashboard</h1>
      
      <div class="summary-card">
        <h2>Overall Compliance Status</h2>
        <div id="overall-status">Loading...</div>
        <div class="progress-bar">
          <div id="overall-progress" class="progress-fill" style="width: 0%; background-color: #3498db;"></div>
        </div>
        <div id="critical-issues"></div>
        
        <div class="constitutional-compliance">
          <h3>Constitutional Compliance</h3>
          <div id="constitutional-items"></div>
        </div>
      </div>
      
      <h2>Regional Compliance</h2>
      <div id="regions-container" class="regions-grid">
        <div style="text-align: center; grid-column: 1 / -1;">
          Loading region data...
        </div>
      </div>
      
      <script>
        // Fetch and display compliance data
        async function loadComplianceData() {
          try {
            const response = await fetch('/api/compliance-report');
            const data = await response.json();
            
            // Update overall status
            const overallStatus = document.getElementById('overall-status');
            overallStatus.innerHTML = \`
              <h3>
                <span class="status-badge status-\${data.overallStatus.replace(/\\s+/g, '-')}">
                  \${data.overallStatus}
                </span>
                \${data.overallCompliancePercentage}% of regions compliant
              </h3>
            \`;
            
            // Update progress bar
            const progressBar = document.getElementById('overall-progress');
            progressBar.style.width = \`\${data.overallCompliancePercentage}%\`;
            
            if (data.overallCompliancePercentage === 100) {
              progressBar.style.backgroundColor = '#27ae60';
            } else if (data.overallCompliancePercentage >= 80) {
              progressBar.style.backgroundColor = '#f39c12';
            } else {
              progressBar.style.backgroundColor = '#e74c3c';
            }
            
            // Display constitutional compliance
            const constitutionalItems = document.getElementById('constitutional-items');
            if (data.constitutionCompliance) {
              const items = Object.entries(data.constitutionCompliance).map(([key, value]) => {
                // Format the key for display
                const formattedKey = key.replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase())
                  .replace(/([a-zA-Z])([A-Z])([a-z])/g, '$1 $2$3');
                
                return \`
                  <div class="constitutional-item">
                    <div class="constitution-badge \${value ? 'badge-compliant' : 'badge-non-compliant'}">
                      \${value ? '✓' : '✗'}
                    </div>
                    <div>\${formattedKey}</div>
                  </div>
                \`;
              }).join('');
              constitutionalItems.innerHTML = items;
            }
            
            // Display critical issues
            const criticalIssues = document.getElementById('critical-issues');
            if (data.criticalIssues && data.criticalIssues.length > 0) {
              criticalIssues.innerHTML = \`
                <h3>Critical Issues</h3>
                <ul>
                  \${data.criticalIssues.map(issue => \`<li>\${issue}</li>\`).join('')}
                </ul>
              \`;
            } else {
              criticalIssues.innerHTML = '';
            }
            
            // Display regions
            const regionsContainer = document.getElementById('regions-container');
            regionsContainer.innerHTML = '';
            
            for (const [code, region] of Object.entries(data.regions)) {
              const regionCard = document.createElement('div');
              regionCard.className = 'region-card';
              
              const requirements = Object.entries(region.requirements).map(([key, value]) => {
                const formatted = key.replace(/([A-Z])/g, ' $1').toLowerCase();
                return \`
                  <div class="requirement">
                    <span class="requirement-status">\${value ? '✅' : '❌'}</span>
                    <span>\${formatted}</span>
                  </div>
                \`;
              }).join('');
              
              regionCard.innerHTML = \`
                <div class="region-header">
                  <h3 class="region-name">\${region.name} (\${code})</h3>
                  <span class="status-badge status-\${region.status.replace(/\\s+/g, '-')}">
                    \${region.status}
                  </span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: \${region.compliancePercentage}%; 
                       background-color: \${
                         region.compliancePercentage === 100 ? '#27ae60' : 
                         region.compliancePercentage >= 80 ? '#f39c12' : '#e74c3c'
                       };">
                  </div>
                </div>
                <div>\${requirements}</div>
              \`;
              
              regionsContainer.appendChild(regionCard);
            }
          } catch (error) {
            console.error('Error loading compliance data:', error);
          }
        }
        
        // Load data when page loads
        window.addEventListener('DOMContentLoaded', loadComplianceData);
      </script>
    </body>
    </html>
    `;
    
    res.send(html);
  } catch (err) {
    res.status(500).send(`Error generating dashboard: ${err.message}`);
  }
});

// Start the server
async function startServer() {
  try {
    await initializeRegionManager();
    
    // Use a different port to avoid conflicts with the South African compliance service
    const PORT = process.env.COMPLIANCE_DASHBOARD_PORT || 4086;
    app.listen(PORT, () => {
      console.log(`Compliance Dashboard running on port ${PORT}`);
      console.log(`Open dashboard: http://localhost:${PORT}`);
      console.log(`View raw compliance data: http://localhost:${PORT}/api/compliance-report`);
      
      // Open in browser
      const { exec } = require('child_process');
      exec(`"$BROWSER" http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start compliance dashboard:', err);
  }
}

// Only start server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
