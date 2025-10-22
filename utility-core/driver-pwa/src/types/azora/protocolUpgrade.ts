/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

export type ProtocolUpgradeProposal = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  status: 'open' | 'closed' | 'executed';
  affectedRules: string[]; // rule IDs from Constitution
  totalStaked: number;
};
