/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs/promises');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4097;
const DATA_DIR = path.join(__dirname, 'data');
const REGULATIONS_DIR = path.join(DATA_DIR, 'regulations');
const COMPLIANCE_LOGS_DIR = path.join(DATA_DIR, 'logs');
const CERTIFICATIONS_DIR = path.join(DATA_DIR, 'certifications');

// Create necessary directories
(async () => {
  await fs.mkdir(DATA_DIR, { recursive: true }).catch(console.error);
  await fs.mkdir(REGULATIONS_DIR, { recursive: true }).catch(console.error);
  await fs.mkdir(COMPLIANCE_LOGS_DIR, { recursive: true }).catch(console.error);
  await fs.mkdir(CERTIFICATIONS_DIR, { recursive: true }).catch(console.error);
})();

// UN Member states and ISO country codes
const COUNTRIES = {
  // Complete list of UN member states with their ISO codes
  "AF": { name: "Afghanistan", unMember: true },
  "AL": { name: "Albania", unMember: true },
  // ... all 193 UN member states would be listed here
  "ZA": { name: "South Africa", unMember: true },
  "ZM": { name: "Zambia", unMember: true },
  "ZW": { name: "Zimbabwe", unMember: true }
};

// Global compliance requirements by category
const COMPLIANCE_CATEGORIES = [
  "data_protection", "financial_regulations", "kyc_aml", 
  "digital_services", "cryptocurrency", "taxation",
  "consumer_protection", "accessibility", "environmental"
];

// Key regulatory frameworks
const KEY_REGULATIONS = {
  "GDPR": { region: "EU", category: "data_protection" },
  "POPIA": { region: "ZA", category: "data_protection" },
  "CCPA": { region: "US-CA", category: "data_protection" },
  "LGPD": { region: "BR", category: "data_protection" },
  "NDPR": { region: "NG", category: "data_protection" },
  "AML5": { region: "EU", category: "kyc_aml" },
  "FATF": { region: "global", category: "kyc_aml" },
  "PSD2": { region: "EU", category: "financial_regulations" },
  "eIDAS": { region: "EU", category: "digital_services" },
  "MiCA": { region: "EU", category: "cryptocurrency" },
  "SARB": { region: "ZA", category: "cryptocurrency" }
};

// UN Sustainable Development Goals
const UN_SDGS = [
  "No Poverty", "Zero Hunger", "Good Health and Well-Being",
  "Quality Education", "Gender Equality", "Clean Water and Sanitation",
  "Affordable and Clean Energy", "Decent Work and Economic Growth",
  "Industry, Innovation and Infrastructure", "Reduced Inequalities",
  "Sustainable Cities and Communities", "Responsible Consumption and Production",
  "Climate Action", "Life Below Water", "Life on Land",
  "Peace, Justice and Strong Institutions", "Partnerships for the Goals"
];

// Language support for all UN official languages and many more
const LANGUAGES = [
  { code: "en", name: "English", direction: "ltr" },
  { code: "ar", name: "Arabic", direction: "rtl" },
  { code: "zh", name: "Chinese (Simplified)", direction: "ltr" },
  { code: "fr", name: "French", direction: "ltr" },
  { code: "ru", name: "Russian", direction: "ltr" },
  { code: "es", name: "Spanish", direction: "ltr" },
  // All 6 official UN languages plus many more (we would have 100+ languages in production)
  { code: "sw", name: "Swahili", direction: "ltr" },
  { code: "xh", name: "Xhosa", direction: "ltr" },
  { code: "zu", name: "Zulu", direction: "ltr" },
  { code: "af", name: "Afrikaans", direction: "ltr" },
  { code: "hi", name: "Hindi", direction: "ltr" },
  { code: "ur", name: "Urdu", direction: "rtl" },
  // Many more languages would be listed here
];

// Load regulations data for a country
async function loadCountryRegulations(countryCode) {
  try {
    const filePath = path.join(REGULATIONS_DIR, `${countryCode.toLowerCase()}.json`);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // Generate default regulations if file doesn't exist
      const regulations = generateDefaultRegulations(countryCode);
      await saveCountryRegulations(countryCode, regulations);
      return regulations;
    }
    throw err;
  }
}

// Generate default regulations for a country
function generateDefaultRegulations(countryCode) {
  const country = COUNTRIES[countryCode];
  if (!country) throw new Error(`Invalid country code: ${countryCode}`);
  
  // Base regulations that apply to all countries
  const baseRegulations = {
    countryCode,
    countryName: country.name,
    lastUpdated: new Date().toISOString(),
    categories: {}
  };
  
  // Add specific regulations based on region
  COMPLIANCE_CATEGORIES.forEach(category => {
    baseRegulations.categories[category] = {
      requirements: [],
      complianceSteps: [],
      certifications: [],
      localAuthorities: []
    };
    
    // Add region-specific regulations
    Object.entries(KEY_REGULATIONS).forEach(([name, regulation]) => {
      if (regulation.category === category) {
        if (
          regulation.region === "global" || 
          regulation.region === countryCode || 
          (countryCode.startsWith(regulation.region + "-"))
        ) {
          baseRegulations.categories[category].requirements.push({
            name,
            description: `Compliance with ${name} regulations`,
            mandatory: true
          });
        }
      }
    });
  });
  
  return baseRegulations;
}

// Save regulations data for a country
async function saveCountryRegulations(countryCode, regulations) {
  const filePath = path.join(REGULATIONS_DIR, `${countryCode.toLowerCase()}.json`);
  await fs.writeFile(filePath, JSON.stringify(regulations, null, 2));
}

// Log compliance event
async function logComplianceEvent(event) {
  try {
    const timestamp = new Date().toISOString();
    const id = uuidv4();
    const logEntry = {
      id,
      timestamp,
      ...event
    };
    
    // Write to compliance log
    const logFile = path.join(COMPLIANCE_LOGS_DIR, `${timestamp.substring(0, 10)}.log`);
    await fs.appendFile(logFile, JSON.stringify(logEntry) + '\n');
    
    // If this is a certification, also store in certifications
    if (event.type === 'certification') {
      const certFile = path.join(CERTIFICATIONS_DIR, `${event.entity}-${event.certification}.json`);
      await fs.writeFile(certFile, JSON.stringify({
        id,
        timestamp,
        ...event,
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      }));
    }
    
    return { success: true, id };
  } catch (err) {
    console.error('Error logging compliance event:', err);
    throw err;
  }
}

// Check entity compliance status
async function checkComplianceStatus(entity, countryCode) {
  try {
    // Get country regulations
    const regulations = await loadCountryRegulations(countryCode);
    
    // Check certifications
    const certifications = [];
    try {
      const files = await fs.readdir(CERTIFICATIONS_DIR);
      for (const file of files) {
        if (file.startsWith(`${entity}-`)) {
          const certData = await fs.readFile(path.join(CERTIFICATIONS_DIR, file), 'utf8');
          const certification = JSON.parse(certData);
          
          // Check if certification is still valid
          if (new Date(certification.validUntil) > new Date()) {
            certifications.push(certification);
          }
        }
      }
    } catch (err) {
      console.error('Error checking certifications:', err);
    }
    
    // Calculate compliance score and status
    const requiredCategories = Object.keys(regulations.categories);
    const certifiedCategories = certifications.map(cert => cert.category);
    const missingCategories = requiredCategories.filter(category => 
      !certifiedCategories.includes(category)
    );
    
    const complianceScore = requiredCategories.length > 0 
      ? ((requiredCategories.length - missingCategories.length) / requiredCategories.length) * 100
      : 0;
    
    return {
      entity,
      countryCode,
      complianceScore,
      compliant: missingCategories.length === 0,
      certifications,
      missingCategories,
      lastChecked: new Date().toISOString()
    };
  } catch (err) {
    console.error('Error checking compliance status:', err);
    throw err;
  }
}

// API Endpoints

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', service: 'global-compliance-service' });
});

// Get all supported countries
app.get('/api/compliance/countries', (_req, res) => {
  res.json({
    countries: Object.entries(COUNTRIES).map(([code, data]) => ({
      code,
      name: data.name,
      unMember: data.unMember
    }))
  });
});

// Get supported languages
app.get('/api/compliance/languages', (_req, res) => {
  res.json({ languages: LANGUAGES });
});

// Get UN SDGs
app.get('/api/compliance/un-sdgs', (_req, res) => {
  res.json({ sdgs: UN_SDGS });
});

// Get compliance regulations for a country
app.get('/api/compliance/regulations/:countryCode', async (req, res) => {
  try {
    const { countryCode } = req.params;
    if (!COUNTRIES[countryCode.toUpperCase()]) {
      return res.status(404).json({ error: 'Country not found' });
    }
    
    const regulations = await loadCountryRegulations(countryCode.toUpperCase());
    res.json(regulations);
  } catch (err) {
    console.error('Error loading regulations:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Log compliance event
app.post('/api/compliance/log', async (req, res) => {
  try {
    const result = await logComplianceEvent(req.body);
    res.json(result);
  } catch (err) {
    console.error('Error logging event:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check entity compliance
app.get('/api/compliance/status/:entity', async (req, res) => {
  try {
    const { entity } = req.params;
    const { countryCode = 'ZA' } = req.query;
    
    if (!COUNTRIES[countryCode.toUpperCase()]) {
      return res.status(404).json({ error: 'Country not found' });
    }
    
    const status = await checkComplianceStatus(entity, countryCode.toUpperCase());
    res.json(status);
  } catch (err) {
    console.error('Error checking compliance status:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get compliance certifications
app.get('/api/compliance/certifications/:entity', async (req, res) => {
  try {
    const { entity } = req.params;
    
    const certifications = [];
    try {
      const files = await fs.readdir(CERTIFICATIONS_DIR);
      for (const file of files) {
        if (file.startsWith(`${entity}-`)) {
          const certData = await fs.readFile(path.join(CERTIFICATIONS_DIR, file), 'utf8');
          certifications.push(JSON.parse(certData));
        }
      }
    } catch (err) {
      console.error('Error reading certifications:', err);
    }
    
    res.json({ certifications });
  } catch (err) {
    console.error('Error getting certifications:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Apply for certification
app.post('/api/compliance/certify', async (req, res) => {
  try {
    const { entity, countryCode, category, evidence } = req.body;
    
    if (!entity || !countryCode || !category || !evidence) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (!COUNTRIES[countryCode.toUpperCase()]) {
      return res.status(404).json({ error: 'Country not found' });
    }
    
    if (!COMPLIANCE_CATEGORIES.includes(category)) {
      return res.status(404).json({ error: 'Invalid compliance category' });
    }
    
    // Log certification
    const certification = `${category}-${countryCode.toUpperCase()}`;
    await logComplianceEvent({
      type: 'certification',
      entity,
      countryCode: countryCode.toUpperCase(),
      category,
      certification,
      evidence,
      status: 'approved'
    });
    
    res.json({
      success: true,
      certification,
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    });
  } catch (err) {
    console.error('Error applying for certification:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Global compliance service running on port ${PORT}`);
  
  // Initialize regulations for key countries
  Promise.all(
    Object.keys(COUNTRIES).map(countryCode => 
      loadCountryRegulations(countryCode).catch(console.error)
    )
  );
});