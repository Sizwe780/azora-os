/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Subscription & Pricing Types
 * Azora OS - Sovereign Immune System
 * 
 * Pricing Model:
 * - 2 weeks free trial
 * - 75% off for 3 months after trial
 * - Full price after month 4
 */

export type SubscriptionTier = 
  | 'procurement_corridor'      // R2M/year (government/enterprise)
  | 'safety_corridor'            // R200K/year per asset
  | 'hr_compliance'              // R499/employee/month
  | 'citizen_federation'         // R100/user/month
  | 'enterprise_suite';          // Custom pricing

export type SubscriptionStatus = 
  | 'trial'                      // 2 weeks free
  | 'promotional'                // 3 months at 75% off
  | 'active'                     // Full price
  | 'paused'
  | 'cancelled'
  | 'expired';

export type PaymentInterval = 'monthly' | 'quarterly' | 'annually';

export interface PricingTier {
  id: string;
  name: string;
  tier: SubscriptionTier;
  description: string;
  features: string[];
  
  // Pricing
  basePrice: number;              // Full price per month (ZAR)
  annualPrice: number;            // Annual price (usually 10-20% discount)
  currency: 'ZAR' | 'USD' | 'EUR';
  
  // Trial & Promotion
  trialDays: number;              // Default: 14 days
  promoMonths: number;            // Default: 3 months
  promoDiscount: number;          // Default: 0.75 (75% off)
  
  // Limits
  maxUsers?: number;
  maxAssets?: number;
  maxCorridors?: number;
  
  // Add-ons
  transactionFeePercentage?: number;  // e.g., 0.5% for procurement
  perAssetPrice?: number;             // e.g., R50K/aircraft
}

type MetadataPrimitive = string | number | boolean | null | Date;

export type MetadataValue = MetadataPrimitive | MetadataPrimitive[] | { [key: string]: MetadataValue };

export type SubscriptionMetadata = Record<string, MetadataValue>;

export interface Subscription {
  id: string;
  userId: string;
  organizationId: string;
  
  // Plan details
  tier: SubscriptionTier;
  pricingTierId: string;
  status: SubscriptionStatus;
  interval: PaymentInterval;
  
  // Dates
  createdAt: Date;
  trialStartDate: Date;
  trialEndDate: Date;
  promoStartDate?: Date;
  promoEndDate?: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelledAt?: Date;
  
  // Pricing
  baseAmount: number;             // Full monthly price
  currentAmount: number;          // What they're paying now (trial=0, promo=25%, full=100%)
  totalPaid: number;              // Lifetime value
  
  // Usage tracking
  usersCount: number;
  assetsCount?: number;
  corridorsCount?: number;
  transactionVolume?: number;     // For transaction fee calculation
  
  // Payment
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  paymentMethod?: 'card' | 'eft' | 'invoice';
  
  // Metadata
  metadata: SubscriptionMetadata;
}

export interface SubscriptionEvent {
  id: string;
  subscriptionId: string;
  type: 'trial_started' | 'trial_ending' | 'trial_ended' | 
        'promo_started' | 'promo_ending' | 'promo_ended' |
        'upgraded' | 'downgraded' | 'cancelled' | 'renewed' |
        'payment_succeeded' | 'payment_failed';
  timestamp: Date;
  metadata: SubscriptionMetadata;
}

// Pricing tiers configuration
export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'procurement_basic',
    name: 'Procurement Corridor - Basic',
    tier: 'procurement_corridor',
    description: 'Single government department or corporate division',
    features: [
      'Immutable tender & bid tracking',
      'Constitution-as-Code enforcement',
      'Compliance verification',
      'Basic corruption detection',
      'Up to 100 tenders/month',
      'Single corridor',
    ],
    basePrice: 166_667,           // R2M/year = R166,667/month
    annualPrice: 2_000_000,       // R2M/year
    currency: 'ZAR',
    trialDays: 14,
    promoMonths: 3,
    promoDiscount: 0.75,
    maxCorridors: 1,
    transactionFeePercentage: 0.005, // 0.5%
  },
  {
    id: 'procurement_enterprise',
    name: 'Procurement Corridor - Enterprise',
    tier: 'procurement_corridor',
    description: 'Multi-department or large corporate',
    features: [
      'Everything in Basic',
      'Advanced AI corruption detection',
      'Multi-corridor management',
      'Unlimited tenders',
      'Predictive analytics',
      'Custom compliance rules',
      'Dedicated support',
    ],
    basePrice: 416_667,           // R5M/year = R416,667/month
    annualPrice: 5_000_000,       // R5M/year
    currency: 'ZAR',
    trialDays: 14,
    promoMonths: 3,
    promoDiscount: 0.75,
    maxCorridors: 10,
    transactionFeePercentage: 0.003, // 0.3% (volume discount)
  },
  {
    id: 'safety_aviation',
    name: 'Safety Corridor - Aviation',
    tier: 'safety_corridor',
    description: 'Per aircraft/asset pricing',
    features: [
      'Predictive Twin for each asset',
      'Pre-flight checklist automation',
      'Incident anchoring',
      'Near-miss detection',
      'Equipment failure prediction',
      'Maintenance optimization',
    ],
    basePrice: 16_667,            // R200K/year = R16,667/month per asset
    annualPrice: 200_000,         // R200K/year per asset
    currency: 'ZAR',
    trialDays: 14,
    promoMonths: 3,
    promoDiscount: 0.75,
    perAssetPrice: 200_000,
  },
  {
    id: 'hr_compliance_standard',
    name: 'HR Compliance - Standard',
    tier: 'hr_compliance',
    description: 'CCMA-proof HR management',
    features: [
      'AZORA HR AI Deputy',
      'CCMA compliance automation',
      'Compensation analysis',
      'Recruitment AI',
      'Performance management',
      'Employee self-service',
    ],
    basePrice: 499,               // R499/employee/month
    annualPrice: 5_390,           // R5,390/employee/year (10% discount)
    currency: 'ZAR',
    trialDays: 14,
    promoMonths: 3,
    promoDiscount: 0.75,
    maxUsers: 1000,
  },
  {
    id: 'citizen_federation_basic',
    name: 'Citizen Federation - Basic',
    tier: 'citizen_federation',
    description: 'Citizen engagement & reputation',
    features: [
      'Azora Wallet',
      'Reputation credits',
      'Whistleblower protection',
      'Service delivery tracking',
      'Community governance',
    ],
    basePrice: 100,               // R100/user/month
    annualPrice: 1_080,           // R1,080/user/year (10% discount)
    currency: 'ZAR',
    trialDays: 14,
    promoMonths: 3,
    promoDiscount: 0.75,
  },
];

// Helper functions
export function calculatePromoPrice(basePrice: number, discount: number = 0.75): number {
  return Math.round(basePrice * (1 - discount));
}

export function getSubscriptionPhase(subscription: Subscription): 'trial' | 'promo' | 'full' {
  const now = new Date();
  
  if (subscription.status === 'trial' || now < subscription.trialEndDate) {
    return 'trial';
  }
  
  if (subscription.promoEndDate && now < subscription.promoEndDate) {
    return 'promo';
  }
  
  return 'full';
}

export function calculateCurrentPrice(subscription: Subscription, tier: PricingTier): number {
  const phase = getSubscriptionPhase(subscription);
  
  switch (phase) {
    case 'trial':
      return 0;
    case 'promo':
      return calculatePromoPrice(tier.basePrice, tier.promoDiscount);
    case 'full':
    default:
      return tier.basePrice;
  }
}

export function getDaysUntilPhaseEnd(subscription: Subscription): number {
  const now = new Date();
  const phase = getSubscriptionPhase(subscription);
  
  let endDate: Date;
  switch (phase) {
    case 'trial':
      endDate = subscription.trialEndDate;
      break;
    case 'promo':
      endDate = subscription.promoEndDate!;
      break;
    case 'full':
      endDate = subscription.currentPeriodEnd;
      break;
  }
  
  const diff = endDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function calculateLifetimeValue(subscription: Subscription, tier: PricingTier): number {
  // Calculate expected LTV based on tier
  const monthlyRevenue = tier.basePrice;
  const averageLifetimeMonths = 24; // Conservative estimate
  
  return monthlyRevenue * averageLifetimeMonths;
}

export function shouldSendPhaseEndingNotification(subscription: Subscription): boolean {
  const daysLeft = getDaysUntilPhaseEnd(subscription);
  const phase = getSubscriptionPhase(subscription);
  
  // Notify 3 days before trial ends
  if (phase === 'trial' && daysLeft <= 3) return true;
  
  // Notify 7 days before promo ends
  if (phase === 'promo' && daysLeft <= 7) return true;
  
  return false;
}
