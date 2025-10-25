/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Azora OS - Promotional Pricing Service
 * Launch Offer: 1 Month Free Trial + 50% off next 2 months
 * 
 * Author: Sizwe Ngwenya <sizwe.ngwenya@azora.world>
 */

const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PROMOTIONS_PORT || 4095;

// Launch promotion details
const LAUNCH_PROMOTION = {
  id: 'LAUNCH2025',
  name: 'Azora OS Launch Special',
  description: '1 Month FREE Trial + 50% OFF Next 2 Months',
  startDate: '2025-10-18T00:00:00Z',
  endDate: '2025-12-31T23:59:59Z',
  benefits: [
    '30-day free trial (no credit card required)',
    '50% discount on months 2 and 3',
    'Access to all premium features',
    'Priority support',
    'Early access to new features',
    'Free Azora Coin starter pack (100 AZR)',
  ],
  countries: {
    ZA: {
      trial: { duration: 30, price: 0, currency: 'ZAR' },
      discount: {
        percentage: 50,
        duration: 60, // days
        plans: {
          driver: { original: 149, discounted: 75 },
          business: { original: 999, discounted: 500 },
          enterprise: { original: 4999, discounted: 2500 },
        },
      },
    },
    US: {
      trial: { duration: 30, price: 0, currency: 'USD' },
      discount: {
        percentage: 50,
        duration: 60,
        plans: {
          driver: { original: 9, discounted: 5 },
          business: { original: 59, discounted: 30 },
          enterprise: { original: 299, discounted: 150 },
        },
      },
    },
    GB: {
      trial: { duration: 30, price: 0, currency: 'GBP' },
      discount: {
        percentage: 50,
        duration: 60,
        plans: {
          driver: { original: 7, discounted: 4 },
          business: { original: 45, discounted: 23 },
          enterprise: { original: 225, discounted: 113 },
        },
      },
    },
    NG: {
      trial: { duration: 30, price: 0, currency: 'NGN' },
      discount: {
        percentage: 50,
        duration: 60,
        plans: {
          driver: { original: 4500, discounted: 2250 },
          business: { original: 29900, discounted: 14950 },
          enterprise: { original: 149900, discounted: 74950 },
        },
      },
    },
    KE: {
      trial: { duration: 30, price: 0, currency: 'KES' },
      discount: {
        percentage: 50,
        duration: 60,
        plans: {
          driver: { original: 1200, discounted: 600 },
          business: { original: 7900, discounted: 3950 },
          enterprise: { original: 39900, discounted: 19950 },
        },
      },
    },
  },
};

// Premium features included in launch offer
const PREMIUM_FEATURES = {
  all_plans: [
    'Advanced Analytics Dashboard',
    'API Access',
    'Custom Branding',
    'Priority Support (24/7)',
    'Advanced Reporting',
    'Data Export',
    'Mobile Apps (iOS & Android)',
    'Unlimited Users',
  ],
  business: [
    'Multi-location Support',
    'Team Management',
    'Advanced Integrations',
    'Custom Workflows',
    'White-label Options',
  ],
  enterprise: [
    'Dedicated Account Manager',
    'Custom Development',
    'SLA Guarantee (99.99% uptime)',
    'On-premise Deployment Option',
    'Advanced Security Features',
    'Compliance Support',
    'Training & Onboarding',
  ],
};

// Promotional codes for special access
const PROMO_CODES = new Map([
  ['SIZWE2025', {
    type: 'founder',
    discount: 100,
    duration: 365,
    description: 'Founder Special - 1 Year Free',
    email: 'sizwe.ngwenya@azora.world',
  }],
  ['LAUNCH50', {
    type: 'launch',
    discount: 50,
    duration: 90,
    description: 'Launch Special - 50% off 3 months',
  }],
  ['EARLYBIRD', {
    type: 'early',
    discount: 75,
    duration: 30,
    description: 'Early Bird - 75% off first month',
  }],
  ['AFRICA25', {
    type: 'regional',
    discount: 25,
    duration: 180,
    description: 'African Union Discount - 25% off 6 months',
    countries: ['ZA', 'NG', 'KE', 'GH', 'UG', 'TZ'],
  }],
]);

// Trial registrations
const trials = new Map();
const subscriptions = new Map();

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'promotions',
    version: '1.0.0',
    activePromotion: LAUNCH_PROMOTION.id,
    activeTrials: trials.size,
    activeSubscriptions: subscriptions.size,
  });
});

// Get launch promotion details
app.get('/launch-offer', (req, res) => {
  const country = req.query.country || 'ZA';
  const countryPromo = LAUNCH_PROMOTION.countries[country] || LAUNCH_PROMOTION.countries.ZA;
  
  res.json({
    success: true,
    promotion: {
      ...LAUNCH_PROMOTION,
      countrySpecific: countryPromo,
    },
    premiumFeatures: PREMIUM_FEATURES,
    message: country === 'ZA' 
      ? '🇿🇦 Special South African Launch Pricing!' 
      : '🌍 Launch Special Available!',
  });
});

// Start free trial
app.post('/trial/start', (req, res) => {
  const { email, fullName, role, country, promoCode } = req.body;
  
  if (!email || !fullName || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const trialId = `trial_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const countryCode = country || 'ZA';
  const countryPromo = LAUNCH_PROMOTION.countries[countryCode] || LAUNCH_PROMOTION.countries.ZA;
  
  // Check promo code
  let appliedPromo = null;
  if (promoCode && PROMO_CODES.has(promoCode.toUpperCase())) {
    appliedPromo = PROMO_CODES.get(promoCode.toUpperCase());
    
    // Special handling for founder email
    if (appliedPromo.email && email.toLowerCase() === appliedPromo.email.toLowerCase()) {
      appliedPromo.verified = true;
    }
  }

  const trial = {
    id: trialId,
    email: email.toLowerCase(),
    fullName,
    role,
    country: countryCode,
    currency: countryPromo.trial.currency,
    status: 'active',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    features: [
      ...PREMIUM_FEATURES.all_plans,
      ...(PREMIUM_FEATURES[role] || []),
    ],
    discount: countryPromo.discount,
    promoCode: appliedPromo ? promoCode.toUpperCase() : null,
    bonusAZR: 100, // Free starter pack
    createdAt: new Date().toISOString(),
  };

  trials.set(trialId, trial);

  // Special message for Sizwe
  const isFounder = email.toLowerCase() === 'sizwe.ngwenya@azora.world';

  res.json({
    success: true,
    trial,
    message: isFounder 
      ? '🎉 Welcome back, Sizwe! Founder access activated with full premium features for 1 year FREE!'
      : `🚀 Trial started! Enjoy 30 days FREE + 50% off next 2 months!`,
    nextSteps: [
      'Check your email for confirmation',
      'Complete your profile setup',
      'Explore all premium features',
      'No credit card required for trial',
    ],
    savings: {
      trialValue: countryPromo.discount.plans[role]?.original || 0,
      twoMonthDiscount: (countryPromo.discount.plans[role]?.original || 0) * 2 * 0.5,
      totalSavings: ((countryPromo.discount.plans[role]?.original || 0) * 3) - 
                    ((countryPromo.discount.plans[role]?.discounted || 0) * 2),
      currency: countryPromo.trial.currency,
    },
  });
});

// Get trial status
app.get('/trial/:id', (req, res) => {
  const trial = trials.get(req.params.id);
  
  if (!trial) {
    return res.status(404).json({ error: 'Trial not found' });
  }

  const daysRemaining = Math.ceil(
    (new Date(trial.endDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  res.json({
    success: true,
    trial: {
      ...trial,
      daysRemaining,
      upcomingDiscount: trial.discount,
    },
  });
});

// Convert trial to paid subscription
app.post('/trial/:id/convert', (req, res) => {
  const trial = trials.get(req.params.id);
  
  if (!trial) {
    return res.status(404).json({ error: 'Trial not found' });
  }

  const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const subscription = {
    id: subscriptionId,
    trialId: trial.id,
    email: trial.email,
    fullName: trial.fullName,
    role: trial.role,
    country: trial.country,
    currency: trial.currency,
    status: 'active',
    discount: trial.discount,
    discountEndDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    startDate: new Date().toISOString(),
    features: trial.features,
    createdAt: new Date().toISOString(),
  };

  subscriptions.set(subscriptionId, subscription);
  trial.status = 'converted';
  trial.convertedAt = new Date().toISOString();

  res.json({
    success: true,
    subscription,
    message: '🎉 Welcome to Azora OS! Your 50% discount is now active for 2 months!',
  });
});

// Validate promo code
app.post('/promo/validate', (req, res) => {
  const { code, email, country } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'Promo code required' });
  }

  const promoCode = PROMO_CODES.get(code.toUpperCase());
  
  if (!promoCode) {
    return res.status(404).json({ 
      valid: false,
      error: 'Invalid promo code' 
    });
  }

  // Check country restrictions
  if (promoCode.countries && !promoCode.countries.includes(country)) {
    return res.status(400).json({
      valid: false,
      error: 'This promo code is not available in your country',
    });
  }

  // Check email restrictions
  if (promoCode.email && email.toLowerCase() !== promoCode.email.toLowerCase()) {
    return res.status(400).json({
      valid: false,
      error: 'This promo code is reserved for a specific user',
    });
  }

  res.json({
    valid: true,
    promo: {
      code: code.toUpperCase(),
      discount: promoCode.discount,
      duration: promoCode.duration,
      description: promoCode.description,
    },
  });
});

// Get all premium features
app.get('/features/premium', (req, res) => {
  const role = req.query.role || 'business';
  
  res.json({
    success: true,
    features: {
      all: PREMIUM_FEATURES.all_plans,
      roleSpecific: PREMIUM_FEATURES[role] || [],
    },
  });
});

// Stats endpoint
app.get('/stats', (req, res) => {
  const activeTrials = Array.from(trials.values()).filter(t => t.status === 'active');
  const convertedTrials = Array.from(trials.values()).filter(t => t.status === 'converted');
  
  res.json({
    success: true,
    stats: {
      totalTrials: trials.size,
      activeTrials: activeTrials.length,
      convertedTrials: convertedTrials.length,
      conversionRate: trials.size > 0 
        ? ((convertedTrials.length / trials.size) * 100).toFixed(2) + '%'
        : '0%',
      activeSubscriptions: subscriptions.size,
    },
  });
});

app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  🎉 AZORA OS - LAUNCH PROMOTION SERVICE               ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Port: ${PORT}`);
  console.log('Status: Launch Ready! 🚀');
  console.log('');
  console.log('Launch Offer:');
  console.log('  ✅ 1 Month FREE Trial');
  console.log('  ✅ 50% OFF Next 2 Months');
  console.log('  ✅ All Premium Features Included');
  console.log('  ✅ 100 AZR Starter Pack');
  console.log('  ✅ No Credit Card Required');
  console.log('');
  console.log('Special Codes:');
  console.log('  • SIZWE2025 - Founder 1 Year Free');
  console.log('  • LAUNCH50 - 50% off 3 months');
  console.log('  • EARLYBIRD - 75% off first month');
  console.log('  • AFRICA25 - 25% off 6 months (Africa only)');
  console.log('');
  console.log('Contact: sizwe.ngwenya@azora.world');
  console.log('');
});

module.exports = app;
