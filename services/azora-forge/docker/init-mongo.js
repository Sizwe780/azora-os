/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// Initialize Azora Forge database with default categories and indexes

db = db.getSiblingDB('azora-forge');

// Create collections
db.createCollection('listings');
db.createCollection('categories');
db.createCollection('transactions');

// Create indexes
db.listings.createIndex({ "sellerId": 1 });
db.listings.createIndex({ "category": 1, "status": 1 });
db.listings.createIndex({ "title": "text", "description": "text" });
db.listings.createIndex({ "tags": 1 });
db.listings.createIndex({ "createdAt": -1 });
db.listings.createIndex({ "price": 1 });

db.transactions.createIndex({ "listingId": 1 });
db.transactions.createIndex({ "buyerId": 1 });
db.transactions.createIndex({ "sellerId": 1 });
db.transactions.createIndex({ "status": 1 });
db.transactions.createIndex({ "createdAt": -1 });

// Insert default categories
db.categories.insertMany([
  {
    name: "Development",
    description: "Software development services and tools",
    icon: "💻",
    isActive: true
  },
  {
    name: "Design",
    description: "Graphic design, UI/UX, and creative services",
    icon: "🎨",
    isActive: true
  },
  {
    name: "Writing",
    description: "Content writing, copywriting, and documentation",
    icon: "✍️",
    isActive: true
  },
  {
    name: "Marketing",
    description: "Digital marketing and advertising services",
    icon: "📢",
    isActive: true
  },
  {
    name: "Consulting",
    description: "Business and technical consulting",
    icon: "💼",
    isActive: true
  },
  {
    name: "Education",
    description: "Tutoring, courses, and educational content",
    icon: "📚",
    isActive: true
  },
  {
    name: "Data",
    description: "Data analysis, visualization, and processing",
    icon: "📊",
    isActive: true
  },
  {
    name: "Other",
    description: "Miscellaneous services and products",
    icon: "🔧",
    isActive: true
  }
]);

print('Azora Forge database initialized successfully');