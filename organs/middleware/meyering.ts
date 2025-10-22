/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import * as osEconomyService from '../services/osEconomyService';

const prisma = new PrismaClient();

export const meterApiCall = (microserviceName: string, baseGasCost: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.user.id;
      if (!userId) return res.status(401).json({ error: 'Authentication required' });
      const wallet = await prisma.wallet.findUnique({ where: { userId } });
      if (!wallet) return res.status(403).json({ error: 'User wallet not found' });
      if (wallet.balance < baseGasCost) return res.status(402).json({ error: 'Insufficient AZR balance for gas fee', required: baseGasCost, balance: wallet.balance });
      await osEconomyService.consumeGas(wallet.id, microserviceName, baseGasCost);
      next();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error during gas metering' });
    }
  };
};