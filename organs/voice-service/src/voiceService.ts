/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class VoiceService {
  async transcribe(audioData: string, userId?: string): Promise<{ transcription: string }> {
    // Mock AI transcription (in real, use Whisper or similar)
    const transcription = "Show me the latest high-value bounties"; // Mock
    const record = await prisma.transcription.create({
      data: {
        audioData,
        transcription,
        userId,
      },
    });
    await prisma.auditLog.create({
      data: {
        action: 'TRANSCRIBE',
        details: { recordId: record.id, userId },
      },
    });
    return { transcription };
  }
}