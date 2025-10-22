/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { ethers } from 'ethers';
import { logger } from '../utils/logger';
import { BlockchainAnchor } from '../types/tender.types';

class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contractAddress: string;
  private contract: ethers.Contract | null = null;

  constructor() {
    const rpcUrl = process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    
    const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY || '';
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    
    this.contractAddress = process.env.TENDER_REGISTRY_CONTRACT || '';
    
    // Tender Registry Contract ABI (simplified)
    const abi = [
      'function anchorTender(string memory tenderId, bytes32 dataHash, string memory metadata) public returns (uint256)',
      'function anchorBid(string memory bidId, string memory tenderId, bytes32 dataHash) public returns (uint256)',
      'function anchorAward(string memory awardId, string memory tenderId, string memory bidId, bytes32 dataHash) public returns (uint256)',
      'function verifyAnchor(string memory entityId) public view returns (bytes32, uint256, address)',
      'event TenderAnchored(string indexed tenderId, bytes32 dataHash, uint256 timestamp)',
      'event BidAnchored(string indexed bidId, string indexed tenderId, bytes32 dataHash, uint256 timestamp)',
      'event AwardAnchored(string indexed awardId, string indexed tenderId, bytes32 dataHash, uint256 timestamp)',
    ];
    
    if (this.contractAddress) {
      this.contract = new ethers.Contract(this.contractAddress, abi, this.wallet);
    }
  }

  /**
   * Anchor tender data to blockchain
   */
  async anchorTender(
    tenderId: string,
    data: Record<string, unknown>
  ): Promise<BlockchainAnchor> {
    try {
      logger.info(`Anchoring tender ${tenderId} to blockchain`);

      // Hash the data
      const dataString = JSON.stringify(data);
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes(dataString));

      if (!this.contract) {
        throw new Error('Blockchain contract not initialized');
      }

      // Anchor to blockchain
      const tx = await this.contract.anchorTender(
        tenderId,
        dataHash,
        JSON.stringify({ type: 'tender', version: '1.0' })
      );

      const receipt = await tx.wait();

      const anchor: BlockchainAnchor = {
        id: `anchor_${tenderId}_${Date.now()}`,
        entityType: 'tender',
        entityId: tenderId,
        hash: dataHash,
        transactionId: receipt.hash,
        blockNumber: receipt.blockNumber,
        blockTimestamp: new Date(),
        network: 'polygon',
        data,
        dataHash,
        anchoredAt: new Date(),
        anchoredBy: 'system',
        verified: true,
        verifiedAt: new Date(),
      };

      logger.info(`Tender ${tenderId} anchored successfully`, {
        txId: receipt.hash,
        blockNumber: receipt.blockNumber,
      });

      return anchor;
    } catch (error) {
      logger.error(`Failed to anchor tender ${tenderId}`, error);
      throw error;
    }
  }

  /**
   * Anchor bid submission to blockchain
   */
  async anchorBid(
    bidId: string,
    tenderId: string,
    data: Record<string, unknown>
  ): Promise<BlockchainAnchor> {
    try {
      logger.info(`Anchoring bid ${bidId} for tender ${tenderId}`);

      const dataString = JSON.stringify(data);
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes(dataString));

      if (!this.contract) {
        throw new Error('Blockchain contract not initialized');
      }

      const tx = await this.contract.anchorBid(bidId, tenderId, dataHash);
      const receipt = await tx.wait();

      const anchor: BlockchainAnchor = {
        id: `anchor_${bidId}_${Date.now()}`,
        entityType: 'bid',
        entityId: bidId,
        hash: dataHash,
        transactionId: receipt.hash,
        blockNumber: receipt.blockNumber,
        blockTimestamp: new Date(),
        network: 'polygon',
        data,
        dataHash,
        anchoredAt: new Date(),
        anchoredBy: 'system',
        verified: true,
        verifiedAt: new Date(),
      };

      logger.info(`Bid ${bidId} anchored successfully`, {
        txId: receipt.hash,
      });

      return anchor;
    } catch (error) {
      logger.error(`Failed to anchor bid ${bidId}`, error);
      throw error;
    }
  }

  /**
   * Anchor award decision to blockchain
   */
  async anchorAward(
    awardId: string,
    tenderId: string,
    bidId: string,
    data: Record<string, unknown>
  ): Promise<BlockchainAnchor> {
    try {
      logger.info(`Anchoring award ${awardId} for tender ${tenderId}`);

      const dataString = JSON.stringify(data);
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes(dataString));

      if (!this.contract) {
        throw new Error('Blockchain contract not initialized');
      }

      const tx = await this.contract.anchorAward(awardId, tenderId, bidId, dataHash);
      const receipt = await tx.wait();

      const anchor: BlockchainAnchor = {
        id: `anchor_${awardId}_${Date.now()}`,
        entityType: 'award',
        entityId: awardId,
        hash: dataHash,
        transactionId: receipt.hash,
        blockNumber: receipt.blockNumber,
        blockTimestamp: new Date(),
        network: 'polygon',
        data,
        dataHash,
        anchoredAt: new Date(),
        anchoredBy: 'system',
        verified: true,
        verifiedAt: new Date(),
      };

      logger.info(`Award ${awardId} anchored successfully`, {
        txId: receipt.hash,
      });

      return anchor;
    } catch (error) {
      logger.error(`Failed to anchor award ${awardId}`, error);
      throw error;
    }
  }

  /**
   * Verify blockchain anchor integrity
   */
  async verifyAnchor(entityId: string): Promise<boolean> {
    try {
      if (!this.contract) {
        throw new Error('Blockchain contract not initialized');
      }

      const [dataHash, timestamp, anchorer] = await this.contract.verifyAnchor(entityId);

      logger.info(`Anchor verified for ${entityId}`, {
        dataHash,
        timestamp: new Date(Number(timestamp) * 1000),
        anchorer,
      });

      return dataHash !== ethers.ZeroHash;
    } catch (error) {
      logger.error(`Failed to verify anchor for ${entityId}`, error);
      return false;
    }
  }

  /**
   * Get full audit trail for a tender
   */
  async getAuditTrail(tenderId: string): Promise<BlockchainAnchor[]> {
    try {
      // Query blockchain events for this tender
      if (!this.contract) {
        throw new Error('Blockchain contract not initialized');
      }

      const filter = this.contract.filters.TenderAnchored(tenderId);
      const events = await this.contract.queryFilter(filter);

      const trail: BlockchainAnchor[] = events.map((event: any) => {
        const eventLog = event as ethers.EventLog;
        return {
          id: `audit_${eventLog.transactionHash}_${eventLog.index}`,
          entityType: 'tender',
          entityId: tenderId,
          hash: eventLog.args?.dataHash || '',
          transactionId: eventLog.transactionHash,
          blockNumber: eventLog.blockNumber,
          blockTimestamp: new Date(),
          network: 'polygon',
          data: {},
          dataHash: eventLog.args?.dataHash || '',
          anchoredAt: new Date(),
          anchoredBy: 'system',
          verified: true,
          verifiedAt: new Date(),
        };
      });

      return trail;
    } catch (error) {
      logger.error(`Failed to get audit trail for tender ${tenderId}`, error);
      throw error;
    }
  }
}

export default new BlockchainService();
