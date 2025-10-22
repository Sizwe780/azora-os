/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

export class AnalyticsEngine {
  constructor(dbManager) {
    this.dbManager = dbManager;
    this.metrics = new Map();
    this.cache = new Map();
  }

  // Real-time metrics calculation
  async calculateMetrics(companyId, timeframe = '30d') {
    const cacheKey = `metrics:${companyId}:${timeframe}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 300000) { // 5 minutes
        return cached.data;
      }
    }

    try {
      const metrics = await this.computeMetrics(companyId, timeframe);

      // Cache results
      this.cache.set(cacheKey, {
        data: metrics,
        timestamp: Date.now()
      });

      // Store in MongoDB for historical analysis
      await this.storeMetricsHistory(companyId, metrics, timeframe);

      return metrics;
    } catch (error) {
      console.error('Metrics calculation error:', error);
      throw error;
    }
  }

  async computeMetrics(companyId, timeframe) {
    const now = new Date();
    const startDate = new Date(now.getTime() - this.parseTimeframe(timeframe));

    // Revenue metrics
    const revenue = await this.dbManager.prisma.revenueRecord.aggregate({
      where: {
        companyId,
        recordDate: { gte: startDate }
      },
      _sum: { amount: true },
      _count: true
    });

    // Expense metrics
    const expenses = await this.dbManager.prisma.expense.aggregate({
      where: {
        companyId,
        expenseDate: { gte: startDate }
      },
      _sum: { amount: true },
      _count: true
    });

    // Operational metrics
    const jobs = await this.dbManager.prisma.job.findMany({
      where: {
        companyId,
        createdAt: { gte: startDate }
      },
      select: {
        status: true,
        createdAt: true
      }
    });

    const trips = await this.dbManager.prisma.trip.findMany({
      where: {
        vehicle: { companyId },
        createdAt: { gte: startDate }
      },
      select: {
        status: true,
        distance: true,
        incidents: true,
        riskScore: true
      }
    });

    // Safety metrics
    const incidents = await this.dbManager.prisma.safetyIncident.findMany({
      where: {
        companyId,
        reportedAt: { gte: startDate }
      },
      select: {
        severity: true,
        incidentType: true
      }
    });

    // HR metrics
    const employees = await this.dbManager.prisma.employee.count({
      where: { companyId, status: 'active' }
    });

    const leaveRequests = await this.dbManager.prisma.leaveRequest.count({
      where: {
        employee: { companyId },
        createdAt: { gte: startDate }
      }
    });

    // Calculate derived metrics
    const jobCompletionRate = jobs.length > 0 ?
      (jobs.filter(j => j.status === 'completed').length / jobs.length) * 100 : 0;

    const averageTripRisk = trips.length > 0 ?
      trips.reduce((sum, t) => sum + t.riskScore, 0) / trips.length : 0;

    const safetyIncidents = incidents.length;
    const criticalIncidents = incidents.filter(i => i.severity === 'critical').length;

    return {
      timeframe,
      period: { start: startDate.toISOString(), end: now.toISOString() },
      financial: {
        totalRevenue: revenue._sum.amount || 0,
        totalExpenses: expenses._sum.amount || 0,
        netProfit: (revenue._sum.amount || 0) - (expenses._sum.amount || 0),
        revenueTransactions: revenue._count,
        expenseTransactions: expenses._count
      },
      operational: {
        totalJobs: jobs.length,
        completedJobs: jobs.filter(j => j.status === 'completed').length,
        jobCompletionRate: Math.round(jobCompletionRate * 100) / 100,
        totalTrips: trips.length,
        totalDistance: trips.reduce((sum, t) => sum + t.distance, 0),
        averageTripRisk: Math.round(averageTripRisk * 100) / 100
      },
      safety: {
        totalIncidents: safetyIncidents,
        criticalIncidents,
        incidentRate: employees > 0 ? Math.round((safetyIncidents / employees) * 100) / 100 : 0
      },
      hr: {
        activeEmployees: employees,
        leaveRequests,
        leaveRate: employees > 0 ? Math.round((leaveRequests / employees) * 100) / 100 : 0
      },
      calculatedAt: now.toISOString()
    };
  }

  async storeMetricsHistory(companyId, metrics, timeframe) {
    if (!this.dbManager.mongoDb) return;

    const collection = this.dbManager.mongoDb.collection('metrics_history');

    await collection.insertOne({
      companyId,
      timeframe,
      metrics,
      createdAt: new Date()
    });

    // Keep only last 1000 records per company
    const count = await collection.countDocuments({ companyId });
    if (count > 1000) {
      const oldest = await collection.find({ companyId })
        .sort({ createdAt: 1 })
        .limit(count - 1000)
        .toArray();

      await collection.deleteMany({
        _id: { $in: oldest.map(doc => doc._id) }
      });
    }
  }

  parseTimeframe(timeframe) {
    const unit = timeframe.slice(-1);
    const value = parseInt(timeframe.slice(0, -1));

    const multipliers = {
      'h': 60 * 60 * 1000,
      'd': 24 * 60 * 60 * 1000,
      'w': 7 * 24 * 60 * 60 * 1000,
      'm': 30 * 24 * 60 * 60 * 1000,
      'y': 365 * 24 * 60 * 60 * 1000
    };

    return value * (multipliers[unit] || multipliers['d']);
  }

  // Predictive analytics
  async generatePredictions(companyId, metricType) {
    if (!this.dbManager.mongoDb) return null;

    const collection = this.dbManager.mongoDb.collection('metrics_history');

    // Get historical data for the last 90 days
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const historicalData = await collection.find({
      companyId,
      'metrics.calculatedAt': { $gte: ninetyDaysAgo.toISOString() }
    }).sort({ 'metrics.calculatedAt': 1 }).toArray();

    if (historicalData.length < 7) {
      return { error: 'Insufficient historical data for prediction' };
    }

    // Simple linear regression for prediction
    const predictions = this.predictTrend(historicalData, metricType);

    return {
      metricType,
      predictions,
      confidence: this.calculateConfidence(historicalData, metricType),
      basedOn: historicalData.length,
      nextUpdate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
  }

  predictTrend(data, metricType) {
    const values = data.map(d => this.extractMetricValue(d.metrics, metricType)).filter(v => v !== null);
    if (values.length < 2) return null;

    // Simple linear regression
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, idx) => sum + val * idx, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Predict next 7 days
    const predictions = [];
    for (let i = 1; i <= 7; i++) {
      const predictedValue = slope * (n + i - 1) + intercept;
      predictions.push({
        day: i,
        predicted: Math.max(0, Math.round(predictedValue * 100) / 100),
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }

    return predictions;
  }

  extractMetricValue(metrics, metricType) {
    const path = metricType.split('.');
    let value = metrics;

    for (const key of path) {
      value = value?.[key];
    }

    return typeof value === 'number' ? value : null;
  }

  calculateConfidence(data, metricType) {
    const values = data.map(d => this.extractMetricValue(d.metrics, metricType)).filter(v => v !== null);
    if (values.length < 2) return 0;

    // Calculate coefficient of variation as confidence measure
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    const cv = mean !== 0 ? stdDev / mean : 0;
    return Math.max(0, Math.min(1, 1 - cv)); // Higher confidence with lower variation
  }
}