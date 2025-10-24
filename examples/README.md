# Azora OS Examples

This directory contains examples demonstrating how to use Azora OS services and APIs.

## 🚀 Quick Start Examples

### 1. Basic API Usage

```javascript
// examples/basic-api-usage.js
const axios = require('axios');

// Example: Get economic intelligence from Azora Oracle
async function getEconomicData() {
  try {
    const response = await axios.get('http://localhost:4030/api/oracle/economic-data');
    console.log('Economic Intelligence:', response.data);
  } catch (error) {
    console.error('Error fetching economic data:', error.message);
  }
}

// Example: Submit education content to Azora Sapiens
async function submitEducationContent(content) {
  try {
    const response = await axios.post('http://localhost:4200/api/education/content', {
      title: content.title,
      description: content.description,
      category: content.category,
      content: content.body
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.AZORA_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Content submitted:', response.data);
  } catch (error) {
    console.error('Error submitting content:', error.message);
  }
}

// Example: Check wallet balance with Azora Mint
async function getWalletBalance(walletAddress) {
  try {
    const response = await axios.get(`http://localhost:4300/api/wallet/${walletAddress}/balance`);
    console.log('Wallet Balance:', response.data);
  } catch (error) {
    console.error('Error fetching balance:', error.message);
  }
}

module.exports = {
  getEconomicData,
  submitEducationContent,
  getWalletBalance
};
```

### 2. React Component Example

```jsx
// examples/EconomicDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function EconomicDashboard() {
  const [economicData, setEconomicData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEconomicData();
  }, []);

  const fetchEconomicData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/oracle/economic-data');
      setEconomicData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading economic intelligence...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="economic-dashboard">
      <h2>Azora Economic Intelligence</h2>
      <div className="metrics">
        <div className="metric">
          <h3>GDP Growth</h3>
          <p>{economicData.gdpGrowth}%</p>
        </div>
        <div className="metric">
          <h3>Inflation Rate</h3>
          <p>{economicData.inflationRate}%</p>
        </div>
        <div className="metric">
          <h3>Employment Rate</h3>
          <p>{economicData.employmentRate}%</p>
        </div>
      </div>
    </div>
  );
}

export default EconomicDashboard;
```

### 3. Docker Compose Development Setup

```yaml
# examples/docker-compose.dev.yml
version: '3.8'

services:
  # Azora OS Core Services
  azora-aegis:
    image: azora-aegis:latest
    ports:
      - "4099:4099"
    environment:
      - NODE_ENV=development
    volumes:
      - ./logs:/app/logs

  azora-sapiens:
    image: azora-sapiens:latest
    ports:
      - "4200:4200"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:password@postgres:5432/azora
    depends_on:
      - postgres

  azora-mint:
    image: azora-mint:latest
    ports:
      - "4300:4300"
    environment:
      - NODE_ENV=development
      - BLOCKCHAIN_RPC_URL=http://ganache:8545
    depends_on:
      - ganache

  azora-oracle:
    image: azora-oracle:latest
    ports:
      - "4030:4030"
    environment:
      - NODE_ENV=development
      - REDIS_URL=redis://redis:6379

  # Infrastructure Services
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: azora
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  ganache:
    image: trufflesuite/ganache:latest
    ports:
      - "8545:8545"
    command: --deterministic --db=/data

volumes:
  postgres_data:
```

### 4. Testing Example

```javascript
// examples/api-integration.test.js
const axios = require('axios');
const { expect } = require('chai');

describe('Azora OS API Integration Tests', () => {
  const baseURL = 'http://localhost:3000';

  describe('Health Checks', () => {
    it('should return healthy status for all services', async () => {
      const services = [
        { name: 'Aegis', port: 4099 },
        { name: 'Sapiens', port: 4200 },
        { name: 'Mint', port: 4300 },
        { name: 'Oracle', port: 4030 }
      ];

      for (const service of services) {
        try {
          const response = await axios.get(`${baseURL}:${service.port}/health`);
          expect(response.status).to.equal(200);
          expect(response.data.status).to.equal('healthy');
        } catch (error) {
          console.log(`${service.name} service not available: ${error.message}`);
        }
      }
    });
  });

  describe('Economic Intelligence', () => {
    it('should fetch current economic data', async () => {
      const response = await axios.get(`${baseURL}:4030/api/oracle/economic-data`);
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('gdpGrowth');
      expect(response.data).to.have.property('inflationRate');
      expect(response.data).to.have.property('timestamp');
    });

    it('should handle invalid requests gracefully', async () => {
      try {
        await axios.get(`${baseURL}:4030/api/oracle/invalid-endpoint`);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).to.equal(404);
      }
    });
  });

  describe('Education Platform', () => {
    it('should retrieve educational content', async () => {
      const response = await axios.get(`${baseURL}:4200/api/education/content`);
      expect(response.status).to.equal(200);
      expect(response.data).to.be.an('array');
    });

    it('should create new educational content', async () => {
      const newContent = {
        title: 'Test Course',
        description: 'A test educational course',
        category: 'Technology',
        content: 'This is test content for the course.'
      };

      const response = await axios.post(`${baseURL}:4200/api/education/content`, newContent, {
        headers: {
          'Authorization': `Bearer ${process.env.TEST_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).to.equal(201);
      expect(response.data).to.have.property('id');
      expect(response.data.title).to.equal(newContent.title);
    });
  });
});
```

## 📁 Example Categories

- **API Usage**: Basic API interaction examples
- **Frontend Integration**: React components and UI examples
- **Deployment**: Docker Compose and infrastructure examples
- **Testing**: Unit and integration test examples
- **Configuration**: Environment setup and configuration examples

## 🏃 Running Examples

1. **Start Azora OS services** (see main README)
2. **Navigate to examples directory**
3. **Install dependencies** (if needed): `npm install`
4. **Run examples**: `node examples/basic-api-usage.js`

## 📚 Additional Resources

- [API Documentation](../API_DOCUMENTATION.md)
- [Deployment Guide](../DEPLOYMENT.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [Security Guidelines](../SECURITY.md)

## 🤝 Contributing Examples

We welcome contributions of new examples! Please:

1. Follow the existing code style and patterns
2. Include clear documentation and comments
3. Test examples before submitting
4. Add examples to the appropriate category
5. Update this README when adding new examples

For more information, see our [Contributing Guide](../CONTRIBUTING.md).