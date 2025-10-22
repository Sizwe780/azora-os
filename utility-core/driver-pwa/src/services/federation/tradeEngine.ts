/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

export type TradeAgreement = {
  id: string;
  nations: string[];
  exports: Record<string, number>;
  imports: Record<string, number>;
  tariffRate: number;
};

let agreements: TradeAgreement[] = [];

export function createAgreement(nations: string[], exports: Record<string, number>, imports: Record<string, number>, tariffRate: number) {
  const agreement: TradeAgreement = {
    id: Math.random().toString(36).slice(2),
    nations,
    exports,
    imports,
    tariffRate,
  };
  agreements.push(agreement);
  return agreement;
}

export function listAgreements() {
  return agreements;
}