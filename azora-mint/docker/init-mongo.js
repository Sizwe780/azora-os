/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// Initialize Azora Mint database with indexes and initial data

db = db.getSiblingDB('azora-mint');

// Create collections
db.createCollection('creditapplications');
db.createCollection('loans');
db.createCollection('trustscores');
db.createCollection('repaymenttransactions');

// Create indexes
db.creditapplications.createIndex({ "userId": 1 });
db.creditapplications.createIndex({ "status": 1 });
db.creditapplications.createIndex({ "expiresAt": 1 });
db.creditapplications.createIndex({ "createdAt": -1 });

db.loans.createIndex({ "userId": 1 });
db.loans.createIndex({ "status": 1 });
db.loans.createIndex({ "dueDate": 1 });
db.loans.createIndex({ "disbursementDate": -1 });

db.trustscores.createIndex({ "userId": 1 }, { unique: true });
db.trustscores.createIndex({ "score": -1 });
db.trustscores.createIndex({ "nextUpdate": 1 });

db.repaymenttransactions.createIndex({ "loanId": 1 });
db.repaymenttransactions.createIndex({ "userId": 1 });
db.repaymenttransactions.createIndex({ "createdAt": -1 });

// Insert default constitution parameters
db.constitution.insertOne({
  article: "VIII.6",
  name: "Neural Credit Protocol",
  parameters: {
    metabolicTax: 0.20,
    defaultPenalty: 0.15,
    maxTermMonths: 3,
    minTrustScore: 70,
    observationPhaseDays: 30
  },
  activated: true,
  activatedAt: new Date()
});

print('Azora Mint database initialized successfully');