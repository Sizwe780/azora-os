import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AIUnifiedService {
  private models: Map<string, any> = new Map();

  async initialize() {
    console.log('Initializing AI Unified Service...');
    await this.loadModels();
    console.log('AI Unified Service initialized');
  }

  private async loadModels() {
    // Load active models from database
    const activeModels = await prisma.aIModel.findMany({
      where: { isActive: true }
    });

    for (const model of activeModels) {
      this.models.set(model.id, model);
    }

    console.log(`Loaded ${activeModels.length} active AI models`);
  }

  async createTask(taskType: string, inputData: any, priority: number = 1): Promise<string> {
    // Select appropriate model based on task type
    const model = await this.selectModelForTask(taskType);

    if (!model) {
      throw new Error(`No suitable model found for task type: ${taskType}`);
    }

    // Create task in database
    const task = await prisma.unifiedTask.create({
      data: {
        taskType,
        inputData,
        priority,
        modelId: model.id
      }
    });

    // Log audit event
    await this.logAudit('task_created', task.id, 'UnifiedTask', { taskType, inputData });

    // Start processing asynchronously
    this.processTask(task.id);

    return task.id;
  }

  private async selectModelForTask(taskType: string) {
    // Simple model selection logic - can be enhanced with AI
    const availableModels = Array.from(this.models.values());

    // For now, select first available model
    // In production, this would use AI to match task requirements to model capabilities
    return availableModels[0];
  }

  private async processTask(taskId: string) {
    try {
      const task = await prisma.unifiedTask.update({
        where: { id: taskId },
        data: { status: 'processing' },
        include: { model: true }
      });

      if (!task) {
        throw new Error(`Task ${taskId} not found`);
      }

      // Simulate AI processing (replace with actual AI integration)
      const outputData = await this.simulateAIProcessing(task.inputData, task.model);

      // Update task as completed
      await prisma.unifiedTask.update({
        where: { id: taskId },
        data: {
          status: 'completed',
          outputData,
          completedAt: new Date()
        }
      });

      // Log completion
      await this.logAudit('task_completed', taskId, 'UnifiedTask', { outputData });

    } catch (error) {
      console.error(`Error processing task ${taskId}:`, error);

      // Update task as failed
      await prisma.unifiedTask.update({
        where: { id: taskId },
        data: { status: 'failed' }
      });

      // Log failure
      await this.logAudit('task_failed', taskId, 'UnifiedTask', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  private async simulateAIProcessing(inputData: any, model: any): Promise<any> {
    // Placeholder for actual AI processing
    // In production, this would call the actual AI provider APIs
    return {
      result: `Processed ${JSON.stringify(inputData)} using ${model.name}`,
      confidence: 0.95,
      timestamp: new Date().toISOString()
    };
  }

  async registerModel(name: string, provider: string, modelType: string, capabilities: any) {
    const model = await prisma.aIModel.create({
      data: {
        name,
        provider,
        modelType,
        capabilities
      }
    });

    this.models.set(model.id, model);

    await this.logAudit('model_registered', model.id, 'AIModel', { name, provider, modelType });

    return model.id;
  }

  async getTaskStatus(taskId: string) {
    const task = await prisma.unifiedTask.findUnique({
      where: { id: taskId },
      include: { model: true }
    });

    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    return {
      id: task.id,
      status: task.status,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completedAt: task.completedAt,
      model: task.model ? { name: task.model.name, provider: task.model.provider } : null
    };
  }

  private async logAudit(action: string, entityId: string, entityType: string, details: any) {
    await prisma.auditLog.create({
      data: {
        action,
        entityId,
        entityType,
        details
      }
    });
  }

  async getAuditLogs(entityId?: string, entityType?: string, limit: number = 50) {
    const where: any = {};
    if (entityId) where.entityId = entityId;
    if (entityType) where.entityType = entityType;

    return await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit
    });
  }
}

export const aiUnifiedService = new AIUnifiedService();