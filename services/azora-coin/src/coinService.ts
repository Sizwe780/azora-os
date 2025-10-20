import { PrismaClient, CoinType, TxnType, TxnStatus } from '@prisma/client';
import { AuditService, ComplianceService } from './auditCompliance.js';

const prisma = new PrismaClient();

export class CoinService {
  // Atomic mint
  static async mint(userId: string, amount: number, coinType: CoinType = CoinType.AZR, notes?: string, originDatumId?: string) {
    // Compliance check
    if (!(await ComplianceService.checkSanctions(userId))) {
      await AuditService.log('MINT_BLOCKED_SANCTION', { userId, amount, coinType }, userId);
      throw new Error('User is sanctioned');
    }
    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new Error('Wallet not found');
      const txn = await tx.transaction.create({
        data: {
          type: TxnType.MINT,
          status: TxnStatus.COMPLETED,
          amount,
          coinType,
          usdEquivalent: amount, // 1:1 for now
          notes,
          originDatumId,
          recipientId: wallet.id,
        },
      });
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: amount } },
      });
      await AuditService.log('MINT', { userId, amount, coinType, notes, originDatumId }, userId, txn.id);
      return txn;
    });
  }

  // Atomic transfer
  static async transfer(senderId: string, recipientId: string, amount: number, coinType: CoinType = CoinType.AZR, notes?: string) {
    if (!(await ComplianceService.canTransact(senderId, recipientId))) {
      await AuditService.log('TRANSFER_BLOCKED_COMPLIANCE', { senderId, recipientId, amount, coinType }, senderId);
      throw new Error('Compliance rule violation');
    }
    return prisma.$transaction(async (tx) => {
      const senderWallet = await tx.wallet.findUnique({ where: { userId: senderId } });
      const recipientWallet = await tx.wallet.findUnique({ where: { userId: recipientId } });
      if (!senderWallet || !recipientWallet) throw new Error('Wallet not found');
      if (senderWallet.balance < amount) throw new Error('Insufficient balance');
      const txn = await tx.transaction.create({
        data: {
          type: TxnType.TRANSFER,
          status: TxnStatus.COMPLETED,
          amount,
          coinType,
          usdEquivalent: amount,
          notes,
          senderId: senderWallet.id,
          recipientId: recipientWallet.id,
        },
      });
      await tx.wallet.update({ where: { id: senderWallet.id }, data: { balance: { decrement: amount } } });
      await tx.wallet.update({ where: { id: recipientWallet.id }, data: { balance: { increment: amount } } });
      await AuditService.log('TRANSFER', { senderId, recipientId, amount, coinType, notes }, senderId, txn.id);
      return txn;
    });
  }

  // Atomic withdrawal
  static async withdraw(userId: string, amount: number, notes?: string) {
    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new Error('Wallet not found');
      if (wallet.balance < amount) throw new Error('Insufficient balance');
      const txn = await tx.transaction.create({
        data: {
          type: TxnType.WITHDRAWAL,
          status: TxnStatus.PENDING,
          amount,
          coinType: wallet.coinType,
          usdEquivalent: amount,
          notes,
          senderId: wallet.id,
        },
      });
      await tx.wallet.update({ where: { id: wallet.id }, data: { balance: { decrement: amount } } });
      await AuditService.log('WITHDRAWAL', { userId, amount, notes }, userId, txn.id);
      return txn;
    });
  }
}
