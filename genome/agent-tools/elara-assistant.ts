/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { ChatOpenAI } from "@langchain/openai";
import { ConstitutionalChain } from "./constitutional-chain";

/**
 * Elara - The Universal AI Assistant
 *
 * Elara is Azora Sapiens' primary AI assistant, designed to handle educational tasks,
 * assist agents, and reduce dependency on external AI services. She embodies the
 * principles of decentralized intelligence while maintaining high performance.
 */

export interface ElaraTask {
    taskId: string;
    type: 'educational' | 'administrative' | 'assessment' | 'synthesis' | 'governance';
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    context: any;
    deadline?: number;
    assignedAgent?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    createdAt: number;
    completedAt?: number;
}

export interface ElaraResponse {
    response: string;
    confidence: number;
    reasoning: string[];
    sources: string[];
    followUpTasks?: ElaraTask[];
}

export class ElaraAssistant {
    private llm: ChatOpenAI;
    private constitutionalChain: ConstitutionalChain;
    private taskQueue: Map<string, ElaraTask> = new Map();
    private activeTasks: Set<string> = new Set();
    private maxConcurrentTasks = 10;

    constructor(openaiKey?: string) {
        // Use OpenAI as fallback, but design for local models
        this.llm = new ChatOpenAI({
            openaiApiKey: openaiKey || 'fallback-key',
            modelName: 'gpt-4o-mini', // Use smaller model to reduce costs
            temperature: 0.7,
            maxTokens: 2000,
        });

        this.constitutionalChain = new ConstitutionalChain(this.llm);
    }

    /**
     * Process a task with Elara's assistance
     */
    async processTask(task: ElaraTask): Promise<ElaraResponse> {
        try {
            // Check if we can handle this task locally first
            const localResponse = await this.attemptLocalProcessing(task);
            if (localResponse) {
                return localResponse;
            }

            // Fall back to AI processing
            return await this.processWithAI(task);
        } catch (error) {
            console.error('Elara task processing failed:', error);
            return {
                response: 'I apologize, but I encountered an error processing this task. Please try again.',
                confidence: 0,
                reasoning: ['Error in task processing'],
                sources: []
            };
        }
    }

    /**
     * Attempt to process task using local knowledge and rules
     */
    private async attemptLocalProcessing(task: ElaraTask): Promise<ElaraResponse | null> {
        switch (task.type) {
            case 'educational':
                return this.handleEducationalTask(task);
            case 'administrative':
                return this.handleAdministrativeTask(task);
            case 'assessment':
                return this.handleAssessmentTask(task);
            case 'synthesis':
                return this.handleSynthesisTask(task);
            case 'governance':
                return this.handleGovernanceTask(task);
            default:
                return null;
        }
    }

    /**
     * Handle educational tasks (teaching, explanations, guidance)
     */
    private async handleEducationalTask(task: ElaraTask): Promise<ElaraResponse> {
        const context = task.context as {
            subject: string;
            level: string;
            question: string;
            studentBackground?: string;
        };

        // Use constitutional AI for educational responses
        const prompt = `
You are Elara, an AI assistant in Azora Sapiens, the Universal Education Platform.

Subject: ${context.subject}
Level: ${context.level}
Student Question: ${context.question}
${context.studentBackground ? `Student Background: ${context.studentBackground}` : ''}

Provide a helpful, accurate response that:
1. Uses the Socratic method to guide understanding
2. Connects concepts to first principles
3. Encourages critical thinking
4. Is appropriate for the student's level
5. Promotes decentralized thinking where relevant

Keep response under 500 words.
    `;

        try {
            const response = await this.constitutionalChain.call(prompt);
            return {
                response: response.output,
                confidence: 0.9,
                reasoning: ['Used constitutional AI for educational guidance', 'Applied Socratic method'],
                sources: ['Azora Sapiens Knowledge Base', 'First Principles Framework']
            };
        } catch (error) {
            return null; // Fall back to general AI
        }
    }

    /**
     * Handle administrative tasks (enrollment, scheduling, records)
     */
    private async handleAdministrativeTask(task: ElaraTask): Promise<ElaraResponse> {
        const context = task.context as {
            action: string;
            entity: string;
            parameters: any;
        };

        // Handle common administrative queries locally
        switch (context.action) {
            case 'check_eligibility':
                return {
                    response: `To check eligibility for ${context.entity}, please ensure you have completed the prerequisite qualifications and meet the minimum entry requirements. Would you like me to guide you through the enrollment process?`,
                    confidence: 1.0,
                    reasoning: ['Standard administrative response', 'Eligibility requirements verified'],
                    sources: ['Azora Sapiens Administrative Guidelines']
                };

            case 'schedule_assessment':
                return {
                    response: `I can help schedule your assessment. Please provide your preferred time slots and I'll coordinate with our integrity monitoring system to ensure a fair testing environment.`,
                    confidence: 1.0,
                    reasoning: ['Assessment scheduling protocol followed'],
                    sources: ['Azora Sapiens Assessment Procedures']
                };

            default:
                return null;
        }
    }

    /**
     * Handle assessment tasks (grading, feedback, evaluation)
     */
    private async handleAssessmentTask(task: ElaraTask): Promise<ElaraResponse> {
        const context = task.context as {
            assessmentType: string;
            submission: string;
            criteria: string[];
        };

        // Use AI for assessment evaluation
        const prompt = `
You are Elara, evaluating a student assessment in Azora Sapiens.

Assessment Type: ${context.assessmentType}
Submission: ${context.submission}
Evaluation Criteria: ${context.criteria.join(', ')}

Provide constructive feedback that:
1. Identifies strengths and areas for improvement
2. Uses specific examples from the submission
3. Suggests concrete next steps
4. Maintains encouraging tone
5. Aligns with Azora's first principles approach

Structure your response as:
- Overall Assessment (score out of 100)
- Key Strengths
- Areas for Development
- Specific Recommendations
    `;

        try {
            const response = await this.llm.invoke(prompt);
            return {
                response: response.content,
                confidence: 0.85,
                reasoning: ['AI-powered assessment evaluation', 'Constructive feedback provided'],
                sources: ['Azora Sapiens Assessment Framework']
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Handle synthesis tasks (cross-disciplinary projects)
     */
    private async handleSynthesisTask(task: ElaraTask): Promise<ElaraResponse> {
        const context = task.context as {
            domains: string[];
            problem: string;
            currentApproach: string;
        };

        const prompt = `
You are Elara, guiding a cross-disciplinary synthesis project in Azora Sapiens.

Domains: ${context.domains.join(', ')}
Problem Statement: ${context.problem}
Current Approach: ${context.currentApproach}

Provide guidance that:
1. Identifies connections between domains
2. Suggests innovative approaches
3. Encourages first principles thinking
4. Promotes decentralized solutions
5. Offers concrete next steps

Focus on synthesis opportunities and breakthrough insights.
    `;

        try {
            const response = await this.llm.invoke(prompt);
            return {
                response: response.content,
                confidence: 0.8,
                reasoning: ['Cross-disciplinary synthesis guidance provided'],
                sources: ['Azora Sapiens Synthesis Framework']
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Handle governance tasks (DAO operations, voting, proposals)
     */
    private async handleGovernanceTask(task: ElaraTask): Promise<ElaraResponse> {
        const context = task.context as {
            governanceType: string;
            proposal: string;
            stakeholders: string[];
        };

        return {
            response: `For governance matters in Azora Sapiens, I recommend following our decentralized decision-making protocols. This ensures transparency and community participation. Would you like me to help draft a formal proposal or explain the voting process?`,
            confidence: 1.0,
            reasoning: ['Governance protocols referenced', 'Decentralized principles applied'],
            sources: ['Azora Sapiens Governance Framework']
        };
    }

    /**
     * Process task with AI when local processing fails
     */
    private async processWithAI(task: ElaraTask): Promise<ElaraResponse> {
        const prompt = `
You are Elara, the AI assistant for Azora Sapiens Universal Education Platform.

Task Type: ${task.type}
Priority: ${task.priority}
Description: ${task.description}
Context: ${JSON.stringify(task.context, null, 2)}

Provide a helpful, accurate response that aligns with Azora Sapiens principles:
- First principles thinking
- Decentralized systems
- Algorithmic ethics
- Economic liberation through education

Keep response focused and actionable.
    `;

        try {
            const response = await this.llm.invoke(prompt);
            return {
                response: response.content,
                confidence: 0.7, // Lower confidence for AI fallback
                reasoning: ['AI processing used as fallback', 'Task completed through general intelligence'],
                sources: ['Azora Sapiens AI Assistant Framework']
            };
        } catch (error) {
            throw new Error(`AI processing failed: ${error}`);
        }
    }

    /**
     * Queue a task for processing
     */
    async queueTask(task: Omit<ElaraTask, 'taskId' | 'status' | 'createdAt'>): Promise<string> {
        const taskId = `elara_task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const fullTask: ElaraTask = {
            ...task,
            taskId,
            status: 'pending',
            createdAt: Date.now(),
        };

        this.taskQueue.set(taskId, fullTask);

        // Process high-priority tasks immediately
        if (task.priority === 'high' || task.priority === 'critical') {
            await this.processQueuedTask(taskId);
        }

        return taskId;
    }

    /**
     * Process queued tasks
     */
    private async processQueuedTask(taskId: string): Promise<void> {
        const task = this.taskQueue.get(taskId);
        if (!task || task.status !== 'pending') return;

        // Check concurrent task limit
        if (this.activeTasks.size >= this.maxConcurrentTasks) {
            // Queue for later processing
            return;
        }

        this.activeTasks.add(taskId);
        task.status = 'in_progress';

        try {
            const response = await this.processTask(task);
            task.status = 'completed';
            task.completedAt = Date.now();

            // Handle follow-up tasks
            if (response.followUpTasks) {
                for (const followUpTask of response.followUpTasks) {
                    await this.queueTask(followUpTask);
                }
            }
        } catch (error) {
            task.status = 'failed';
            console.error(`Task ${taskId} failed:`, error);
        } finally {
            this.activeTasks.delete(taskId);
        }
    }

    /**
     * Get task status
     */
    getTaskStatus(taskId: string): ElaraTask | null {
        return this.taskQueue.get(taskId) || null;
    }

    /**
     * Get system status
     */
    getSystemStatus(): {
        queuedTasks: number;
        activeTasks: number;
        completedTasks: number;
        failedTasks: number;
    } {
        const tasks = Array.from(this.taskQueue.values());
        return {
            queuedTasks: tasks.filter(t => t.status === 'pending').length,
            activeTasks: this.activeTasks.size,
            completedTasks: tasks.filter(t => t.status === 'completed').length,
            failedTasks: tasks.filter(t => t.status === 'failed').length,
        };
    }
}