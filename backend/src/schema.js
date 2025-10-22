/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type AviationChecklist {
    _id: ID!
    steps: [String]
    status: String
    completedBy: String
    completedAt: String
  }

  type DefenseDrill {
    _id: ID!
    alertLevel: String
    status: String
    triggeredBy: String
    triggeredAt: String
  }

  type Reputation {
    _id: ID!
    userId: ID!
    score: Int
    history: [ReputationHistory]
  }

  type ReputationHistory {
    delta: Int
    reason: String
    timestamp: String
  }

  type Policy {
    _id: ID!
    title: String
    description: String
    corridor: String
    effectiveDate: String
    status: String
  }

  type Incident {
    _id: ID!
    userId: ID!
    details: String
    corridor: String
    status: String
    timestamp: String
  }

  type Shift {
    _id: ID!
    userId: ID!
    corridor: String
    start: String
    end: String
    status: String
  }

  type AuditLog {
    _id: ID!
    userId: ID!
    action: String
    details: String
    timestamp: String
  }

  type User {
    _id: ID!
    name: String
    email: String
    role: String
    corridor: String
    reputation: Int
    createdAt: String
  }

  type Dashboard {
    compliance: ComplianceStats
    reputation: ReputationStats
    incidents: [Incident]
  }

  type ComplianceStats {
    completed: Int
    pending: Int
  }

  type ReputationStats {
    score: Int
  }

  type CorridorStatus {
    corridor: String
    status: String
    updated: String
  }

  type Query {
    getCorridorStatus(corridor: String!): CorridorStatus
    getDashboard(userId: ID!): Dashboard
  }

  type Mutation {
    startAviationChecklist(userId: ID!, steps: [String]!): AviationChecklist
    completeAviationChecklist(userId: ID!, checklistId: ID!): AviationChecklist
    triggerDefenseDrill(userId: ID!, alertLevel: String!): DefenseDrill
    updateDefenseDrill(userId: ID!, drillId: ID!, status: String!): DefenseDrill
    completeChecklist(userId: ID!, checklistId: ID!, corridor: String!): ComplianceStats
    reportIncident(userId: ID!, details: String!, corridor: String!): Incident
    updateReputation(userId: ID!, delta: Int!, reason: String!): Reputation
  }
`;

module.exports = typeDefs;
