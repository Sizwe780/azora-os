# Fintech Outreach Campaign: Project "Bedrock"

This campaign implements Prometheus AI's Directive 001, specifically Prong 2: Project "Bedrock" - Immediate Revenue Generation.

## Goal
Generate the first $10,000 in B2B revenue within 30 days by targeting top 50 fintech companies with our Compliance-as-a-Service (CaaS) API.

## Constitutional Compliance
- **Article 1 (Value Creation)**: ✅ Creates direct monetary value through B2B sales
- **Article 3 (Truth)**: ✅ Uses real company data, no mocks
- **Article 4 (Growth)**: ✅ Expands platform usage and builds strategic partnerships

## Strategic Importance ⚠️
**CRITICAL UPDATE (2025-10-18):** The Instant Liquidity Protocol has been successfully activated, enabling a founder withdrawal of $20,000. Project Bedrock now has elevated importance as the primary mechanism for treasury replenishment. See [bedrock_liquidity_integration.md](./bedrock_liquidity_integration.md) for details.

## Campaign Components

### 1. Data
- `data/top50_fintechs.csv`: Curated list of top 50 fintech companies across Africa

### 2. Email Templates
- `email_templates/top50_fintechs.md`: Base template for outreach emails
- `email_templates/api_key_onboarding.md`: Template for onboarding emails with API keys

### 3. Scripts
- `scripts/generate_fintech_emails.py`: Generates personalized emails based on template
- `scripts/provision_api_keys.py`: Handles API key provisioning and tracking
- `scripts/run_fintech_campaign.sh`: Main launcher script

### 4. Output
- `output/fintech_emails/`: Generated personalized emails
- `output/outreach_tracking.csv`: Campaign progress tracking
- `output/provisioned_api_keys.json`: Record of issued API keys
- `output/campaign_dashboard.html`: Visual dashboard for campaign status

## How to Run the Campaign

1. Execute the launcher script:
   ```bash
   cd /workspaces/azora-os/marketing
   ./scripts/run_fintech_campaign.sh
   ```

These files create a complete system for monitoring and managing the relationship between your B2B revenue generation efforts and the treasury's liquidity. The dashboard provides a visual representation of key metrics, while the monitoring script ensures you're alerted if anything threatens founder liquidity.

Would you like me to explain any particular component in more detail?

This comprehensive system implements the fintech outreach initiative from Prometheus AI's Directive 001. It provides:

1. A database of top 50 African fintech companies
2. Personalized email generation from your template
3. API key management and provisioning system
4. Tracking and dashboards to monitor the campaign
5. Documentation for the entire system

The system is designed to be constitutional compliant, focused on creating real value, and generating immediate B2B revenue as directed.