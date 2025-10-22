/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const cors = require('cors');
const i18next = require('i18next');
const RegionIntegration = require('./region-integration');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize i18next
i18next.init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: {
      translation: {
        welcome: 'Welcome to Azora Mail!',
        test_success: 'Region test successful'
      }
    }
  }
});

// Create and initialize region integration
const regionIntegration = new RegionIntegration(app, i18next);

// Test endpoint - get region info
app.get('/test/:region', (req, res) => {
  const { region } = req.params;
  
  try {
    // Get region settings
    const regionManager = require('./region-manager');
    const settings = regionManager.getRegionSettings(region);
    
    // Mock email with region settings
    const mockEmail = {
      to: 'test@example.com',
      subject: 'Test Email',
      text: 'This is a test email'
    };
    
    // Apply region settings
    const modifiedEmail = regionIntegration.applyRegionSettings(
      'sender@azora.world',
      mockEmail,
      region
    );
    
    // Response with region info and email
    res.json({
      region,
      settings,
      email: modifiedEmail,
      translated: i18next.t('test_success')
    });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// Test endpoint - detect region from email
app.get('/detect-region', (req, res) => {
  const { email } = req.query;
  
  if (!email) {
    return res.status(400).json({ error: 'Email parameter required' });
  }
  
  const region = regionIntegration.getRegionFromEmail(email);
  
  res.json({
    email,
    detectedRegion: region,
    message: `Detected region ${region} for email ${email}`
  });
});

// Wrap the server start in an async function
async function startServer() {
  try {
    // Initialize region integration
    await regionIntegration.initialize();
    
    // Start server
    const PORT = process.env.SA_COMPLIANCE_PORT || 4090;
    app.listen(PORT, () => {
      console.log(`Test server running on port ${PORT}`);
      console.log('Try these endpoints:');
      console.log(`  http://localhost:${PORT}/test/ZA`);
      console.log(`  http://localhost:${PORT}/test/EU`);
      console.log(`  http://localhost:${PORT}/test/US`);
      console.log(`  http://localhost:${PORT}/detect-region?email=user@example.za`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

startServer();

// Modified options to include compliance header
const modifiedOptions = {
  headers: {
    'X-Azora-Compliance': region.privacyNotice ? 'compliant' : 'non-compliant'
  }
};

// In azora-coin/contracts/AzoraCoin.sol
uint256 public constant MAX_SUPPLY = 1000000 * 10**18; // 1 million tokens with 18 decimals