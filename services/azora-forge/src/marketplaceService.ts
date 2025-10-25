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

export class MarketplaceService {
  static async createListing(userId: string, item: string, price: number) {
    const listing = await prisma.listing.create({
      data: {
        item,
        price,
        userId,
      },
    });
    await AuditService.log('LISTING_CREATED', { item, price }, userId);
    return listing;
  }

  static async getListings() {
    return await prisma.listing.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async purchaseListing(listingId: string, buyerId: string) {
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing || listing.status !== 'active') {
      throw new Error('Listing not available');
    }
    const transaction = await prisma.transaction.create({
      data: {
        listingId,
        buyerId,
        amount: listing.price,
      },
    });
    await prisma.listing.update({
      where: { id: listingId },
      data: { status: 'sold' },
    });
    await AuditService.log('LISTING_PURCHASED', { listingId, amount: listing.price }, buyerId);
    return transaction;
  }
}