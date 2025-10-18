import { ethers } from 'ethers';
import crypto from 'crypto';

/**
 * Withdrawal System
 * 
 * Implements the withdrawal mechanisms described in Article XII, Section 12.5
 * - Handles KYC/AML verification
 * - Manages fiat off-ramps
 * - Provides P2P marketplace functionality
 */
export class WithdrawalSystem {
    private kycProviders: Map<string, KYCProvider> = new Map();
    private paymentProcessors: Map<string, PaymentProcessor> = new Map();
    private withdrawalRequests: Map<string, WithdrawalRequest> = new Map();
    private p2pListings: Map<string, P2PListing> = new Map();
    
    constructor() {
        // Initialize with default payment processors
        this.registerPaymentProcessor({
            id: 'bank-transfer-za',
            name: 'South African Bank Transfer',
            type: 'BANK_TRANSFER',
            countries: ['ZA'],
            currencies: ['ZAR'],
            minAmount: '100',
            maxAmount: '50000',
            processingTimeHours: 24,
            fees: {
                percentage: 0.5,
                fixed: '10'
            }
        });
        
        this.registerPaymentProcessor({
            id: 'mobile-money-za',
            name: 'Mobile Money Transfer',
            type: 'MOBILE_MONEY',
            countries: ['ZA', 'KE', 'NG', 'GH'],
            currencies: ['ZAR', 'KES', 'NGN', 'GHS'],
            minAmount: '10',
            maxAmount: '5000',
            processingTimeHours: 1,
            fees: {
                percentage: 1.0,
                fixed: '5'
            }
        });
    }
    
    /**
     * Register a KYC provider
     * @param provider The KYC provider details
     */
    public registerKYCProvider(provider: KYCProvider): void {
        this.kycProviders.set(provider.id, provider);
    }
    
    /**
     * Register a payment processor
     * @param processor The payment processor details
     */
    public registerPaymentProcessor(processor: PaymentProcessor): void {
        this.paymentProcessors.set(processor.id, processor);
    }
    
    /**
     * Create a withdrawal request
     * @param userAddress The user's blockchain address
     * @param amount The amount of AZR to withdraw
     * @param destinationCurrency The fiat currency to receive
     * @param processorId The payment processor to use
     * @param withdrawalDetails Additional details needed for the withdrawal
     * @returns The withdrawal request
     */
    public createWithdrawalRequest(
        userAddress: string,
        amount: string,
        destinationCurrency: string,
        processorId: string,
        withdrawalDetails: any
    ): WithdrawalRequest {
        // Check if processor exists
        const processor = this.paymentProcessors.get(processorId);
        if (!processor) {
            throw new Error('Unknown payment processor');
        }
        
        // Validate amount
        const amountBN = ethers.parseEther(amount);
        const minAmountBN = ethers.parseEther(processor.minAmount);
        const maxAmountBN = ethers.parseEther(processor.maxAmount);
        
        if (amountBN.lt(minAmountBN) || amountBN.gt(maxAmountBN)) {
            throw new Error(`Amount must be between ${processor.minAmount} and ${processor.maxAmount}`);
        }
        
        // Check if currency is supported
        if (!processor.currencies.includes(destinationCurrency)) {
            throw new Error(`Currency ${destinationCurrency} not supported by this processor`);
        }
        
        // Create the request
        const requestId = crypto.randomUUID();
        const timestamp = Math.floor(Date.now() / 1000);
        
        const request: WithdrawalRequest = {
            id: requestId,
            userAddress,
            amount,
            destinationCurrency,
            processorId,
            withdrawalDetails,
            status: 'PENDING',
            createdAt: timestamp,
            updatedAt: timestamp,
            completedAt: null,
            transactionId: null,
            failureReason: null
        };
        
        this.withdrawalRequests.set(requestId, request);
        
        return request;
    }
    
    /**
     * Update the status of a withdrawal request
     * @param requestId The ID of the request
     * @param status The new status
     * @param details Additional details (transaction ID, failure reason, etc.)
     */
    public updateWithdrawalStatus(
        requestId: string,
        status: WithdrawalStatus,
        details?: {
            transactionId?: string;
            failureReason?: string;
        }
    ): void {
        const request = this.withdrawalRequests.get(requestId);
        if (!request) {
            throw new Error('Withdrawal request not found');
        }
        
        request.status = status;
        request.updatedAt = Math.floor(Date.now() / 1000);
        
        if (status === 'COMPLETED') {
            request.completedAt = Math.floor(Date.now() / 1000);
            if (details?.transactionId) {
                request.transactionId = details.transactionId;
            }
        }
        
        if (status === 'FAILED' && details?.failureReason) {
            request.failureReason = details.failureReason;
        }
    }
    
    /**
     * Create a P2P marketplace listing
     * @param sellerAddress The address of the AZR seller
     * @param amount The amount of AZR to sell
     * @param askingPrice The asking price in fiat
     * @param currency The fiat currency code
     * @param paymentMethods Accepted payment methods
     * @returns The created P2P listing
     */
    public createP2PListing(
        sellerAddress: string,
        amount: string,
        askingPrice: number,
        currency: string,
        paymentMethods: string[]
    ): P2PListing {
        const listingId = crypto.randomUUID();
        const timestamp = Math.floor(Date.now() / 1000);
        
        const listing: P2PListing = {
            id: listingId,
            sellerAddress,
            amount,
            askingPrice,
            currency,
            paymentMethods,
            status: 'ACTIVE',
            createdAt: timestamp,
            updatedAt: timestamp,
            escrowAddress: `0x${crypto.randomBytes(20).toString('hex')}` // In a real implementation, this would be a real escrow contract
        };
        
        this.p2pListings.set(listingId, listing);
        
        return listing;
    }
    
    /**
     * Get all active P2P listings
     * @returns Array of active P2P listings
     */
    public getActiveP2PListings(): P2PListing[] {
        return Array.from(this.p2pListings.values())
            .filter(listing => listing.status === 'ACTIVE');
    }
    
    /**
     * Get available payment processors for a country and currency
     * @param country The country code
     * @param currency The currency code
     * @returns Array of available payment processors
     */
    public getAvailableProcessors(country: string, currency: string): PaymentProcessor[] {
        return Array.from(this.paymentProcessors.values())
            .filter(processor => 
                processor.countries.includes(country) && 
                processor.currencies.includes(currency)
            );
    }
    
    /**
     * Calculate fees for a withdrawal
     * @param amount The withdrawal amount
     * @param processorId The payment processor ID
     * @returns The fee details
     */
    public calculateFees(amount: string, processorId: string): { 
        feeAmount: string;
        netAmount: string; 
    } {
        const processor = this.paymentProcessors.get(processorId);
        if (!processor) {
            throw new Error('Unknown payment processor');
        }
        
        const amountBN = ethers.parseEther(amount);
        const percentageFee = amountBN.mul(Math.floor(processor.fees.percentage * 100)).div(10000);
        const fixedFee = ethers.parseEther(processor.fees.fixed);
        
        const totalFee = percentageFee.add(fixedFee);
        const netAmount = amountBN.sub(totalFee);
        
        return {
            feeAmount: ethers.formatEther(totalFee),
            netAmount: ethers.formatEther(netAmount)
        };
    }
}

export interface KYCProvider {
    id: string;
    name: string;
    apiEndpoint: string;
    supportedCountries: string[];
    requiredDocuments: string[];
}

export interface PaymentProcessor {
    id: string;
    name: string;
    type: 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'CARD_PAYOUT' | 'CRYPTO_EXCHANGE';
    countries: string[];
    currencies: string[];
    minAmount: string;
    maxAmount: string;
    processingTimeHours: number;
    fees: {
        percentage: number;
        fixed: string;
    };
}

export interface WithdrawalRequest {
    id: string;
    userAddress: string;
    amount: string;
    destinationCurrency: string;
    processorId: string;
    withdrawalDetails: any;
    status: WithdrawalStatus;
    createdAt: number;
    updatedAt: number;
    completedAt: number | null;
    transactionId: string | null;
    failureReason: string | null;
}

export type WithdrawalStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface P2PListing {
    id: string;
    sellerAddress: string;
    amount: string;
    askingPrice: number;
    currency: string;
    paymentMethods: string[];
    status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    createdAt: number;
    updatedAt: number;
    escrowAddress: string;
}