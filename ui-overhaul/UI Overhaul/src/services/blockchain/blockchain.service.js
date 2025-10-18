import { ethers } from 'ethers';

// ABI for the Azora Coin contract
const AZORA_COIN_ABI = [
  // ERC20 standard functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  
  // Azora-specific functions
  "function proposeMint(address recipient, uint256 amount, bytes32 complianceRecordHash, bytes calldata complianceProof) returns (bytes32)",
  "function approveMint(bytes32 requestId)",
  "function executeMint(bytes32 requestId)",
  "function complianceRecords(bytes32) view returns (bool)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event MintRequested(bytes32 indexed requestId, address indexed recipient, uint256 amount, bytes32 complianceRecordHash)",
  "event MintApproved(bytes32 indexed requestId, address indexed approver)",
  "event MintExecuted(bytes32 indexed requestId, address indexed recipient, uint256 amount)",
];

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      // Get provider - in production this would use env variables
      const providerUrl = import.meta.env.VITE_BLOCKCHAIN_PROVIDER || 'http://localhost:8545';
      this.provider = new ethers.providers.JsonRpcProvider(providerUrl);
      
      // Get contract address
      const contractAddress = import.meta.env.VITE_AZORA_COIN_CONTRACT || '0x1234567890123456789012345678901234567890';
      
      // Initialize contract
      this.contract = new ethers.Contract(contractAddress, AZORA_COIN_ABI, this.provider);
      
      // Check connection
      await this.provider.getBlockNumber();
      this.initialized = true;
      
      return true;
    } catch (error) {
      console.error('Failed to initialize blockchain service:', error);
      return false;
    }
  }

  async connectWallet() {
    if (window.ethereum) {
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Create Web3Provider using window.ethereum
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        this.signer = this.provider.getSigner();
        
        // Get contract with signer
        const contractAddress = import.meta.env.VITE_AZORA_COIN_CONTRACT || '0x1234567890123456789012345678901234567890';
        this.contract = new ethers.Contract(contractAddress, AZORA_COIN_ABI, this.signer);
        
        return await this.signer.getAddress();
      } catch (error) {
        console.error('User denied wallet access:', error);
        return null;
      }
    } else {
      console.error('No Ethereum wallet found');
      return null;
    }
  }

  async getWalletAddress() {
    if (!this.signer) return null;
    return await this.signer.getAddress();
  }

  async getBalance(address) {
    if (!this.initialized) await this.initialize();
    
    if (!address && this.signer) {
      address = await this.signer.getAddress();
    }
    
    if (!address) return null;
    
    try {
      const balance = await this.contract.balanceOf(address);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      return null;
    }
  }

  async transfer(toAddress, amount) {
    if (!this.initialized || !this.signer) {
      await this.connectWallet();
    }
    
    try {
      const amountWei = ethers.utils.parseEther(amount.toString());
      const tx = await this.contract.transfer(toAddress, amountWei);
      return await tx.wait();
    } catch (error) {
      console.error('Transfer failed:', error);
      throw error;
    }
  }

  async getTransactionHistory(address, limit = 10) {
    if (!this.initialized) await this.initialize();
    
    if (!address && this.signer) {
      address = await this.signer.getAddress();
    }
    
    if (!address) return [];
    
    try {
      // In a real implementation, this would query an API or blockchain explorer
      // Here we're returning mock data for demonstration
      return this._getMockTransactionHistory(address, limit);
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
      return [];
    }
  }

  async getComplianceStatus(recordHash) {
    if (!this.initialized) await this.initialize();
    
    try {
      return await this.contract.complianceRecords(recordHash);
    } catch (error) {
      console.error('Failed to check compliance record:', error);
      return false;
    }
  }

  async proposeMint(recipient, amount, complianceRecordHash, complianceProof) {
    if (!this.initialized || !this.signer) {
      await this.connectWallet();
    }
    
    try {
      const amountWei = ethers.utils.parseEther(amount.toString());
      const tx = await this.contract.proposeMint(
        recipient,
        amountWei,
        complianceRecordHash,
        complianceProof || '0x'
      );
      const receipt = await tx.wait();
      
      // Find the MintRequested event
      const event = receipt.events.find(e => e.event === 'MintRequested');
      return event.args.requestId;
    } catch (error) {
      console.error('Mint proposal failed:', error);
      throw error;
    }
  }

  async approveMint(requestId) {
    if (!this.initialized || !this.signer) {
      await this.connectWallet();
    }
    
    try {
      const tx = await this.contract.approveMint(requestId);
      return await tx.wait();
    } catch (error) {
      console.error('Mint approval failed:', error);
      throw error;
    }
  }

  // Helper method to generate mock transaction history
  _getMockTransactionHistory(address, limit) {
    const types = ['send', 'receive', 'mint', 'withdraw'];
    const statuses = ['completed', 'pending', 'failed'];
    
    return Array.from({ length: limit }).map((_, i) => {
      const type = types[Math.floor(Math.random() * types.length)];
      const isIncoming = type === 'receive' || type === 'mint';
      
      return {
        id: `tx_${Date.now() - i * 86400000}_${Math.random().toString(36).substring(2, 10)}`,
        type,
        amount: (Math.random() * 1000).toFixed(2),
        timestamp: new Date(Date.now() - i * 86400000).toISOString(),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        from: isIncoming ? `0x${Math.random().toString(16).substring(2, 42)}` : address,
        to: isIncoming ? address : `0x${Math.random().toString(16).substring(2, 42)}`,
        hash: `0x${Array.from({ length: 64 }).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`
      };
    });
  }
}

// Create singleton instance
const blockchainService = new BlockchainService();
export default blockchainService;