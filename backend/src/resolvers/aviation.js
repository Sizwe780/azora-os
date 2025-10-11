const AviationChecklist = require('../models/AviationChecklist');
module.exports = {
  Mutation: {
    startPreflight: async (_, { userId }, { user }) => {
      if (user.corridor !== 'aviation') throw new Error('Unauthorized');
      const checklist = new AviationChecklist({
        userId,
        steps: [
          { step: 'Cabin secure', completed: false },
          { step: 'Fuel check', completed: false },
          { step: 'Controls free', completed: false },
          { step: 'Instruments normal', completed: false },
        ],
      });
      await checklist.save();
      return checklist;
    },
    completeStep: async (_, { checklistId, stepIndex }) => {
      const checklist = await AviationChecklist.findById(checklistId);
      checklist.steps[stepIndex].completed = true;
      checklist.steps[stepIndex].timestamp = new Date();
      if (checklist.steps.every(s => s.completed)) checklist.status = 'completed';
      await checklist.save();
      return checklist;
    },
  },
};
