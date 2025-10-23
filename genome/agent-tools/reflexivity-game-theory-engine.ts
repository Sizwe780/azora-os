/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { EventEmitter } from 'events';
import { logger } from '../utils/logger';

/**
 * REFLEXIVITY & EVOLUTIONARY GAME THEORY ENGINE
 *
 * Implements George Soros's Theory of Reflexivity and Evolutionary Game Theory
 * for strategic market positioning and competitor modeling.
 *
 * Key Concepts:
 * - Reflexivity: Market participants' actions create feedback loops that change fundamentals
 * - Evolutionary Game Theory: Models how strategies evolve in competitive environments
 * - Nash Equilibrium: Points where no player can benefit by changing strategy unilaterally
 * - Evolutionarily Stable Strategies (ESS): Strategies resistant to invasion by mutants
 */

export interface MarketParticipant {
    id: string;
    name: string;
    marketShare: number;
    strategy: MarketStrategy;
    resources: ResourceProfile;
    behavioralBiases: BehavioralBias[];
    historicalActions: HistoricalAction[];
}

export interface MarketStrategy {
    type: 'aggressive' | 'defensive' | 'cooperative' | 'predatory' | 'innovative';
    parameters: Record<string, number>;
    adaptability: number; // 0-1, how quickly strategy can change
    riskTolerance: number;
}

export interface ResourceProfile {
    capital: number;
    technology: number;
    brand: number;
    network: number;
    humanCapital: number;
}

export interface BehavioralBias {
    type: 'overconfidence' | 'loss_aversion' | 'anchoring' | 'herding' | 'confirmation';
    intensity: number; // 0-1
    triggerConditions: string[];
}

export interface HistoricalAction {
    timestamp: Date;
    action: string;
    outcome: ActionOutcome;
    marketImpact: number;
}

export interface ActionOutcome {
    success: boolean;
    payoff: number;
    marketShift: MarketShift;
}

export interface MarketShift {
    priceChange: number;
    volumeChange: number;
    competitorReactions: CompetitorReaction[];
    fundamentalChange: number; // How much this changed market fundamentals
}

export interface CompetitorReaction {
    competitorId: string;
    reactionType: 'retaliate' | 'accommodate' | 'ignore' | 'cooperate';
    intensity: number;
    delay: number; // Days until reaction
}

export interface GameState {
    participants: MarketParticipant[];
    marketConditions: MarketConditions;
    payoffMatrix: PayoffMatrix;
    currentRound: number;
    history: GameHistory[];
}

export interface MarketConditions {
    demand: number;
    supply: number;
    competition: number;
    regulation: number;
    technology: number;
    economicCycle: 'expansion' | 'contraction' | 'recession' | 'recovery';
}

export interface PayoffMatrix {
    [participantId: string]: {
        [strategy: string]: {
            [opponentStrategy: string]: number;
        };
    };
}

export interface GameHistory {
    round: number;
    actions: Action[];
    outcomes: Outcome[];
    marketState: MarketConditions;
}

export interface Action {
    participantId: string;
    strategy: string;
    parameters: any;
}

export interface Outcome {
    participantId: string;
    payoff: number;
    newMarketShare: number;
    strategyFitness: number;
}

export interface ReflexiveSimulation {
    id: string;
    scenario: string;
    initialConditions: MarketConditions;
    participants: MarketParticipant[];
    rounds: number;
    results: SimulationResult[];
    insights: ReflexiveInsight[];
}

export interface SimulationResult {
    round: number;
    marketState: MarketConditions;
    participantStates: ParticipantState[];
    reflexiveFeedback: ReflexiveFeedback[];
}

export interface ParticipantState {
    id: string;
    strategy: MarketStrategy;
    marketShare: number;
    payoff: number;
    behavioralState: BehavioralState;
}

export interface BehavioralState {
    confidence: number;
    riskPerception: number;
    cooperationLevel: number;
    innovationDrive: number;
}

export interface ReflexiveFeedback {
    trigger: string;
    feedbackLoop: FeedbackLoop;
    marketImpact: number;
    participantImpacts: Record<string, number>;
}

export interface FeedbackLoop {
    type: 'positive' | 'negative' | 'balancing';
    strength: number;
    description: string;
    causalChain: string[];
}

export interface ReflexiveInsight {
    type: 'opportunity' | 'threat' | 'strategy' | 'manipulation';
    description: string;
    confidence: number;
    actionable: boolean;
    implementation: string[];
}

export class ReflexivityGameTheoryEngine {
    private eventEmitter: EventEmitter;
    private currentGameState: GameState;
    private simulations: Map<string, ReflexiveSimulation>;
    private evolutionEngine: EvolutionaryEngine;

    constructor() {
        this.eventEmitter = new EventEmitter();
        this.simulations = new Map();
        this.evolutionEngine = new EvolutionaryEngine();
        this.initializeGameState();
    }

    /**
     * Initialize the current market game state
     */
    private async initializeGameState(): Promise<void> {
        // Initialize with current market participants
        const participants = await this.identifyMarketParticipants();
        const marketConditions = await this.assessMarketConditions();

        this.currentGameState = {
            participants,
            marketConditions,
            payoffMatrix: this.calculatePayoffMatrix(participants, marketConditions),
            currentRound: 0,
            history: []
        };

        logger.info('Reflexivity Game Theory Engine initialized', {
            participants: participants.length,
            marketConditions: marketConditions.economicCycle
        });
    }

    /**
     * Run a comprehensive reflexive simulation
     */
    public async runReflexiveSimulation(
        scenario: string,
        rounds: number = 10,
        participants?: MarketParticipant[]
    ): Promise<ReflexiveSimulation> {
        const simulationId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const simParticipants = participants || this.currentGameState.participants;
        const initialConditions = { ...this.currentGameState.marketConditions };

        const simulation: ReflexiveSimulation = {
            id: simulationId,
            scenario,
            initialConditions,
            participants: simParticipants,
            rounds,
            results: [],
            insights: []
        };

        logger.info(`Starting reflexive simulation: ${scenario}`, { simulationId, rounds });

        // Run simulation rounds
        for (let round = 1; round <= rounds; round++) {
            const result = await this.simulateRound(simulation, round);
            simulation.results.push(result);

            // Check for reflexive feedback loops
            const feedback = await this.detectReflexiveFeedback(result);
            if (feedback.length > 0) {
                result.reflexiveFeedback = feedback;
            }
        }

        // Generate insights from simulation
        simulation.insights = await this.generateReflexiveInsights(simulation);

        this.simulations.set(simulationId, simulation);

        logger.info(`Completed reflexive simulation: ${scenario}`, {
            simulationId,
            rounds,
            insights: simulation.insights.length
        });

        return simulation;
    }

    /**
     * Simulate a single round of market interaction
     */
    private async simulateRound(
        simulation: ReflexiveSimulation,
        round: number
    ): Promise<SimulationResult> {
        const currentState = round === 1 ?
            simulation.initialConditions :
            simulation.results[round - 2].marketState;

        // Each participant chooses strategy based on current state
        const participantStates: ParticipantState[] = [];

        for (const participant of simulation.participants) {
            const state = await this.simulateParticipantBehavior(participant, currentState, round);
            participantStates.push(state);
        }

        // Calculate market impacts and reflexive feedback
        const newMarketState = await this.calculateMarketEvolution(currentState, participantStates);

        return {
            round,
            marketState: newMarketState,
            participantStates,
            reflexiveFeedback: [] // Will be filled by detectReflexiveFeedback
        };
    }

    /**
     * Simulate individual participant behavior with behavioral biases
     */
    private async simulateParticipantBehavior(
        participant: MarketParticipant,
        marketState: MarketConditions,
        round: number
    ): Promise<ParticipantState> {
        // Apply behavioral biases to decision making
        const biasedPerception = this.applyBehavioralBiases(participant, marketState);

        // Choose strategy using evolutionary game theory
        const strategy = await this.evolutionEngine.selectStrategy(
            participant,
            biasedPerception,
            this.currentGameState.participants
        );

        // Calculate payoff based on strategy and market conditions
        const payoff = this.calculateStrategyPayoff(strategy, marketState, participant);

        // Update participant's behavioral state
        const behavioralState = this.updateBehavioralState(participant, payoff, marketState);

        return {
            id: participant.id,
            strategy,
            marketShare: participant.marketShare + (payoff * 0.01), // Simplified market share evolution
            payoff,
            behavioralState
        };
    }

    /**
     * Apply behavioral biases to market perception
     */
    private applyBehavioralBiases(
        participant: MarketParticipant,
        marketState: MarketConditions
    ): MarketConditions {
        let biasedState = { ...marketState };

        for (const bias of participant.behavioralBiases) {
            switch (bias.type) {
                case 'overconfidence':
                    biasedState.demand *= (1 + bias.intensity * 0.2);
                    break;
                case 'loss_aversion':
                    biasedState.competition *= (1 + bias.intensity * 0.15);
                    break;
                case 'anchoring':
                    // Stick to historical perceptions
                    biasedState = this.applyAnchoring(biasedState, participant, bias.intensity);
                    break;
                case 'herding':
                    biasedState = this.applyHerding(biasedState, bias.intensity);
                    break;
                case 'confirmation':
                    biasedState = this.applyConfirmationBias(biasedState, participant, bias.intensity);
                    break;
            }
        }

        return biasedState;
    }

    /**
     * Calculate how market evolves based on participant actions
     */
    private async calculateMarketEvolution(
        currentState: MarketConditions,
        participantStates: ParticipantState[]
    ): Promise<MarketConditions> {
        // Aggregate strategy impacts
        const strategyImpacts = participantStates.map(state =>
            this.calculateStrategyImpact(state.strategy, currentState)
        );

        // Calculate reflexive feedback loops
        const totalImpact = strategyImpacts.reduce((acc, impact) => ({
            demand: acc.demand + impact.demand,
            supply: acc.supply + impact.supply,
            competition: acc.competition + impact.competition,
            regulation: acc.regulation + impact.regulation,
            technology: acc.technology + impact.technology,
            economicCycle: currentState.economicCycle
        }), { demand: 0, supply: 0, competition: 0, regulation: 0, technology: 0 });

        // Apply reflexive effects (actions change fundamentals)
        const newState: MarketConditions = {
            demand: Math.max(0, currentState.demand + totalImpact.demand + this.calculateReflexiveDemand(currentState, participantStates)),
            supply: Math.max(0, currentState.supply + totalImpact.supply),
            competition: Math.max(0, currentState.competition + totalImpact.competition),
            regulation: Math.max(0, currentState.regulation + totalImpact.regulation),
            technology: Math.max(0, currentState.technology + totalImpact.technology),
            economicCycle: this.determineEconomicCycle(currentState, totalImpact)
        };

        return newState;
    }

    /**
     * Detect reflexive feedback loops in simulation results
     */
    private async detectReflexiveFeedback(result: SimulationResult): Promise<ReflexiveFeedback[]> {
        const feedback: ReflexiveFeedback[] = [];

        // Check for price feedback loops
        if (result.marketState.demand > result.marketState.supply * 1.5) {
            feedback.push({
                trigger: 'supply_demand_imbalance',
                feedbackLoop: {
                    type: 'positive',
                    strength: 0.8,
                    description: 'High demand relative to supply creates price pressure',
                    causalChain: ['high_demand', 'price_increase', 'supplier_investment', 'supply_increase', 'price_stabilization']
                },
                marketImpact: 0.3,
                participantImpacts: this.calculateParticipantImpacts(result.participantStates, 'price_pressure')
            });
        }

        // Check for competitive feedback loops
        const aggressiveStrategies = result.participantStates.filter(
            s => s.strategy.type === 'aggressive'
        ).length;

        if (aggressiveStrategies > result.participantStates.length * 0.3) {
            feedback.push({
                trigger: 'competitive_aggression',
                feedbackLoop: {
                    type: 'negative',
                    strength: 0.6,
                    description: 'Multiple aggressive strategies create market instability',
                    causalChain: ['price_wars', 'margin_compression', 'industry_consolidation', 'reduced_competition']
                },
                marketImpact: -0.4,
                participantImpacts: this.calculateParticipantImpacts(result.participantStates, 'competition')
            });
        }

        return feedback;
    }

    /**
     * Generate strategic insights from reflexive simulation
     */
    private async generateReflexiveInsights(simulation: ReflexiveSimulation): Promise<ReflexiveInsight[]> {
        const insights: ReflexiveInsight[] = [];

        // Analyze final market state
        const finalState = simulation.results[simulation.results.length - 1];
        const initialState = simulation.initialConditions;

        // Identify evolutionarily stable strategies
        const stableStrategies = this.identifyStableStrategies(simulation);

        // Find manipulation opportunities
        const manipulationOpportunities = this.identifyManipulationOpportunities(simulation);

        // Generate strategic recommendations
        insights.push({
            type: 'strategy',
            description: `Evolutionarily stable strategy identified: ${stableStrategies[0]?.strategy || 'mixed approach'}`,
            confidence: 0.85,
            actionable: true,
            implementation: [
                'Implement identified stable strategy',
                'Monitor competitor reactions',
                'Adjust based on reflexive feedback'
            ]
        });

        if (manipulationOpportunities.length > 0) {
            insights.push({
                type: 'manipulation',
                description: `Market manipulation opportunity: ${manipulationOpportunities[0].description}`,
                confidence: 0.75,
                actionable: true,
                implementation: manipulationOpportunities[0].actions
            });
        }

        // Identify threats and opportunities
        const marketShift = this.calculateMarketShift(initialState, finalState.marketState);

        if (marketShift > 0.2) {
            insights.push({
                type: 'opportunity',
                description: 'Simulation shows significant market share growth potential through reflexive strategies',
                confidence: 0.8,
                actionable: true,
                implementation: [
                    'Execute identified growth strategy',
                    'Monitor reflexive feedback loops',
                    'Adjust tactics based on competitor responses'
                ]
            });
        }

        return insights;
    }

    /**
     * Find evolutionarily stable strategies from simulation
     */
    private identifyStableStrategies(simulation: ReflexiveSimulation): Array<{ strategy: string, fitness: number }> {
        const strategyFitness: Map<string, number> = new Map();

        // Calculate fitness for each strategy across all rounds
        for (const result of simulation.results) {
            for (const state of result.participantStates) {
                const key = `${state.strategy.type}_${JSON.stringify(state.strategy.parameters)}`;
                const currentFitness = strategyFitness.get(key) || 0;
                strategyFitness.set(key, currentFitness + state.payoff);
            }
        }

        // Return strategies sorted by fitness
        return Array.from(strategyFitness.entries())
            .map(([strategy, fitness]) => ({ strategy, fitness }))
            .sort((a, b) => b.fitness - a.fitness);
    }

    /**
     * Identify market manipulation opportunities
     */
    private identifyManipulationOpportunities(simulation: ReflexiveSimulation): Array<{ description: string, actions: string[] }> {
        const opportunities: Array<{ description: string, actions: string[] }> = [];

        // Look for strategies that consistently outperform others
        const dominantStrategies = this.findDominantStrategies(simulation);

        if (dominantStrategies.length > 0) {
            opportunities.push({
                description: `Dominant strategy identified: ${dominantStrategies[0]}. Use this to force competitors into suboptimal positions.`,
                actions: [
                    'Implement dominant strategy at scale',
                    'Monitor competitor reactions',
                    'Exploit reflexive feedback loops',
                    'Force industry consolidation'
                ]
            });
        }

        // Look for cooperative opportunities
        const cooperativePotential = this.assessCooperativePotential(simulation);

        if (cooperativePotential > 0.7) {
            opportunities.push({
                description: 'High cooperative potential detected. Consider forming strategic alliances or setting industry standards.',
                actions: [
                    'Identify potential allies',
                    'Propose cooperative frameworks',
                    'Set industry standards',
                    'Create win-win market structures'
                ]
            });
        }

        return opportunities;
    }

    // Helper methods
    private async identifyMarketParticipants(): Promise<MarketParticipant[]> {
        // Implementation would integrate with Oracle to identify competitors
        return [];
    }

    private async assessMarketConditions(): Promise<MarketConditions> {
        // Implementation would use Oracle data
        return {
            demand: 100,
            supply: 80,
            competition: 0.6,
            regulation: 0.3,
            technology: 0.8,
            economicCycle: 'expansion'
        };
    }

    private calculatePayoffMatrix(participants: MarketParticipant[], conditions: MarketConditions): PayoffMatrix {
        // Implementation of payoff matrix calculation
        const matrix: PayoffMatrix = {};
        // Complex calculation based on game theory
        return matrix;
    }

    private calculateStrategyPayoff(strategy: MarketStrategy, marketState: MarketConditions, participant: MarketParticipant): number {
        // Simplified payoff calculation
        let payoff = 0;

        switch (strategy.type) {
            case 'aggressive':
                payoff = marketState.demand * 0.8 - marketState.competition * 0.6;
                break;
            case 'defensive':
                payoff = marketState.supply * 0.6 + marketState.regulation * 0.4;
                break;
            case 'cooperative':
                payoff = (marketState.demand + marketState.supply) * 0.4;
                break;
            case 'innovative':
                payoff = marketState.technology * 0.9 - marketState.competition * 0.3;
                break;
        }

        return payoff * participant.resources.capital * 0.01;
    }

    private updateBehavioralState(participant: MarketParticipant, payoff: number, marketState: MarketConditions): BehavioralState {
        // Simplified behavioral state update
        return {
            confidence: Math.min(1, Math.max(0, (payoff > 0 ? 0.6 : 0.4) + Math.random() * 0.2)),
            riskPerception: marketState.competition * 0.8,
            cooperationLevel: marketState.regulation * 0.6,
            innovationDrive: marketState.technology * 0.7
        };
    }

    private calculateStrategyImpact(strategy: MarketStrategy, marketState: MarketConditions): Partial<MarketConditions> {
        // Calculate how strategy affects market conditions
        switch (strategy.type) {
            case 'aggressive':
                return { demand: 0.1, supply: -0.05, competition: 0.2 };
            case 'defensive':
                return { supply: 0.1, competition: -0.1, regulation: 0.05 };
            case 'cooperative':
                return { demand: 0.05, supply: 0.05, competition: -0.15 };
            case 'innovative':
                return { technology: 0.2, demand: 0.1, competition: 0.1 };
            default:
                return {};
        }
    }

    private calculateReflexiveDemand(currentState: MarketConditions, participantStates: ParticipantState[]): number {
        // Calculate reflexive effects on demand
        const aggressiveParticipants = participantStates.filter(s => s.strategy.type === 'aggressive').length;
        const totalParticipants = participantStates.length;

        // Aggressive strategies can create demand through marketing wars
        return (aggressiveParticipants / totalParticipants) * currentState.demand * 0.1;
    }

    private determineEconomicCycle(currentState: MarketConditions, impact: any): MarketConditions['economicCycle'] {
        const totalImpact = impact.demand + impact.supply - impact.competition;

        if (totalImpact > 0.3) return 'expansion';
        if (totalImpact < -0.3) return 'recession';
        if (currentState.demand > currentState.supply * 1.2) return 'recovery';
        return currentState.economicCycle;
    }

    private calculateParticipantImpacts(participantStates: ParticipantState[], impactType: string): Record<string, number> {
        const impacts: Record<string, number> = {};

        for (const state of participantStates) {
            switch (impactType) {
                case 'price_pressure':
                    impacts[state.id] = state.strategy.type === 'aggressive' ? 0.3 : -0.2;
                    break;
                case 'competition':
                    impacts[state.id] = state.strategy.type === 'aggressive' ? -0.4 : 0.1;
                    break;
                default:
                    impacts[state.id] = 0;
            }
        }

        return impacts;
    }

    private calculateMarketShift(initial: MarketConditions, final: MarketConditions): number {
        const shifts = [
            Math.abs(final.demand - initial.demand) / initial.demand,
            Math.abs(final.supply - initial.supply) / initial.supply,
            Math.abs(final.competition - initial.competition),
            Math.abs(final.technology - initial.technology)
        ];

        return shifts.reduce((sum, shift) => sum + shift, 0) / shifts.length;
    }

    private applyAnchoring(biasedState: MarketConditions, participant: MarketParticipant, intensity: number): MarketConditions {
        // Apply anchoring bias based on historical actions
        const historicalAverage = participant.historicalActions.reduce((sum, action) =>
            sum + action.outcome.payoff, 0) / participant.historicalActions.length;

        return {
            ...biasedState,
            demand: biasedState.demand * (1 - intensity) + historicalAverage * intensity
        };
    }

    private applyHerding(biasedState: MarketConditions, intensity: number): MarketConditions {
        // Apply herding bias - follow market consensus
        const marketAverage = (biasedState.demand + biasedState.supply + biasedState.competition) / 3;

        return {
            ...biasedState,
            demand: biasedState.demand * (1 - intensity) + marketAverage * intensity,
            supply: biasedState.supply * (1 - intensity) + marketAverage * intensity
        };
    }

    private applyConfirmationBias(biasedState: MarketConditions, participant: MarketParticipant, intensity: number): MarketConditions {
        // Apply confirmation bias - favor information that confirms existing beliefs
        const successfulActions = participant.historicalActions.filter(a => a.outcome.success);
        const successRate = successfulActions.length / participant.historicalActions.length;

        return {
            ...biasedState,
            demand: biasedState.demand * (1 + successRate * intensity * 0.2)
        };
    }

    private findDominantStrategies(simulation: ReflexiveSimulation): string[] {
        // Find strategies that consistently outperform others
        const strategyPerformance: Map<string, number[]> = new Map();

        for (const result of simulation.results) {
            for (const state of result.participantStates) {
                const key = state.strategy.type;
                if (!strategyPerformance.has(key)) {
                    strategyPerformance.set(key, []);
                }
                strategyPerformance.get(key)!.push(state.payoff);
            }
        }

        const averages = Array.from(strategyPerformance.entries()).map(([strategy, payoffs]) => ({
            strategy,
            average: payoffs.reduce((sum, p) => sum + p, 0) / payoffs.length
        }));

        const maxAverage = Math.max(...averages.map(a => a.average));
        return averages.filter(a => a.average >= maxAverage * 0.9).map(a => a.strategy);
    }

    private assessCooperativePotential(simulation: ReflexiveSimulation): number {
        // Assess how much cooperation could benefit all participants
        let cooperativePayoff = 0;
        let competitivePayoff = 0;

        for (const result of simulation.results) {
            for (const state of result.participantStates) {
                if (state.strategy.type === 'cooperative') {
                    cooperativePayoff += state.payoff;
                } else {
                    competitivePayoff += state.payoff;
                }
            }
        }

        // Return ratio of cooperative to competitive payoff
        return cooperativePayoff / (cooperativePayoff + competitivePayoff);
    }
}

/**
 * Evolutionary Engine for Strategy Selection
 */
export class EvolutionaryEngine {
    async selectStrategy(
        participant: MarketParticipant,
        marketState: MarketConditions,
        competitors: MarketParticipant[]
    ): Promise<MarketStrategy> {
        // Use evolutionary algorithms to select optimal strategy
        const strategies = this.generateStrategyVariants(participant.strategy);
        const fitnessScores = strategies.map(strategy =>
            this.evaluateStrategyFitness(strategy, marketState, competitors)
        );

        // Select strategy with highest fitness
        const bestIndex = fitnessScores.indexOf(Math.max(...fitnessScores));

        return strategies[bestIndex];
    }

    private generateStrategyVariants(baseStrategy: MarketStrategy): MarketStrategy[] {
        // Generate mutated versions of the base strategy
        const variants: MarketStrategy[] = [baseStrategy];

        for (let i = 0; i < 5; i++) {
            const variant = { ...baseStrategy };
            variant.parameters = { ...baseStrategy.parameters };

            // Random mutations
            Object.keys(variant.parameters).forEach(key => {
                variant.parameters[key] *= (0.8 + Math.random() * 0.4); // ±20% mutation
            });

            variants.push(variant);
        }

        return variants;
    }

    private evaluateStrategyFitness(
        strategy: MarketStrategy,
        marketState: MarketConditions,
        competitors: MarketParticipant[]
    ): number {
        // Calculate fitness based on expected payoff and stability
        let fitness = 0;

        // Base payoff potential
        switch (strategy.type) {
            case 'aggressive':
                fitness += marketState.demand * 0.7 - marketState.competition * 0.8;
                break;
            case 'defensive':
                fitness += marketState.supply * 0.6 + marketState.regulation * 0.5;
                break;
            case 'cooperative':
                fitness += (marketState.demand + marketState.supply) * 0.4 - marketState.competition * 0.3;
                break;
            case 'innovative':
                fitness += marketState.technology * 0.8 - marketState.competition * 0.4;
                break;
        }

        // Add stability factor (resistance to competitor moves)
        const stability = this.calculateStrategyStability(strategy, competitors);
        fitness += stability * 0.3;

        return fitness;
    }

    private calculateStrategyStability(strategy: MarketStrategy, competitors: MarketParticipant[]): number {
        // Calculate how stable strategy is against competitor responses
        let stability = 0;

        for (const competitor of competitors) {
            const responsePayoff = this.predictCompetitorResponse(strategy, competitor);
            stability += Math.max(0, 1 - Math.abs(responsePayoff));
        }

        return stability / competitors.length;
    }

    private predictCompetitorResponse(strategy: MarketStrategy, competitor: MarketParticipant): number {
        // Predict how competitor would respond to our strategy
        // Simplified prediction based on competitor's historical behavior
        const similarSituations = competitor.historicalActions.filter(action =>
            action.action.includes(strategy.type)
        );

        if (similarSituations.length === 0) return 0;

        const averageOutcome = similarSituations.reduce((sum, action) =>
            sum + action.outcome.payoff, 0) / similarSituations.length;

        return averageOutcome;
    }
}

// Global instance
export const reflexivityEngine = new ReflexivityGameTheoryEngine();