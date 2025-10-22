/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

export function summarizeProposal(title: string, description: string): string {
    return description.length > 120
      ? description.slice(0, 120) + '…'
      : description;
  }