/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const { updateReputation } = require('../services/reputationService');

module.exports = {
  Mutation: {
    updateReputation: async (_, { userId, delta, reason }) => {
      return await updateReputation(userId, delta, reason);
    },
  },
};
