/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AiSearchService {
  async performSearch(query: string, userId?: string) {
    const searchQuery = await prisma.searchQuery.create({
      data: {
        query,
        userId,
        results: {},
      },
    });

    // AI: Simulate intelligent search
    const results = await this.simulateAiSearch(query);

    await prisma.searchQuery.update({
      where: { id: searchQuery.id },
      data: { results },
    });

    // Store results
    for (const result of results) {
      await prisma.searchResult.create({
        data: {
          queryId: searchQuery.id,
          content: result.content,
          relevance: result.relevance,
        },
      });
    }

    // Audit
    await this.logAudit('SEARCH', searchQuery.id, 'SearchQuery', { query, resultsCount: results.length });

    return { searchQuery, results };
  }

  async getSearchHistory(userId: string) {
    return await prisma.searchQuery.findMany({
      where: { userId },
      include: { auditLogs: true },
    });
  }

  async simulateAiSearch(query: string): Promise<{ content: string; relevance: number }[]> {
    // AI placeholder: Return mock results with relevance scores
    return [
      { content: `Result for "${query}" - High relevance`, relevance: 0.95 },
      { content: `Another result for "${query}"`, relevance: 0.85 },
    ];
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

export default new AiSearchService();