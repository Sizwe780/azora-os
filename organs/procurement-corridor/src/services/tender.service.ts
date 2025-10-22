/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Tender, Bid, TenderStatus, BidStatus } from '../types/tender.types';
import { logger } from '../utils/logger';
import blockchainService from './blockchain.service';
import complianceService from './compliance.service';
import corruptionService from './corruption.service';

class TenderService {
  // In-memory storage (replace with database in production)
  private tenders: Map<string, Tender> = new Map();
  private bids: Map<string, Bid> = new Map();

  /**
   * Create a new tender
   */
  async createTender(organizationId: string, data: Partial<Tender>): Promise<Tender> {
    const tender: Tender = {
      id: `tender_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      organizationId,
      referenceNumber: data.referenceNumber || `TND-${Date.now()}`,
      title: data.title || '',
      description: data.description || '',
      type: data.type || 'goods',
      status: 'draft',
      closingDate: data.closingDate || new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      estimatedValue: data.estimatedValue || 0,
      currency: data.currency || 'ZAR',
      budgetAvailable: data.budgetAvailable || data.estimatedValue || 0,
      minimumRequirements: data.minimumRequirements || [],
      evaluationCriteria: data.evaluationCriteria || [],
      documentRequirements: data.documentRequirements || [],
      bbbeeRequired: data.bbbeeRequired || false,
      taxClearanceRequired: data.taxClearanceRequired !== false,
      centralSupplierDatabaseRequired: data.centralSupplierDatabaseRequired !== false,
      createdBy: data.createdBy || 'system',
      tags: data.tags || [],
    };

    this.tenders.set(tender.id, tender);
    
    logger.info(`Tender created: ${tender.id}`, { title: tender.title });
    
    return tender;
  }

  /**
   * Publish tender (make it public and anchor to blockchain)
   */
  async publishTender(tenderId: string, userId: string): Promise<Tender> {
    const tender = this.tenders.get(tenderId);
    
    if (!tender) {
      throw new Error('Tender not found');
    }

    if (tender.status !== 'draft') {
      throw new Error('Only draft tenders can be published');
    }

    // Run compliance check before publishing
    const compliance = await complianceService.checkTenderCompliance(tender);
    
    if (compliance.status === 'failed') {
      throw new Error(`Tender failed compliance: ${compliance.violations.join(', ')}`);
    }

    // Anchor to blockchain
    const anchor = await blockchainService.anchorTender(tender.id, {
      referenceNumber: tender.referenceNumber,
      title: tender.title,
      estimatedValue: tender.estimatedValue,
      closingDate: tender.closingDate,
      publishedBy: userId,
    });

    tender.status = 'published';
    tender.publishedAt = new Date();
    tender.blockchainHash = anchor.hash;
    tender.blockchainTxId = anchor.transactionId;
    tender.updatedAt = new Date();

    this.tenders.set(tenderId, tender);

    logger.info(`Tender published: ${tenderId}`, {
      blockchainTx: anchor.transactionId,
    });

    return tender;
  }

  /**
   * Submit a bid for a tender
   */
  async submitBid(
    tenderId: string,
    organizationId: string,
    supplierId: string,
    data: Partial<Bid>
  ): Promise<Bid> {
    const tender = this.tenders.get(tenderId);
    
    if (!tender) {
      throw new Error('Tender not found');
    }

    if (tender.status !== 'published' && tender.status !== 'open') {
      throw new Error('Tender is not open for bidding');
    }

    if (new Date() > tender.closingDate) {
      throw new Error('Tender closing date has passed');
    }

    const bid: Bid = {
      id: `bid_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      tenderId,
      organizationId,
      supplierId,
      submittedAt: new Date(),
      status: 'submitted',
      bidAmount: data.bidAmount || 0,
      currency: data.currency || 'ZAR',
      documents: data.documents || [],
      taxClearanceCertificate: data.taxClearanceCertificate,
      bbbeeLevel: data.bbbeeLevel,
      bbbeeCertificate: data.bbbeeCertificate,
      csdRegistrationNumber: data.csdRegistrationNumber,
      metadata: data.metadata || {},
    };

    // Run compliance check
    const compliance = await complianceService.checkBidCompliance(tender, bid);
    bid.status = compliance.status === 'passed' ? 'compliant' : 'non_compliant';

    // Anchor bid to blockchain
    const anchor = await blockchainService.anchorBid(bid.id, tender.id, {
      bidAmount: bid.bidAmount,
      submittedAt: bid.submittedAt,
      supplierId: bid.supplierId,
    });

    bid.blockchainHash = anchor.hash;
    bid.blockchainTxId = anchor.transactionId;

    this.bids.set(bid.id, bid);

    logger.info(`Bid submitted: ${bid.id} for tender ${tenderId}`, {
      amount: bid.bidAmount,
      status: bid.status,
    });

    return bid;
  }

  /**
   * Close tender and run corruption analysis
   */
  async closeTender(tenderId: string): Promise<Tender> {
    const tender = this.tenders.get(tenderId);
    
    if (!tender) {
      throw new Error('Tender not found');
    }

    tender.status = 'closed';
    tender.updatedAt = new Date();

    // Get all bids for this tender
    const tenderBids = Array.from(this.bids.values()).filter(
      b => b.tenderId === tenderId
    );

    // Run corruption analysis
    if (tenderBids.length > 0) {
      const corruptionAnalysis = await corruptionService.analyzeTender(tender, tenderBids);
      
      logger.info(`Corruption analysis completed for tender ${tenderId}`, {
        riskScore: corruptionAnalysis.riskScore,
        riskLevel: corruptionAnalysis.riskLevel,
      });
    }

    this.tenders.set(tenderId, tender);

    logger.info(`Tender closed: ${tenderId}`);

    return tender;
  }

  /**
   * Award tender to winning bid
   */
  async awardTender(
    tenderId: string,
    bidId: string,
    userId: string,
    awardNotes?: string
  ): Promise<Bid> {
    const tender = this.tenders.get(tenderId);
    const bid = this.bids.get(bidId);

    if (!tender || !bid) {
      throw new Error('Tender or bid not found');
    }

    if (bid.tenderId !== tenderId) {
      throw new Error('Bid does not belong to this tender');
    }

    if (bid.status !== 'compliant' && bid.status !== 'shortlisted') {
      throw new Error('Only compliant or shortlisted bids can be awarded');
    }

    // Anchor award to blockchain
    const anchor = await blockchainService.anchorAward(
      `award_${bidId}`,
      tenderId,
      bidId,
      {
        awardedTo: bid.supplierId,
        awardValue: bid.bidAmount,
        awardedBy: userId,
        awardedAt: new Date(),
      }
    );

    bid.status = 'awarded';
    bid.awardedAt = new Date();
    bid.awardValue = bid.bidAmount;
    bid.awardNotes = awardNotes;

    tender.status = 'awarded';
    tender.updatedAt = new Date();

    this.bids.set(bidId, bid);
    this.tenders.set(tenderId, tender);

    logger.info(`Tender ${tenderId} awarded to bid ${bidId}`, {
      awardValue: bid.awardValue,
      blockchainTx: anchor.transactionId,
    });

    return bid;
  }

  /**
   * Get tender by ID
   */
  async getTender(tenderId: string): Promise<Tender | undefined> {
    return this.tenders.get(tenderId);
  }

  /**
   * List tenders for an organization
   */
  async listTenders(organizationId: string, filters?: {
    status?: TenderStatus;
    type?: string;
  }): Promise<Tender[]> {
    let tenders = Array.from(this.tenders.values()).filter(
      t => t.organizationId === organizationId
    );

    if (filters?.status) {
      tenders = tenders.filter(t => t.status === filters.status);
    }

    if (filters?.type) {
      tenders = tenders.filter(t => t.type === filters.type);
    }

    return tenders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get bids for a tender
   */
  async getTenderBids(tenderId: string): Promise<Bid[]> {
    return Array.from(this.bids.values())
      .filter(b => b.tenderId === tenderId)
      .sort((a, b) => a.submittedAt.getTime() - b.submittedAt.getTime());
  }

  /**
   * Get bid by ID
   */
  async getBid(bidId: string): Promise<Bid | undefined> {
    return this.bids.get(bidId);
  }
}

export default new TenderService();
