# Azora OS Architecture

## Overview
Azora OS is a comprehensive African-focused software infrastructure for crypto, identity, and DeFi. It consists of 140+ microservices, PWAs, and integrations.

## Core Components
- **Services**: Modular Node.js services (e.g., identity.js for user onboarding, ai-trading.js for automated trading).
- **Apps**: PWAs (driver-pwa, main-app) using shared-ui components for consistency.
- **Contracts**: Solidity contracts in azora-coin/ for AZR token.
- **Infrastructure**: Compliance checkers, quantum services.

## Service Classes
- IdentityService: Handles onboarding, verification.
- MintingService: Manages AZR minting with PoC.
- TradingService: AI-driven trades.
- SubscriptionService: Manages plans (Basic: $10/month, Premium: $50/month).

## Integration
Services communicate via REST APIs. Data synced every minute for real-time valuation.

## For Developers
- Clone repo, run npm install, ./start-all.sh.
- Add new services in services/, update start-all.sh.
- Use shared-ui for consistent UI.

This ensures easy continuation of development.
