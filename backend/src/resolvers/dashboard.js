// Dashboard resolver for compliance, reputation, and incidents
module.exports = {
  Query: {
    getDashboard: async (_, { userId }) => {
      // Mock: Aggregate compliance, reputation, incidents
      return {
        compliance: { completed: 12, pending: 2 },
        reputation: { score: 87 },
        incidents: [{ id: 1, status: 'reported' }],
      };
    },
  },
};
