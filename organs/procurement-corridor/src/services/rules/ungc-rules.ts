/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { ComplianceRule } from '../../interfaces/compliance-rule.interface';

export const UNGCPrinciples: ComplianceRule[] = [
  {
    ruleId: 'UNGC-01',
    name: 'Protection of Human Rights',
    description: 'Business must support and respect the protection of internationally proclaimed human rights.',
    article: 'XIV',
    section: '1.1',
    isCritical: true,
    appliesTo: ['all', 'hr', 'procurement'],
  },
  {
    ruleId: 'UNGC-10',
    name: 'Anti-Corruption',
    description: 'Business must work against corruption in all its forms, including extortion and bribery.',
    article: 'XIV',
    section: '1.2',
    isCritical: true,
    appliesTo: ['all', 'finance', 'procurement', 'legal'],
  },
];