/**
 * Subscription Service
 * Handles trial, promotional pricing, and billing
 */

const express = require('express');
const router = express.Router();

// In-memory storage (production will use PostgreSQL/Prisma)
const subscriptions = new Map();
const pricingTiers = require('./pricingConfig');

/**
 * Create new subscription (starts with 14-day trial)
 */
router.post('/create', async (req, res) => {
  try {
    const { userId, organizationId, tierId, interval = 'monthly' } = req.body;
    
    const tier = pricingTiers.find(t => t.id === tierId);
    if (!tier) {
      return res.status(400).json({ error: 'Invalid pricing tier' });
    }
    
    const now = new Date();
    const trialEndDate = new Date(now);
    trialEndDate.setDate(trialEndDate.getDate() + tier.trialDays);
    
    const promoStartDate = new Date(trialEndDate);
    const promoEndDate = new Date(promoStartDate);
    promoEndDate.setMonth(promoEndDate.getMonth() + tier.promoMonths);
    
    const subscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      organizationId,
      tier: tier.tier,
      pricingTierId: tier.id,
      status: 'trial',
      interval,
      
      createdAt: now,
      trialStartDate: now,
      trialEndDate,
      promoStartDate,
      promoEndDate,
      currentPeriodStart: now,
      currentPeriodEnd: trialEndDate,
      
      baseAmount: tier.basePrice,
      currentAmount: 0, // Trial = R0
      totalPaid: 0,
      
      usersCount: 0,
      assetsCount: 0,
      corridorsCount: 0,
      transactionVolume: 0,
      
      metadata: {
        tierName: tier.name,
        trialLength: tier.trialDays,
        promoDiscount: tier.promoDiscount,
        promoMonths: tier.promoMonths,
      },
    };
    
    subscriptions.set(subscription.id, subscription);
    
    // Log event
    await logSubscriptionEvent(subscription.id, 'trial_started', {
      tierName: tier.name,
      trialEndDate,
    });
    
    res.json({
      success: true,
      subscription,
      message: `${tier.trialDays}-day free trial started. Promotional pricing (${tier.promoDiscount * 100}% off) begins after trial.`,
    });
    
  } catch (error) {
    console.error('Subscription creation error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

/**
 * Get subscription status
 */
router.get('/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const subscription = subscriptions.get(subscriptionId);
    
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    const phase = getSubscriptionPhase(subscription);
    const daysLeft = getDaysUntilPhaseEnd(subscription);
    const tier = pricingTiers.find(t => t.id === subscription.pricingTierId);
    
    res.json({
      subscription,
      currentPhase: phase,
      daysLeftInPhase: daysLeft,
      currentMonthlyPrice: subscription.currentAmount,
      fullMonthlyPrice: tier.basePrice,
      savingsPerMonth: tier.basePrice - subscription.currentAmount,
      nextPhase: phase === 'trial' ? 'promo' : phase === 'promo' ? 'full' : null,
      nextPhasePrice: phase === 'trial' 
        ? Math.round(tier.basePrice * (1 - tier.promoDiscount))
        : phase === 'promo'
        ? tier.basePrice
        : null,
    });
    
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
});

/**
 * Process phase transition (trial → promo → full)
 */
router.post('/:subscriptionId/process-transition', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const subscription = subscriptions.get(subscriptionId);
    
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    const now = new Date();
    const tier = pricingTiers.find(t => t.id === subscription.pricingTierId);
    
    // Check if trial ended
    if (subscription.status === 'trial' && now >= subscription.trialEndDate) {
      subscription.status = 'promotional';
      subscription.currentAmount = Math.round(tier.basePrice * (1 - tier.promoDiscount));
      subscription.currentPeriodStart = subscription.promoStartDate;
      subscription.currentPeriodEnd = subscription.promoEndDate;
      
      await logSubscriptionEvent(subscriptionId, 'promo_started', {
        promoPrice: subscription.currentAmount,
        fullPrice: tier.basePrice,
        discount: tier.promoDiscount,
      });
      
      return res.json({
        success: true,
        message: `Trial ended. Promotional pricing (${tier.promoDiscount * 100}% off) now active for ${tier.promoMonths} months.`,
        subscription,
      });
    }
    
    // Check if promo ended
    if (subscription.status === 'promotional' && now >= subscription.promoEndDate) {
      subscription.status = 'active';
      subscription.currentAmount = tier.basePrice;
      
      const nextPeriodEnd = new Date(subscription.promoEndDate);
      nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);
      
      subscription.currentPeriodStart = subscription.promoEndDate;
      subscription.currentPeriodEnd = nextPeriodEnd;
      
      await logSubscriptionEvent(subscriptionId, 'promo_ended', {
        newPrice: tier.basePrice,
      });
      
      return res.json({
        success: true,
        message: 'Promotional period ended. Full pricing now active.',
        subscription,
      });
    }
    
    res.json({
      success: true,
      message: 'No transition needed at this time',
      subscription,
    });
    
  } catch (error) {
    console.error('Transition error:', error);
    res.status(500).json({ error: 'Failed to process transition' });
  }
});

/**
 * Cancel subscription
 */
router.post('/:subscriptionId/cancel', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { reason } = req.body;
    
    const subscription = subscriptions.get(subscriptionId);
    
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    
    await logSubscriptionEvent(subscriptionId, 'cancelled', { reason });
    
    res.json({
      success: true,
      message: 'Subscription cancelled',
      subscription,
    });
    
  } catch (error) {
    console.error('Cancel error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

/**
 * Get all pricing tiers
 */
router.get('/pricing/tiers', (req, res) => {
  res.json({
    tiers: pricingTiers,
    promotionalOffer: {
      trialDays: 14,
      promoMonths: 3,
      discount: 0.75,
      message: 'Start with 14 days free, then get 75% off for 3 months!',
    },
  });
});

/**
 * Check if notification should be sent
 */
router.get('/:subscriptionId/check-notifications', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const subscription = subscriptions.get(subscriptionId);
    
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    const daysLeft = getDaysUntilPhaseEnd(subscription);
    const phase = getSubscriptionPhase(subscription);
    const shouldNotify = shouldSendNotification(subscription);
    
    if (shouldNotify) {
      let message = '';
      if (phase === 'trial' && daysLeft <= 3) {
        message = `Your trial ends in ${daysLeft} days. Promotional pricing (75% off) will begin automatically.`;
      } else if (phase === 'promo' && daysLeft <= 7) {
        const tier = pricingTiers.find(t => t.id === subscription.pricingTierId);
        message = `Your promotional period ends in ${daysLeft} days. Full price (R${tier.basePrice.toLocaleString()}/month) will apply.`;
      }
      
      return res.json({
        shouldNotify: true,
        phase,
        daysLeft,
        message,
      });
    }
    
    res.json({
      shouldNotify: false,
      phase,
      daysLeft,
    });
    
  } catch (error) {
    console.error('Notification check error:', error);
    res.status(500).json({ error: 'Failed to check notifications' });
  }
});

// Helper functions
function getSubscriptionPhase(subscription) {
  const now = new Date();
  
  if (subscription.status === 'trial' || now < subscription.trialEndDate) {
    return 'trial';
  }
  
  if (subscription.promoEndDate && now < subscription.promoEndDate) {
    return 'promo';
  }
  
  return 'full';
}

function getDaysUntilPhaseEnd(subscription) {
  const now = new Date();
  const phase = getSubscriptionPhase(subscription);
  
  let endDate;
  switch (phase) {
    case 'trial':
      endDate = subscription.trialEndDate;
      break;
    case 'promo':
      endDate = subscription.promoEndDate;
      break;
    case 'full':
      endDate = subscription.currentPeriodEnd;
      break;
  }
  
  const diff = endDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function shouldSendNotification(subscription) {
  const daysLeft = getDaysUntilPhaseEnd(subscription);
  const phase = getSubscriptionPhase(subscription);
  
  if (phase === 'trial' && daysLeft <= 3) return true;
  if (phase === 'promo' && daysLeft <= 7) return true;
  
  return false;
}

async function logSubscriptionEvent(subscriptionId, type, metadata) {
  console.log(`[Subscription Event] ${subscriptionId}: ${type}`, metadata);
  // Subscription stored in memory - production ready for demo
}

module.exports = router;
