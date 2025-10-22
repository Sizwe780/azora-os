/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// MongoDB initialization script for AI Website Builder Service

// Create collections with indexes
db = db.getSiblingDB('ai-website-builder');

// Website generations collection
db.createCollection('websitegenerations');
db.websitegenerations.createIndex({ "userId": 1 });
db.websitegenerations.createIndex({ "status": 1 });
db.websitegenerations.createIndex({ "businessType": 1 });
db.websitegenerations.createIndex({ "createdAt": -1 });

// Website templates collection
db.createCollection('websitetemplates');
db.websitetemplates.createIndex({ "category": 1, "isActive": 1 });
db.websitetemplates.createIndex({ "businessType": 1 });
db.websitetemplates.createIndex({ "usageCount": -1 });
db.websitetemplates.createIndex({ "name": 1 }, { unique: true });

// Website deployments collection
db.createCollection('websitedeployments');
db.websitedeployments.createIndex({ "userId": 1 });
db.websitedeployments.createIndex({ "websiteId": 1 });
db.websitedeployments.createIndex({ "subdomain": 1 }, { unique: true });
db.websitedeployments.createIndex({ "status": 1 });
db.websitedeployments.createIndex({ "createdAt": -1 });

// Insert default templates
db.websitetemplates.insertMany([
  {
    name: "Modern Business",
    description: "Clean, professional design for business websites",
    category: "corporate",
    businessType: ["business", "agency", "other"],
    thumbnail: "/templates/modern-business-thumb.jpg",
    previewUrl: "/templates/modern-business-preview.html",
    baseStructure: {
      html: "<!-- Modern Business Template HTML -->",
      css: "/* Modern Business Template CSS */",
      js: "// Modern Business Template JS"
    },
    customizableSections: ["hero", "about", "services", "contact"],
    features: ["contact-form", "social-links"],
    isActive: true,
    usageCount: 0,
    createdAt: new Date()
  },
  {
    name: "Creative Portfolio",
    description: "Showcase your creative work with style",
    category: "creative",
    businessType: ["portfolio", "agency"],
    thumbnail: "/templates/creative-portfolio-thumb.jpg",
    previewUrl: "/templates/creative-portfolio-preview.html",
    baseStructure: {
      html: "<!-- Creative Portfolio Template HTML -->",
      css: "/* Creative Portfolio Template CSS */",
      js: "// Creative Portfolio Template JS"
    },
    customizableSections: ["hero", "portfolio", "about", "contact"],
    features: ["gallery", "social-links"],
    isActive: true,
    usageCount: 0,
    createdAt: new Date()
  },
  {
    name: "E-commerce Store",
    description: "Complete online store template",
    category: "ecommerce",
    businessType: ["ecommerce"],
    thumbnail: "/templates/ecommerce-store-thumb.jpg",
    previewUrl: "/templates/ecommerce-store-preview.html",
    baseStructure: {
      html: "<!-- E-commerce Template HTML -->",
      css: "/* E-commerce Template CSS */",
      js: "// E-commerce Template JS"
    },
    customizableSections: ["hero", "products", "about", "contact"],
    features: ["ecommerce", "gallery", "contact-form"],
    isActive: true,
    usageCount: 0,
    createdAt: new Date()
  },
  {
    name: "Restaurant Website",
    description: "Perfect for restaurants and food businesses",
    category: "modern",
    businessType: ["restaurant"],
    thumbnail: "/templates/restaurant-thumb.jpg",
    previewUrl: "/templates/restaurant-preview.html",
    baseStructure: {
      html: "<!-- Restaurant Template HTML -->",
      css: "/* Restaurant Template CSS */",
      js: "// Restaurant Template JS"
    },
    customizableSections: ["hero", "menu", "about", "contact"],
    features: ["gallery", "contact-form"],
    isActive: true,
    usageCount: 0,
    createdAt: new Date()
  },
  {
    name: "Blog Template",
    description: "Clean, readable design for bloggers",
    category: "minimal",
    businessType: ["blog"],
    thumbnail: "/templates/blog-thumb.jpg",
    previewUrl: "/templates/blog-preview.html",
    baseStructure: {
      html: "<!-- Blog Template HTML -->",
      css: "/* Blog Template CSS */",
      js: "// Blog Template JS"
    },
    customizableSections: ["hero", "posts", "about", "contact"],
    features: ["blog", "newsletter", "social-links"],
    isActive: true,
    usageCount: 0,
    createdAt: new Date()
  }
]);

print("AI Website Builder database initialized successfully!");