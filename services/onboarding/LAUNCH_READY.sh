#!/bin/bash

echo "🚀 Preparing Azora OS for Official Launch..."
echo ""

# Create promotional pricing service
mkdir -p services/promotions

cat > services/promotions/index.js << 'PROMO_EOF'
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
PROMO_EOF

cat > services/promotions/package.json << 'PKG_EOF'
{
  "name": "@azora/promotions",
  "version": "1.0.0",
  "description": "Launch promotional pricing for Azora OS",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "author": "Sizwe Ngwenya <sizwe.ngwenya@azora.world>",
  "license": "SEE LICENSE IN LICENSE"
}
PKG_EOF

# Create launch landing page
mkdir -p apps/launch-page

cat > apps/launch-page/index.html << 'HTML_EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Azora OS - Launch Special: 1 Month FREE + 50% OFF</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            padding: 40px 20px;
        }
        .header h1 {
            font-size: 3em;
            margin-bottom: 20px;
            animation: fadeInDown 1s;
        }
        .promo-banner {
            background: rgba(255, 255, 255, 0.2);
            padding: 30px;
            border-radius: 20px;
            text-align: center;
            margin: 40px 0;
            backdrop-filter: blur(10px);
            animation: slideInUp 1s;
        }
        .promo-banner h2 {
            font-size: 2.5em;
            margin-bottom: 20px;
            color: #ffd700;
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 40px 0;
        }
        .feature-card {
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
            transition: transform 0.3s;
        }
        .feature-card:hover {
            transform: translateY(-10px);
        }
        .cta-button {
            display: inline-block;
            background: #ffd700;
            color: #333;
            padding: 20px 50px;
            border-radius: 50px;
            font-size: 1.5em;
            font-weight: bold;
            text-decoration: none;
            transition: all 0.3s;
            margin: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .cta-button:hover {
            transform: scale(1.05);
            box-shadow: 0 15px 40px rgba(0,0,0,0.4);
        }
        .pricing-table {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 40px 0;
        }
        .pricing-card {
            background: white;
            color: #333;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
        }
        .pricing-card.popular {
            transform: scale(1.05);
            border: 3px solid #ffd700;
        }
        .price {
            font-size: 3em;
            font-weight: bold;
            color: #667eea;
            margin: 20px 0;
        }
        .original-price {
            text-decoration: line-through;
            color: #999;
            font-size: 1.5em;
        }
        .savings {
            background: #4ade80;
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            display: inline-block;
            margin: 10px 0;
        }
        @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-50px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInUp {
            from { opacity: 0; transform: translateY(50px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .countdown {
            font-size: 2em;
            margin: 20px 0;
            color: #ffd700;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Azora OS Launch Special 🚀</h1>
            <p style="font-size: 1.5em;">Africa's First Trillion-Dollar Operating System</p>
        </div>

        <div class="promo-banner">
            <h2>🎉 LAUNCH OFFER 🎉</h2>
            <div style="font-size: 1.8em; margin: 20px 0;">
                <div>✅ <strong>1 MONTH FREE TRIAL</strong></div>
                <div>✅ <strong>50% OFF NEXT 2 MONTHS</strong></div>
                <div>✅ <strong>ALL PREMIUM FEATURES</strong></div>
                <div>✅ <strong>100 AZR COIN BONUS</strong></div>
            </div>
            <div class="countdown" id="countdown">
                Limited Time Offer!
            </div>
            <p style="font-size: 1.2em;">No Credit Card Required for Trial</p>
        </div>

        <div style="text-align: center; margin: 40px 0;">
            <a href="#signup" class="cta-button">START FREE TRIAL NOW</a>
            <p style="margin-top: 20px; font-size: 1.2em;">
                🇿🇦 Special South African Pricing Available!
            </p>
        </div>

        <div class="pricing-table">
            <div class="pricing-card">
                <h3>Student</h3>
                <div class="price">FREE</div>
                <div class="savings">Earn While You Learn</div>
                <ul style="text-align: left; margin: 20px 0;">
                    <li>✅ 10% Token Allocation</li>
                    <li>✅ All Premium Features</li>
                    <li>✅ Learning Platform</li>
                    <li>✅ Community Access</li>
                </ul>
            </div>

            <div class="pricing-card">
                <h3>Driver</h3>
                <div class="original-price">R149/month</div>
                <div class="price">R75</div>
                <div class="savings">SAVE R74/month</div>
                <ul style="text-align: left; margin: 20px 0;">
                    <li>✅ GPS Tracking</li>
                    <li>✅ Route Optimization</li>
                    <li>✅ Earnings Dashboard</li>
                    <li>✅ Priority Support</li>
                </ul>
            </div>

            <div class="pricing-card popular">
                <div style="background: #ffd700; color: #333; padding: 10px; border-radius: 10px; margin-bottom: 10px;">
                    ⭐ MOST POPULAR
                </div>
                <h3>Business</h3>
                <div class="original-price">R999/month</div>
                <div class="price">R500</div>
                <div class="savings">SAVE R499/month</div>
                <ul style="text-align: left; margin: 20px 0;">
                    <li>✅ Full Suite Access</li>
                    <li>✅ Advanced Analytics</li>
                    <li>✅ Team Management</li>
                    <li>✅ API Integration</li>
                    <li>✅ Custom Branding</li>
                </ul>
            </div>

            <div class="pricing-card">
                <h3>Enterprise</h3>
                <div class="original-price">R4,999/month</div>
                <div class="price">R2,500</div>
                <div class="savings">SAVE R2,499/month</div>
                <ul style="text-align: left; margin: 20px 0;">
                    <li>✅ Everything in Business</li>
                    <li>✅ Dedicated Support</li>
                    <li>✅ Custom Development</li>
                    <li>✅ 99.99% SLA</li>
                    <li>✅ Training Included</li>
                </ul>
            </div>
        </div>

        <div class="features">
            <div class="feature-card">
                <h3>🤖 Self-Healing</h3>
                <p>Automatic error detection and patching. No downtime, ever.</p>
            </div>
            <div class="feature-card">
                <h3>🧠 Self-Learning AI</h3>
                <p>AI models that improve over time. Gets smarter every day.</p>
            </div>
            <div class="feature-card">
                <h3>🔒 Constitutional Governance</h3>
                <p>Rules enforced through code. Transparent and fair.</p>
            </div>
            <div class="feature-card">
                <h3>🌍 Built in Africa</h3>
                <p>Proudly South African. For Africa, by Africans.</p>
            </div>
            <div class="feature-card">
                <h3>💰 Azora Coin Integration</h3>
                <p>Own blockchain. Earn as you use the platform.</p>
            </div>
            <div class="feature-card">
                <h3>🚀 Zero External Dependencies</h3>
                <p>No AWS, Stripe, or OpenAI. Fully self-sufficient.</p>
            </div>
        </div>

        <div style="text-align: center; margin: 60px 0;">
            <h2 style="font-size: 2.5em; margin-bottom: 30px;">Ready to Transform Your Business?</h2>
            <a href="mailto:sizwe.ngwenya@azora.world?subject=Launch Special - Free Trial" class="cta-button">
                GET STARTED NOW
            </a>
            <p style="margin-top: 30px; font-size: 1.2em;">
                Questions? Contact Sizwe: 
                <a href="mailto:sizwe.ngwenya@azora.world" style="color: #ffd700;">
                    sizwe.ngwenya@azora.world
                </a>
                <br>
                📱 +27 73 234 7232
            </p>
        </div>

        <div style="text-align: center; padding: 40px; background: rgba(0,0,0,0.3); border-radius: 20px; margin-top: 40px;">
            <h3 style="margin-bottom: 20px;">Use Promo Codes for Extra Savings!</h3>
            <div style="font-size: 1.2em;">
                <div><strong>SIZWE2025</strong> - Founder Special: 1 Year FREE (sizwe.ngwenya@azora.world)</div>
                <div><strong>LAUNCH50</strong> - 50% off 3 months</div>
                <div><strong>EARLYBIRD</strong> - 75% off first month</div>
                <div><strong>AFRICA25</strong> - 25% off 6 months (Africa only)</div>
            </div>
        </div>

        <div style="text-align: center; margin-top: 60px; padding-bottom: 40px;">
            <p style="font-size: 0.9em; opacity: 0.8;">
                Built with ❤️ in South Africa 🇿🇦 by Sizwe Ngwenya<br>
                From Africa, For Humanity, Towards Infinity 🚀
            </p>
        </div>
    </div>

    <script>
        // Simple countdown timer
        setInterval(() => {
            const end = new Date('2025-12-31T23:59:59Z');
            const now = new Date();
            const diff = end - now;
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            
            document.getElementById('countdown').innerHTML = 
                `Offer ends in ${days} days, ${hours} hours!`;
        }, 1000);
    </script>
</body>
</html>
HTML_EOF

# Install promotions service dependencies
echo "Installing promotional service dependencies..."
cd services/promotions && npm install --silent && cd ../..

# Update main startup script
cat > START_AZORA_OS.sh << 'START_EOF'
#!/bin/bash

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║  🚀 STARTING AZORA OS - LAUNCH READY! 🚀                  ║"
echo "║                                                            ║"
echo "║  🎉 LAUNCH SPECIAL: 1 Month FREE + 50% OFF Next 2!        ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Start promotional service first
echo "Starting Promotional Service..."
cd services/promotions && node index.js > /tmp/promotions.log 2>&1 &
echo "✅ Promotions running (port 4095)"
cd ../..
sleep 2

# Start Azora Pay
if [ -f "infrastructure/azora-pay/index.js" ]; then
  cd infrastructure/azora-pay && node index.js > /tmp/azora-pay.log 2>&1 &
  echo "✅ Azora Pay started (port 5000)"
  cd ../..
fi

# Start Onboarding
if [ -f "services/onboarding/index.js" ]; then
  cd services/onboarding && node index.js > /tmp/onboarding.log 2>&1 &
  echo "✅ Onboarding Service started (port 4070)"
  cd ../..
fi

# Start HR AI Deputy
if [ -f "services/hr-ai-deputy/index.js" ]; then
  cd services/hr-ai-deputy && node index.js > /tmp/hr-ai.log 2>&1 &
  echo "✅ HR AI Deputy started (port 4091)"
  cd ../..
fi

# Start Auth Service
if [ -f "services/auth/index.js" ]; then
  cd services/auth && node index.js > /tmp/auth.log 2>&1 &
  echo "✅ Auth Service started (port 4004)"
  cd ../..
fi

# Open launch page in browser
if [ -f "apps/launch-page/index.html" ]; then
  echo ""
  echo "Opening launch page..."
  sleep 2
  "$BROWSER" "file://$(pwd)/apps/launch-page/index.html" 2>/dev/null || \
    echo "Launch page available at: file://$(pwd)/apps/launch-page/index.html"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ✅ AZORA OS IS NOW LIVE! ✅                              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "🎉 LAUNCH SPECIAL:"
echo "  • 1 Month FREE Trial"
echo "  • 50% OFF Next 2 Months"
echo "  • All Premium Features"
echo "  • 100 AZR Coin Bonus"
echo ""
echo "Access Points:"
echo "  • Launch Page: file://$(pwd)/apps/launch-page/index.html"
echo "  • Promotions API: http://localhost:4095/launch-offer"
echo "  • Azora Pay: http://localhost:5000"
echo "  • Onboarding: http://localhost:4070/pricing"
echo ""
echo "Special Promo Codes:"
echo "  • SIZWE2025 - Founder 1 Year FREE (sizwe.ngwenya@azora.world)"
echo "  • LAUNCH50 - 50% off 3 months"
echo "  • EARLYBIRD - 75% off first month"
echo "  • AFRICA25 - 25% off 6 months (Africa)"
echo ""
echo "Contact: sizwe.ngwenya@azora.world | +27 73 234 7232"
echo ""
echo "Logs:"
echo "  • Promotions: /tmp/promotions.log"
echo "  • Azora Pay: /tmp/azora-pay.log"
echo "  • Onboarding: /tmp/onboarding.log"
echo ""
START_EOF

chmod +x START_AZORA_OS.sh

# Create promotional email template
cat > LAUNCH_EMAIL.md << 'EMAIL_EOF'
# Azora OS - Launch Email Template

**Subject:** 🚀 Azora OS Launch: 1 Month FREE + 50% OFF Next 2 Months!

---

Hi there! 👋

**Exciting news from South Africa! 🇿🇦**

I'm Sizwe Ngwenya, and I'm thrilled to announce the official launch of **Azora OS** - Africa's first trillion-dollar operating system!

## 🎉 LAUNCH SPECIAL OFFER

For a limited time, I'm offering:

✅ **1 MONTH FREE TRIAL** (No credit card required)  
✅ **50% OFF for the next 2 months**  
✅ **All premium features included**  
✅ **100 AZR Coin starter pack** (FREE)  
✅ **Priority support**

## 💰 South African Pricing (ZAR)

| Plan | Regular | Launch Special | You Save |
|------|---------|----------------|----------|
| Driver | R149/mo | **R75/mo** | R74/month |
| Business | R999/mo | **R500/mo** | R499/month |
| Enterprise | R4,999/mo | **R2,500/mo** | R2,499/month |

*International pricing available in USD, GBP, NGN, KES*

## 🚀 What Makes Azora OS Special?

- **Self-Healing**: Automatic error detection and patching
- **Self-Learning AI**: Gets smarter every day
- **Zero External Dependencies**: No AWS, Stripe, or OpenAI
- **Constitutional Governance**: Transparent and fair
- **Built in Africa**: Proudly South African 🇿🇦
- **Azora Coin Integration**: Earn as you use

## 🎁 Exclusive Promo Codes

- **SIZWE2025** - Founder Special: 1 Year FREE *(sizwe.ngwenya@azora.world only)*
- **LAUNCH50** - 50% off for 3 months
- **EARLYBIRD** - 75% off first month
- **AFRICA25** - 25% off for 6 months *(Africa only)*

## 📞 Get Started

**Email:** sizwe.ngwenya@azora.world  
**Phone:** +27 73 234 7232  
**Website:** www.azora.world

Start your free trial today - no credit card required!

---

*Built with ❤️ in South Africa 🇿🇦*  
*From Africa, For Humanity, Towards Infinity 🚀*

**Sizwe Ngwenya**  
Founder & Chief Architect  
Azora OS (Pty) Ltd
EMAIL_EOF

echo ""
echo "✅ Launch preparation complete!"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "LAUNCH CHECKLIST"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "✅ Promotional pricing service created"
echo "✅ Launch landing page created"
echo "✅ Country-specific pricing (SA in ZAR)"
echo "✅ Promo codes configured:"
echo "   • SIZWE2025 - 1 Year FREE for sizwe.ngwenya@azora.world"
echo "   • LAUNCH50 - 50% off 3 months"
echo "   • EARLYBIRD - 75% off first month"
echo "   • AFRICA25 - 25% off 6 months (Africa)"
echo ""
echo "✅ Premium features:"
echo "   • Advanced Analytics Dashboard"
echo "   • API Access"
echo "   • Custom Branding"
echo "   • Priority 24/7 Support"
echo "   • Mobile Apps (iOS & Android)"
echo "   • Unlimited Users"
echo ""
echo "✅ Trial offer:"
echo "   • 30 days FREE"
echo "   • No credit card required"
echo "   • Full premium access"
echo "   • 100 AZR bonus"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "NEXT STEPS"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "1. Start services:"
echo "   ./START_AZORA_OS.sh"
echo ""
echo "2. Test promotional endpoint:"
echo "   curl http://localhost:4095/launch-offer?country=ZA"
echo ""
echo "3. Test trial signup:"
echo "   curl -X POST http://localhost:4095/trial/start \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -d '{\"email\":\"sizwe.ngwenya@azora.world\",\"fullName\":\"Sizwe Ngwenya\",\"role\":\"business\",\"country\":\"ZA\",\"promoCode\":\"SIZWE2025\"}'"
echo ""
echo "4. Open launch page in browser:"
echo "   file://$(pwd)/apps/launch-page/index.html"
echo ""
echo "5. Share LAUNCH_EMAIL.md with customers"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "🎉 READY FOR LAUNCH! 🚀"
echo ""
echo "Contact: sizwe.ngwenya@azora.world | +27 73 234 7232"
echo "🇿🇦 From Africa, For Humanity, Towards Infinity 🚀"
echo ""
