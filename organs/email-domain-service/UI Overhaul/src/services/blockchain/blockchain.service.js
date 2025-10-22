/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Blockchain Service
 * Handles interactions with the Azora Coin smart contract and blockchain
 */

import { ethers } from 'ethers';

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.initialized = false;
    this.contractAddress = process.env.AZORA_COIN_CONTRACT || '0x0000000000000000000000000000000000000000';
    this.azoraCoinABI = [
      // ERC20 functions
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
      "function totalSupply() view returns (uint256)",
      "function balanceOf(address) view returns (uint256)",
      "function transfer(address to, uint amount) returns (bool)",
      "function allowance(address owner, address spender) view returns (uint256)",
      "function approve(address spender, uint amount) returns (bool)",
      "function transferFrom(address sender, address recipient, uint amount) returns (bool)",
      // Custom functions
      "function mint(address to, uint256 amount)",
      "function pause()",
      "function unpause()",
      // Constants
      "function MAX_SUPPLY() view returns (uint256)",
    ];
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Connect to provider
      if (window.ethereum) {
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        this.signer = this.provider.getSigner();
        
        // Create contract instance
        if (this.contractAddress && this.contractAddress !== '0x0000000000000000000000000000000000000000') {
          this.contract = new ethers.Contract(this.contractAddress, this.azoraCoinABI, this.signer);
        }
        
        this.initialized = true;
      } else {
        throw new Error('No Ethereum wallet detected');
      }
    } catch (error) {
      console.error('Failed to initialize blockchain service:', error);
      throw error;
    }
  }

  async getBalance(address) {
    if (!this.initialized) await this.initialize();
    if (!this.contract) return '0';
    
    try {
      const balance = await this.contract.balanceOf(address || await this.signer.getAddress());
      const decimals = await this.contract.decimals();
      return ethers.utils.formatUnits(balance, decimals);
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  }

  async getTransactionHistory() {
    // For demo purposes, return mock data
    // In a real implementation, this would query transaction events from the contract
    const address = await this.signer.getAddress();
    
    return [
      {
        hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        from: address,
        to: '0xdef1234567890abcdef1234567890abcdef123456',
        amount: '10',
        timestamp: Date.now() - 3600000, // 1 hour ago
        status: 'confirmed'
      },
      {
        hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        from: '0x7890abcdef1234567890abcdef1234567890abcde',
        to: address,
        amount: '25',
        timestamp: Date.now() - 86400000, // 1 day ago
        status: 'confirmed'
      },
      {
        hash: '0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
        from: address,
        to: '0x90abcdef1234567890abcdef1234567890abcdef12',
        amount: '5',
        timestamp: Date.now() - 172800000, // 2 days ago
        status: 'confirmed'
      }
    ];
  }

  async sendTransaction(recipientAddress, amount) {
    if (!this.initialized) await this.initialize();
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const decimals = await this.contract.decimals();
      const amountInWei = ethers.utils.parseUnits(amount, decimals);
      const tx = await this.contract.transfer(recipientAddress, amountInWei);
      
      return {
        hash: tx.hash,
        from: await this.signer.getAddress(),
        to: recipientAddress,
        amount: amount,
        timestamp: Date.now(),
        status: 'pending'
      };
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }

  async getTotalSupply() {
    if (!this.initialized) await this.initialize();
    if (!this.contract) return '0';
    
    try {
      const totalSupply = await this.contract.totalSupply();
      const decimals = await this.contract.decimals();
      return ethers.utils.formatUnits(totalSupply, decimals);
    } catch (error) {
      console.error('Failed to get total supply:', error);
      return '0';
    }
  }

  async getMaxSupply() {
    if (!this.initialized) await this.initialize();
    if (!this.contract) return '0';
    
    try {
      const maxSupply = await this.contract.MAX_SUPPLY();
      const decimals = await this.contract.decimals();
      return ethers.utils.formatUnits(maxSupply, decimals);
    } catch (error) {
      console.error('Failed to get max supply:', error);
      return '1000000'; // Default to 1M if can't read from contract
    }
  }
}

export default new BlockchainService();
