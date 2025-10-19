const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

/**
 * Advanced Backed Valuation Service.
 * Fetches data from other services to compute realistic valuation.
 */
app.get('/api/valuation/backed', async (req, res) => {
  try {
    const adoption = await axios.get('http://localhost:4122/api/adoption/stats');
    const revenue = await axios.get('http://localhost:4126/api/revenue/total');
    const partners = await axios.get('http://localhost:4127/api/partnerships/list');
    
    const userCount = adoption.data.totalUsers;
    const totalRevenue = revenue.data.totalRevenue;
    const partnerCount = partners.data.partners.length;
    
    const valuation = (userCount * 50) + (totalRevenue * 1) + (partnerCount * 50000);
    
    res.json({ backedValuation: valuation, metrics: { users: userCount, revenue: totalRevenue, partners: partnerCount } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
});

const PORT = 4124;
app.listen(PORT, () => console.log(`💰 Advanced Backed Valuation Service running on port ${PORT}`));
