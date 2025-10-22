/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { ComplianceRule } from '../../interfaces/compliance-rule.interface';

export const SALegalRules: ComplianceRule[] = [
  {
    ruleId: 'SA-POPIA-01',
    name: 'POPIA Compliance',
    description: 'All handling of personal information must comply with the Protection of Personal Information Act.',
    article: 'XV',
    section: '2.1',
    isCritical: true,
    appliesTo: ['all', 'hr', 'data-management', 'legal'],
  },
  {
    ruleId: 'SA-B-BBEE-01',
    name: 'B-BBEE Strategy Adherence',
    description: 'Procurement and HR decisions must align with the Broad-Based Black Economic Empowerment strategy.',
    article: 'XV',
    section: '2.2',
    isCritical: false,
    appliesTo: ['hr', 'procurement', 'finance'],
  },
];