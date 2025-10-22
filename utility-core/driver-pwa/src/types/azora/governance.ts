/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

export type Proposal = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  status: 'open' | 'closed' | 'executed';
  totalStaked: number;
};
