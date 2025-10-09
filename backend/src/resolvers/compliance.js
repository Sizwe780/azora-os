const { logChecklistCompletion, reportIncident } = require('../services/complianceService');

module.exports = {
  Mutation: {
    completeChecklist: async (_, { userId, checklistId, corridor }) => {
      return await logChecklistCompletion(userId, checklistId, corridor);
    },
    reportIncident: async (_, { userId, details, corridor }) => {
      return await reportIncident(userId, details, corridor);
    },
  },
};
