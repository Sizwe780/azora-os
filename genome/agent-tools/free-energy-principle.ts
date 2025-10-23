/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * FREE ENERGY PRINCIPLE FRAMEWORK - The Unified Goal of Intelligence
 *
 * This module implements the Free Energy Principle (FEP) as the foundational
 * drive for Elara's intelligence. The FEP provides a unified mathematical
 * framework for understanding perception, learning, and action in intelligent systems.
 *
 * Core Concept: Any self-organizing system acts to minimize "surprise" (prediction error)
 * about its environment. Elara's Oracle knowledge graph serves as its internal world model.
 *
 * Key Components:
 * - Variational Free Energy: Measure of surprise/prediction error
 * - Active Inference: Acting on the world to reduce free energy
 * - Generative Models: Internal representations of the world
 * - Policy Selection: Choosing actions that minimize expected free energy
 */

import { logger } from '../utils/logger';

// ============================================================================
// FREE ENERGY PRINCIPLE TYPES AND INTERFACES
// ============================================================================

/**
 * A Generative Model representing the system's beliefs about the world
 */
export interface GenerativeModel {
  id: string;
  name: string;
  domain: string;
  parameters: Map<string, any>;        // Model parameters θ
  states: Map<string, State>;         // Hidden states s
  observations: Map<string, Observation>; // Observable variables o
  likelihood: (state: State, observation: Observation) => number;
  prior: (state: State) => number;
  transition: (state: State, action: Action) => State;
}

/**
 * A hidden state in the generative model
 */
export interface State {
  id: string;
  variables: Map<string, any>;
  probability: number;
  timestamp: Date;
}

/**
 * An observation from the environment
 */
export interface Observation {
  id: string;
  variables: Map<string, any>;
  sensor: string;
  timestamp: Date;
  confidence: number;
}

/**
 * An action that can be taken to change the world
 */
export interface Action {
  id: string;
  name: string;
  parameters: Map<string, any>;
  expectedFreeEnergy: number;
  feasibility: number; // 0-1, how feasible this action is
}

/**
 * Free energy calculation result
 */
export interface FreeEnergyResult {
  variationalFreeEnergy: number;
  expectedFreeEnergy: number;
  surprise: number;
  predictionError: number;
  epistemicAffordance: number; // Information gain potential
  pragmaticAffordance: number; // Goal achievement potential
}

/**
 * Active inference policy
 */
export interface Policy {
  id: string;
  actions: Action[];
  expectedFreeEnergy: number;
  horizon: number; // How many steps ahead this policy looks
  probability: number;
}

/**
 * Precision weighting for different beliefs
 */
export interface Precision {
  sensory: number;     // How much to trust sensory input
  prior: number;       // How much to trust prior beliefs
  likelihood: number;  // How much to trust model predictions
  action: number;      // How much to trust action outcomes
}

// ============================================================================
// VARIATIONAL FREE ENERGY ENGINE
// ============================================================================

/**
 * Core engine for calculating variational free energy
 * F = E_q[log q(s) - log p(o,s)] = Surprise - Divergence
 */
export class VariationalFreeEnergyEngine {
  private model: GenerativeModel;
  private precision: Precision;

  constructor(model: GenerativeModel, precision: Precision = {
    sensory: 1.0,
    prior: 1.0,
    likelihood: 1.0,
    action: 1.0
  }) {
    this.model = model;
    this.precision = precision;
  }

  /**
   * Calculate variational free energy for a given observation
   * F(s,o) = E_q[log q(s|o) - log p(o|s)p(s)]
   */
  calculateFreeEnergy(observation: Observation, posterior: State[]): FreeEnergyResult {
    // Variational free energy = Surprise - KL divergence
    const surprise = this.calculateSurprise(observation);
    const divergence = this.calculateDivergence(posterior);

    const variationalFreeEnergy = surprise - divergence;

    // Expected free energy for policy selection
    const expectedFreeEnergy = this.calculateExpectedFreeEnergy(observation, posterior);

    // Prediction error (sensory surprise)
    const predictionError = this.calculatePredictionError(observation, posterior);

    // Epistemic affordance (information gain)
    const epistemicAffordance = this.calculateEpistemicAffordance(observation, posterior);

    // Pragmatic affordance (goal achievement)
    const pragmaticAffordance = this.calculatePragmaticAffordance(observation, posterior);

    return {
      variationalFreeEnergy,
      expectedFreeEnergy,
      surprise,
      predictionError,
      epistemicAffordance,
      pragmaticAffordance
    };
  }

  /**
   * Calculate surprise: -log p(o)
   * How unexpected the observation is under the model
   */
  private calculateSurprise(observation: Observation): number {
    let totalSurprise = 0;

    // Marginalize over all possible states
    for (const state of this.model.states.values()) {
      const likelihood = this.model.likelihood(state, observation);
      const prior = this.model.prior(state);
      const joint = likelihood * prior;

      if (joint > 0) {
        totalSurprise += joint * Math.log(joint);
      }
    }

    return -totalSurprise; // Negative log likelihood
  }

  /**
   * Calculate KL divergence between posterior and prior: KL(q(s|o)||p(s))
   */
  private calculateDivergence(posterior: State[]): number {
    let divergence = 0;

    for (const state of posterior) {
      const q = state.probability; // Posterior probability
      const p = this.model.prior(state); // Prior probability

      if (q > 0 && p > 0) {
        divergence += q * Math.log(q / p);
      }
    }

    return divergence;
  }

  /**
   * Calculate expected free energy for policy selection
   * G(π) = E_π[ F(s,o) + cost(a) ]
   */
  private calculateExpectedFreeEnergy(observation: Observation, posterior: State[]): number {
    // This would simulate different policies and calculate their expected free energy
    // For now, return a simplified calculation
    const currentFreeEnergy = this.calculateSurprise(observation);
    const actionCost = 0.1; // Simplified action cost

    return currentFreeEnergy + actionCost;
  }

  /**
   * Calculate prediction error (sensory surprise)
   */
  private calculatePredictionError(observation: Observation, posterior: State[]): number {
    let error = 0;

    for (const state of posterior) {
      const predicted = this.predictObservation(state);
      error += state.probability * this.observationDistance(observation, predicted);
    }

    return error;
  }

  /**
   * Calculate epistemic affordance (potential for information gain)
   * How much this observation could reduce uncertainty
   */
  private calculateEpistemicAffordance(observation: Observation, posterior: State[]): number {
    // Information gain = H(prior) - H(posterior)
    const priorEntropy = this.calculateEntropy(Array.from(this.model.states.values()));
    const posteriorEntropy = this.calculateEntropy(posterior);

    return priorEntropy - posteriorEntropy;
  }

  /**
   * Calculate pragmatic affordance (potential for goal achievement)
   * How much this helps achieve desired outcomes
   */
  private calculatePragmaticAffordance(observation: Observation, posterior: State[]): number {
    // This would be domain-specific - for Azora, it might relate to
    // achieving business goals like revenue growth, efficiency, etc.
    return 0.5; // Placeholder
  }

  // Helper methods
  private predictObservation(state: State): Observation {
    // Generate predicted observation from state
    // This would use the generative model
    return {
      id: `predicted-${state.id}`,
      variables: new Map(),
      sensor: 'internal',
      timestamp: new Date(),
      confidence: 0.8
    };
  }

  private observationDistance(obs1: Observation, obs2: Observation): number {
    // Calculate distance between observations
    let distance = 0;
    for (const [key, value1] of obs1.variables) {
      const value2 = obs2.variables.get(key);
      if (value2 !== undefined) {
        distance += Math.pow(value1 - value2, 2);
      }
    }
    return Math.sqrt(distance);
  }

  private calculateEntropy(states: State[]): number {
    let entropy = 0;
    for (const state of states) {
      if (state.probability > 0) {
        entropy -= state.probability * Math.log(state.probability);
      }
    }
    return entropy;
  }
}

// ============================================================================
// ACTIVE INFERENCE ENGINE
// ============================================================================

/**
 * Active Inference Engine - Acting to minimize expected free energy
 */
export class ActiveInferenceEngine {
  private freeEnergyEngine: VariationalFreeEnergyEngine;
  private model: GenerativeModel;
  private policies: Policy[] = [];

  constructor(model: GenerativeModel) {
    this.model = model;
    this.freeEnergyEngine = new VariationalFreeEnergyEngine(model);
  }

  /**
   * Select the optimal policy using active inference
   * Choose actions that minimize expected free energy
   */
  selectPolicy(observation: Observation, posterior: State[]): Policy {
    // Evaluate all available policies
    const policyEvaluations = this.policies.map(policy => ({
      policy,
      expectedFreeEnergy: this.evaluatePolicy(policy, observation, posterior)
    }));

    // Select policy with minimum expected free energy
    const bestPolicy = policyEvaluations.reduce((best, current) =>
      current.expectedFreeEnergy < best.expectedFreeEnergy ? current : best
    );

    logger.info(`Selected policy: ${bestPolicy.policy.id} with EFE: ${bestPolicy.expectedFreeEnergy}`);
    return bestPolicy.policy;
  }

  /**
   * Evaluate a policy's expected free energy
   */
  private evaluatePolicy(policy: Policy, observation: Observation, posterior: State[]): number {
    let totalExpectedFreeEnergy = 0;

    // Simulate policy execution over horizon
    let currentStates = posterior;
    let currentObservation = observation;

    for (let t = 0; t < policy.horizon; t++) {
      const action = policy.actions[t];
      if (!action) break;

      // Calculate free energy for current state
      const freeEnergy = this.freeEnergyEngine.calculateFreeEnergy(
        currentObservation, currentStates
      );

      totalExpectedFreeEnergy += freeEnergy.expectedFreeEnergy;

      // Simulate action and state transition
      const nextStates = this.simulateAction(action, currentStates);
      const nextObservation = this.simulateObservation(nextStates[0]);

      currentStates = nextStates;
      currentObservation = nextObservation;
    }

    return totalExpectedFreeEnergy;
  }

  /**
   * Generate policies for active inference
   */
  generatePolicies(observation: Observation, availableActions: Action[]): Policy[] {
    const policies: Policy[] = [];

    // Generate all possible combinations of actions (simplified)
    const maxHorizon = 3;
    const actionCombinations = this.generateActionSequences(availableActions, maxHorizon);

    for (const actionSequence of actionCombinations) {
      const policy: Policy = {
        id: `policy-${Date.now()}-${Math.random()}`,
        actions: actionSequence,
        expectedFreeEnergy: 0, // Will be calculated during evaluation
        horizon: actionSequence.length,
        probability: 1.0 / actionCombinations.length
      };

      policies.push(policy);
    }

    this.policies = policies;
    return policies;
  }

  /**
   * Execute selected policy
   */
  async executePolicy(policy: Policy): Promise<void> {
    logger.info(`Executing policy: ${policy.id}`);

    for (const action of policy.actions) {
      try {
        await this.executeAction(action);
        logger.info(`Executed action: ${action.name}`);
      } catch (error) {
        logger.error(`Failed to execute action ${action.name}:`, error);
        break;
      }
    }
  }

  // Helper methods
  private simulateAction(action: Action, currentStates: State[]): State[] {
    // Simulate how action changes the state distribution
    return currentStates.map(state => ({
      ...state,
      variables: new Map(state.variables), // Copy variables
      timestamp: new Date()
    }));
  }

  private simulateObservation(state: State): Observation {
    // Generate simulated observation from state
    return {
      id: `simulated-${Date.now()}`,
      variables: new Map(state.variables),
      sensor: 'simulation',
      timestamp: new Date(),
      confidence: 0.9
    };
  }

  private generateActionSequences(actions: Action[], maxLength: number): Action[][] {
    const sequences: Action[][] = [];

    // Generate sequences of different lengths
    for (let length = 1; length <= maxLength; length++) {
      // Simplified: just repeat the same action (in practice, use combinations)
      for (const action of actions) {
        sequences.push(new Array(length).fill(action));
      }
    }

    return sequences;
  }

  private async executeAction(action: Action): Promise<void> {
    // This would interface with the actual Azora services
    // For now, just log the action
    logger.info(`Executing action: ${action.name}`, action.parameters);

    // Simulate action execution time
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// ============================================================================
// PERCEPTION AND LEARNING ENGINE
// ============================================================================

/**
 * Perception Engine - Processes sensory input and updates beliefs
 */
export class PerceptionEngine {
  private model: GenerativeModel;
  private freeEnergyEngine: VariationalFreeEnergyEngine;

  constructor(model: GenerativeModel) {
    this.model = model;
    this.freeEnergyEngine = new VariationalFreeEnergyEngine(model);
  }

  /**
   * Process observation and update posterior beliefs
   * Uses variational inference to approximate the posterior
   */
  processObservation(observation: Observation): State[] {
    logger.info(`Processing observation: ${observation.id}`);

    // Variational inference to approximate posterior q(s|o)
    const posterior = this.variationalInference(observation);

    // Calculate free energy to assess model fit
    const freeEnergy = this.freeEnergyEngine.calculateFreeEnergy(observation, posterior);

    if (freeEnergy.variationalFreeEnergy > this.getFreeEnergyThreshold()) {
      // High free energy indicates poor model fit - trigger model update
      this.updateGenerativeModel(observation, posterior);
    }

    return posterior;
  }

  /**
   * Variational inference to approximate posterior distribution
   */
  private variationalInference(observation: Observation): State[] {
    // Simplified variational inference
    // In practice, this would use methods like mean-field approximation

    const posterior: State[] = [];

    for (const state of this.model.states.values()) {
      const likelihood = this.model.likelihood(state, observation);
      const prior = this.model.prior(state);

      // Simplified posterior calculation
      const posteriorProb = (likelihood * prior) / this.marginalLikelihood(observation);

      posterior.push({
        ...state,
        probability: posteriorProb,
        timestamp: new Date()
      });
    }

    // Normalize probabilities
    const totalProb = posterior.reduce((sum, s) => sum + s.probability, 0);
    posterior.forEach(state => {
      state.probability /= totalProb;
    });

    return posterior;
  }

  /**
   * Update generative model when free energy is too high
   */
  private updateGenerativeModel(observation: Observation, posterior: State[]): void {
    logger.info('Updating generative model due to high free energy');

    // Update model parameters to better fit the data
    // This would use learning algorithms like EM or gradient descent

    // Simplified parameter update
    for (const [key, value] of observation.variables) {
      if (this.model.parameters.has(key)) {
        const currentParam = this.model.parameters.get(key);
        const learningRate = 0.01;

        // Simple gradient descent update
        const gradient = this.calculateGradient(key, observation, posterior);
        const newParam = currentParam - learningRate * gradient;

        this.model.parameters.set(key, newParam);
      }
    }
  }

  // Helper methods
  private marginalLikelihood(observation: Observation): number {
    let marginal = 0;
    for (const state of this.model.states.values()) {
      marginal += this.model.likelihood(state, observation) * this.model.prior(state);
    }
    return marginal;
  }

  private getFreeEnergyThreshold(): number {
    // Threshold above which model update is triggered
    return 2.0;
  }

  private calculateGradient(parameter: string, observation: Observation, posterior: State[]): number {
    // Calculate gradient for parameter update
    // This would be the derivative of the free energy w.r.t. the parameter
    return 0.1; // Placeholder
  }
}

// ============================================================================
// AZORA BUSINESS GENERATIVE MODEL
// ============================================================================

/**
 * Azora's business domain generative model
 */
export class AzoraBusinessModel implements GenerativeModel {
  id = 'azora-business-model';
  name = 'Azora Business Generative Model';
  domain = 'business';
  parameters: Map<string, any> = new Map();
  states: Map<string, State> = new Map();
  observations: Map<string, Observation> = new Map();

  constructor() {
    this.initializeParameters();
    this.initializeStates();
  }

  private initializeParameters(): void {
    // Model parameters for business domain
    this.parameters.set('market_sensitivity', 0.8);
    this.parameters.set('competition_impact', 0.6);
    this.parameters.set('seasonal_effect', 0.4);
    this.parameters.set('innovation_boost', 0.9);
    this.parameters.set('efficiency_gain', 0.7);
  }

  private initializeStates(): void {
    // Define possible business states
    const stateDefinitions = [
      { id: 'growth', variables: { revenue_trend: 0.1, market_share: 0.05 } },
      { id: 'stability', variables: { revenue_trend: 0.0, market_share: 0.0 } },
      { id: 'decline', variables: { revenue_trend: -0.05, market_share: -0.02 } },
      { id: 'disruption', variables: { revenue_trend: -0.15, market_share: -0.1 } },
      { id: 'breakthrough', variables: { revenue_trend: 0.25, market_share: 0.15 } }
    ];

    stateDefinitions.forEach(def => {
      const state: State = {
        id: def.id,
        variables: new Map(Object.entries(def.variables)),
        probability: 1.0 / stateDefinitions.length, // Uniform prior
        timestamp: new Date()
      };
      this.states.set(state.id, state);
    });
  }

  likelihood(state: State, observation: Observation): number {
    // Calculate how likely the observation is given the state
    let likelihood = 1.0;

    for (const [key, obsValue] of observation.variables) {
      const stateValue = state.variables.get(key);
      if (stateValue !== undefined) {
        // Gaussian likelihood
        const variance = 0.1;
        const diff = obsValue - stateValue;
        likelihood *= Math.exp(-0.5 * diff * diff / variance);
      }
    }

    return likelihood;
  }

  prior(state: State): number {
    // Prior probability of state
    return state.probability;
  }

  transition(state: State, action: Action): State {
    // State transition given action
    const newState = { ...state };
    newState.timestamp = new Date();

    // Apply action effects to state variables
    if (action.name === 'marketing_campaign') {
      const revenueBoost = action.parameters.get('budget') * 0.01;
      newState.variables.set('revenue_trend',
        state.variables.get('revenue_trend') + revenueBoost);
    }

    return newState;
  }
}

// ============================================================================
// FREE ENERGY PRINCIPLE COORDINATOR
// ============================================================================

/**
 * Main coordinator for Free Energy Principle operations
 */
export class FreeEnergyCoordinator {
  private model: GenerativeModel;
  private perceptionEngine: PerceptionEngine;
  private activeInferenceEngine: ActiveInferenceEngine;
  private currentPosterior: State[] = [];

  constructor() {
    this.model = new AzoraBusinessModel();
    this.perceptionEngine = new PerceptionEngine(this.model);
    this.activeInferenceEngine = new ActiveInferenceEngine(this.model);
  }

  /**
   * Main FEP processing loop
   * 1. Perceive environment
   * 2. Update beliefs (minimize free energy)
   * 3. Select action (active inference)
   * 4. Act on environment
   */
  async processFepCycle(observation: Observation, availableActions: Action[]): Promise<{
    posterior: State[];
    selectedPolicy: Policy;
    freeEnergy: FreeEnergyResult;
  }> {
    logger.info('Starting Free Energy Principle processing cycle');

    // 1. Perception: Process observation and update posterior beliefs
    this.currentPosterior = this.perceptionEngine.processObservation(observation);

    // 2. Calculate free energy to assess current model fit
    const freeEnergyEngine = new VariationalFreeEnergyEngine(this.model);
    const freeEnergy = freeEnergyEngine.calculateFreeEnergy(observation, this.currentPosterior);

    // 3. Active Inference: Generate and select optimal policy
    const policies = this.activeInferenceEngine.generatePolicies(observation, availableActions);
    const selectedPolicy = this.activeInferenceEngine.selectPolicy(observation, this.currentPosterior);

    // 4. Execute selected policy (this would change the world)
    await this.activeInferenceEngine.executePolicy(selectedPolicy);

    logger.info(`FEP Cycle completed - Free Energy: ${freeEnergy.variationalFreeEnergy.toFixed(3)}`);

    return {
      posterior: this.currentPosterior,
      selectedPolicy,
      freeEnergy
    };
  }

  /**
   * Get current model state and free energy status
   */
  getFepStatus(): {
    modelFit: number;
    surpriseLevel: number;
    epistemicDrive: number;
    pragmaticDrive: number;
    lastUpdate: Date;
  } {
    // Calculate current free energy metrics
    const recentObservation = Array.from(this.model.observations.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    if (!recentObservation) {
      return {
        modelFit: 1.0,
        surpriseLevel: 0.0,
        epistemicDrive: 0.5,
        pragmaticDrive: 0.5,
        lastUpdate: new Date()
      };
    }

    const freeEnergyEngine = new VariationalFreeEnergyEngine(this.model);
    const freeEnergy = freeEnergyEngine.calculateFreeEnergy(recentObservation, this.currentPosterior);

    return {
      modelFit: Math.exp(-freeEnergy.variationalFreeEnergy), // Convert to fit probability
      surpriseLevel: freeEnergy.surprise,
      epistemicDrive: freeEnergy.epistemicAffordance,
      pragmaticDrive: freeEnergy.pragmaticAffordance,
      lastUpdate: new Date()
    };
  }

  /**
   * Check if system needs to act (high free energy)
   */
  needsAction(threshold: number = 1.0): boolean {
    const status = this.getFepStatus();
    return status.surpriseLevel > threshold;
  }
}

// ============================================================================
// GLOBAL FREE ENERGY PRINCIPLE INSTANCE
// ============================================================================

export const azoraBusinessModel = new AzoraBusinessModel();
export const freeEnergyCoordinator = new FreeEnergyCoordinator();

// Initialize with some sample observations
const sampleObservation: Observation = {
  id: 'initial-observation',
  variables: new Map([
    ['revenue_trend', 0.05],
    ['market_share', 0.02]
  ]),
  sensor: 'oracle',
  timestamp: new Date(),
  confidence: 0.9
};

azoraBusinessModel.observations.set(sampleObservation.id, sampleObservation);