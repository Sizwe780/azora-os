/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const DefenseDrill = require('../models/DefenseDrill');
const { sendPushNotification } = require('../services/notificationService');

module.exports = {
  Mutation: {
    triggerMobilization: async (_, { drillType, participants }, { user }) => {
      if (user.corridor !== 'defense') throw new Error('Unauthorized');
      const drill = new DefenseDrill({ userId: user.id, drillType, participants });
      await drill.save();
      // Alert participants
      participants.forEach(p => sendPushNotification(p, 'Mobilization Alert', `Drill: ${drillType}`, 'defense', user.jurisdiction));
      return drill;
    },
    updateDrillStatus: async (_, { drillId, status }) => {
      const drill = await DefenseDrill.findById(drillId);
      drill.status = status;
      await drill.save();
      return drill;
    },
  },
};
