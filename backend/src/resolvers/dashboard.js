/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const AviationChecklist = require('../models/AviationChecklist');
const DefenseDrill = require('../models/DefenseDrill');
const Reputation = require('../models/Reputation');
const Incident = require('../models/Incident');

// Dashboard resolver for compliance, reputation, and incidents
module.exports = {
  Query: {
    getDashboard: async (_, { userId }) => {
      const userFilter = userId ? { userId } : {};

      const [completedChecklists, pendingChecklists, completedDrills, activeDrills, reputation, incidents] = await Promise.all([
        AviationChecklist.countDocuments({ ...userFilter, status: 'completed' }),
        AviationChecklist.countDocuments({ ...userFilter, status: { $ne: 'completed' } }),
        DefenseDrill.countDocuments({ ...userFilter, status: 'completed' }),
        DefenseDrill.countDocuments({ ...userFilter, status: { $ne: 'completed' } }),
        Reputation.findOne(userFilter).lean(),
        Incident.find(userFilter).sort({ timestamp: -1 }).limit(10).lean(),
      ]);

      return {
        compliance: {
          completed: completedChecklists + completedDrills,
          pending: pendingChecklists + activeDrills,
        },
        reputation: {
          score: reputation?.score ?? 0,
          history: reputation?.history ?? [],
        },
        incidents,
      };
    },
  },
};
