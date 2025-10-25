/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export class AuditService {
  static async log(eventType: string, details: any, userId?: string) {
    await prisma.auditLog.create({
      data: {
        eventType,
        details,
        userId,
      },
    });
  }
}

export class LedgerService {
  static async createCheckpoint(nodeId: string, stateRoot: string, signature: string, snapshotLocator?: string) {
    const slices = ['slice-00.bin', 'slice-01.bin'];
    const checkpoint = await prisma.checkpoint.create({
      data: {
        nodeId,
        stateRoot,
        signature,
        snapshotLocator,
        slices,
      },
    });
    await AuditService.log('CHECKPOINT_CREATED', { nodeId, stateRoot }, nodeId);
    return { checkpointId: checkpoint.id, distributedSlicesRefs: slices };
  }

  static async getState() {
    const lastCheckpoint = await prisma.checkpoint.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    return {
      stateRoot: lastCheckpoint?.stateRoot || '0x123',
      lastCheckpoint: lastCheckpoint?.createdAt.getTime() || Date.now(),
    };
  }
}