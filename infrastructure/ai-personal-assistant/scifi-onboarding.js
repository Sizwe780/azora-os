/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Sci-Fi Level Onboarding Experience
 * Immersive, interactive, and intelligent
 */

const express = require('express');
const router = express.Router();
const { ARIA } = require('./azora-ai-assistant');

class SciFiOnboarding {
  constructor(userId) {
    this.userId = userId;
    this.step = 0;
    this.userProfile = {};
    this.aria = new ARIA(userId);
  }

  async start() {
    return {
      step: 0,
      message: `
🌟 Welcome to Azora OS

*A holographic interface materializes before you*

I'm ARIA, your personal AI assistant. I've been waiting for you.

Before we begin your journey, I need to learn about you. 
Not just your name and email - I want to understand who you are, 
what drives you, and how I can help you achieve your dreams.

Ready to begin?
      `,
      animation: 'hologram_appear',
      voice: true,
      options: [
        { text: "Yes, let's do this!", value: 'start', primary: true },
        { text: 'Tell me more first', value: 'info' },
      ],
    };
  }

  async processStep(step, data) {
    this.step = step;
    
    switch (step) {
      case 1:
        return await this.stepPersonalInfo(data);
      case 2:
        return await this.stepGoals(data);
      case 3:
        return await this.stepSkills(data);
      case 4:
        return await this.stepFinancialGoals(data);
      case 5:
        return await this.stepAICalibration(data);
      case 6:
        return await this.stepComplete(data);
      default:
        return this.start();
    }
  }

  async stepPersonalInfo(data) {
    this.userProfile.personalInfo = data;

    return {
      step: 1,
      message: `
Perfect, ${data.firstName}. 

*ARIA's eyes glow brighter*

I'm analyzing your profile... 

✓ Identity verified
✓ Creating secure wallet
✓ Initializing learning algorithms
✓ Deploying personalized AI models

Now, tell me about your dreams. What brings you to Azora?
      `,
      animation: 'scanning_user',
      fields: [
        {
          name: 'goals',
          type: 'multiselect',
          label: 'What are you here to achieve?',
          options: [
            'Learn new skills',
            'Earn money while learning',
            'Start a business',
            'Build a tech career',
            'Financial freedom',
            'Help my community',
            'Change the world',
          ],
        },
      ],
    };
  }

  async stepGoals(data) {
    this.userProfile.goals = data.goals;

    return {
      step: 2,
      message: `
${data.goals.join(', ')} - I love it. Those are powerful goals.

*ARIA pulls up a holographic display of opportunities*

Based on your goals, I'm calculating your optimal path...

Let me understand your starting point. What skills do you already have?
      `,
      animation: 'calculating_path',
      fields: [
        {
          name: 'currentSkills',
          type: 'tags',
          label: 'Your current skills',
          suggestions: [
            'Programming', 'Design', 'Marketing', 'Sales', 
            'Writing', 'Business', 'Leadership', 'None yet - ready to learn!',
          ],
        },
        {
          name: 'learningStyle',
          type: 'select',
          label: 'How do you learn best?',
          options: [
            { value: 'video', label: 'Video tutorials' },
            { value: 'reading', label: 'Reading documentation' },
            { value: 'hands-on', label: 'Hands-on projects' },
            { value: 'mentorship', label: 'One-on-one mentorship' },
          ],
        },
      ],
    };
  }

  async stepSkills(data) {
    this.userProfile.skills = data;

    // AI calculates earning potential
    const earningPotential = this.calculateEarningPotential(this.userProfile);

    return {
      step: 3,
      message: `
Excellent. I'm building your personalized learning path now...

*Numbers and graphs float around ARIA*

Based on your profile, here's what I calculated:

📊 Your Earning Potential:
   • First month: ${earningPotential.firstMonth} AZR ($${earningPotential.firstMonth})
   • First year: ${earningPotential.firstYear} AZR ($${earningPotential.firstYear})
   • At full potential: ${earningPotential.max} AZR/month

This isn't just numbers - this is your future.

What's your primary financial goal right now?
      `,
      animation: 'projecting_future',
      fields: [
        {
          name: 'financialGoal',
          type: 'select',
          label: 'Primary financial goal',
          options: [
            { value: 'supplement_income', label: 'Supplement my income' },
            { value: 'full_time_income', label: 'Build full-time income' },
            { value: 'save_for_goal', label: 'Save for specific goal' },
            { value: 'financial_independence', label: 'Financial independence' },
          ],
        },
        {
          name: 'targetAmount',
          type: 'number',
          label: 'Target monthly income (USD)',
          placeholder: 'e.g., 1000',
        },
      ],
    };
  }

  async stepFinancialGoals(data) {
    this.userProfile.financial = data;

    return {
      step: 4,
      message: `
${data.targetAmount ? `$${data.targetAmount}/month` : 'Your financial goal'} - I'm going to help you achieve that.

*ARIA extends a holographic hand*

Now for the final step: I need to calibrate my AI specifically for you.

I'm going to ask you a few quick questions. There are no wrong answers - 
I just need to understand how you think so I can serve you better.

Ready?
      `,
      animation: 'extending_hand',
      fields: [
        {
          name: 'workingStyle',
          type: 'slider',
          label: 'I prefer to work...',
          min: { label: 'Early morning', value: 0 },
          max: { label: 'Late night', value: 100 },
        },
        {
          name: 'autonomy',
          type: 'slider',
          label: 'I prefer...',
          min: { label: 'Guided step-by-step', value: 0 },
          max: { label: 'Full autonomy', value: 100 },
        },
        {
          name: 'communication',
          type: 'slider',
          label: 'When I communicate...',
          min: { label: 'Brief and direct', value: 0 },
          max: { label: 'Detailed and thorough', value: 100 },
        },
      ],
    };
  }

  async stepAICalibration(data) {
    this.userProfile.preferences = data;

    // Create user account and initialize ARIA
    await this.createUserAccount();
    await this.aria.initialize();

    // Calculate personalized onboarding reward
    const bonus = this.calculateOnboardingBonus(this.userProfile);

    return {
      step: 5,
      message: `
*A burst of light as ARIA fully materializes*

Perfect. I'm calibrated and ready to serve you, ${this.userProfile.personalInfo.firstName}.

Creating your account...
✓ Secure wallet created
✓ AI models deployed
✓ Learning path generated
✓ Earning opportunities identified

🎁 Welcome Bonus: ${bonus} AZR (worth $${bonus})

I've already found ${this.findInitialOpportunities()} opportunities 
perfectly matched to your profile. Want to see them?

Welcome to Azora. Let's build your future together.
      `,
      animation: 'full_materialization',
      actions: [
        { text: 'Show me my dashboard', value: 'dashboard', primary: true },
        { text: 'Start earning now', value: 'opportunities' },
      ],
    };
  }

  async stepComplete(data) {
    return {
      step: 6,
      complete: true,
      redirect: '/dashboard',
    };
  }

  calculateEarningPotential(profile) {
    const baseEarning = 50; // Base monthly earning
    const skillMultiplier = (profile.skills?.currentSkills?.length || 0) * 10;
    const goalMultiplier = (profile.goals?.length || 0) * 5;

    return {
      firstMonth: baseEarning + 20,
      firstYear: (baseEarning + skillMultiplier) * 10,
      max: baseEarning + skillMultiplier + goalMultiplier + 100,
    };
  }

  calculateOnboardingBonus(profile) {
    // More complete profiles get higher bonuses
    let bonus = 10; // Base signup bonus

    if (profile.goals?.length >= 3) bonus += 2;
    if (profile.skills?.currentSkills?.length > 0) bonus += 3;
    if (profile.financial?.targetAmount) bonus += 5;

    return bonus;
  }

  findInitialOpportunities() {
    return Math.floor(Math.random() * 10) + 5; // 5-15 opportunities
  }

  async createUserAccount() {
    // In production, create actual user account
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

// API Routes
router.post('/onboarding/start', async (req, res) => {
  const { userId } = req.body;
  const onboarding = new SciFiOnboarding(userId);
  
  const step = await onboarding.start();
  res.json(step);
});

router.post('/onboarding/step', async (req, res) => {
  const { userId, step, data } = req.body;
  const onboarding = new SciFiOnboarding(userId);
  
  const nextStep = await onboarding.processStep(step, data);
  res.json(nextStep);
});

module.exports = router;
