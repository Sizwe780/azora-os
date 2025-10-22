/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Azora OS Founder Portal
 * 
 * Web interface for founders to manage their token withdrawals
 * and reinvestments according to constitutional requirements.
 */

const express = require('express');
const path = require('path');
const axios = require('axios');
const fs = require('fs').promises;
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

// Configuration
const PORT = process.env.FOUNDER_PORTAL_PORT || 4097;
const WITHDRAWAL_SERVICE_URL = process.env.WITHDRAWAL_SERVICE_URL || 'http://localhost:4096';

// Create public directory and files
(async () => {
  try {
    const publicDir = path.join(__dirname, 'public');
    await fs.mkdir(publicDir, { recursive: true });
    
    // Create CSS file
    const cssContent = `
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f7f9fc;
        color: #333;
      }
      
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }
      
      header {
        background-color: #336699;
        color: white;
        padding: 1rem;
        text-align: center;
      }
      
      h1 {
        margin: 0;
      }
      
      .card {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        padding: 20px;
        margin-bottom: 20px;
      }
      
      .balance-container {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        margin-bottom: 30px;
      }
      
      .balance-card {
        flex: 1;
        min-width: 250px;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        padding: 20px;
      }
      
      .balance-value {
        font-size: 2rem;
        font-weight: bold;
        color: #336699;
      }
      
      .balance-label {
        font-size: 1rem;
        color: #666;
      }
      
      .actions {
        margin-top: 30px;
      }
      
      button {
        background-color: #336699;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.3s;
      }
      
      button:hover {
        background-color: #254a70;
      }
      
      button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
      }
      
      .withdraw-options {
        display: none;
        background-color: #f9f9f9;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 20px;
        margin-top: 20px;
      }
      
      .form-group {
        margin-bottom: 15px;
      }
      
      label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
      }
      
      select, input {
        width: 100%;
        padding: 8px;
        border-radius: 4px;
        border: 1px solid #ddd;
      }
      
      .progress-container {
        height: 20px;
        background-color: #e9ecef;
        border-radius: 10px;
        margin: 10px 0;
      }
      
      .progress-bar {
        height: 100%;
        border-radius: 10px;
        background-color: #336699;
        transition: width 0.3s ease;
      }
      
      .reinvestment-options {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 15px;
        margin-top: 20px;
      }
      
      .reinvestment-option {
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 15px;
        cursor: pointer;
      }
      
      .reinvestment-option.selected {
        background-color: #e6f0ff;
        border-color: #336699;
      }
      
      .notification {
        padding: 10px 15px;
        margin-bottom: 20px;
        border-radius: 4px;
      }
      
      .success {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }
      
      .error {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      }
    `;
    
    await fs.writeFile(path.join(publicDir, 'style.css'), cssContent);
    
    // Create main HTML file
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Azora Founder Portal</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <header>
        <h1>Azora Founder Portal</h1>
        <p>Secure Token Withdrawal & Reinvestment</p>
      </header>
      
      <div class="container">
        <div id="notification-area"></div>
        
        <div class="card">
          <h2>Founder Information</h2>
          <div id="founder-info">Loading...</div>
        </div>
        
        <div class="balance-container">
          <div class="balance-card">
            <div class="balance-label">Personal Withdrawal Available</div>
            <div class="balance-value" id="personal-balance">--</div>
            <div>ZAR Value: <span id="personal-zar">--</span></div>
            <div class="progress-container">
              <div class="progress-bar" id="personal-progress" style="width: 0%"></div>
            </div>
          </div>
          
          <div class="balance-card">
            <div class="balance-label">Reinvestment Required</div>
            <div class="balance-value" id="reinvestment-balance">--</div>
            <div>ZAR Value: <span id="reinvestment-zar">--</span></div>
            <div class="progress-container">
              <div class="progress-bar" id="reinvestment-progress" style="width: 0%"></div>
            </div>
          </div>
          
          <div class="balance-card">
            <div class="balance-label">Total Remaining</div>
            <div class="balance-value" id="total-balance">--</div>
            <div>ZAR Value: <span id="total-zar">--</span></div>
            <div class="progress-container">
              <div class="progress-bar" id="total-progress" style="width: 0%"></div>
            </div>
          </div>
        </div>
        
        <div class="card actions">
          <h2>Withdrawal Actions</h2>
          <p>Choose your withdrawal option:</p>
          <button id="withdraw-personal" onclick="showWithdrawOptions('personal')">Withdraw Personal Allocation</button>
          <button id="withdraw-reinvest" onclick="showWithdrawOptions('reinvestment')">Process Reinvestment</button>
          <button id="withdraw-all" onclick="showWithdrawOptions('all')">Process All Tokens</button>
          
          <div id="withdraw-options" class="withdraw-options">
            <h3 id="withdraw-options-title">Withdrawal Options</h3>
            
            <form id="withdrawal-form">
              <input type="hidden" id="withdrawal-type" value="personal">
              
              <div class="form-group">
                <label for="bank-account">Select Bank Account:</label>
                <select id="bank-account">
                  <option value="">Loading bank accounts...</option>
                </select>
              </div>
              
              <div id="reinvestment-section" style="display: none;">
                <h3>Select Reinvestment Options</h3>
                <p>Choose where to reinvest your tokens (60% of your allocation):</p>
                <div id="reinvestment-options" class="reinvestment-options">
                  Loading reinvestment options...
                </div>
              </div>
              
              <div class="form-group" style="margin-top: 20px;">
                <button type="submit" id="submit-withdrawal">Confirm Withdrawal</button>
                <button type="button" onclick="hideWithdrawOptions()">Cancel</button>
              </div>
            </form>
          </div>
        </div>
        
        <div class="card">
          <h2>Recent Transactions</h2>
          <div id="transactions">No recent transactions</div>
        </div>
      </div>
      
      <script>
        // Mock founder ID - in a real app, this would come from authentication
        const founderId = '1'; // Sizwe Ngwenya
        let founderData = null;
        let reinvestmentOptions = [];
        let selectedReinvestmentOptions = [];
        
        // Fetch founder data
        async function loadFounderData() {
          try {
            const response = await fetch(\`/api/founder/\${founderId}\`);
            const data = await response.json();
            
            if (data.error) {
              showNotification(data.error, 'error');
              return;
            }
            
            founderData = data;
            updateFounderUI();
            loadBankAccounts();
          } catch (err) {
            console.error('Error loading founder data:', err);
            showNotification('Failed to load founder data. Please try again later.', 'error');
          }
        }
        
        // Update UI with founder data
        function updateFounderUI() {
          if (!founderData) return;
          
          // Update founder info
          document.getElementById('founder-info').innerHTML = \`
            <p><strong>Name:</strong> \${founderData.founder.name}</p>
            <p><strong>Role:</strong> \${founderData.founder.role}</p>
            <p><strong>Email:</strong> \${founderData.founder.email}</p>
            <p><strong>Total Allocation:</strong> \${founderData.allocation.total.toLocaleString()} AZR</p>
          \`;
          
          // Update balances
          document.getElementById('personal-balance').textContent = \`\${founderData.remaining.personal.toLocaleString()} AZR\`;
          document.getElementById('personal-zar').textContent = \`\${founderData.zarValue.personal.toLocaleString()} ZAR\`;
          document.getElementById('personal-progress').style.width = \`\${(founderData.withdrawn.personal / founderData.allocation.personal * 100).toFixed(0)}%\`;
          
          document.getElementById('reinvestment-balance').textContent = \`\${founderData.remaining.reinvestment.toLocaleString()} AZR\`;
          document.getElementById('reinvestment-zar').textContent = \`\${founderData.zarValue.reinvestment.toLocaleString()} ZAR\`;
          document.getElementById('reinvestment-progress').style.width = \`\${(founderData.withdrawn.reinvestment / founderData.allocation.reinvestment * 100).toFixed(0)}%\`;
          
          document.getElementById('total-balance').textContent = \`\${founderData.remaining.total.toLocaleString()} AZR\`;
          document.getElementById('total-zar').textContent = \`\${(founderData.zarValue.personal + founderData.zarValue.reinvestment).toLocaleString()} ZAR\`;
          document.getElementById('total-progress').style.width = \`\${((founderData.withdrawn.personal + founderData.withdrawn.reinvestment) / founderData.allocation.total * 100).toFixed(0)}%\`;
          
          // Enable/disable buttons based on remaining balances
          document.getElementById('withdraw-personal').disabled = founderData.remaining.personal <= 0;
          document.getElementById('withdraw-reinvest').disabled = founderData.remaining.reinvestment <= 0;
          document.getElementById('withdraw-all').disabled = founderData.remaining.total <= 0;
        }
        
        // Load bank accounts
        function loadBankAccounts() {
          if (!founderData) return;
          
          const bankAccountSelect = document.getElementById('bank-account');
          bankAccountSelect.innerHTML = '';
          
          if (founderData.founder.name === 'AZORA') {
            // AI founder doesn't need bank accounts
            bankAccountSelect.innerHTML = '<option value="ai">AI Founder - No Bank Required</option>';
            document.querySelector('.form-group').style.display = 'none';
            return;
          }
          
          founderData.founder.bankAccounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account.accountNumber;
            option.textContent = \`\${account.bank} - \${account.accountNumber} (\${account.accountType})\`;
            bankAccountSelect.appendChild(option);
          });
        }
        
        // Load reinvestment options
        async function loadReinvestmentOptions() {
          try {
            const response = await fetch('/api/reinvestment-options');
            const data = await response.json();
            
            reinvestmentOptions = data.options;
            const optionsContainer = document.getElementById('reinvestment-options');
            
            if (reinvestmentOptions.length === 0) {
              optionsContainer.innerHTML = '<p>No reinvestment options available</p>';
              return;
            }
            
            optionsContainer.innerHTML = reinvestmentOptions.map(option => \`
              <div class="reinvestment-option" data-id="\${option.id}" onclick="toggleReinvestmentOption('\${option.id}')">
                <h4>\${option.name}</h4>
                <p>\${option.description}</p>
                <p><strong>Minimum:</strong> \${option.minAmount.toLocaleString()} AZR</p>
                <p><strong>Impact:</strong> \${option.impact}</p>
              </div>
            \`).join('');
          } catch (err) {
            console.error('Error loading reinvestment options:', err);
            document.getElementById('reinvestment-options').innerHTML = 
              '<p class="error">Failed to load reinvestment options</p>';
          }
        }
        
        // Toggle selection of reinvestment option
        function toggleReinvestmentOption(id) {
          const element = document.querySelector(\`.reinvestment-option[data-id="\${id}"]\`);
          
          if (element.classList.contains('selected')) {
            element.classList.remove('selected');
            selectedReinvestmentOptions = selectedReinvestmentOptions.filter(optId => optId !== id);
          } else {
            element.classList.add('selected');
            selectedReinvestmentOptions.push(id);
          }
        }
        
        // Show withdrawal options
        function showWithdrawOptions(type) {
          document.getElementById('withdrawal-type').value = type;
          const optionsDiv = document.getElementById('withdraw-options');
          optionsDiv.style.display = 'block';
          
          let title;
          switch (type) {
            case 'personal':
              title = 'Personal Withdrawal Options';
              document.getElementById('reinvestment-section').style.display = 'none';
              break;
            case 'reinvestment':
              title = 'Reinvestment Options';
              document.getElementById('reinvestment-section').style.display = 'block';
              loadReinvestmentOptions();
              break;
            case 'all':
              title = 'Complete Token Processing';
              document.getElementById('reinvestment-section').style.display = 'block';
              loadReinvestmentOptions();
              break;
          }
          
          document.getElementById('withdraw-options-title').textContent = title;
        }
        
        // Hide withdrawal options
        function hideWithdrawOptions() {
          document.getElementById('withdraw-options').style.display = 'none';
          selectedReinvestmentOptions = [];
        }
        
        // Show notification
        function showNotification(message, type) {
          const notification = document.createElement('div');
          notification.className = \`notification \${type}\`;
          notification.textContent = message;
          
          const notificationArea = document.getElementById('notification-area');
          notificationArea.innerHTML = '';
          notificationArea.appendChild(notification);
          
          // Remove notification after 5 seconds
          setTimeout(() => {
            notification.remove();
          }, 5000);
        }
        
        // Handle withdrawal form submission
        document.getElementById('withdrawal-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const withdrawalType = document.getElementById('withdrawal-type').value;
          const bankAccountId = document.getElementById('bank-account').value;
          
          let reinvestmentOptions = null;
          if (withdrawalType === 'reinvestment' || withdrawalType === 'all') {
            if (selectedReinvestmentOptions.length === 0) {
              showNotification('Please select at least one reinvestment option', 'error');
              return;
            }
            
            reinvestmentOptions = {
              projects: selectedReinvestmentOptions
            };
          }
          
          try {
            const response = await fetch(\`/api/founder/\${founderId}/withdraw\`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                withdrawType: withdrawalType,
                bankAccountId,
                reinvestmentOptions
              })
            });
            
            const result = await response.json();
            
            if (result.error) {
              showNotification(result.error, 'error');
              return;
            }
            
            showNotification('Withdrawal processed successfully!', 'success');
            hideWithdrawOptions();
            loadFounderData(); // Reload data to update balances
          } catch (err) {
            console.error('Error processing withdrawal:', err);
            showNotification('Failed to process withdrawal. Please try again later.', 'error');
          }
        });
        
        // Initial data load
        loadFounderData();
      </script>
    </body>
    </html>
    `;
    
    await fs.writeFile(path.join(publicDir, 'index.html'), htmlContent);
    
    console.log('Frontend files created successfully');
  } catch (err) {
    console.error('Error creating frontend files:', err);
  }
})();

// API routes that proxy to the withdrawal service

// Get founder information
app.get('/api/founder/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${WITHDRAWAL_SERVICE_URL}/api/founders/${id}`);
    res.json(response.data);
  } catch (err) {
    console.error('Error fetching founder data:', err);
    res.status(err.response?.status || 500).json({
      error: err.response?.data?.error || 'Failed to fetch founder data'
    });
  }
});

// Get reinvestment options
app.get('/api/reinvestment-options', async (req, res) => {
  try {
    const response = await axios.get(`${WITHDRAWAL_SERVICE_URL}/api/reinvestment-options`);
    res.json(response.data);
  } catch (err) {
    console.error('Error fetching reinvestment options:', err);
    res.status(err.response?.status || 500).json({
      error: err.response?.data?.error || 'Failed to fetch reinvestment options'
    });
  }
});

// Process withdrawal
app.post('/api/founder/:id/withdraw', async (req, res) => {
  try {
    const { id } = req.params;
    const { withdrawType, bankAccountId, reinvestmentOptions } = req.body;
    
    const response = await axios.post(`${WITHDRAWAL_SERVICE_URL}/api/founders/${id}/instant-withdraw`, {
      withdrawType,
      bankAccountId,
      reinvestmentOptions
    });
    
    res.json(response.data);
  } catch (err) {
    console.error('Error processing withdrawal:', err);
    res.status(err.response?.status || 500).json({
      error: err.response?.data?.error || 'Failed to process withdrawal'
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Founder Portal running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT} to access the portal`);
});

module.exports = app;