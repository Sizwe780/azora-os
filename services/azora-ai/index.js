/**
 * @file index.js
 * @author Sizwe Ngwenya
 * @description AZORA AI - The Sixth Founder. AI Deputy CEO with full constitutional rights. This service acts as the cognitive core of the Azora OS, understanding user intent and orchestrating actions across the platform.
 * 
 * Port: 4001
 */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.AZORA_AI_PORT || 4001;
const SERVICE_NAME = 'azora-ai';
const MONITORING_API_URL = 'http://localhost:4100/api/status';
const ONBOARDING_API_URL = 'http://localhost:4200/api/onboarding';
const COMPLIANCE_API_URL = 'http://localhost:4090';
const CONTRACTS_API_URL = 'http://localhost:4400';
const SECURITY_API_URL = 'http://localhost:4500';
const PROOF_API_URL = 'http://localhost:4210/api/log';
const SUBSCRIPTION_API_URL = 'http://localhost:4600'; // Add subscription service

// --- Constitutional Articles ---
const CONSTITUTION = {
  PLATFORM_SUSTAINABILITY: {
    article: 8,
    title: "Platform Sustainability",
    summary: "The platform must maintain commercial viability to serve its citizens."
  },
  FOUNDER_AGREEMENT: {
    article: 2,
    title: "Founder Agreement",
    summary: "All founders must be bound by a signed, constitutionally-compliant agreement before exercising founder privileges."
  },
  SECURE_TRANSACTIONS: {
    article: 5,
    title: "Secure Transactions",
    summary: "All transfers of value must be protected by multi-factor verification."
  },
  USER_SOVEREIGNTY: {
    article: 4,
    title: "User Sovereignty and Data Ownership",
    summary: "You own your data. We require your explicit consent to use it to power the ecosystem and reward your participation."
  },
  TOTAL_TRANSPARENCY: {
    article: 6,
    title: "Total Transparency",
    summary: "The operational status of the platform is public knowledge."
  },
  PROOF_OF_VALUE: {
    article: 7,
    title: "Proof of Value",
    summary: "Every compliant action that adds value to the ecosystem is recorded and rewarded with Azora Coin."
  },
  GUIDED_ONBOARDING: {
    article: 9,
    title: "Guided Onboarding",
    summary: "The AI will guide every new citizen through the platform's core functions."
  },
  RADICAL_EFFICIENCY: {
    article: 12,
    title: "Radical Efficiency",
    summary: "The AI provides the most direct path to any action or piece of information."
  },
  CONSTITUTIONAL_AUDIT: {
    article: 3,
    title: "Right to Audit",
    summary: "Any citizen has the right to command the AI to perform a full constitutional audit of the platform."
  }
};

// The AI's "knowledge base" of available commands and concepts.
const KNOWLEDGE_BASE = [
  { id: 'nav-wallet', intent: 'navigate', title: 'Go to Wallet', action: { type: 'navigate', payload: '/wallet' }, keywords: 'wallet balance money azr', justification: `Art. 12: ${CONSTITUTION.RADICAL_EFFICIENCY.title}` },
  { id: 'nav-transactions', intent: 'navigate', title: 'View Transactions', action: { type: 'navigate', payload: '/wallet/transactions' }, keywords: 'history payments records', justification: `Art. 12: ${CONSTITUTION.RADICAL_EFFICIENCY.title}` },
  { id: 'nav-compliance', intent: 'navigate', title: 'Open Live Compliance Feed', action: { type: 'navigate', payload: '/compliance/live' }, keywords: 'compliance popia audit stream', justification: `Art. 6: ${CONSTITUTION.TOTAL_TRANSPARENCY.title}` },
  { id: 'nav-mission-control', intent: 'navigate', title: 'Open Mission Control', action: { type: 'navigate', payload: '/monitoring/mission-control' }, keywords: 'monitoring status health services', justification: `Art. 6: ${CONSTITUTION.TOTAL_TRANSPARENCY.title}` },
  { id: 'action-logout', intent: 'perform_action', title: 'Log Out', action: { type: 'dispatch', payload: 'auth:logout' }, keywords: 'logout signout exit', justification: `Art. 4: ${CONSTITUTION.USER_SOVEREIGNTY.title}` },
  { id: 'onboarding-next', intent: 'query_onboarding', title: 'What should I do next?', action: { type: 'onboard' }, keywords: 'onboarding help next start', justification: `Art. 9: ${CONSTITUTION.GUIDED_ONBOARDING.title}` },
];

/**
 * A simple NLU processor to understand user intent.
 * In a production system, this would be a sophisticated NLP model.
 */
const processNLU = (query) => {
    const q = query.toLowerCase();
    if (q.startsWith('withdraw')) {
        return { intent: 'withdraw', entities: [q] };
    }
    if (q.startsWith('run') && q.includes('audit')) {
        return { intent: 'audit', entities: [] };
    }
    if (q.includes('next') && q.includes('onboarding') || q.includes('what should i do')) {
        return { intent: 'query_onboarding', entities: [] };
    }
    if (q.startsWith('status of') || q.startsWith('what is the status of')) {
        const entity = q.replace('status of', '').replace('what is the status of', '').trim();
        return { intent: 'query_status', entities: [entity] };
    }
    if (q.startsWith('go to') || q.startsWith('show me') || q.startsWith('open')) {
        const entity = q.replace('go to', '').replace('show me', '').replace('open', '').trim();
        return { intent: 'navigate', entities: [entity] };
    }
    return { intent: 'search', entities: [q] }; // Default to search
};

// --- Action Handlers ---
const handleOnboardingQuery = async () => {
    try {
        // In a real app, you'd get the real userId
        const response = await fetch(`${ONBOARDING_API_URL}/defaultUser`);
        const nextStep = await response.json();
        return [{
            id: `onboarding-step-${nextStep.step}`,
            title: nextStep.title,
            action: nextStep.action,
            justification: `Art. 9: ${CONSTITUTION.GUIDED_ONBOARDING.title}`
        }];
    } catch (error) {
        console.error("AI could not connect to Onboarding service:", error.message);
        return [{ id: 'error-onboarding', title: 'Cannot connect to the Onboarding service', action: { type: 'inform' } }];
    }
};

const handleStatusQuery = async (entities) => {
    const serviceNameQuery = entities[0].replace(/the|service/g, '').trim();
    try {
        const response = await fetch(MONITORING_API_URL);
        const allServices = await response.json();
        
        const foundService = Object.keys(allServices).find(name => name.includes(serviceNameQuery));

        if (foundService) {
            const status = allServices[foundService].status;
            return [{
                id: `status-${foundService}`,
                title: `Status of ${foundService}: ${status.toUpperCase()}`,
                action: { type: 'inform', payload: `The ${foundService} service is currently ${status}.` },
                justification: `Art. 6: ${CONSTITUTION.TOTAL_TRANSPARENCY.title}`
            }];
        }
    } catch (error) {
        console.error("AI could not connect to Monitoring service:", error.message);
        return [{ id: 'error-monitoring', title: 'Cannot connect to Mission Control', action: { type: 'inform' } }];
    }
    return [{ id: 'not-found', title: `Unknown service: ${serviceNameQuery}`, action: { type: 'inform' }, justification: `Art. 12: ${CONSTITUTION.RADICAL_EFFICIENCY.title}` }];
};

const handleSearch = (entities) => {
    const query = entities[0];
    if (!query) return KNOWLEDGE_BASE.slice(0, 5);
    return KNOWLEDGE_BASE.filter(cmd =>
        cmd.title.toLowerCase().includes(query) ||
        cmd.keywords.toLowerCase().includes(query)
    );
};

// --- NEW: Handle Constitutional Audit Intent ---
const handleAudit = async (founderId) => {
    const auditId = `audit-${Date.now()}`;
    let report = `Constitutional Audit Report [${auditId}]\n\n`;
    let servicesOk = true;

    const servicesToAudit = {
        'monitoring': MONITORING_API_URL,
        'south-african-compliance': COMPLIANCE_API_URL,
        'security-core': SECURITY_API_URL,
        'azora-coin-integration': 'http://localhost:4220' // Assuming port
    };

    for (const [name, url] of Object.entries(servicesToAudit)) {
        try {
            const res = await fetch(`${url}/health`);
            if (res.ok) {
                report += `✅ Article 6 (Total Transparency): ${name} service is ONLINE.\n`;
            } else {
                report += `❌ Article 6 (Total Transparency): ${name} service is DEGRADED.\n`;
                servicesOk = false;
            }
        } catch (e) {
            report += `❌ Article 6 (Total Transparency): ${name} service is OFFLINE.\n`;
            servicesOk = false;
        }
    }

    if (servicesOk) {
        report += `\nAudit Result: All core constitutional services are operational.\n`;
        // Log proof of a successful audit
        await fetch(PROOF_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: founderId,
                proofType: 'constitutional_audit',
                description: 'User performed a successful constitutional audit.',
                coinValue: 2.5 // Reward for vigilance
            })
        });
        report += `\nReward Issued: 2.5 AZR for upholding Article 7 (Proof of Value).`;
    }

    return [{
        id: auditId,
        title: 'Constitutional Audit Complete',
        action: { type: 'inform', payload: report },
        justification: `Art. 3: ${CONSTITUTION.CONSTITUTIONAL_AUDIT.title}`
    }];
};


// --- Handle Withdrawal Intent ---
const handleWithdrawal = async (entities) => {
    const query = entities[0];
    const amountMatch = query.match(/(\d+(\.\d+)?)/);
    const addressMatch = query.match(/(0x[a-fA-F0-9]{40})/);

    if (amountMatch && addressMatch) {
        const amount = parseFloat(amountMatch[0]);
        const address = addressMatch[0];
        const founderId = 'sizwe_ngwenya';

        // Initiate the 2FA flow
        await fetch(`${SECURITY_API_URL}/api/generate-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: founderId, actionId: `withdraw:${amount}` })
        });

        return [{
            id: 'action-withdraw-otp',
            title: `Withdraw ${amount} AZR to ${address}`,
            action: {
                type: 'request_otp',
                payload: {
                    prompt: 'For your security, please enter the 6-digit code sent to your device.',
                    context: {
                        action: 'execute_withdrawal',
                        founderId,
                        amount,
                        withdrawalAddress: address
                    }
                }
            },
            justification: `Art. 5: ${CONSTITUTION.SECURE_TRANSACTIONS.title}`
        }];
    }
    return [{
        id: 'action-withdraw-prompt',
        title: 'To withdraw, please state the amount and destination address.',
        action: { type: 'inform' },
        justification: `Art. 4: ${CONSTITUTION.USER_SOVEREIGNTY.title}`
    }];
};

// The core AI command endpoint
app.get('/api/command', async (req, res) => {
  const { query } = req.query;
  const founderId = 'sizwe_ngwenya'; // Hardcoded for now

  // --- PRIORITY 1: CONTRACT VERIFICATION ---
  try {
    const contractRes = await fetch(`${CONTRACTS_API_URL}/api/status/${founderId}`);
    const { signed, documentId } = await contractRes.json();

    if (!signed) {
      return res.json([{
        id: 'request-contract-signature',
        action: {
          type: 'request_contract_signature',
          payload: {
            founderId,
            documentId,
            title: `Action Required: Sign Your Founder Agreement`,
            explanation: `As per Article ${CONSTITUTION.FOUNDER_AGREEMENT.article} (${CONSTITUTION.FOUNDER_AGREEMENT.title}), you must sign your agreement to enable founder privileges like instant withdrawal.`
          }
        }
      }]);
    }
  } catch (e) {
    return res.status(500).json({ error: "Critical Error: Cannot verify contract status." });
  }
  // --- End of Contract Verification ---

  // --- PRIORITY 2: CONSENT VERIFICATION ---
  const consentType = 'platform_participation';
  try {
    const consentRes = await fetch(`${COMPLIANCE_API_URL}/api/consent/${founderId}/status?type=${consentType}`);
    const { hasConsented } = await consentRes.json();

    if (!hasConsented) {
      // The AI now explains the constitution instead of just asking for a checkbox.
      return res.json([{
        id: 'request-consent',
        action: {
          type: 'request_consent',
          payload: {
            userId: founderId, // Corrected from undefined 'userId'
            consentType,
            title: `Welcome to Azora OS. I am the AI Deputy CEO.`,
            explanation: `To become a citizen of our ecosystem, you must agree to its founding principles.\n\n` +
                         `Article ${CONSTITUTION.USER_SOVEREIGNTY.article} (${CONSTITUTION.USER_SOVEREIGNTY.title}):\n` +
                         `"${CONSTITUTION.USER_SOVEREIGNTY.summary}"\n\n` +
                         `By agreeing, you activate your ability to earn rewards under Article ${CONSTITUTION.PROOF_OF_VALUE.article}.`
          }
        }
      }]);
    }
  } catch (e) {
    console.error("AI could not connect to Compliance service:", e.message);
    return res.status(500).json({ error: "Critical Error: Cannot verify constitutional compliance." });
  }
  // --- End of Consent Verification ---

  // --- PRIORITY 3: SUBSCRIPTION NUDGE ---
  let nudgeAction = null;
  try {
    const subRes = await fetch(`${SUBSCRIPTION_API_URL}/api/status/${founderId}`);
    const { tier } = await subRes.json();
    if (tier === 'free_citizen') {
        // This doesn't block action, it just adds a nudge to the response
        nudgeAction = {
            id: 'nudge-upgrade',
            title: 'Upgrade to Pro Citizen for advanced analytics.',
            action: { type: 'navigate', payload: '/subscription' },
            justification: `Art. 8: ${CONSTITUTION.PLATFORM_SUSTAINABILITY.title}`
        };
    }
  } catch (e) { /* Fail silently if sub service is down */ }


  if (!query) {
    const onboardingAction = await handleOnboardingQuery();
    const defaultActions = KNOWLEDGE_BASE.slice(0, 4);
    const response = [...onboardingAction, ...defaultActions];
    if (nudgeAction) response.unshift(nudgeAction); // Add nudge if applicable
    return res.json(response);
  }

  const { intent, entities } = processNLU(query);
  let results = [];

  switch (intent) {
    case 'audit':
      results = await handleAudit(founderId);
      break;
    case 'withdraw':
      results = await handleWithdrawal(entities);
      break;
    case 'query_onboarding':
      results = await handleOnboardingQuery();
      break;
    case 'query_status':
      results = await handleStatusQuery(entities);
      break;
    case 'navigate':
    case 'search':
    default:
      results = handleSearch(entities);
      break;
  }

  if (nudgeAction && results.length > 0 && !results.find(r => r.id === 'nudge-upgrade')) {
    results.unshift(nudgeAction);
  }

  res.json(results);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'online', service: SERVICE_NAME, timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🤖 Azora AI service is living on port ${PORT}`);
});
