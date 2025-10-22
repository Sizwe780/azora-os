/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export class AuditService {
  static async log(eventType: string, details: any, userId?: string) {
    await prisma.auditLog.create({
      data: {
        eventType,
        details,
        userId,
      },
    });
  }
}

export class AnalyticsService {
  static async trackEvent(type: string, data: any, userId?: string) {
    await prisma.event.create({
      data: {
        type,
        data,
        userId,
      },
    });
    await AuditService.log('EVENT_TRACKED', { type, data }, userId);
  }

  static async getFunnel() {
    const events = await prisma.event.findMany();
    const funnel = events.reduce((f: Record<string, number>, e: typeof events[number]) => {
      f[e.type] = (f[e.type] || 0) + 1;
      return f;
    }, {} as Record<string, number>);
    return funnel;
  }

  static async getHeatmap() {
    const clicks = await prisma.event.findMany({
      where: { type: 'click' },
    });
    const heatmap: Record<string, number> = {};
    clicks.forEach((e: typeof clicks[number]) => {
      const key = `${e.data.x},${e.data.y}`;
      heatmap[key] = (heatmap[key] || 0) + 1;
    });
    return heatmap;
  }

  static async startSession(userId: string, path: string) {
    await prisma.session.create({
      data: {
        userId,
        path,
      },
    });
    await AuditService.log('SESSION_STARTED', { path }, userId);
  }

  static async getUserJourney(userId: string) {
    return await prisma.session.findMany({
      where: { userId },
      orderBy: { timestamp: 'asc' },
    });
  }

  static async getDropoffs() {
    const sessions = await prisma.session.findMany({
      orderBy: { userId: 'asc', timestamp: 'desc' },
    });
    const dropoffs: string[] = [];
    let currentUser = '';
    sessions.forEach((s: typeof sessions[number]) => {
      if (s.userId !== currentUser) {
        dropoffs.push(s.path);
        currentUser = s.userId;
      }
    });
    const stats = dropoffs.reduce((m, p) => {
      m[p] = (m[p] || 0) + 1;
      return m;
    }, {} as Record<string, number>);
    return stats;
  }
}