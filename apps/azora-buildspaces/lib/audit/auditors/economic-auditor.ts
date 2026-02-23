/**
 * Economic System Auditor
 * 
 * Verifies compliance with Article III (Economic Constitution):
 * - Token economics (1 billion AZR total supply)
 * - Mining engine (Proof-of-Knowledge rewards)
 * - Wallet endpoints protection
 * - Reward distribution logic
 * - Ubuntu-based compensation principles
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import * as fs from 'fs'
import * as path from 'path'
import {
  AuditCategory,
  AuditResult,
  Finding,
  IAuditor,
  Severity
} from '../types'

export class EconomicAuditor implements IAuditor {
  name = 'Economic System Auditor'
  category = AuditCategory.ECONOMIC_SYSTEM
  description = 'Verifies token economics, mining engine, and wallet endpoints per Article III'

  private baseDir: string
  private findings: Finding[] = []

  constructor(baseDir: string = process.cwd()) {
    this.baseDir = baseDir
  }

  async audit(): Promise<AuditResult> {
    const startTime = Date.now()
    this.findings = []

    console.log('[ECONOMIC AUDIT] Starting economic system audit...')

    // Task 8.1: Verify token economics configuration
    await this.verifyTokenEconomics()

    // Task 8.2: Test mining engine
    await this.testMiningEngine()

    // Task 8.3: Verify wallet endpoints
    await this.verifyWalletEndpoints()

    // Calculate score
    const score = this.calculateScore()
    const executionTime = Date.now() - startTime

    console.log(`[ECONOMIC AUDIT] Completed in ${executionTime}ms with score ${score}/100`)

    return {
      category: this.category,
      score,
      passed: score >= 80,
      findings: this.findings,
      criticalCount: this.findings.filter(f => f.severity === Severity.CRITICAL).length,
      highCount: this.findings.filter(f => f.severity === Severity.HIGH).length,
      mediumCount: this.findings.filter(f => f.severity === Severity.MEDIUM).length,
      lowCount: this.findings.filter(f => f.severity === Severity.LOW).length,
      infoCount: this.findings.filter(f => f.severity === Severity.INFO).length,
      executionTime,
      timestamp: new Date()
    }
  }

  /**
   * Task 8.1: Verify token economics configuration
   * Requirements: 7.1
   */
  private async verifyTokenEconomics(): Promise<void> {
    console.log('[ECONOMIC AUDIT] Verifying token economics configuration...')

    // Check mining-engine.ts exists
    const miningEnginePath = path.join(
      this.baseDir,
      'lib/economy/mining-engine.ts'
    )

    if (!fs.existsSync(miningEnginePath)) {
      this.addFinding({
        severity: Severity.CRITICAL,
        title: 'Mining Engine Not Found',
        description: 'The mining-engine.ts file does not exist',
        filePath: 'lib/economy/mining-engine.ts',
        remediation: [
          'Create lib/economy/mining-engine.ts',
          'Implement Proof-of-Knowledge reward mechanisms',
          'Configure token economics per Article III'
        ],
        constitutionalArticle: 'Article III, Section 3.1',
        requirement: '7.1'
      })
      return
    }

    // Read and analyze mining engine
    const miningEngineContent = fs.readFileSync(miningEnginePath, 'utf-8')

    // Check for total supply constant (1 billion AZR)
    const totalSupplyPattern = /1[,_]?000[,_]?000[,_]?000|1e9|1000000000/i
    const hasCorrectSupply = totalSupplyPattern.test(miningEngineContent)

    if (!hasCorrectSupply) {
      this.addFinding({
        severity: Severity.HIGH,
        title: 'Total Supply Not Configured',
        description: 'The 1 billion AZR total supply constant is not found in mining-engine.ts',
        filePath: miningEnginePath,
        evidence: 'Missing total supply constant matching 1,000,000,000 AZR',
        remediation: [
          'Add TOTAL_SUPPLY constant: 1_000_000_000',
          'Document token allocation structure per Constitution',
          'Implement supply cap enforcement'
        ],
        constitutionalArticle: 'Article III, Section 3.1',
        requirement: '7.1'
      })
    } else {
      this.addFinding({
        severity: Severity.INFO,
        title: 'Total Supply Configured',
        description: 'Found reference to 1 billion token supply in mining engine',
        filePath: miningEnginePath,
        remediation: [],
        requirement: '7.1'
      })
    }

    // Check for community tax (1%)
    const communityTaxPattern = /COMMUNITY_TAX|0\.01|1%/i
    const hasCommunityTax = communityTaxPattern.test(miningEngineContent)

    if (!hasCommunityTax) {
      this.addFinding({
        severity: Severity.HIGH,
        title: 'Community Tax Not Implemented',
        description: 'Article III Section 3.1 requires 1% community tax to Citadel Fund',
        filePath: miningEnginePath,
        remediation: [
          'Implement COMMUNITY_TAX_RATE = 0.01',
          'Apply tax to all token awards',
          'Route tax to Citadel Fund wallet'
        ],
        constitutionalArticle: 'Article III, Section 3.1',
        requirement: '7.1'
      })
    } else {
      this.addFinding({
        severity: Severity.INFO,
        title: 'Community Tax Implemented',
        description: 'Found community tax implementation in mining engine',
        filePath: miningEnginePath,
        remediation: [],
        requirement: '7.1'
      })
    }

    // Check for reward amounts structure
    const rewardAmountsPattern = /REWARD_AMOUNTS|RewardAction/
    const hasRewardStructure = rewardAmountsPattern.test(miningEngineContent)

    if (!hasRewardStructure) {
      this.addFinding({
        severity: Severity.HIGH,
        title: 'Reward Structure Not Defined',
        description: 'Missing REWARD_AMOUNTS configuration for different actions',
        filePath: miningEnginePath,
        remediation: [
          'Define REWARD_AMOUNTS object with action types',
          'Include CODE_COMMIT, SPEC_RATIFICATION, TUTORIAL_COMPLETION, etc.',
          'Document reward amounts per action type'
        ],
        constitutionalArticle: 'Article III, Section 3.2',
        requirement: '7.1'
      })
    } else {
      this.addFinding({
        severity: Severity.INFO,
        title: 'Reward Structure Defined',
        description: 'Found REWARD_AMOUNTS configuration in mining engine',
        filePath: miningEnginePath,
        remediation: [],
        requirement: '7.1'
      })
    }

    // Check for deflationary mechanism
    const deflationaryPattern = /deflationary|burn|supply.*decrease/i
    const hasDeflationaryMechanism = deflationaryPattern.test(miningEngineContent)

    if (!hasDeflationaryMechanism) {
      this.addFinding({
        severity: Severity.MEDIUM,
        title: 'Deflationary Mechanism Not Found',
        description: 'No evidence of deflationary mechanism implementation',
        filePath: miningEnginePath,
        evidence: 'Missing token burn or supply reduction logic',
        remediation: [
          'Consider implementing token burn mechanism',
          'Document deflationary strategy',
          'Align with Article III economic principles'
        ],
        constitutionalArticle: 'Article III, Section 3.1',
        requirement: '7.1'
      })
    }
  }

  /**
   * Task 8.2: Test mining engine
   * Requirements: 7.2, 7.4
   */
  private async testMiningEngine(): Promise<void> {
    console.log('[ECONOMIC AUDIT] Testing mining engine functionality...')

    const miningEnginePath = path.join(
      this.baseDir,
      'apps/azora-buildspaces/lib/economy/mining-engine.ts'
    )

    if (!fs.existsSync(miningEnginePath)) {
      return // Already reported in verifyTokenEconomics
    }

    const miningEngineContent = fs.readFileSync(miningEnginePath, 'utf-8')

    // Check for awardTokens function
    const awardTokensPattern = /export\s+(async\s+)?function\s+awardTokens|export\s+const\s+awardTokens/
    const hasAwardTokens = awardTokensPattern.test(miningEngineContent)

    if (!hasAwardTokens) {
      this.addFinding({
        severity: Severity.CRITICAL,
        title: 'awardTokens Function Missing',
        description: 'The core awardTokens() function is not exported from mining-engine.ts',
        filePath: miningEnginePath,
        remediation: [
          'Implement awardTokens(userId, action, value?, metadata?) function',
          'Include Proof-of-Knowledge verification',
          'Apply community tax calculation',
          'Record transaction in database'
        ],
        constitutionalArticle: 'Article III, Section 3.2',
        requirement: '7.2'
      })
    } else {
      this.addFinding({
        severity: Severity.INFO,
        title: 'awardTokens Function Found',
        description: 'Core token award function is implemented',
        filePath: miningEnginePath,
        remediation: [],
        requirement: '7.2'
      })
    }

    // Check for Proof-of-Knowledge mechanisms
    const pokPattern = /Proof-of-Knowledge|PoK|verifyWorkQuality|verifyAndAward/i
    const hasPoK = pokPattern.test(miningEngineContent)

    if (!hasPoK) {
      this.addFinding({
        severity: Severity.HIGH,
        title: 'Proof-of-Knowledge Not Implemented',
        description: 'Missing Proof-of-Knowledge verification mechanisms',
        filePath: miningEnginePath,
        remediation: [
          'Implement verifyAndAward() function',
          'Add work quality verification logic',
          'Integrate with AI agents (Themba for code, Nia for specs)',
          'Prevent spam and low-quality submissions'
        ],
        constitutionalArticle: 'Article III, Section 3.2',
        requirement: '7.2'
      })
    } else {
      this.addFinding({
        severity: Severity.INFO,
        title: 'Proof-of-Knowledge Mechanisms Found',
        description: 'Found evidence of work quality verification',
        filePath: miningEnginePath,
        remediation: [],
        requirement: '7.2'
      })
    }

    // Check for fair distribution (Ubuntu principles)
    const ubuntuPattern = /Ubuntu|fair.*distribution|collective.*prosperity|mutual.*prosperity/i
    const hasUbuntuPrinciples = ubuntuPattern.test(miningEngineContent)

    if (!hasUbuntuPrinciples) {
      this.addFinding({
        severity: Severity.MEDIUM,
        title: 'Ubuntu Principles Not Documented',
        description: 'Missing documentation of Ubuntu-based compensation principles',
        filePath: miningEnginePath,
        remediation: [
          'Add comments explaining Ubuntu Philosophy implementation',
          'Document "I am because we are" collective prosperity model',
          'Explain fair distribution mechanisms'
        ],
        constitutionalArticle: 'Article I, Section 1.1 & Article III, Section 3.2',
        requirement: '7.4'
      })
    } else {
      this.addFinding({
        severity: Severity.INFO,
        title: 'Ubuntu Principles Documented',
        description: 'Found Ubuntu Philosophy references in mining engine',
        filePath: miningEnginePath,
        remediation: [],
        requirement: '7.4'
      })
    }

    // Check for wallet balance functions
    const walletBalancePattern = /getWalletBalance|fetchBalance/
    const hasWalletBalance = walletBalancePattern.test(miningEngineContent)

    if (!hasWalletBalance) {
      this.addFinding({
        severity: Severity.HIGH,
        title: 'Wallet Balance Function Missing',
        description: 'Missing getWalletBalance() function for retrieving user balances',
        filePath: miningEnginePath,
        remediation: [
          'Implement getWalletBalance(userId) function',
          'Query database for user wallet',
          'Return current AZR balance'
        ],
        requirement: '7.2'
      })
    } else {
      this.addFinding({
        severity: Severity.INFO,
        title: 'Wallet Balance Function Found',
        description: 'Found wallet balance retrieval function',
        filePath: miningEnginePath,
        remediation: [],
        requirement: '7.2'
      })
    }

    // Check for transaction history
    const transactionHistoryPattern = /getTransactionHistory|transactionHistory/
    const hasTransactionHistory = transactionHistoryPattern.test(miningEngineContent)

    if (!hasTransactionHistory) {
      this.addFinding({
        severity: Severity.MEDIUM,
        title: 'Transaction History Function Missing',
        description: 'Missing getTransactionHistory() function for audit trail',
        filePath: miningEnginePath,
        remediation: [
          'Implement getTransactionHistory(userId, limit?) function',
          'Query transaction records from database',
          'Support pagination for large histories'
        ],
        requirement: '7.2'
      })
    } else {
      this.addFinding({
        severity: Severity.INFO,
        title: 'Transaction History Function Found',
        description: 'Found transaction history retrieval function',
        filePath: miningEnginePath,
        remediation: [],
        requirement: '7.2'
      })
    }
  }

  /**
   * Task 8.3: Verify wallet endpoints
   * Requirements: 7.3, 7.5
   */
  private async verifyWalletEndpoints(): Promise<void> {
    console.log('[ECONOMIC AUDIT] Verifying wallet endpoints...')

    // Check /api/economy/wallet endpoint
    const walletRoutePath = path.join(
      this.baseDir,
      'app/api/economy/wallet/route.ts'
    )

    if (!fs.existsSync(walletRoutePath)) {
      this.addFinding({
        severity: Severity.CRITICAL,
        title: '/api/economy/wallet Endpoint Missing',
        description: 'The wallet API endpoint does not exist',
        filePath: 'app/api/economy/wallet/route.ts',
        remediation: [
          'Create app/api/economy/wallet/route.ts',
          'Implement GET handler with authentication',
          'Return user balance and transaction history',
          'Include truth score and wallet status'
        ],
        constitutionalArticle: 'Article III, Section 3.3',
        requirement: '7.3'
      })
    } else {
      const walletContent = fs.readFileSync(walletRoutePath, 'utf-8')

      // Check for authentication
      const hasAuth = /getServerSession|authOptions/.test(walletContent)
      if (!hasAuth) {
        this.addFinding({
          severity: Severity.CRITICAL,
          title: '/api/economy/wallet Not Protected',
          description: 'Wallet endpoint missing authentication check',
          filePath: walletRoutePath,
          remediation: [
            'Add getServerSession(authOptions) check',
            'Return 401 for unauthenticated requests',
            'Verify user can only access their own wallet'
          ],
          constitutionalArticle: 'Article VII, Section 7.2',
          requirement: '7.5'
        })
      } else {
        this.addFinding({
          severity: Severity.INFO,
          title: '/api/economy/wallet Protected',
          description: 'Wallet endpoint has authentication protection',
          filePath: walletRoutePath,
          remediation: [],
          requirement: '7.5'
        })
      }

      // Check for balance retrieval
      const hasBalanceRetrieval = /getWalletBalance|balance/.test(walletContent)
      if (!hasBalanceRetrieval) {
        this.addFinding({
          severity: Severity.HIGH,
          title: 'Wallet Balance Not Returned',
          description: 'Wallet endpoint does not return user balance',
          filePath: walletRoutePath,
          remediation: [
            'Call getWalletBalance(userId)',
            'Include balance in response',
            'Handle database errors gracefully'
          ],
          requirement: '7.3'
        })
      } else {
        this.addFinding({
          severity: Severity.INFO,
          title: 'Wallet Balance Returned',
          description: 'Wallet endpoint returns user balance',
          filePath: walletRoutePath,
          remediation: [],
          requirement: '7.3'
        })
      }
    }

    // Check /api/economy/award endpoint
    const awardRoutePath = path.join(
      this.baseDir,
      'app/api/economy/award/route.ts'
    )

    if (!fs.existsSync(awardRoutePath)) {
      this.addFinding({
        severity: Severity.CRITICAL,
        title: '/api/economy/award Endpoint Missing',
        description: 'The token award API endpoint does not exist',
        filePath: 'app/api/economy/award/route.ts',
        remediation: [
          'Create app/api/economy/award/route.ts',
          'Implement POST handler with authentication',
          'Call awardTokens() from mining engine',
          'Return transaction details'
        ],
        constitutionalArticle: 'Article III, Section 3.2',
        requirement: '7.3'
        })
    } else {
      const awardContent = fs.readFileSync(awardRoutePath, 'utf-8')

      // Check for authentication
      const hasAuth = /getServerSession|authOptions/.test(awardContent)
      if (!hasAuth) {
        this.addFinding({
          severity: Severity.CRITICAL,
          title: '/api/economy/award Not Protected',
          description: 'Award endpoint missing authentication check',
          filePath: awardRoutePath,
          remediation: [
            'Add getServerSession(authOptions) check',
            'Return 401 for unauthenticated requests',
            'Implement authorization checks for admin actions'
          ],
          constitutionalArticle: 'Article VII, Section 7.2',
          requirement: '7.5'
        })
      } else {
        this.addFinding({
          severity: Severity.INFO,
          title: '/api/economy/award Protected',
          description: 'Award endpoint has authentication protection',
          filePath: awardRoutePath,
          remediation: [],
          requirement: '7.5'
        })
      }

      // Check for awardTokens integration
      const hasAwardTokens = /awardTokens|verifyAndAward|awardByType/.test(awardContent)
      if (!hasAwardTokens) {
        this.addFinding({
          severity: Severity.CRITICAL,
          title: 'Award Endpoint Not Functional',
          description: 'Award endpoint does not call awardTokens() function',
          filePath: awardRoutePath,
          remediation: [
            'Import awardTokens from mining-engine',
            'Call awardTokens(userId, action, value, metadata)',
            'Return transaction result to client'
          ],
          requirement: '7.3'
        })
      } else {
        this.addFinding({
          severity: Severity.INFO,
          title: 'Award Endpoint Functional',
          description: 'Award endpoint integrates with mining engine',
          filePath: awardRoutePath,
          remediation: [],
          requirement: '7.3'
        })
      }

      // Check for action validation
      const hasActionValidation = /REWARD_AMOUNTS|RewardAction/.test(awardContent)
      if (!hasActionValidation) {
        this.addFinding({
          severity: Severity.MEDIUM,
          title: 'Action Validation Missing',
          description: 'Award endpoint does not validate action types',
          filePath: awardRoutePath,
          remediation: [
            'Validate action against REWARD_AMOUNTS',
            'Return 400 for invalid action types',
            'Document valid action types in API'
          ],
          requirement: '7.3'
        })
      } else {
        this.addFinding({
          severity: Severity.INFO,
          title: 'Action Validation Implemented',
          description: 'Award endpoint validates action types',
          filePath: awardRoutePath,
          remediation: [],
          requirement: '7.3'
        })
      }
    }
  }

  /**
   * Calculate overall score based on findings
   */
  private calculateScore(): number {
    const weights = {
      [Severity.CRITICAL]: 25,
      [Severity.HIGH]: 15,
      [Severity.MEDIUM]: 8,
      [Severity.LOW]: 3,
      [Severity.INFO]: 0
    }

    let deductions = 0
    for (const finding of this.findings) {
      deductions += weights[finding.severity]
    }

    return Math.max(0, 100 - deductions)
  }

  /**
   * Add a finding to the audit results
   */
  private addFinding(finding: Omit<Finding, 'id' | 'category'>): void {
    this.findings.push({
      id: `economic-${this.findings.length + 1}`,
      category: this.category,
      ...finding
    })
  }

  /**
   * Check if a file exists
   */
  private fileExists(relativePath: string): boolean {
    const fullPath = path.join(this.baseDir, relativePath)
    return fs.existsSync(fullPath)
  }
}
