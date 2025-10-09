const { updateReputation } = require('../services/reputationService');

module.exports = {
  Mutation: {
    updateReputation: async (_, { userId, delta, reason }) => {
      return await updateReputation(userId, delta, reason);
    },
  },
};
