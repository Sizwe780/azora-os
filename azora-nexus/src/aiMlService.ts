import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AiMlService {
  async trainModel(name: string, algorithm: string) {
    const model = await prisma.mlModel.create({
      data: {
        name,
        algorithm,
        accuracy: 0.0,
      },
    });

    // AI: Simulate training
    const trainedAccuracy = await this.simulateTraining();

    await prisma.mlModel.update({
      where: { id: model.id },
      data: { accuracy: trainedAccuracy },
    });

    // Audit
    await this.logAudit('TRAIN', model.id, 'MlModel', { name, algorithm, accuracy: trainedAccuracy });

    return { model: { ...model, accuracy: trainedAccuracy } };
  }

  async getModels() {
    return await prisma.mlModel.findMany({
      include: { auditLogs: true },
    });
  }

  async addTrainingData(dataset: string, size: number, features: any) {
    const data = await prisma.trainingData.create({
      data: {
        dataset,
        size,
        features,
      },
    });

    // Audit
    await this.logAudit('ADD_DATA', data.id, 'TrainingData', { dataset, size });

    return data;
  }

  async simulateTraining(): Promise<number> {
    // AI placeholder: Simulate training accuracy
    return Math.random() * 0.5 + 0.5; // 0.5 to 1.0
  }

  private async logAudit(action: string, entityId: string, entityType: string, details?: any) {
    await prisma.auditLog.create({
      data: {
        action,
        entityId,
        entityType,
        details,
      },
    });
  }
}

export default new AiMlService();