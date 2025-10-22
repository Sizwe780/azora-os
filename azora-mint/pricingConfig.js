/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Azora OS Pricing Configuration
 * Trial: 1 month free, then 50% off for 2 months
 */

module.exports = [
  {
    id: 'starter',
    tier: 'starter',
    name: 'Starter Plan',
    basePrice: 2500, // R2,500/month
    trialDays: 30, // 1 month free trial
    promoDiscount: 0.5, // 50% off
    promoMonths: 2, // 2 months promotional pricing
    features: [
      'Up to 10 users',
      'Basic route optimization',
      'Real-time tracking',
      'Mobile app access',
      'Email support'
    ]
  },
  {
    id: 'professional',
    tier: 'professional',
    name: 'Professional Plan',
    basePrice: 7500, // R7,500/month
    trialDays: 30, // 1 month free trial
    promoDiscount: 0.5, // 50% off
    promoMonths: 2, // 2 months promotional pricing
    features: [
      'Up to 50 users',
      'Advanced AI optimization',
      'Predictive maintenance',
      'Custom integrations',
      'Priority support',
      'Advanced analytics'
    ]
  },
  {
    id: 'enterprise',
    tier: 'enterprise',
    name: 'Enterprise Plan',
    basePrice: 25000, // R25,000/month
    trialDays: 30, // 1 month free trial
    promoDiscount: 0.5, // 50% off
    promoMonths: 2, // 2 months promotional pricing
    features: [
      'Unlimited users',
      'Full AI suite',
      'Custom AI models',
      'White-label solution',
      'Dedicated support',
      'Advanced security',
      'Compliance automation'
    ]
  }
];