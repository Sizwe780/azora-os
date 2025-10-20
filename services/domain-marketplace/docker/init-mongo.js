// MongoDB initialization script for Domain Marketplace Service

// Create collections with indexes
db = db.getSiblingDB('domain-marketplace');

// Domain listings collection
db.createCollection('domainlistings');
db.domainlistings.createIndex({ "domain": 1 }, { unique: true });
db.domainlistings.createIndex({ "owner": 1 });
db.domainlistings.createIndex({ "status": 1 });
db.domainlistings.createIndex({ "category": 1 });
db.domainlistings.createIndex({ "price": 1 });
db.domainlistings.createIndex({ "createdAt": -1 });

// Domain bids collection
db.createCollection('domainbids');
db.domainbids.createIndex({ "domain": 1 });
db.domainbids.createIndex({ "bidder": 1 });
db.domainbids.createIndex({ "amount": -1 });
db.domainbids.createIndex({ "createdAt": -1 });

// Domain watchlist collection
db.createCollection('domainwatchlists');
db.domainwatchlists.createIndex({ "userId": 1 });
db.domainwatchlists.createIndex({ "domain": 1 });
db.domainwatchlists.createIndex({ "createdAt": -1 });

// Domain categories collection
db.createCollection('domaincategories');
db.domaincategories.createIndex({ "slug": 1 }, { unique: true });
db.domaincategories.createIndex({ "name": 1 });

// Insert default categories
db.domaincategories.insertMany([
  {
    name: "Technology",
    slug: "technology",
    description: "Tech-related domains",
    createdAt: new Date()
  },
  {
    name: "Business",
    slug: "business",
    description: "Business and commerce domains",
    createdAt: new Date()
  },
  {
    name: "Health",
    slug: "health",
    description: "Health and wellness domains",
    createdAt: new Date()
  },
  {
    name: "Education",
    slug: "education",
    description: "Education and learning domains",
    createdAt: new Date()
  },
  {
    name: "Entertainment",
    slug: "entertainment",
    description: "Entertainment and media domains",
    createdAt: new Date()
  },
  {
    name: "Sports",
    slug: "sports",
    description: "Sports and recreation domains",
    createdAt: new Date()
  },
  {
    name: "Travel",
    slug: "travel",
    description: "Travel and tourism domains",
    createdAt: new Date()
  },
  {
    name: "Finance",
    slug: "finance",
    description: "Financial services domains",
    createdAt: new Date()
  }
]);

print("Domain Marketplace database initialized successfully!");