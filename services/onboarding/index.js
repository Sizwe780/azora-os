/**
 * Azora OS - User Onboarding Service
 * Handles new user registration, verification, and initial setup
 * Country-specific pricing and localization
 * 
 * Author: Sizwe Ngwenya <sizwe@azora.world>
 */

const express = require('express');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(express.json());

const PORT = process.env.ONBOARDING_PORT || 4070;

// Country-specific pricing (in local currency)
const PRICING = {
  ZA: {
    country: 'South Africa',
    currency: 'ZAR',
    symbol: 'R',
    plans: {
      student: { monthly: 0, yearly: 0, features: 'Free with earnings' },
      driver: { monthly: 149, yearly: 1490, features: 'Basic + GPS tracking' },
      business: { monthly: 999, yearly: 9990, features: 'Full suite + analytics' },
      enterprise: { monthly: 4999, yearly: 49990, features: 'Custom + dedicated support' },
    },
    azrPrice: 850, // 1 AZR = R850
  },
  US: {
    country: 'United States',
    currency: 'USD',
    symbol: '$',
    plans: {
      student: { monthly: 0, yearly: 0, features: 'Free with earnings' },
      driver: { monthly: 9, yearly: 90, features: 'Basic + GPS tracking' },
      business: { monthly: 59, yearly: 590, features: 'Full suite + analytics' },
      enterprise: { monthly: 299, yearly: 2990, features: 'Custom + dedicated support' },
    },
    azrPrice: 50, // 1 AZR = $50
  },
  GB: {
    country: 'United Kingdom',
    currency: 'GBP',
    symbol: '£',
    plans: {
      student: { monthly: 0, yearly: 0, features: 'Free with earnings' },
      driver: { monthly: 7, yearly: 70, features: 'Basic + GPS tracking' },
      business: { monthly: 45, yearly: 450, features: 'Full suite + analytics' },
      enterprise: { monthly: 225, yearly: 2250, features: 'Custom + dedicated support' },
    },
    azrPrice: 40, // 1 AZR = £40
  },
  NG: {
    country: 'Nigeria',
    currency: 'NGN',
    symbol: '₦',
    plans: {
      student: { monthly: 0, yearly: 0, features: 'Free with earnings' },
      driver: { monthly: 4500, yearly: 45000, features: 'Basic + GPS tracking' },
      business: { monthly: 29900, yearly: 299000, features: 'Full suite + analytics' },
      enterprise: { monthly: 149900, yearly: 1499000, features: 'Custom + dedicated support' },
    },
    azrPrice: 25000, // 1 AZR = ₦25,000
  },
  KE: {
    country: 'Kenya',
    currency: 'KES',
    symbol: 'KSh',
    plans: {
      student: { monthly: 0, yearly: 0, features: 'Free with earnings' },
      driver: { monthly: 1200, yearly: 12000, features: 'Basic + GPS tracking' },
      business: { monthly: 7900, yearly: 79000, features: 'Full suite + analytics' },
      enterprise: { monthly: 39900, yearly: 399000, features: 'Custom + dedicated support' },
    },
    azrPrice: 6500, // 1 AZR = KSh 6,500
  },
  DEFAULT: {
    country: 'International',
    currency: 'USD',
    symbol: '$',
    plans: {
      student: { monthly: 0, yearly: 0, features: 'Free with earnings' },
      driver: { monthly: 10, yearly: 100, features: 'Basic + GPS tracking' },
      business: { monthly: 65, yearly: 650, features: 'Full suite + analytics' },
      enterprise: { monthly: 325, yearly: 3250, features: 'Custom + dedicated support' },
    },
    azrPrice: 55, // 1 AZR = $55
  },
};

// In-memory store (replace with database in production)
const onboardingQueue = new Map();
const users = new Map();

// Detect country from request
function detectCountry(req) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const countryHeader = req.headers['cf-ipcountry'] || req.headers['x-country'];
  
  // In production, use IP geolocation service
  // For now, check headers or default to ZA (South Africa)
  return countryHeader || req.query.country || 'ZA';
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'onboarding',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    onboardingInProgress: onboardingQueue.size,
    totalUsers: users.size,
  });
});

// Get pricing for country
app.get('/pricing', (req, res) => {
  const country = detectCountry(req);
  const pricing = PRICING[country] || PRICING.DEFAULT;
  
  res.json({
    success: true,
    country: pricing.country,
    currency: pricing.currency,
    symbol: pricing.symbol,
    plans: pricing.plans,
    azoraCoinPrice: {
      amount: pricing.azrPrice,
      currency: pricing.currency,
      formatted: `${pricing.symbol}${pricing.azrPrice.toLocaleString()}`,
    },
    note: country === 'ZA' ? 'Special South African pricing 🇿🇦' : undefined,
  });
});

// Start onboarding process
app.post('/onboard', [
  body('email').isEmail(),
  body('fullName').notEmpty(),
  body('role').isIn(['student', 'driver', 'enterprise', 'business']),
  body('country').optional().isISO31661Alpha2(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, fullName, role, country: userCountry } = req.body;
  const country = userCountry || detectCountry(req);
  const pricing = PRICING[country] || PRICING.DEFAULT;
  
  const onboardingRecord = {
    id: `onboard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email,
    fullName,
    role,
    country,
    pricing: pricing.plans[role],
    currency: pricing.currency,
    status: 'pending',
    createdAt: new Date().toISOString(),
    steps: {
      emailVerification: false,
      profileSetup: false,
      documentUpload: role !== 'student',
      paymentSetup: role !== 'student',
      training: true,
    },
  };

  onboardingQueue.set(onboardingRecord.id, onboardingRecord);

  res.json({
    success: true,
    onboardingId: onboardingRecord.id,
    message: `Welcome to Azora OS! ${country === 'ZA' ? '🇿🇦 Special SA pricing applied!' : ''}`,
    nextStep: 'email-verification',
    pricing: {
      plan: pricing.plans[role],
      currency: pricing.currency,
      symbol: pricing.symbol,
    },
  });
});

// Get onboarding status
app.get('/onboard/:id', (req, res) => {
  const record = onboardingQueue.get(req.params.id);
  
  if (!record) {
    return res.status(404).json({ error: 'Onboarding record not found' });
  }

  const progress = Object.values(record.steps).filter(v => v === true).length;
  const total = Object.values(record.steps).length;

  res.json({
    success: true,
    record,
    progress: {
      completed: progress,
      total,
      percentage: Math.round((progress / total) * 100),
    },
  });
});

// Update onboarding step
app.patch('/onboard/:id/step', (req, res) => {
  const { step, completed } = req.body;
  const record = onboardingQueue.get(req.params.id);
  
  if (!record) {
    return res.status(404).json({ error: 'Onboarding record not found' });
  }

  if (record.steps.hasOwnProperty(step)) {
    record.steps[step] = completed;
    
    // Check if all steps completed
    const allCompleted = Object.values(record.steps).every(v => v === true);
    if (allCompleted) {
      record.status = 'completed';
      record.completedAt = new Date().toISOString();
      
      // Move to users collection
      users.set(record.email, {
        id: `user-${Date.now()}`,
        email: record.email,
        fullName: record.fullName,
        role: record.role,
        country: record.country,
        joinedAt: record.completedAt,
      });
      
      // Remove from onboarding queue
      onboardingQueue.delete(record.id);
    }
  }

  res.json({
    success: true,
    record,
    message: record.status === 'completed' ? 'Welcome to Azora OS! 🎉' : 'Step updated',
  });
});

// Complete onboarding
app.post('/onboard/:id/complete', (req, res) => {
  const record = onboardingQueue.get(req.params.id);
  
  if (!record) {
    return res.status(404).json({ error: 'Onboarding record not found' });
  }

  record.status = 'completed';
  record.completedAt = new Date().toISOString();

  const user = {
    id: `user-${Date.now()}`,
    email: record.email,
    fullName: record.fullName,
    role: record.role,
    country: record.country,
    pricing: record.pricing,
    joinedAt: record.completedAt,
  };

  users.set(user.email, user);
  onboardingQueue.delete(record.id);

  res.json({
    success: true,
    message: 'Onboarding completed successfully! 🎉',
    user,
  });
});

// Get all users (for admin)
app.get('/users', (req, res) => {
  const allUsers = Array.from(users.values());
  
  res.json({
    success: true,
    total: allUsers.length,
    users: allUsers,
  });
});

app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  🚀 ONBOARDING SERVICE - COUNTRY-AWARE PRICING        ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Port: ${PORT}`);
  console.log('Status: Operational');
  console.log('');
  console.log('Supported Countries:');
  console.log('  🇿🇦 South Africa (ZAR)');
  console.log('  🇺🇸 United States (USD)');
  console.log('  🇬🇧 United Kingdom (GBP)');
  console.log('  🇳🇬 Nigeria (NGN)');
  console.log('  🇰🇪 Kenya (KES)');
  console.log('  🌍 International (USD)');
  console.log('');
  console.log('Endpoints:');
  console.log('  GET  /pricing - Get country-specific pricing');
  console.log('  POST /onboard - Start onboarding');
  console.log('  GET  /onboard/:id - Get status');
  console.log('');
});

module.exports = app;
