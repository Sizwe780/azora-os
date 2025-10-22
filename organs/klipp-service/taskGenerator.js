/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// services/klipp-service/taskGenerator.js

/**
 * @typedef {Object} KlippTask
 * @property {string} taskId - Unique identifier for the task.
 * @property {string} title - The title of the task.
 * @property {string} description - A short description of what needs to be done.
 * @property {string} category - The type of task (e.g., 'digital', 'physical', 'creative').
 * @property {number} estimatedEarnings - The guaranteed amount of money earned upon completion.
 * @property {string} currency - The currency of the earnings (e.g., 'USD', 'ZAR').
 * @property {number} estimatedTimeMinutes - The estimated time to complete the task in minutes.
 * @property {string[]} requiredSkills - Skills needed to complete the task.
 * @property {Object} verificationMethod - How the task completion is verified.
 * @property {string} verificationMethod.type - e.g., 'photo_upload', 'gps_checkpoint', 'text_submission'.
 */

const taskDatabase = [
  {
    taskId: 'task_001',
    title: 'Local Landmark Photography',
    description: 'Take a high-quality, well-lit photo of a specific local landmark or public art installation.',
    category: 'digital',
    estimatedEarnings: 5,
    currency: 'USD',
    estimatedTimeMinutes: 20,
    requiredSkills: ['smartphone_camera', 'walking'],
    verificationMethod: { type: 'photo_upload', requires_geotag: true },
  },
  {
    taskId: 'task_002',
    title: 'Verify Business Operating Hours',
    description: 'Visit a local small business and confirm their current operating hours. Submit the hours as text.',
    category: 'physical',
    estimatedEarnings: 3,
    currency: 'USD',
    estimatedTimeMinutes: 15,
    requiredSkills: ['communication', 'walking'],
    verificationMethod: { type: 'text_submission', requires_gps_checkpoint: true },
  },
  {
    taskId: 'task_003',
    title: 'Community Feedback Survey',
    description: 'Complete a short, anonymous survey about public services in your area.',
    category: 'digital',
    estimatedEarnings: 2,
    currency: 'USD',
    estimatedTimeMinutes: 10,
    requiredSkills: ['reading'],
    verificationMethod: { type: 'form_completion' },
  },
  {
    taskId: 'task_004',
    title: 'Translate a Short Paragraph',
    description: 'Translate a paragraph of text from English to another language you are fluent in.',
    category: 'creative',
    estimatedEarnings: 7,
    currency: 'USD',
    estimatedTimeMinutes: 25,
    requiredSkills: ['bilingual'],
    verificationMethod: { type: 'text_submission' },
  },
  {
    taskId: 'task_005',
    title: 'Public Transit Accessibility Audit',
    description: 'Document the accessibility features (e.g., ramps, elevators) at a public transit station.',
    category: 'physical',
    estimatedEarnings: 8,
    currency: 'USD',
    estimatedTimeMinutes: 45,
    requiredSkills: ['observation', 'smartphone_camera'],
    verificationMethod: { type: 'photo_upload', requires_notes: true },
  },
];

/**
 * Generates a list of available tasks for a user.
 * In a real application, this would be a sophisticated function that considers the user's
 * location, skills, reputation, and device capabilities.
 *
 * @param {Object} userContext - Information about the user.
 * @param {string[]} [userContext.skills] - The user's declared skills.
 * @param {boolean} [userContext.has_vehicle] - If the user has access to a vehicle.
 * @returns {Promise<KlippTask[]>} A list of tasks.
 */
async function generateTasks(userContext = {}) {
  // Returns tasks from the task database.
  // This simulates the AI finding relevant tasks for the user.
  const shuffled = [...taskDatabase].sort(() => 0.5 - Math.random());
  
  // Filter tasks based on skills if provided
  let tasks = shuffled;
  if (userContext.skills && userContext.skills.length > 0) {
      tasks = tasks.filter(task => 
          task.requiredSkills.some(skill => userContext.skills.includes(skill))
      );
  }

  // Return a subset of available tasks
  return Promise.resolve(tasks.slice(0, 3));
}

module.exports = { generateTasks };
