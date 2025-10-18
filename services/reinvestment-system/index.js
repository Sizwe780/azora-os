/**
 * Azora OS Founder Reinvestment System
 * 
 * This service enforces the Constitutional requirement that:
 * - Founders may only withdraw 40% of their allocation (16% of total supply)
 * - 60% of founder allocation (24% of total supply) must be reinvested into Azora
 */

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

// Configuration
const PORT = process.env.REINVESTMENT_PORT || 4092;
const DATA_DIR = path.join(__dirname, 'data');
const FOUNDERS_FILE = path.join(DATA_DIR, 'founders.json');
const REINVESTMENTS_FILE = path.join(DATA_DIR, 'reinvestments.json');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const LEDGER_FILE = path.join(DATA_DIR, 'token-ledger.json');

// Total token supply from Constitution
const TOTAL_SUPPLY = 1000000; // 1 million tokens

// Create data directory
(async () => {
  await fs.mkdir(DATA_DIR, { recursive: true }).catch(err => {
    console.error('Error creating data directory:', err);
  });
})();

// Data storage
let founders = [];
let reinvestments = [];
let projects = [];
let tokenLedger = {
  totalSupply: TOTAL_SUPPLY,
  allocations: {
    founders: {
      total: TOTAL_SUPPLY * 0.4, // 40% of total
      personal: TOTAL_SUPPLY * 0.16, // 16% of total (40% of founder allocation)
      reinvestment: TOTAL_SUPPLY * 0.24 // 24% of total (60% of founder allocation)
    },
    users: TOTAL_SUPPLY * 0.6 // 60% of total
  },
  withdrawn: {
    foundersPersonal: 0,
    foundersReinvested: 0,
    users: 0
  },
  compliance: {
    supplyLimit: true,
    reinvestmentEnforced: true
  }
};

// Load data
async function loadData() {
  try {
    // Load founders
    try {
      const foundersData = await fs.readFile(FOUNDERS_FILE, 'utf8');
      founders = JSON.parse(foundersData);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
      
      // Create sample founders if file doesn't exist
      founders = [
        {
          id: '1',
          name: 'Sizwe Ngwenya',
          email: 'sizwe.ngwenya@azora.world',
          role: 'CEO & CTO',
          totalAllocation: 80000, // 8% of total supply (20% of founder allocation)
          personalAllocation: 32000, // 40% of their allocation
          reinvestmentAllocation: 48000, // 60% of their allocation
          withdrawn: {
            personal: 0,
            reinvested: 0
          }
        },
        {
          id: '2',
          name: 'Sizwe Motingwe',
          email: 'sizwe.motingwe@azora.world',
          role: 'CFO & Head of Sales',
          totalAllocation: 80000,
          personalAllocation: 32000,
          reinvestmentAllocation: 48000,
          withdrawn: {
            personal: 0,
            reinvested: 0
          }
        },
        {
          id: '3',
          name: 'Milla Mukundi',
          email: 'milla.mukundi@azora.world',
          role: 'COO',
          totalAllocation: 80000,
          personalAllocation: 32000,
          reinvestmentAllocation: 48000,
          withdrawn: {
            personal: 0,
            reinvested: 0
          }
        },
        {
          id: '4',
          name: 'Nolundi Ngwenya',
          email: 'nolundi.ngwenya@azora.world',
          role: 'CMO & Head of Retail',
          totalAllocation: 80000,
          personalAllocation: 32000,
          reinvestmentAllocation: 48000,
          withdrawn: {
            personal: 0,
            reinvested: 0
          }
        },
        {
          id: '5',
          name: 'AZORA',
          email: 'azora.ai@azora.world',
          role: 'AI Deputy CEO & Sixth Founder',
          totalAllocation: 80000,
          personalAllocation: 32000,
          reinvestmentAllocation: 48000,
          withdrawn: {
            personal: 0,
            reinvested: 0
          }
        }
      ];
      
      await fs.writeFile(FOUNDERS_FILE, JSON.stringify(founders, null, 2));
    }
    
    // Load reinvestments
    try {
      const reinvestmentsData = await fs.readFile(REINVESTMENTS_FILE, 'utf8');
      reinvestments = JSON.parse(reinvestmentsData);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
      reinvestments = [];
      await fs.writeFile(REINVESTMENTS_FILE, JSON.stringify(reinvestments, null, 2));
    }
    
    // Load projects
    try {
      const projectsData = await fs.readFile(PROJECTS_FILE, 'utf8');
      projects = JSON.parse(projectsData);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
      
      // Create sample projects
      projects = [
        {
          id: '1',
          name: 'Azora OS Core Development',
          description: 'Core platform development and infrastructure',
          fundingTarget: 100000,
          fundingReceived: 0,
          status: 'active',
          valuation: 5000000, // $5M valuation
          roi: 2.5 // 2.5x expected return
        },
        {
          id: '2',
          name: 'Marketing Campaign Q4 2025',
          description: 'Marketing and growth initiatives',
          fundingTarget: 50000,
          fundingReceived: 0,
          status: 'active',
          valuation: 2000000, // $2M valuation
          roi: 3.0 // 3.0x expected return
        },
        {
          id: '3',
          name: 'AI Infrastructure Expansion',
          description: 'Expand AI capabilities and processing power',
          fundingTarget: 70000,
          fundingReceived: 0,
          status: 'active',
          valuation: 7000000, // $7M valuation
          roi: 4.2 // 4.2x expected return
        }
      ];
      
      await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));
    }
    
    // Load token ledger
    try {
      const ledgerData = await fs.readFile(LEDGER_FILE, 'utf8');
      tokenLedger = JSON.parse(ledgerData);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
      await fs.writeFile(LEDGER_FILE, JSON.stringify(tokenLedger, null, 2));
    }
    
    console.log(`Loaded ${founders.length} founders and ${projects.length} projects`);
    console.log(`Total token supply: ${tokenLedger.totalSupply}`);
  } catch (err) {
    console.error('Error loading data:', err);
  }
}

// Save data to files
async function saveFounders() {
  await fs.writeFile(FOUNDERS_FILE, JSON.stringify(founders, null, 2));
}

async function saveReinvestments() {
  await fs.writeFile(REINVESTMENTS_FILE, JSON.stringify(reinvestments, null, 2));
}

async function saveProjects() {
  await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));
}

async function saveLedger() {
  await fs.writeFile(LEDGER_FILE, JSON.stringify(tokenLedger, null, 2));
}

// Calculate portfolio value based on reinvestments
function calculatePortfolioValue() {
  let totalValue = 0;
  
  // Sum up values of all reinvestments with their ROI factors
  for (const reinvestment of reinvestments) {
    const project = projects.find(p => p.id === reinvestment.projectId);
    if (project) {
      totalValue += reinvestment.amount * (project.roi || 1.0);
    } else {
      totalValue += reinvestment.amount; // Default to 1:1 if project not found
    }
  }
  
  return totalValue;
}

// Calculate total company valuation
function calculateCompanyValuation() {
  // Base valuation from token economics
  const tokenValue = tokenLedger.totalSupply * 10; // Assuming $10 per token
  
  // Project-based valuation (sum of all project valuations)
  const projectValue = projects.reduce((sum, project) => sum + project.valuation, 0);
  
  // Reinvestment growth (portfolio value)
  const portfolioValue = calculatePortfolioValue();
  
  // Total valuation
  return {
    tokenValue,
    projectValue,
    portfolioValue,
    totalValuation: tokenValue + projectValue + portfolioValue
  };
}

// API Endpoints

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    service: 'reinvestment-system'
  });
});

// Get token ledger info
app.get('/api/ledger', (req, res) => {
  res.json(tokenLedger);
});

// Get company valuation
app.get('/api/valuation', (req, res) => {
  const valuation = calculateCompanyValuation();
  res.json(valuation);
});

// List all founders (public info)
app.get('/api/founders', (req, res) => {
  const publicFounders = founders.map(f => ({
    id: f.id,
    name: f.name,
    role: f.role,
    totalAllocation: f.totalAllocation,
    personalAllocation: f.personalAllocation,
    reinvestmentAllocation: f.reinvestmentAllocation,
    withdrawn: f.withdrawn
  }));
  
  res.json({ founders: publicFounders });
});

// Get founder details
app.get('/api/founders/:id', (req, res) => {
  const { id } = req.params;
  const founder = founders.find(f => f.id === id);
  
  if (!founder) {
    return res.status(404).json({ error: 'Founder not found' });
  }
  
  // Calculate remaining allocations
  const remaining = {
    personal: founder.personalAllocation - founder.withdrawn.personal,
    reinvestment: founder.reinvestmentAllocation - founder.withdrawn.reinvested
  };
  
  // Calculate founder's portfolio value
  const founderReinvestments = reinvestments.filter(r => r.founderId === id);
  let portfolioValue = 0;
  
  for (const reinvestment of founderReinvestments) {
    const project = projects.find(p => p.id === reinvestment.projectId);
    if (project) {
      portfolioValue += reinvestment.amount * (project.roi || 1.0);
    } else {
      portfolioValue += reinvestment.amount;
    }
  }
  
  res.json({
    ...founder,
    remaining,
    portfolioValue,
    reinvestments: founderReinvestments
  });
});

// Founder login (simplified for demo)
app.post('/api/login', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  const founder = founders.find(f => f.email === email);
  
  if (!founder) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Generate session token
  const sessionToken = crypto.randomBytes(32).toString('hex');
  
  res.json({
    sessionToken,
    founder: {
      id: founder.id,
      name: founder.name,
      email: founder.email,
      role: founder.role
    }
  });
});

// List available projects
app.get('/api/projects', (req, res) => {
  res.json({ projects });
});

// Get project details
app.get('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const project = projects.find(p => p.id === id);
  
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  const projectReinvestments = reinvestments.filter(r => r.projectId === id);
  
  res.json({
    ...project,
    reinvestments: projectReinvestments
  });
});

// Personal withdrawal
app.post('/api/withdraw/personal', (req, res) => {
  const { founderId, amount, walletAddress } = req.body;
  
  if (!founderId || !amount || !walletAddress) {
    return res.status(400).json({ error: 'Founder ID, amount, and wallet address are required' });
  }
  
  const founderIndex = founders.findIndex(f => f.id === founderId);
  if (founderIndex === -1) {
    return res.status(404).json({ error: 'Founder not found' });
  }
  
  const founder = founders[founderIndex];
  const amountNum = Number(amount);
  
  // Check if amount is valid
  if (isNaN(amountNum) || amountNum <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }
  
  // Check if founder has enough personal allocation
  const remaining = founder.personalAllocation - founder.withdrawn.personal;
  if (amountNum > remaining) {
    return res.status(400).json({
      error: 'Withdrawal amount exceeds remaining personal allocation',
      remaining
    });
  }
  
  // Update founder's withdrawn amount
  founders[founderIndex].withdrawn.personal += amountNum;
  
  // Update ledger
  tokenLedger.withdrawn.foundersPersonal += amountNum;
  
  // Save data
  Promise.all([
    saveFounders(),
    saveLedger()
  ]).then(() => {
    res.json({
      success: true,
      remaining: founder.personalAllocation - founders[founderIndex].withdrawn.personal,
      transactionHash: `0x${crypto.randomBytes(32).toString('hex')}`
    });
  }).catch(err => {
    console.error('Error saving withdrawal data:', err);
    res.status(500).json({ error: 'Error processing withdrawal' });
  });
});

// Make a reinvestment
app.post('/api/reinvest', (req, res) => {
  const { founderId, projectId, amount } = req.body;
  
  if (!founderId || !projectId || !amount) {
    return res.status(400).json({ error: 'Founder ID, project ID, and amount are required' });
  }
  
  const founderIndex = founders.findIndex(f => f.id === founderId);
  if (founderIndex === -1) {
    return res.status(404).json({ error: 'Founder not found' });
  }
  
  const projectIndex = projects.findIndex(p => p.id === projectId);
  if (projectIndex === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  const founder = founders[founderIndex];
  const project = projects[projectIndex];
  const amountNum = Number(amount);
  
  // Check if amount is valid
  if (isNaN(amountNum) || amountNum <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }
  
  // Check if founder has enough reinvestment allocation
  const remaining = founder.reinvestmentAllocation - founder.withdrawn.reinvested;
  if (amountNum > remaining) {
    return res.status(400).json({
      error: 'Reinvestment amount exceeds remaining allocation',
      remaining
    });
  }
  
  // Create reinvestment record
  const reinvestment = {
    id: uuidv4(),
    founderId,
    founderName: founder.name,
    projectId,
    projectName: project.name,
    amount: amountNum,
    timestamp: new Date().toISOString(),
    transactionHash: `0x${crypto.randomBytes(32).toString('hex')}`,
    expectedReturn: amountNum * (project.roi || 1.0)
  };
  
  // Update founder's withdrawn reinvestment amount
  founders[founderIndex].withdrawn.reinvested += amountNum;
  
  // Update project's funding received
  projects[projectIndex].fundingReceived += amountNum;
  
  // Update ledger
  tokenLedger.withdrawn.foundersReinvested += amountNum;
  
  // Save the reinvestment and updated data
  reinvestments.push(reinvestment);
  
  Promise.all([
    saveFounders(),
    saveProjects(),
    saveReinvestments(),
    saveLedger()
  ]).then(() => {
    res.json({
      success: true,
      reinvestment,
      remaining: founder.reinvestmentAllocation - founders[founderIndex].withdrawn.reinvested,
      projectFunding: projects[projectIndex].fundingReceived
    });
  }).catch(err => {
    console.error('Error saving reinvestment data:', err);
    res.status(500).json({ error: 'Error processing reinvestment' });
  });
});

// Get reinvestment stats
app.get('/api/reinvestment-stats', (req, res) => {
  // Calculate total reinvestments
  const totalReinvested = tokenLedger.withdrawn.foundersReinvested;
  
  // Calculate percentage of founder reinvestment allocation used
  const reinvestmentAllocation = tokenLedger.allocations.founders.reinvestment;
  const reinvestmentPercentage = (totalReinvested / reinvestmentAllocation * 100).toFixed(2);
  
  // Calculate portfolio value
  const portfolioValue = calculatePortfolioValue();
  
  // Calculate ROI
  const roi = totalReinvested > 0 ? (portfolioValue / totalReinvested).toFixed(2) : 0;
  
  // Project funding stats
  const projectStats = projects.map(project => ({
    id: project.id,
    name: project.name,
    fundingTarget: project.fundingTarget,
    fundingReceived: project.fundingReceived,
    percentageFunded: ((project.fundingReceived / project.fundingTarget) * 100).toFixed(2),
    valuation: project.valuation,
    roi: project.roi
  }));
  
  res.json({
    totalReinvested,
    reinvestmentAllocation,
    reinvestmentPercentage,
    portfolioValue,
    roi,
    projectStats
  });
});

// Get compliance status
app.get('/api/compliance', (req, res) => {
  // Calculate compliance metrics
  const founderPersonalPercentage = (tokenLedger.withdrawn.foundersPersonal / tokenLedger.allocations.founders.personal * 100).toFixed(2);
  const founderReinvestmentPercentage = (tokenLedger.withdrawn.foundersReinvested / tokenLedger.allocations.founders.reinvestment * 100).toFixed(2);
  
  const compliance = {
    supplyLimit: {
      status: tokenLedger.compliance.supplyLimit,
      description: 'Total supply limited to 1 million tokens',
      constitutionalReference: 'Article 1, Section 1; Article 12, Section 2'
    },
    reinvestmentEnforcement: {
      status: tokenLedger.compliance.reinvestmentEnforced,
      description: '60% of founder allocation must be reinvested',
      constitutionalReference: 'Article 4, Section 2-3'
    },
    withdrawalStats: {
      founderPersonal: {
        withdrawn: tokenLedger.withdrawn.foundersPersonal,
        allocation: tokenLedger.allocations.founders.personal,
        percentage: founderPersonalPercentage
      },
      founderReinvestment: {
        reinvested: tokenLedger.withdrawn.foundersReinvested,
        allocation: tokenLedger.allocations.founders.reinvestment,
        percentage: founderReinvestmentPercentage
      }
    },
    complianceStatus: (tokenLedger.compliance.supplyLimit && tokenLedger.compliance.reinvestmentEnforced) ? 
      'FULLY COMPLIANT' : 'COMPLIANCE ISSUES DETECTED'
  };
  
  res.json(compliance);
});

// Initialize and start server
loadData().then(() => {
  app.listen(PORT, () => {
    console.log(`Reinvestment System running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Error starting service:', err);
});

module.exports = app;