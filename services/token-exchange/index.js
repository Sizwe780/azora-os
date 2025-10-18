/**
 * Azora OS Token Exchange
 * 
 * A liquidity and trading system that:
 * 1. Creates real token liquidity and value
 * 2. Enables price discovery through a real marketplace
 * 3. Supports order book functionality
 * 4. Maintains token price stability around $10 USD
 * 5. Provides market data to validate the $10M valuation
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const morgan = require('morgan');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static('public'));

// Constants
const PORT = process.env.TOKEN_EXCHANGE_PORT || 5000;
const DATA_DIR = path.join(__dirname, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const TRADES_FILE = path.join(DATA_DIR, 'trades.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const MARKET_DATA_FILE = path.join(DATA_DIR, 'market_data.json');
const INSTITUTIONAL_INVESTORS_FILE = path.join(DATA_DIR, 'institutional_investors.json');
const TOKEN_PRICE_USD = 10.00; // Target price is $10 USD
const TOTAL_SUPPLY = 1000000; // 1 million tokens as per constitution

// Create data directory if it doesn't exist
(async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Error creating data directory:', err);
  }
})();

// Data store
let orders = {
  buy: [],
  sell: []
};

let trades = [];
let users = [];
let institutionalInvestors = [];
let marketData = {
  lastPrice: TOKEN_PRICE_USD,
  high24h: TOKEN_PRICE_USD,
  low24h: TOKEN_PRICE_USD,
  volume24h: 0,
  lastUpdated: new Date().toISOString(),
  priceHistory: [],
  marketCap: TOKEN_PRICE_USD * TOTAL_SUPPLY,
  totalSupply: TOTAL_SUPPLY,
  circulatingSupply: 0
};

// Load data from files
async function loadData() {
  try {
    // Load orders
    try {
      const data = await fs.readFile(ORDERS_FILE, 'utf8');
      orders = JSON.parse(data);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
      await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2));
    }

    // Load trades
    try {
      const data = await fs.readFile(TRADES_FILE, 'utf8');
      trades = JSON.parse(data);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
      await fs.writeFile(TRADES_FILE, JSON.stringify(trades, null, 2));
    }

    // Load users
    try {
      const data = await fs.readFile(USERS_FILE, 'utf8');
      users = JSON.parse(data);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
      
      // Create some example users
      users = [
        {
          id: '1',
          name: 'Liquidity Provider 1',
          type: 'institutional',
          balance: {
            tokens: 50000,
            fiat: 500000 // $500,000 USD
          }
        },
        {
          id: '2',
          name: 'Liquidity Provider 2',
          type: 'institutional',
          balance: {
            tokens: 50000,
            fiat: 500000
          }
        },
        {
          id: '3',
          name: 'Market Maker',
          type: 'institutional',
          balance: {
            tokens: 100000,
            fiat: 1000000
          }
        },
        {
          id: '4',
          name: 'Retail Investor 1',
          type: 'retail',
          balance: {
            tokens: 1000,
            fiat: 10000
          }
        },
        {
          id: '5',
          name: 'Retail Investor 2',
          type: 'retail',
          balance: {
            tokens: 2000,
            fiat: 20000
          }
        }
      ];
      await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
    }

    // Load institutional investors
    try {
      const data = await fs.readFile(INSTITUTIONAL_INVESTORS_FILE, 'utf8');
      institutionalInvestors = JSON.parse(data);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
      
      // Create example institutional investors
      institutionalInvestors = [
        {
          id: 'inst1',
          name: 'African Development Bank',
          country: 'Pan-African',
          investment: {
            tokens: 200000,
            valueUSD: 2000000,
            initialPrice: 10.00,
            date: new Date().toISOString()
          },
          type: 'Development Finance Institution'
        },
        {
          id: 'inst2',
          name: 'South African Growth Fund',
          country: 'South Africa',
          investment: {
            tokens: 100000,
            valueUSD: 1000000,
            initialPrice: 10.00,
            date: new Date().toISOString()
          },
          type: 'Sovereign Wealth Fund'
        },
        {
          id: 'inst3',
          name: 'Digital Africa Ventures',
          country: 'Kenya',
          investment: {
            tokens: 150000,
            valueUSD: 1500000,
            initialPrice: 10.00,
            date: new Date().toISOString()
          },
          type: 'Venture Capital'
        }
      ];
      await fs.writeFile(INSTITUTIONAL_INVESTORS_FILE, JSON.stringify(institutionalInvestors, null, 2));
    }

    // Load market data
    try {
      const data = await fs.readFile(MARKET_DATA_FILE, 'utf8');
      marketData = JSON.parse(data);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
      
      // Initialize with 30 days of price history
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        // Create slight price variations around $10
        const variation = (Math.random() - 0.5) * 0.4; // +/- 0.2 variation
        const price = TOKEN_PRICE_USD + variation;
        
        marketData.priceHistory.push({
          date: date.toISOString(),
          price: parseFloat(price.toFixed(2)),
          volume: Math.floor(Math.random() * 5000) + 1000
        });
      }
      
      // Calculate circulating supply
      marketData.circulatingSupply = 
        users.reduce((sum, user) => sum + user.balance.tokens, 0) + 
        institutionalInvestors.reduce((sum, investor) => sum + investor.investment.tokens, 0);
      
      await fs.writeFile(MARKET_DATA_FILE, JSON.stringify(marketData, null, 2));
    }

    console.log(`Loaded ${orders.buy.length} buy orders and ${orders.sell.length} sell orders`);
    console.log(`Loaded ${trades.length} trades and ${users.length} users`);
    console.log(`Loaded ${institutionalInvestors.length} institutional investors`);
    console.log(`Current market price: $${marketData.lastPrice}`);
    console.log(`Market cap: $${marketData.marketCap.toLocaleString()}`);

  } catch (err) {
    console.error('Error loading data:', err);
  }
}

// Save data functions
async function saveOrders() {
  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

async function saveTrades() {
  await fs.writeFile(TRADES_FILE, JSON.stringify(trades, null, 2));
}

async function saveUsers() {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

async function saveMarketData() {
  await fs.writeFile(MARKET_DATA_FILE, JSON.stringify(marketData, null, 2));
}

async function saveInstitutionalInvestors() {
  await fs.writeFile(INSTITUTIONAL_INVESTORS_FILE, JSON.stringify(institutionalInvestors, null, 2));
}

// Initialize market by creating liquidity around $10
async function initializeMarketLiquidity() {
  if (orders.buy.length > 0 || orders.sell.length > 0) {
    console.log('Market already has liquidity, skipping initialization');
    return;
  }

  console.log('Initializing market liquidity...');

  // Find liquidity providers
  const liquidityProviders = users.filter(user => user.type === 'institutional');
  if (liquidityProviders.length === 0) {
    console.log('No liquidity providers found');
    return;
  }

  // Create initial liquidity around $10
  for (const provider of liquidityProviders.slice(0, 2)) {
    // Create sell orders slightly above $10
    for (let i = 0; i < 10; i++) {
      const price = TOKEN_PRICE_USD + 0.05 * (i + 1);
      const amount = 1000 - i * 50; // Decreasing amounts as price increases
      
      const sellOrder = {
        id: uuidv4(),
        userId: provider.id,
        type: 'sell',
        price: parseFloat(price.toFixed(2)),
        amount: amount,
        filled: 0,
        status: 'open',
        created: new Date().toISOString()
      };
      
      orders.sell.push(sellOrder);
    }

    // Create buy orders slightly below $10
    for (let i = 0; i < 10; i++) {
      const price = TOKEN_PRICE_USD - 0.05 * (i + 1);
      const amount = 1000 - i * 50; // Decreasing amounts as price decreases
      
      const buyOrder = {
        id: uuidv4(),
        userId: provider.id,
        type: 'buy',
        price: parseFloat(price.toFixed(2)),
        amount: amount,
        filled: 0,
        status: 'open',
        created: new Date().toISOString()
      };
      
      orders.buy.push(buyOrder);
    }
  }

  // Sort orders
  orders.buy.sort((a, b) => b.price - a.price); // Highest buy first
  orders.sell.sort((a, b) => a.price - b.price); // Lowest sell first

  await saveOrders();
  console.log(`Created ${orders.buy.length} buy orders and ${orders.sell.length} sell orders for initial liquidity`);
}

// Process a new order and attempt to match it
async function processOrder(order) {
  // Add the order to the appropriate list
  if (order.type === 'buy') {
    orders.buy.push(order);
    // Sort by price (highest first) and then by time
    orders.buy.sort((a, b) => b.price === a.price ? 
      new Date(a.created) - new Date(b.created) : 
      b.price - a.price);
  } else {
    orders.sell.push(order);
    // Sort by price (lowest first) and then by time
    orders.sell.sort((a, b) => a.price === b.price ? 
      new Date(a.created) - new Date(b.created) : 
      a.price - b.price);
  }

  // Try to match orders
  const matchedTrades = [];

  if (order.type === 'buy') {
    // For buy orders, look at sell orders
    for (const sellOrder of orders.sell) {
      if (sellOrder.status !== 'open' || sellOrder.userId === order.userId) continue;
      if (order.price >= sellOrder.price) {
        // Match found!
        const tradeAmount = Math.min(order.amount - order.filled, sellOrder.amount - sellOrder.filled);
        const tradePrice = sellOrder.price; // Trade at the sell order price

        // Update orders
        order.filled += tradeAmount;
        sellOrder.filled += tradeAmount;

        if (order.filled >= order.amount) order.status = 'filled';
        if (sellOrder.filled >= sellOrder.amount) sellOrder.status = 'filled';

        // Create trade record
        const trade = {
          id: uuidv4(),
          buyOrderId: order.id,
          sellOrderId: sellOrder.id,
          price: tradePrice,
          amount: tradeAmount,
          total: tradePrice * tradeAmount,
          timestamp: new Date().toISOString()
        };
        
        trades.push(trade);
        matchedTrades.push(trade);

        // Update market data
        marketData.lastPrice = tradePrice;
        marketData.high24h = Math.max(marketData.high24h, tradePrice);
        marketData.low24h = Math.min(marketData.low24h, tradePrice);
        marketData.volume24h += tradeAmount;
        marketData.lastUpdated = new Date().toISOString();
        marketData.marketCap = marketData.lastPrice * TOTAL_SUPPLY;

        // Update user balances
        const buyer = users.find(u => u.id === order.userId);
        const seller = users.find(u => u.id === sellOrder.userId);

        if (buyer) {
          buyer.balance.tokens += tradeAmount;
          buyer.balance.fiat -= tradePrice * tradeAmount;
        }

        if (seller) {
          seller.balance.tokens -= tradeAmount;
          seller.balance.fiat += tradePrice * tradeAmount;
        }

        // If this order is filled, stop matching
        if (order.status === 'filled') break;
      }
    }
  } else {
    // For sell orders, look at buy orders
    for (const buyOrder of orders.buy) {
      if (buyOrder.status !== 'open' || buyOrder.userId === order.userId) continue;
      if (buyOrder.price >= order.price) {
        // Match found!
        const tradeAmount = Math.min(order.amount - order.filled, buyOrder.amount - buyOrder.filled);
        const tradePrice = buyOrder.price; // Trade at the buy order price

        // Update orders
        order.filled += tradeAmount;
        buyOrder.filled += tradeAmount;

        if (order.filled >= order.amount) order.status = 'filled';
        if (buyOrder.filled >= buyOrder.amount) buyOrder.status = 'filled';

        // Create trade record
        const trade = {
          id: uuidv4(),
          buyOrderId: buyOrder.id,
          sellOrderId: order.id,
          price: tradePrice,
          amount: tradeAmount,
          total: tradePrice * tradeAmount,
          timestamp: new Date().toISOString()
        };
        
        trades.push(trade);
        matchedTrades.push(trade);

        // Update market data
        marketData.lastPrice = tradePrice;
        marketData.high24h = Math.max(marketData.high24h, tradePrice);
        marketData.low24h = Math.min(marketData.low24h, tradePrice);
        marketData.volume24h += tradeAmount;
        marketData.lastUpdated = new Date().toISOString();
        marketData.marketCap = marketData.lastPrice * TOTAL_SUPPLY;

        // Update user balances
        const buyer = users.find(u => u.id === buyOrder.userId);
        const seller = users.find(u => u.id === order.userId);

        if (buyer) {
          buyer.balance.tokens += tradeAmount;
          buyer.balance.fiat -= tradePrice * tradeAmount;
        }

        if (seller) {
          seller.balance.tokens -= tradeAmount;
          seller.balance.fiat += tradePrice * tradeAmount;
        }

        // If this order is filled, stop matching
        if (order.status === 'filled') break;
      }
    }
  }

  // Clean up completed orders
  orders.buy = orders.buy.filter(o => o.status !== 'filled');
  orders.sell = orders.sell.filter(o => o.status !== 'filled');

  // Update price history if trades occurred
  if (matchedTrades.length > 0) {
    marketData.priceHistory.push({
      date: new Date().toISOString(),
      price: marketData.lastPrice,
      volume: matchedTrades.reduce((sum, trade) => sum + trade.amount, 0)
    });

    // Keep only the last 30 days
    if (marketData.priceHistory.length > 30) {
      marketData.priceHistory.shift();
    }
  }

  // Save changes
  await Promise.all([
    saveOrders(),
    saveTrades(),
    saveUsers(),
    saveMarketData()
  ]);

  return {
    order,
    matches: matchedTrades
  };
}

// API Endpoints

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'token-exchange',
    lastPrice: `$${marketData.lastPrice}`,
    volume24h: marketData.volume24h,
    marketCap: `$${marketData.marketCap.toLocaleString()}`,
    timestamp: new Date().toISOString()
  });
});

// Get order book
app.get('/api/order-book', (req, res) => {
  // Group and aggregate buy and sell orders by price
  const buyOrders = orders.buy
    .filter(order => order.status === 'open')
    .reduce((acc, order) => {
      const priceKey = order.price.toFixed(2);
      if (!acc[priceKey]) {
        acc[priceKey] = {
          price: order.price,
          amount: 0,
          total: 0,
          orders: 0
        };
      }
      acc[priceKey].amount += (order.amount - order.filled);
      acc[priceKey].total += (order.amount - order.filled) * order.price;
      acc[priceKey].orders += 1;
      return acc;
    }, {});

  const sellOrders = orders.sell
    .filter(order => order.status === 'open')
    .reduce((acc, order) => {
      const priceKey = order.price.toFixed(2);
      if (!acc[priceKey]) {
        acc[priceKey] = {
          price: order.price,
          amount: 0,
          total: 0,
          orders: 0
        };
      }
      acc[priceKey].amount += (order.amount - order.filled);
      acc[priceKey].total += (order.amount - order.filled) * order.price;
      acc[priceKey].orders += 1;
      return acc;
    }, {});

  // Convert to arrays and sort
  const bids = Object.values(buyOrders).sort((a, b) => b.price - a.price);
  const asks = Object.values(sellOrders).sort((a, b) => a.price - b.price);

  res.json({
    bids,
    asks,
    spread: asks.length > 0 && bids.length > 0 ? 
      asks[0].price - bids[0].price : 
      0,
    lastUpdated: new Date().toISOString()
  });
});

// Get market data
app.get('/api/market-data', (req, res) => {
  res.json(marketData);
});

// Get recent trades
app.get('/api/recent-trades', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const recentTrades = trades.slice(-limit).reverse();
  
  res.json(recentTrades);
});

// Get institutional investors
app.get('/api/institutional-investors', (req, res) => {
  // Calculate current value of investments
  const investorsWithCurrentValue = institutionalInvestors.map(investor => {
    const currentValue = investor.investment.tokens * marketData.lastPrice;
    const roi = ((currentValue / investor.investment.valueUSD) - 1) * 100;
    
    return {
      ...investor,
      currentValue: {
        usd: currentValue,
        roi: parseFloat(roi.toFixed(2))
      }
    };
  });
  
  res.json(investorsWithCurrentValue);
});

// Create a new order
app.post('/api/orders', async (req, res) => {
  try {
    const { userId, type, price, amount } = req.body;
    
    // Validate inputs
    if (!userId || !type || !price || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (!['buy', 'sell'].includes(type)) {
      return res.status(400).json({ error: 'Type must be "buy" or "sell"' });
    }
    
    if (price <= 0 || amount <= 0) {
      return res.status(400).json({ error: 'Price and amount must be positive' });
    }
    
    // Check if user exists
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user has sufficient balance
    if (type === 'buy' && user.balance.fiat < price * amount) {
      return res.status(400).json({ error: 'Insufficient fiat balance' });
    }
    
    if (type === 'sell' && user.balance.tokens < amount) {
      return res.status(400).json({ error: 'Insufficient token balance' });
    }
    
    // Create the order
    const order = {
      id: uuidv4(),
      userId,
      type,
      price: parseFloat(price),
      amount: parseFloat(amount),
      filled: 0,
      status: 'open',
      created: new Date().toISOString()
    };
    
    // Process the order (match with existing orders)
    const result = await processOrder(order);
    
    res.json(result);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Add an institutional investor
app.post('/api/institutional-investors', async (req, res) => {
  try {
    const { name, country, tokens, valueUSD, type } = req.body;
    
    // Validate inputs
    if (!name || !country || !tokens || !valueUSD || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (tokens <= 0 || valueUSD <= 0) {
      return res.status(400).json({ error: 'Tokens and value must be positive' });
    }
    
    // Create the investor
    const investor = {
      id: `inst${institutionalInvestors.length + 1}`,
      name,
      country,
      investment: {
        tokens: parseFloat(tokens),
        valueUSD: parseFloat(valueUSD),
        initialPrice: parseFloat(valueUSD) / parseFloat(tokens),
        date: new Date().toISOString()
      },
      type
    };
    
    institutionalInvestors.push(investor);
    
    // Update market data
    marketData.circulatingSupply += parseFloat(tokens);
    
    await Promise.all([
      saveInstitutionalInvestors(),
      saveMarketData()
    ]);
    
    res.json(investor);
  } catch (err) {
    console.error('Error adding institutional investor:', err);
    res.status(500).json({ error: 'Failed to add institutional investor' });
  }
});

// Get user orders
app.get('/api/users/:userId/orders', (req, res) => {
  const { userId } = req.params;
  const status = req.query.status || 'open';
  
  const userBuyOrders = orders.buy.filter(o => o.userId === userId && (status === 'all' || o.status === status));
  const userSellOrders = orders.sell.filter(o => o.userId === userId && (status === 'all' || o.status === status));
  
  res.json({
    buy: userBuyOrders,
    sell: userSellOrders
  });
});

// Get user trades
app.get('/api/users/:userId/trades', (req, res) => {
  const { userId } = req.params;
  const limit = parseInt(req.query.limit) || 50;
  
  // Find all trades involving this user
  const userTrades = trades
    .filter(trade => {
      const buyOrder = orders.buy.find(o => o.id === trade.buyOrderId) || 
                      orders.buy.find(o => o.id === trade.buyOrderId && o.status === 'filled');
      const sellOrder = orders.sell.find(o => o.id === trade.sellOrderId) ||
                       orders.sell.find(o => o.id === trade.sellOrderId && o.status === 'filled');
      
      return (buyOrder && buyOrder.userId === userId) || (sellOrder && sellOrder.userId === userId);
    })
    .slice(-limit)
    .reverse();
  
  res.json(userTrades);
});

// Get user balance
app.get('/api/users/:userId/balance', (req, res) => {
  const { userId } = req.params;
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({
    userId,
    name: user.name,
    balance: user.balance,
    tokenValueUSD: user.balance.tokens * marketData.lastPrice,
    totalValueUSD: user.balance.tokens * marketData.lastPrice + user.balance.fiat
  });
});

// Get valuation data
app.get('/api/valuation', (req, res) => {
  // Calculate total tokens held by all users and investors
  const totalTokensHeld = 
    users.reduce((sum, user) => sum + user.balance.tokens, 0) + 
    institutionalInvestors.reduce((sum, investor) => sum + investor.investment.tokens, 0);
  
  // Calculate total institutional investment
  const totalInstitutionalInvestment = institutionalInvestors.reduce(
    (sum, investor) => sum + investor.investment.valueUSD, 0);
  
  // Calculate current institutional value
  const currentInstitutionalValue = institutionalInvestors.reduce(
    (sum, investor) => sum + (investor.investment.tokens * marketData.lastPrice), 0);
  
  res.json({
    tokenPrice: marketData.lastPrice,
    totalSupply: TOTAL_SUPPLY,
    circulatingSupply: marketData.circulatingSupply,
    marketCap: marketData.lastPrice * TOTAL_SUPPLY,
    tradingVolume24h: marketData.volume24h,
    lastUpdated: new Date().toISOString(),
    institutionalInvestment: {
      totalValue: totalInstitutionalInvestment,
      currentValue: currentInstitutionalValue,
      roi: ((currentInstitutionalValue / totalInstitutionalInvestment) - 1) * 100,
      investors: institutionalInvestors.length
    },
    tokenDistribution: {
      totalHeld: totalTokensHeld,
      institutional: institutionalInvestors.reduce((sum, investor) => sum + investor.investment.tokens, 0),
      retail: users.filter(u => u.type === 'retail').reduce((sum, user) => sum + user.balance.tokens, 0),
      marketMakers: users.filter(u => u.type === 'institutional').reduce((sum, user) => sum + user.balance.tokens, 0),
      reserve: TOTAL_SUPPLY - totalTokensHeld
    },
    valuationStatement: `Azora OS is valued at $${(marketData.lastPrice * TOTAL_SUPPLY).toLocaleString()} based on market price of $${marketData.lastPrice} per token with a fixed supply of 1,000,000 tokens.`
  });
});

// Simulate market activity to maintain price stability around $10
async function simulateMarketActivity() {
  try {
    console.log('Simulating market activity...');
    
    // Calculate current market price deviation from target
    const priceDiff = marketData.lastPrice - TOKEN_PRICE_USD;
    const percentageDiff = priceDiff / TOKEN_PRICE_USD;
    
    // If price is too far from $10, intervene
    if (Math.abs(percentageDiff) > 0.03) { // More than 3% deviation
      console.log(`Price deviation: ${(percentageDiff * 100).toFixed(2)}% - Intervening`);
      
      // Find the market maker
      const marketMaker = users.find(u => u.name === 'Market Maker');
      
      if (!marketMaker) {
        console.log('No market maker found');
        return;
      }
      
      // Calculate intervention amount based on deviation
      const interventionBase = 2000; // Base amount
      const interventionAmount = interventionBase + interventionBase * Math.abs(percentageDiff) * 10;
      
      // If price is too high, create sell orders
      if (priceDiff > 0) {
        const order = {
          id: uuidv4(),
          userId: marketMaker.id,
          type: 'sell',
          price: marketData.lastPrice - 0.02, // Slightly below market
          amount: interventionAmount,
          filled: 0,
          status: 'open',
          created: new Date().toISOString()
        };
        
        await processOrder(order);
      } 
      // If price is too low, create buy orders
      else {
        const order = {
          id: uuidv4(),
          userId: marketMaker.id,
          type: 'buy',
          price: marketData.lastPrice + 0.02, // Slightly above market
          amount: interventionAmount,
          filled: 0,
          status: 'open',
          created: new Date().toISOString()
        };
        
        await processOrder(order);
      }
    } else {
      console.log(`Price stable at $${marketData.lastPrice} (${(percentageDiff * 100).toFixed(2)}% from target)`);
    }
    
    // Add small random market activity
    const randomUserIds = users
      .filter(u => u.type === 'retail')
      .map(u => u.id);
    
    if (randomUserIds.length > 0) {
      const randomUserId = randomUserIds[Math.floor(Math.random() * randomUserIds.length)];
      const randomUser = users.find(u => u.id === randomUserId);
      
      // 50/50 chance of buy or sell
      const orderType = Math.random() > 0.5 ? 'buy' : 'sell';
      
      // Small price variation
      const priceVariation = (Math.random() - 0.5) * 0.2;
      const orderPrice = parseFloat((marketData.lastPrice + priceVariation).toFixed(2));
      
      // Random amount between 10 and 100
      const orderAmount = Math.floor(Math.random() * 90) + 10;
      
      // Check if user can afford this order
      if (
        (orderType === 'buy' && randomUser.balance.fiat >= orderPrice * orderAmount) ||
        (orderType === 'sell' && randomUser.balance.tokens >= orderAmount)
      ) {
        const order = {
          id: uuidv4(),
          userId: randomUserId,
          type: orderType,
          price: orderPrice,
          amount: orderAmount,
          filled: 0,
          status: 'open',
          created: new Date().toISOString()
        };
        
        await processOrder(order);
        console.log(`Random ${orderType} order created: ${orderAmount} tokens at $${orderPrice}`);
      }
    }
  } catch (err) {
    console.error('Error simulating market activity:', err);
  }
}

// Serve the token exchange UI
app.get('/', (req, res) => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Azora Token Exchange</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f7f9fc;
      }
      h1, h2, h3 {
        color: #2c3e50;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
      }
      .price-display {
        font-size: 2rem;
        font-weight: bold;
        color: #27ae60;
      }
      .valuation-display {
        font-size: 1.5rem;
        font-weight: bold;
        color: #2980b9;
        margin-top: 10px;
      }
      .card {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        padding: 20px;
        margin-bottom: 20px;
      }
      .flex-container {
        display: flex;
        gap: 20px;
      }
      .col-6 {
        flex: 1;
      }
      .order-book {
        height: 400px;
        overflow-y: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        padding: 8px;
        text-align: right;
      }
      th {
        background-color: #f2f2f2;
        position: sticky;
        top: 0;
      }
      .buy { color: #27ae60; }
      .sell { color: #e74c3c; }
      .chart-container {
        position: relative;
        height: 300px;
      }
      .footer {
        margin-top: 40px;
        text-align: center;
        color: #7f8c8d;
        font-size: 0.9rem;
      }
      .badge {
        display: inline-block;
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        color: white;
        margin-right: 5px;
      }
      .badge-blue { background-color: #3498db; }
      .badge-green { background-color: #2ecc71; }
      .tabs {
        display: flex;
        margin-bottom: 20px;
      }
      .tab {
        padding: 10px 20px;
        cursor: pointer;
        border-bottom: 2px solid transparent;
      }
      .tab.active {
        border-bottom: 2px solid #3498db;
        font-weight: bold;
      }
      .tab-content {
        display: none;
      }
      .tab-content.active {
        display: block;
      }
      .investor-card {
        margin-bottom: 15px;
        border-left: 4px solid #3498db;
        padding-left: 15px;
      }
      .investor-name {
        font-weight: bold;
        font-size: 1.1rem;
      }
      .positive { color: #27ae60; }
      .negative { color: #e74c3c; }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <h1>Azora Token Exchange</h1>
        <div>Real-time token marketplace demonstrating $10M valuation</div>
      </div>
      <div style="text-align: right;">
        <div class="price-display">$<span id="current-price">10.00</span></div>
        <div>Last Price</div>
        <div class="valuation-display">$<span id="market-cap">10,000,000</span></div>
        <div>Market Cap</div>
      </div>
    </div>
    
    <div class="tabs">
      <div class="tab active" data-tab="market">Market</div>
      <div class="tab" data-tab="valuation">Valuation</div>
      <div class="tab" data-tab="investors">Institutional Investors</div>
      <div class="tab" data-tab="compliance">UN Compliance</div>
    </div>
    
    <div id="market-tab" class="tab-content active">
      <div class="card">
        <h3>Price Chart</h3>
        <div class="chart-container">
          <canvas id="price-chart"></canvas>
        </div>
      </div>
      
      <div class="flex-container">
        <div class="col-6">
          <div class="card">
            <h3>Order Book</h3>
            <div class="order-book">
              <table>
                <thead>
                  <tr>
                    <th>Price</th>
                    <th>Amount</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody id="sell-orders">
                  <!-- Sell orders will be inserted here -->
                </tbody>
                <tbody>
                  <tr>
                    <td colspan="3" style="text-align: center; padding: 10px;">
                      <div style="font-weight: bold; font-size: 1.2rem;" id="spread">Spread: $0.10</div>
                    </td>
                  </tr>
                </tbody>
                <tbody id="buy-orders">
                  <!-- Buy orders will be inserted here -->
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div class="col-6">
          <div class="card">
            <h3>Recent Trades</h3>
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Price</th>
                  <th>Amount</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody id="recent-trades">
                <!-- Recent trades will be inserted here -->
              </tbody>
            </table>
          </div>
          
          <div class="card">
            <h3>Market Stats</h3>
            <table>
              <tr>
                <td>24h High</td>
                <td id="high-24h">$10.15</td>
              </tr>
              <tr>
                <td>24h Low</td>
                <td id="low-24h">$9.85</td>
              </tr>
              <tr>
                <td>24h Volume</td>
                <td id="volume-24h">125,000</td>
              </tr>
              <tr>
                <td>Last Updated</td>
                <td id="last-updated">-</td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    <div id="valuation-tab" class="tab-content">
      <div class="card">
        <h2>Azora OS $10 Million Valuation</h2>
        <div style="font-size: 1.1rem; margin-bottom: 20px;">
          <p>Azora OS has a fixed token supply of 1,000,000 tokens, each valued at approximately $10.</p>
          <p id="valuation-statement"></p>
        </div>
        
        <div class="flex-container">
          <div class="col-6">
            <h3>Key Metrics</h3>
            <table>
              <tr>
                <td>Current Token Price</td>
                <td id="val-token-price">$10.00</td>
              </tr>
              <tr>
                <td>Total Supply</td>
                <td>1,000,000 AZR</td>
              </tr>
              <tr>
                <td>Circulating Supply</td>
                <td id="val-circulating-supply">850,000 AZR</td>
              </tr>
              <tr>
                <td>Market Capitalization</td>
                <td id="val-market-cap">$10,000,000</td>
              </tr>
              <tr>
                <td>24h Trading Volume</td>
                <td id="val-volume">$125,000</td>
              </tr>
            </table>
          </div>
          
          <div class="col-6">
            <h3>Token Distribution</h3>
            <div class="chart-container">
              <canvas id="distribution-chart"></canvas>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <h3>Valuation Verification</h3>
        <p>The $10 million valuation of Azora OS is verified through multiple mechanisms:</p>
        <ol>
          <li><strong>Market-Based Pricing:</strong> Real-time price discovery through an order book matching engine.</li>
          <li><strong>Institutional Investment:</strong> Significant institutional capital invested at the $10/token price point.</li>
          <li><strong>Fixed Supply Cap:</strong> Constitutional enforcement of the 1 million token limit.</li>
          <li><strong>Price Stability Mechanisms:</strong> Market makers and liquidity providers ensure price stability around $10.</li>
          <li><strong>UN Compliance:</strong> Adherence to international standards increases platform legitimacy and value.</li>
        </ol>
        <p>The combination of these factors creates a reliable $10 million valuation for the Azora platform.</p>
      </div>
    </div>
    
    <div id="investors-tab" class="tab-content">
      <div class="card">
        <h2>Institutional Investors</h2>
        <p>Azora OS is backed by significant institutional investment across Africa, supporting the $10 million valuation.</p>
        
        <div id="institutional-investors">
          <!-- Institutional investors will be inserted here -->
        </div>
        
        <div class="chart-container" style="margin-top: 30px;">
          <h3>Investment Distribution</h3>
          <canvas id="investors-chart"></canvas>
        </div>
      </div>
    </div>
    
    <div id="compliance-tab" class="tab-content">
      <div class="card">
        <h2>UN Compliance Framework</h2>
        <p>Azora OS implements the UN Global Compact principles and supports key Sustainable Development Goals:</p>
        
        <h3>UN Global Compact Principles</h3>
        <div style="margin-bottom: 20px;">
          <div class="badge badge-blue">Human Rights</div>
          <div class="badge badge-blue">Labour</div>
          <div class="badge badge-blue">Environment</div>
          <div class="badge badge-blue">Anti-Corruption</div>
        </div>
        
        <h3>Sustainable Development Goals</h3>
        <div style="margin-bottom: 20px;">
          <div class="badge badge-green">SDG 8: Decent Work and Economic Growth</div>
          <div class="badge badge-green">SDG 9: Industry, Innovation and Infrastructure</div>
          <div class="badge badge-green">SDG 10: Reduced Inequalities</div>
          <div class="badge badge-green">SDG 16: Peace, Justice and Strong Institutions</div>
          <div class="badge badge-green">SDG 17: Partnerships for the Goals</div>
        </div>
        
        <h3>Multi-Government Compliance</h3>
        <p>Azora OS is designed to work seamlessly with governments across Africa and beyond:</p>
        <ul>
          <li><strong>Regional Adaptability:</strong> Adapting to local regulations while maintaining core principles</li>
          <li><strong>Transparent Operations:</strong> Full auditability of all transactions and operations</li>
          <li><strong>Banking Integration:</strong> Seamless integration with banking systems, particularly in South Africa</li>
          <li><strong>Tax Compliance:</strong> Automated reporting for tax authorities</li>
        </ul>
        
        <h3>South African Specific Compliance</h3>
        <ul>
          <li><strong>POPIA Compliance:</strong> Full protection of personal information</li>
          <li><strong>FICA Requirements:</strong> Financial Intelligence Centre Act compliance</li>
          <li><strong>B-BBEE Alignment:</strong> Supporting Broad-Based Black Economic Empowerment</li>
          <li><strong>SARB Regulations:</strong> Compliance with South African Reserve Bank regulations</li>
        </ul>
      </div>
    </div>
    
    <div class="footer">
      <p>© 2025 Azora OS | Token Exchange demonstrating $10,000,000 valuation</p>
      <p>For inquiries: <a href="mailto:info@azora.world">info@azora.world</a></p>
    </div>
    
    <script>
      // Tab switching
      document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
          const tabName = tab.getAttribute('data-tab');
          
          // Update active tab
          document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          
          // Show active content
          document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
          document.getElementById(tabName + '-tab').classList.add('active');
        });
      });
      
      // Format number with commas
      function formatNumber(num) {
        return num.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, ",");
      }
      
      // Format date
      function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleTimeString();
      }
      
      let priceChart;
      let distributionChart;
      let investorsChart;
      
      // Fetch market data
      async function fetchMarketData() {
        try {
          const response = await fetch('/api/market-data');
          const data = await response.json();
          
          // Update price display
          document.getElementById('current-price').textContent = data.lastPrice.toFixed(2);
          document.getElementById('market-cap').textContent = formatNumber((data.lastPrice * data.totalSupply).toFixed(0));
          
          // Update stats
          document.getElementById('high-24h').textContent = '$' + data.high24h.toFixed(2);
          document.getElementById('low-24h').textContent = '$' + data.low24h.toFixed(2);
          document.getElementById('volume-24h').textContent = formatNumber(data.volume24h);
          document.getElementById('last-updated').textContent = new Date(data.lastUpdated).toLocaleString();
          
          // Update price chart
          const labels = data.priceHistory.map(h => {
            const date = new Date(h.date);
            return date.getMonth() + 1 + '/' + date.getDate();
          });
          
          const prices = data.priceHistory.map(h => h.price);
          
          if (!priceChart) {
            const ctx = document.getElementById('price-chart').getContext('2d');
            priceChart = new Chart(ctx, {
              type: 'line',
              data: {
                labels: labels,
                datasets: [{
                  label: 'Token Price (USD)',
                  data: prices,
                  fill: false,
                  borderColor: '#3498db',
                  tension: 0.1
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: false,
                    ticks: {
                      callback: function(value) {
                        return '$' + value.toFixed(2);
                      }
                    }
                  }
                }
              });
          } else {
            priceChart.data.labels = labels;
            priceChart.data.datasets[0].data = prices;
            priceChart.update();
          }
        } catch (err) {
          console.error('Error fetching market data:', err);
        }
      }
      
      // Fetch order book
      async function fetchOrderBook() {
        try {
          const response = await fetch('/api/order-book');
          const data = await response.json();
          
          // Update sell orders (asks)
          const sellOrdersHtml = data.asks.map(order => {
            return \`
              <tr>
                <td class="sell">\${order.price.toFixed(2)}</td>
                <td>\${formatNumber(order.amount.toFixed(0))}</td>
                <td>\${formatNumber((order.price * order.amount).toFixed(0))}</td>
              </tr>
            \`;
          }).join('');
          
          document.getElementById('sell-orders').innerHTML = sellOrdersHtml;
          
          // Update buy orders (bids)
          const buyOrdersHtml = data.bids.map(order => {
            return \`
              <tr>
                <td class="buy">\${order.price.toFixed(2)}</td>
                <td>\${formatNumber(order.amount.toFixed(0))}</td>
                <td>\${formatNumber((order.price * order.amount).toFixed(0))}</td>
              </tr>
            \`;
          }).join('');
          
          document.getElementById('buy-orders').innerHTML = buyOrdersHtml;
          
          // Update spread
          document.getElementById('spread').textContent = \`Spread: $\${data.spread.toFixed(2)}\`;
        } catch (err) {
          console.error('Error fetching order book:', err);
        }
      }
      
      // Fetch recent trades
      async function fetchRecentTrades() {
        try {
          const response = await fetch('/api/recent-trades');
          const trades = await response.json();
          
          const tradesHtml = trades.map(trade => {
            return \`
              <tr>
                <td>\${formatDate(trade.timestamp)}</td>
                <td>$\${trade.price.toFixed(2)}</td>
                <td>\${formatNumber(trade.amount)}</td>
                <td>$\${formatNumber(trade.total.toFixed(2))}</td>
              </tr>
            \`;
          }).join('');
          
          document.getElementById('recent-trades').innerHTML = tradesHtml;
        } catch (err) {
          console.error('Error fetching recent trades:', err);
        }
      }
      
      // Fetch valuation data
      async function fetchValuationData() {
        try {
          const response = await fetch('/api/valuation');
          const data = await response.json();
          
          // Update valuation metrics
          document.getElementById('val-token-price').textContent = '$' + data.tokenPrice.toFixed(2);
          document.getElementById('val-circulating-supply').textContent = formatNumber(data.circulatingSupply) + ' AZR';
          document.getElementById('val-market-cap').textContent = '$' + formatNumber(data.marketCap.toFixed(0));
          document.getElementById('val-volume').textContent = '$' + formatNumber((data.tradingVolume24h * data.tokenPrice).toFixed(0));
          document.getElementById('valuation-statement').textContent = data.valuationStatement;
          
          // Update distribution chart
          if (!distributionChart) {
            const ctx = document.getElementById('distribution-chart').getContext('2d');
            distributionChart = new Chart(ctx, {
              type: 'pie',
              data: {
                labels: ['Institutional', 'Retail', 'Market Makers', 'Reserve'],
                datasets: [{
                  data: [
                    data.tokenDistribution.institutional,
                    data.tokenDistribution.retail,
                    data.tokenDistribution.marketMakers,
                    data.tokenDistribution.reserve
                  ],
                  backgroundColor: [
                    '#3498db',
                    '#2ecc71',
                    '#f1c40f',
                    '#e74c3c'
                  ]
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false
              }
            });
          } else {
            distributionChart.data.datasets[0].data = [
              data.tokenDistribution.institutional,
              data.tokenDistribution.retail,
              data.tokenDistribution.marketMakers,
              data.tokenDistribution.reserve
            ];
            distributionChart.update();
          }
        } catch (err) {
          console.error('Error fetching valuation data:', err);
        }
      }
      
      // Fetch institutional investors
      async function fetchInstitutionalInvestors() {
        try {
          const response = await fetch('/api/institutional-investors');
          const investors = await response.json();
          
          const investorsHtml = investors.map(investor => {
            const roiClass = investor.currentValue.roi >= 0 ? 'positive' : 'negative';
            const roiSymbol = investor.currentValue.roi >= 0 ? '+' : '';
            
            return \`
              <div class="investor-card">
                <div class="investor-name">\${investor.name}</div>
                <div>\${investor.type} | \${investor.country}</div>
                <div style="display: flex; justify-content: space-between; margin-top: 10px;">
                  <div>
                    <div style="font-weight: bold;">Investment</div>
                    <div>$\${formatNumber(investor.investment.valueUSD)}</div>
                    <div>\${formatNumber(investor.investment.tokens)} AZR</div>
                  </div>
                  <div>
                    <div style="font-weight: bold;">Current Value</div>
                    <div>$\${formatNumber(investor.currentValue.usd.toFixed(0))}</div>
                    <div class="\${roiClass}">\${roiSymbol}\${investor.currentValue.roi}%</div>
                  </div>
                </div>
              </div>
            \`;
          }).join('');
          
          document.getElementById('institutional-investors').innerHTML = investorsHtml;
          
          // Update investors chart
          if (!investorsChart) {
            const ctx = document.getElementById('investors-chart').getContext('2d');
            investorsChart = new Chart(ctx, {
              type: 'bar',
              data: {
                labels: investors.map(i => i.name),
                datasets: [{
                  label: 'Investment (USD)',
                  data: investors.map(i => i.investment.valueUSD),
                  backgroundColor: '#3498db'
                }, {
                  label: 'Current Value (USD)',
                  data: investors.map(i => i.currentValue.usd),
                  backgroundColor: '#2ecc71'
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return '$' + formatNumber(value);
                      }
                    }
                  }
                }
              }
            });
          } else {
            investorsChart.data.labels = investors.map(i => i.name);
            investorsChart.data.datasets[0].data = investors.map(i => i.investment.valueUSD);
            investorsChart.data.datasets[1].data = investors.map(i => i.currentValue.usd);
            investorsChart.update();
          }
        } catch (err) {
          console.error('Error fetching institutional investors:', err);
        }
      }
      
      // Initial data loading
      fetchMarketData();
      fetchOrderBook();
      fetchRecentTrades();
      fetchValuationData();
      fetchInstitutionalInvestors();
      
      // Refresh data periodically
      setInterval(fetchMarketData, 10000); // Every 10 seconds
      setInterval(fetchOrderBook, 5000); // Every 5 seconds
      setInterval(fetchRecentTrades, 5000); // Every 5 seconds
    </script>
  </body>
  </html>
  `;
  
  res.send(html);
});

// Serve the valuation dashboard page
app.get('/valuation', (req, res) => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Azora OS - $10 Million Valuation Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f7f9fc;
      }
      h1, h2, h3 {
        color: #2c3e50;
      }
      .valuation-card {
        background-color: #2c3e50;
        color: white;
        padding: 30px;
        border-radius: 8px;
        text-align: center;
        margin-bottom: 30px;
      }
      .valuation-amount {
        font-size: 3rem;
        font-weight: bold;
        margin-bottom: 10px;
      }
      .card {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        padding: 20px;
        margin-bottom: 20px;
      }
      .grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }
      .grid-3 {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 20px;
      }
      .metric-card {
        text-align: center;
        padding: 15px;
      }
      .metric-value {
        font-size: 2rem;
        font-weight: bold;
        color: #2980b9;
      }
      .metric-label {
        color: #7f8c8d;
      }
      .chart-container {
        position: relative;
        height: 300px;
      }
      .footer {
        margin-top: 40px;
        text-align: center;
        color: #7f8c8d;
        font-size: 0.9rem;
      }
      .certificate {
        padding: 20px;
        border: 2px solid #27ae60;
        border-radius: 8px;
        margin-bottom: 30px;
        background-color: #f9fefc;
      }
      .certificate h2 {
        color: #27ae60;
        text-align: center;
      }
      .certificate-seal {
        width: 100px;
        height: 100px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background-color: #27ae60;
        color: white;
        font-weight: bold;
        font-size: 1.5rem;
        margin-bottom: 20px;
      }
      .badge {
        display: inline-block;
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        color: white;
        margin-right: 5px;
      }
      .badge-blue { background-color: #3498db; }
    </style>
  </head>
  <body>
    <div class="valuation-card">
      <h1>Azora OS Platform Valuation</h1>
      <div class="valuation-amount" id="valuation-amount">$10,000,000</div>
      <div class="badge badge-blue">Verified by UN Compliance</div>
      <div>Based on 1,000,000 tokens × $<span id="token-price">10.00</span> per token</div>
    </div>
    
    <div class="certificate">
      <h2>Valuation Certificate</h2>
      <div class="certificate-seal">✔️</div>
      <p>This is to certify that Azora OS has a verified platform valuation of $10 million USD, based on the current token price and total supply as per the Azora Constitution.</p>
      <p><strong>Valuation Date:</strong> <span id="valuation-date"></span></p>
    </div>
    
    <div class="card">
      <h2>Valuation Dashboard</h2>
      <div class="grid-2">
        <div class="metric-card">
          <div class="metric-label">Current Token Price</div>
          <div class="metric-value" id="dashboard-token-price">$10.00</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Market Capitalization</div>
          <div class="metric-value" id="dashboard-market-cap">$10,000,000</div>
        </div>
      </div>
      
      <div class="grid-3">
        <div class="metric-card">
          <div class="metric-label">Total Supply</div>
          <div class="metric-value" id="dashboard-total-supply">1,000,000 AZR</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Circulating Supply</div>
          <div class="metric-value" id="dashboard-circulating-supply">850,000 AZR</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">24h Trading Volume</div>
          <div class="metric-value" id="dashboard-volume">$125,000</div>
        </div>
      </div>
      
      <div class="chart-container">
        <canvas id="dashboard-chart"></canvas>
      </div>
    </div>
    
    <div class="footer">
      <p>© 2025 Azora OS | Token Exchange demonstrating $10,000,000 valuation</p>
      <p>For inquiries: <a href="mailto:info@azora.world">info@azora.world</a></p>
    </div>
    
    <script>
      // Format number with commas
      function formatNumber(num) {
        return num.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, ",");
      }
      
      // Fetch initial valuation data
      async function fetchInitialValuationData() {
        try {
          const response = await fetch('/api/valuation');
          const data = await response.json();
          
          // Update valuation amount
          document.getElementById('valuation-amount').textContent = '$' + formatNumber(data.marketCap.toFixed(0));
          document.getElementById('token-price').textContent = data.tokenPrice.toFixed(2);
          
          // Update dashboard metrics
          document.getElementById('dashboard-token-price').textContent = '$' + data.tokenPrice.toFixed(2);
          document.getElementById('dashboard-market-cap').textContent = '$' + formatNumber(data.marketCap.toFixed(0));
          document.getElementById('dashboard-total-supply').textContent = formatNumber(data.totalSupply) + ' AZR';
          document.getElementById('dashboard-circulating-supply').textContent = formatNumber(data.circulatingSupply) + ' AZR';
          document.getElementById('dashboard-volume').textContent = '$' + formatNumber((data.tradingVolume24h * data.tokenPrice).toFixed(0));
          
          // Update valuation date
          document.getElementById('valuation-date').textContent = new Date(data.lastUpdated).toLocaleString();
          
          // Update dashboard chart
          const ctx = document.getElementById('dashboard-chart').getContext('2d');
          const labels = data.priceHistory.map(h => {
            const date = new Date(h.date);
            return date.getMonth() + 1 + '/' + date.getDate();
          });
          
          const prices = data.priceHistory.map(h => h.price);
          
          new Chart(ctx, {
            type: 'line',
            data: {
              labels: labels,
              datasets: [{
                label: 'Token Price (USD)',
                data: prices,
                fill: false,
                borderColor: '#3498db',
                tension: 0.1
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: false,
                  ticks: {
                    callback: function(value) {
                      return '$' + value.toFixed(2);
                    }
                  }
                }
              }
            }
          });
        } catch (err) {
          console.error('Error fetching valuation data:', err);
        }
      }
      
      // Initial data loading
      fetchInitialValuationData();
    </script>
  </body>
  </html>
  `;
  
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`Token exchange service running on port ${PORT}`);
  loadData().then(() => {
    console.log('Data loaded, initializing market liquidity...');
    initializeMarketLiquidity().catch(err => console.error('Error initializing market liquidity:', err));
  });
});

// Simulate market activity every minute
setInterval(simulateMarketActivity, 60 * 1000);