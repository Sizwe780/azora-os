# Azora Economy System - Phase 12

## Overview

The Azora Economy implements a **Proof-of-Knowledge (PoK)** token system that rewards users with **AZR tokens** for valuable contributions to the ecosystem. This system embodies the **Ubuntu Philosophy**: "I am because we are" — emphasizing mutual prosperity and community benefit.

## Constitutional Principles

### Article III, Section 3.1: Community Tax
- **1% of all earnings** are automatically contributed to the **Citadel Fund**
- This ensures mutual prosperity and funds community initiatives
- All transactions are transparent and immutable

### Truth Economics
- **No hidden fees or inflation**
- All token awards and tax contributions are fully visible
- Transaction history is permanently recorded
- "Truth Score" displayed in wallet (always 100% for full transparency)

## Components

### 1. Mining Engine (`lib/economy/mining-engine.ts`)

The core reward distribution system that awards AZR tokens based on quality contributions.

#### Token Reward Amounts

| Action | Reward | Description |
|--------|--------|-------------|
| **CODE_COMMIT** | 1 AZR | Quality code commit (verified by Themba) |
| **SPEC_RATIFICATION** | 2 AZR | Specification approved (verified by Nia) |
| **TUTORIAL_COMPLETION** | 5 AZR | Successfully completed learning module |
| **PEER_TEACHING** | 3 AZR | Helped another developer |
| **CONTENT_CREATION** | 4 AZR | Created educational content |
| **COMMUNITY_CONTRIBUTION** | 2 AZR | Other valuable contributions |

#### Key Functions

```typescript
// Award tokens for a verified action
await awardTokens(
  userId: string,
  action: RewardAction,
  value?: number,
  metadata?: Record<string, any>
)

// Verify work quality before awarding
await verifyAndAward(
  userId: string,
  action: RewardAction,
  workContent: string,
  metadata?: Record<string, any>
)

// Get wallet balance
const balance = await getWalletBalance(userId: string)

// Get transaction history
const history = await getTransactionHistory(userId: string, limit?: number)
```

#### Quality Verification

The mining engine includes quality checks to prevent spam:
- Rejects empty or very short submissions
- Filters out spam patterns
- For code commits: Verifies presence of actual code structures
- For specs: Ensures sufficient detail and completeness
- Future: Integration with AI agents (Themba for code, Nia for specs)

### 2. AzoraVault Component (`components/economy/azora-vault.tsx`)

A React component that displays the user's wallet information.

#### Features
- **Balance Display**: Shows current AZR token balance
- **Transaction History**: Scrollable list of recent transactions
- **Status Badge**: Displays wallet status (Sovereign/Pooled)
- **Truth Score**: Shows transparency score (always 100%)
- **Earning Opportunities**: Lists ways to earn more tokens

#### Usage

```tsx
import { AzoraVault } from '@/components/economy/azora-vault'

<AzoraVault userId={user.id} className="custom-class" />
```

### 3. API Endpoints

#### GET `/api/economy/wallet`
Returns wallet information for the authenticated user.

**Response:**
```json
{
  "balance": 125,
  "transactions": [...],
  "status": "sovereign",
  "truthScore": 100
}
```

#### POST `/api/economy/award`
Awards tokens to a user (requires authentication).

**Request:**
```json
{
  "userId": "user123",  // Optional, defaults to authenticated user
  "action": "CODE_COMMIT",
  "value": 1,  // Optional, uses standard amount if not provided
  "workContent": "function hello() {...}",  // Optional, for quality verification
  "metadata": {
    "commitHash": "abc123",
    "repository": "azora/buildspaces"
  }
}
```

**Response:**
```json
{
  "success": true,
  "transactionId": "tx_abc123",
  "amount": 1,
  "netAmount": 0.99,
  "taxAmount": 0.01
}
```

## Database Schema

The economy system uses the following existing models from the main Prisma schema:

### Wallet
```prisma
model Wallet {
  id        String   @id @default(cuid())
  userId    String
  currency  String   // AZR, BTC, ETH, USD
  balance   Decimal  @default(0)
  address   String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user         User          @relation(...)
  transactions Transaction[]
  
  @@unique([userId, currency])
}
```

### Transaction
```prisma
model Transaction {
  id          String            @id @default(cuid())
  walletId    String
  type        TransactionType   // MINING_REWARD, CREDIT, etc.
  amount      Decimal
  currency    String
  status      TransactionStatus
  description String
  metadata    Json?
  createdAt   DateTime          @default(now())
  
  wallet Wallet @relation(...)
}
```

### MiningActivity
```prisma
model MiningActivity {
  id           String       @id @default(cuid())
  userId       String
  activityType MiningType
  tokensEarned Decimal
  metadata     Json?
  status       MiningStatus
  startedAt    DateTime     @default(now())
  completedAt  DateTime?
  
  user User @relation(...)
}
```

## Integration Examples

### Award Tokens for Code Commit

```typescript
import { awardTokens } from '@/lib/economy/mining-engine'

// After successful code commit
const result = await awardTokens(
  userId,
  'CODE_COMMIT',
  undefined,
  {
    commitHash: commit.sha,
    repository: 'azora/buildspaces',
    filesChanged: 5
  }
)

if (result.success) {
  console.log(`Awarded ${result.netAmount} AZR (${result.taxAmount} to Citadel Fund)`)
}
```

### Display Wallet in Dashboard

```tsx
import { AzoraVault } from '@/components/economy/azora-vault'
import { useSession } from 'next-auth/react'

export default function Dashboard() {
  const { data: session } = useSession()
  
  return (
    <div>
      <h1>Dashboard</h1>
      <AzoraVault userId={session?.user?.id} />
    </div>
  )
}
```

## Configuration

### Environment Variables

```bash
# Database (required for economy features)
DATABASE_URL=postgresql://user:password@localhost:5432/azora

# Feature Flags
AZR_MINT_ENABLED=false        # Enable token minting
AZR_TOTAL_SUPPLY=1000000000   # Total token supply
AZR_CHAIN=ethereum            # Blockchain for future integration
```

### Graceful Degradation

The economy system gracefully handles missing database configuration:
- If `DATABASE_URL` is not set, wallet features will show an error
- API endpoints return appropriate error messages
- Mining engine returns `{ success: false, error: 'Database not configured' }`

## Testing

### Run Tests

```bash
npm test -- tests/lib/economy/mining-engine.test.ts
```

### Test Coverage

The test suite covers:
- ✅ Reward amount calculations
- ✅ Community Tax (1%) calculation
- ✅ Quality verification (spam detection)
- ✅ Constitutional compliance
- ✅ Ubuntu Philosophy principles
- ✅ Database unavailable scenarios

## Future Enhancements

### Phase 13: AI Agent Integration
- **Themba**: Automated code quality verification
- **Nia**: Spec completeness validation
- Real-time quality scoring

### Phase 14: Blockchain Integration
- Smart contract deployment for AZR token
- On-chain transaction recording
- NFT minting for achievements

### Phase 15: Advanced Economy
- Token staking and governance
- Community voting on fund allocation
- DeFi lending and borrowing
- Cross-chain bridges

## Constitutional Audit Trail

Every transaction in the Azora Economy is recorded with:
- **Timestamp**: When the action occurred
- **User ID**: Who performed the action
- **Action Type**: What was done
- **Reward Amount**: How much was earned
- **Tax Amount**: Contribution to Citadel Fund
- **Verification Status**: Quality check result
- **Metadata**: Context and details

This creates an immutable audit trail for transparency and accountability.

## Support

For issues or questions about the economy system:
1. Check the [BuildSpaces Documentation](../docs/)
2. Review the [Constitutional AI Guidelines](../../CONSTITUTION.md)
3. Contact the development team via GitHub Issues

---

**Last Updated**: January 9, 2026  
**Phase**: 12 — The Azora Vault (Economy)  
**Status**: ✅ Implemented and Ready for Testing
