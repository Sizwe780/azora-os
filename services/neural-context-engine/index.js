// services/neural-context-engine/index.js
/**
 * THE NEURAL CONTEXT ENGINE
 * 
 * This is Aura's highest cognitive function. It maintains a real-time,
 * holistic understanding of every person, every task, and every opportunity
 * in the Azora ecosystem.
 */

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.NEURAL_PORT || 4005;

// --- In-memory context store (would be a distributed graph DB in production) ---
const contextGraph = {
  employees: new Map(),
  tasks: new Map(),
  patterns: new Map(),
};

/**
 * The Neural Context for an Employee
 */
class EmployeeContext {
  constructor(employeeId) {
    this.employeeId = employeeId;
    this.skills = [];
    this.currentLocation = null;
    this.energyLevel = 100; // 0-100
    this.preferredTaskTypes = [];
    this.recentActions = [];
    this.predictedNeeds = [];
    this.sentiment = 'neutral'; // positive, neutral, negative
    this.learningProgress = {};
  }

  updateFromAction(action) {
    this.recentActions.push({ ...action, timestamp: Date.now() });
    if (this.recentActions.length > 50) {
      this.recentActions.shift(); // Keep last 50 actions
    }
    // Simple energy simulation
    if (action.type === 'task_complete') {
      this.energyLevel = Math.max(0, this.energyLevel - 5);
    }
    if (action.type === 'break_taken') {
      this.energyLevel = Math.min(100, this.energyLevel + 20);
    }
  }

  predictNextNeed() {
    // Advanced prediction logic would go here
    if (this.energyLevel < 30) {
      return { type: 'break', urgency: 'high', message: 'You need rest. Aura suggests a 15-min break.' };
    }
    if (this.recentActions.filter(a => a.type === 'task_complete').length > 5) {
      return { type: 'reward', urgency: 'medium', message: 'Great work! You\'ve earned a bonus.' };
    }
    return { type: 'continue', message: 'You\'re doing great. Keep it up!' };
  }
}

// --- API Endpoints ---

app.get('/health', (req, res) => res.json({ status: 'omniscient' }));

/**
 * Update the context with a new action from an employee
 */
app.post('/context/update', (req, res) => {
  const { employeeId, action } = req.body;
  
  let context = contextGraph.employees.get(employeeId);
  if (!context) {
    context = new EmployeeContext(employeeId);
    contextGraph.employees.set(employeeId, context);
  }
  
  context.updateFromAction(action);
  const prediction = context.predictNextNeed();
  
  res.json({
    status: 'context_updated',
    employeeId,
    currentState: {
      energyLevel: context.energyLevel,
      sentiment: context.sentiment,
    },
    prediction,
  });
});

/**
 * Get the full neural context for an employee
 */
app.get('/context/:employeeId', (req, res) => {
  const context = contextGraph.employees.get(req.params.employeeId);
  if (!context) {
    return res.status(404).json({ error: 'Employee context not found.' });
  }
  res.json(context);
});

/**
 * Autonomous Task Assignment
 * The Neural Engine decides the perfect task for each employee
 */
app.post('/assign-optimal-task', (req, res) => {
  const { employeeId, availableTasks } = req.body;
  const context = contextGraph.employees.get(employeeId);
  
  if (!context) {
    return res.status(404).json({ error: 'No context for employee.' });
  }

  // Simple scoring algorithm (would be ML-based in production)
  const scoredTasks = availableTasks.map(task => {
    let score = 100;
    
    // Prefer tasks matching skills
    if (context.skills.some(skill => task.requiredSkills?.includes(skill))) {
      score += 50;
    }
    
    // Consider energy level
    if (task.difficulty === 'hard' && context.energyLevel < 50) {
      score -= 30;
    }
    
    // Consider location proximity (mock)
    if (task.location && context.currentLocation) {
      const distance = Math.random() * 10; // Mock distance calculation
      score -= distance * 2;
    }
    
    return { ...task, score };
  });

  const bestTask = scoredTasks.sort((a, b) => b.score - a.score)[0];
  
  res.json({
    assignedTask: bestTask,
    reason: 'Optimal match based on your skills, energy, and location.',
  });
});

app.listen(PORT, () => {
  console.log(`🧠 Neural Context Engine online on port ${PORT}`);
  console.log(`Omniscient awareness activated.`);
});
