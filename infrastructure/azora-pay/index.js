/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Azora Pay - Self-Hosted Payment Processor
 * Constitutional Article VI: No external payment processors (Stripe, PayPal, etc.)
 * Country-specific payment methods and currency support
 * 
 * Author: Sizwe Ngwenya <sizwe@azora.world>
 */

const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const PORT = process.env.AZORA_PAY_PORT || 5000;

// Supported payment methods by country
const PAYMENT_METHODS = {
  ZA: ['EFT', 'SnapScan', 'Zapper', 'Card', 'AZR'],
  US: ['ACH', 'Wire', 'Card', 'AZR'],
  GB: ['BACS', 'Faster Payments', 'Card', 'AZR'],
  NG: ['Bank Transfer', 'Paystack', 'Flutterwave', 'AZR'],
  KE: ['M-Pesa', 'Bank Transfer', 'Card', 'AZR'],
};

// Exchange rates (to USD)
const EXCHANGE_RATES = {
  ZAR: 18.5,
  USD: 1.0,
  GBP: 0.79,
  NGN: 790,
  KES: 130,
  AZR: 0.02, // 1 AZR = $50
};

// In-memory stores
const accounts = new Map();
const transactions = new Map();
const withdrawals = new Map();

// Generate secure ID
function generateId(prefix) {
  return `${prefix}_${crypto.randomBytes(16).toString('hex')}`;
}

// Convert between currencies
function convertCurrency(amount, from, to) {
  const usdAmount = amount / EXCHANGE_RATES[from];
  return usdAmount * EXCHANGE_RATES[to];
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'azora-pay',
    version: '1.0.0',
    compliance: 'Article VI compliant - No external processors',
    timestamp: new Date().toISOString(),
    stats: {
      accounts: accounts.size,
      transactions: transactions.size,
      withdrawals: withdrawals.size,
    },
  });
});

// Get supported payment methods for country
app.get('/payment-methods/:country', (req, res) => {
  const country = req.params.country.toUpperCase();
  const methods = PAYMENT_METHODS[country] || ['Card', 'AZR'];
  
  res.json({
    success: true,
    country,
    methods,
    note: country === 'ZA' ? 'South African payment methods 🇿🇦' : undefined,
  });
});

// Create payment account
app.post('/accounts', (req, res) => {
  const { userId, type, country, currency } = req.body;
  
  const accountId = generateId('azr_acc');
  const accountCurrency = currency || (country === 'ZA' ? 'ZAR' : 'USD');
  
  const account = {
    id: accountId,
    userId,
    type: type || 'standard',
    country: country || 'ZA',
    currency: accountCurrency,
    balance: 0,
    balanceAZR: 0, // Azora Coin balance
    createdAt: new Date().toISOString(),
    status: 'active',
  };

  accounts.set(accountId, account);

  res.json({
    success: true,
    account,
    message: country === 'ZA' ? 'Lekker! SA account created 🇿🇦' : 'Account created successfully',
  });
});

// Get account details
app.get('/accounts/:id', (req, res) => {
  const account = accounts.get(req.params.id);
  
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  // Calculate balance in multiple currencies
  const balances = {
    primary: {
      amount: account.balance,
      currency: account.currency,
    },
    azr: account.balanceAZR,
    usd: convertCurrency(account.balance, account.currency, 'USD'),
  };

  if (account.country === 'ZA') {
    balances.zar = account.currency === 'ZAR' ? account.balance : convertCurrency(account.balance, account.currency, 'ZAR');
  }

  res.json({
    success: true,
    account: {
      ...account,
      balances,
    },
  });
});

// Process payment
app.post('/payments', (req, res) => {
  const { fromAccount, toAccount, amount, currency, description, method } = req.body;

  if (!accounts.has(fromAccount) || !accounts.has(toAccount)) {
    return res.status(404).json({ error: 'Account not found' });
  }

  const sender = accounts.get(fromAccount);
  const receiver = accounts.get(toAccount);

  // Convert amount if currencies differ
  let debitAmount = amount;
  let creditAmount = amount;

  if (sender.currency !== currency) {
    debitAmount = convertCurrency(amount, currency, sender.currency);
  }

  if (receiver.currency !== currency) {
    creditAmount = convertCurrency(amount, currency, receiver.currency);
  }

  if (sender.balance < debitAmount) {
    return res.status(400).json({ 
      error: 'Insufficient funds',
      required: debitAmount,
      available: sender.balance,
    });
  }

  const transactionId = generateId('azr_txn');
  
  const transaction = {
    id: transactionId,
    from: fromAccount,
    to: toAccount,
    amount: {
      original: amount,
      currency,
      debitAmount,
      creditAmount,
    },
    method: method || 'internal',
    description,
    status: 'completed',
    createdAt: new Date().toISOString(),
  };

  // Update balances
  sender.balance -= debitAmount;
  receiver.balance += creditAmount;

  transactions.set(transactionId, transaction);

  res.json({
    success: true,
    transaction,
    message: sender.country === 'ZA' ? 'Payment successful! 🇿🇦' : 'Payment completed',
  });
});

// Get account balance
app.get('/accounts/:id/balance', (req, res) => {
  const account = accounts.get(req.params.id);
  
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  res.json({
    success: true,
    accountId: account.id,
    balance: account.balance,
    balanceAZR: account.balanceAZR,
    currency: account.currency,
    country: account.country,
    balanceFormatted: account.country === 'ZA' 
      ? `R${account.balance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`
      : `${account.currency} ${account.balance.toLocaleString()}`,
  });
});

// Get transaction history
app.get('/accounts/:id/transactions', (req, res) => {
  const accountTransactions = Array.from(transactions.values()).filter(
    t => t.from === req.params.id || t.to === req.params.id
  );

  res.json({
    success: true,
    total: accountTransactions.length,
    transactions: accountTransactions.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    ),
  });
});

// Withdrawal endpoint (minimum 50 AZR or equivalent)
app.post('/withdrawals', (req, res) => {
  const { accountId, amount, currency, method } = req.body;

  const account = accounts.get(accountId);
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  // Convert to AZR to check minimum
  const azrAmount = convertCurrency(amount, currency || account.currency, 'AZR');
  
  if (azrAmount < 50) {
    return res.status(400).json({ 
      error: 'Minimum withdrawal is 50 AZR or equivalent',
      minimum: 50,
      requested: azrAmount,
      message: account.country === 'ZA' 
        ? `Minimum R${(50 * EXCHANGE_RATES.ZAR / EXCHANGE_RATES.AZR).toLocaleString()} required 🇿🇦`
        : 'Please increase withdrawal amount',
    });
  }

  const withdrawAmount = currency === account.currency 
    ? amount 
    : convertCurrency(amount, currency, account.currency);

  if (account.balance < withdrawAmount) {
    return res.status(400).json({ error: 'Insufficient funds' });
  }

  const withdrawalId = generateId('azr_wth');

  const withdrawal = {
    id: withdrawalId,
    accountId,
    amount,
    currency: currency || account.currency,
    method: method || (account.country === 'ZA' ? 'EFT' : 'Bank Transfer'),
    status: 'pending',
    createdAt: new Date().toISOString(),
    estimatedArrival: account.country === 'ZA' ? '1-2 business days' : '3-5 business days',
  };

  // Deduct from balance
  account.balance -= withdrawAmount;
  withdrawals.set(withdrawalId, withdrawal);

  res.json({
    success: true,
    withdrawal,
    message: account.country === 'ZA' 
      ? 'Withdrawal initiated! Funds will reflect in 1-2 business days 🇿🇦'
      : 'Withdrawal initiated',
  });
});

// Get withdrawal status
app.get('/withdrawals/:id', (req, res) => {
  const withdrawal = withdrawals.get(req.params.id);
  
  if (!withdrawal) {
    return res.status(404).json({ error: 'Withdrawal not found' });
  }

  res.json({
    success: true,
    withdrawal,
  });
});

// Deposit funds (simulation for testing)
app.post('/deposits', (req, res) => {
  const { accountId, amount, currency, method } = req.body;

  const account = accounts.get(accountId);
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  const depositAmount = currency === account.currency 
    ? amount 
    : convertCurrency(amount, currency || account.currency, account.currency);

  account.balance += depositAmount;

  const transactionId = generateId('azr_dep');
  const transaction = {
    id: transactionId,
    type: 'deposit',
    accountId,
    amount: depositAmount,
    currency: account.currency,
    method: method || 'bank_transfer',
    status: 'completed',
    createdAt: new Date().toISOString(),
  };

  transactions.set(transactionId, transaction);

  res.json({
    success: true,
    transaction,
    newBalance: account.balance,
    message: account.country === 'ZA' ? 'Deposit received! 🇿🇦' : 'Deposit completed',
  });
});

// Convert AZR to fiat
app.post('/convert/azr-to-fiat', (req, res) => {
  const { accountId, amountAZR, targetCurrency } = req.body;

  const account = accounts.get(accountId);
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  if (account.balanceAZR < amountAZR) {
    return res.status(400).json({ error: 'Insufficient AZR balance' });
  }

  const fiatAmount = convertCurrency(amountAZR, 'AZR', targetCurrency || account.currency);

  account.balanceAZR -= amountAZR;
  account.balance += fiatAmount;

  res.json({
    success: true,
    converted: {
      from: `${amountAZR} AZR`,
      to: `${fiatAmount} ${targetCurrency || account.currency}`,
    },
    newBalances: {
      azr: account.balanceAZR,
      fiat: account.balance,
    },
  });
});

app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  💳 AZORA PAY - CONSTITUTIONAL PAYMENT PROCESSOR      ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Port: ${PORT}`);
  console.log('Status: Operational');
  console.log('Compliance: Article VI (No external processors)');
  console.log('');
  console.log('Supported Countries:');
  console.log('  🇿🇦 South Africa (EFT, SnapScan, Zapper)');
  console.log('  🇺🇸 United States (ACH, Wire Transfer)');
  console.log('  🇬🇧 United Kingdom (BACS, Faster Payments)');
  console.log('  🇳�� Nigeria (Bank Transfer, Paystack, Flutterwave)');
  console.log('  🇰🇪 Kenya (M-Pesa, Bank Transfer)');
  console.log('');
  console.log('Features:');
  console.log('  • Multi-currency support');
  console.log('  • Country-specific payment methods');
  console.log('  • AZR coin integration');
  console.log('  • Minimum 50 AZR withdrawal');
  console.log('  • Real-time currency conversion');
  console.log('');
});

module.exports = app;
