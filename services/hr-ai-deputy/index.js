/**
 * HR AI DEPUTY CEO - Autonomous Human Resources Management System
 * Acts as Deputy CEO and Board Chair ensuring work completion
 * Automates onboarding, performance tracking, task assignment, and exit/resolution
 * 
 * Built by Sizwe Ngwenya for Azora World (Pty) Ltd
 * Making companies fully autonomous and globally competitive
 */

import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// ============================================================================
// HR AI DEPUTY CEO BRAIN - Autonomous Decision Making
// ============================================================================

class HRDeputyCEO {
  constructor() {
    this.employees = new Map();
    this.founders = new Map();
    this.tasks = new Map();
    this.performanceMetrics = new Map();
    this.onboardingFlows = new Map();
    this.exitProcesses = new Map();
    this.resolutionCases = new Map();
    
    // AI Deputy CEO Parameters
    this.decisionThresholds = {
      taskAssignmentConfidence: 0.85,
      performanceReviewThreshold: 0.70,
      warningThreshold: 0.60,
      exitConsiderationThreshold: 0.40,
      founderExpectationScore: 0.80,
      employeeExpectationScore: 0.75
    };
    
    // Global Expansion Metrics
    this.globalReachMetrics = {
      targetCountries: ['ZA', 'ZW', 'BW', 'MZ', 'NA', 'ZM', 'US', 'UK', 'NG', 'KE'],
      currentReach: ['ZA'],
      expansionTasks: []
    };
    
    this.initializeFounders();
  }
  
  initializeFounders() {
    // Load founder contracts from Annex C
    const founders = [
      {
        id: 'F001',
        name: 'Sizwe Ngwenya',
        role: 'CEO & Founder',
        equity: 40,
        responsibilities: [
          'Overall strategy and vision',
          'Product development oversight',
          'Fundraising and investor relations',
          'Key partnership negotiations'
        ],
        expectedDeliverables: [
          { task: 'Quarterly strategic roadmap', frequency: 'quarterly', priority: 'critical' },
          { task: 'Monthly investor updates', frequency: 'monthly', priority: 'high' },
          { task: 'Weekly product review', frequency: 'weekly', priority: 'high' },
          { task: 'Global expansion strategy', frequency: 'quarterly', priority: 'critical' }
        ],
        performance: { score: 1.0, lastReview: new Date() }
      },
      {
        id: 'F002',
        name: 'Head of Sales & Partnerships',
        role: 'Founding Partner - Sales',
        equity: 15,
        responsibilities: [
          'Drive customer adoption and revenue growth',
          'Build partnerships with fleet operators',
          'Lead go-to-market strategy',
          'Manage sales pipeline'
        ],
        expectedDeliverables: [
          { task: 'Weekly sales pipeline review', frequency: 'weekly', priority: 'critical' },
          { task: 'Monthly revenue report', frequency: 'monthly', priority: 'critical' },
          { task: 'Partnership deals (3 per quarter)', frequency: 'quarterly', priority: 'high' },
          { task: 'Customer feedback compilation', frequency: 'weekly', priority: 'medium' }
        ],
        performance: { score: 0.85, lastReview: new Date() }
      },
      {
        id: 'F003',
        name: 'Operations & Support Lead',
        role: 'Founding Partner - Operations',
        equity: 15,
        responsibilities: [
          'Coordinate project management',
          'Manage DevOps and deployment',
          'Provide cross-functional support',
          'Ensure operational stability'
        ],
        expectedDeliverables: [
          { task: 'Daily system health report', frequency: 'daily', priority: 'critical' },
          { task: 'Weekly operations review', frequency: 'weekly', priority: 'high' },
          { task: 'Monthly deployment report', frequency: 'monthly', priority: 'high' },
          { task: 'Quarterly efficiency improvements', frequency: 'quarterly', priority: 'medium' }
        ],
        performance: { score: 0.90, lastReview: new Date() }
      },
      {
        id: 'F004',
        name: 'Head of Retail & Community',
        role: 'Founding Partner - Community',
        equity: 15,
        responsibilities: [
          'Lead retail pilots and community engagement',
          'Build trust at last-mile',
          'Manage community feedback loops',
          'Coordinate with regulators'
        ],
        expectedDeliverables: [
          { task: 'Weekly community engagement report', frequency: 'weekly', priority: 'high' },
          { task: 'Monthly pilot progress update', frequency: 'monthly', priority: 'critical' },
          { task: 'Regulatory compliance check', frequency: 'monthly', priority: 'high' },
          { task: 'Customer success stories', frequency: 'weekly', priority: 'medium' }
        ],
        performance: { score: 0.88, lastReview: new Date() }
      },
      {
        id: 'F005',
        name: 'Founding UI/UX Engineer',
        role: 'Founding Partner - Design',
        equity: 15,
        responsibilities: [
          'Design and implement all user interfaces',
          'Ensure exceptional usability',
          'Develop design systems',
          'Collaborate with backend team'
        ],
        expectedDeliverables: [
          { task: 'Weekly UI/UX updates', frequency: 'weekly', priority: 'high' },
          { task: 'User testing feedback', frequency: 'weekly', priority: 'high' },
          { task: 'Design system improvements', frequency: 'monthly', priority: 'medium' },
          { task: 'Accessibility audit', frequency: 'quarterly', priority: 'high' }
        ],
        performance: { score: 0.92, lastReview: new Date() }
      }
    ];
    
    founders.forEach(founder => {
      this.founders.set(founder.id, founder);
      this.employees.set(founder.id, { ...founder, type: 'founder' });
      this.generateTasksForEmployee(founder.id);
    });
    
    console.log(`🤖 Initialized ${founders.length} founders with performance tracking`);
  }
  
  // ============================================================================
  // AUTOMATED ONBOARDING ENGINE
  // ============================================================================
  
  async startOnboarding(employeeData) {
    const flowId = `ONB-${Date.now()}`;
    const onboardingFlow = {
      id: flowId,
      employee: employeeData,
      status: 'in_progress',
      startedAt: new Date(),
      steps: [
        { id: 1, name: 'Personal Info Collection', status: 'pending', completedAt: null },
        { id: 2, name: 'Role & Responsibilities Assignment', status: 'pending', completedAt: null },
        { id: 3, name: 'Contract Generation', status: 'pending', completedAt: null },
        { id: 4, name: 'E-Signature Collection', status: 'pending', completedAt: null },
        { id: 5, name: 'System Access Setup', status: 'pending', completedAt: null },
        { id: 6, name: 'Task Assignment', status: 'pending', completedAt: null },
        { id: 7, name: 'Performance Tracking Activation', status: 'pending', completedAt: null },
        { id: 8, name: 'Welcome & Orientation', status: 'pending', completedAt: null }
      ],
      currentStep: 1
    };
    
    this.onboardingFlows.set(flowId, onboardingFlow);
    
    // AI Deputy CEO automatically progresses onboarding
    this.autoProgressOnboarding(flowId);
    
    return onboardingFlow;
  }
  
  async autoProgressOnboarding(flowId) {
    const flow = this.onboardingFlows.get(flowId);
    if (!flow) return;
    
    // Simulate automated onboarding steps
    const processStep = async (stepId) => {
      const step = flow.steps.find(s => s.id === stepId);
      if (!step) return;
      
      step.status = 'in_progress';
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      step.status = 'completed';
      step.completedAt = new Date();
      
      // Auto-generate based on step
      if (stepId === 2) {
        this.assignRoleAndResponsibilities(flow.employee);
      } else if (stepId === 3) {
        this.generateContract(flow.employee);
      } else if (stepId === 5) {
        this.setupSystemAccess(flow.employee);
      } else if (stepId === 6) {
        this.assignInitialTasks(flow.employee);
      } else if (stepId === 7) {
        this.activatePerformanceTracking(flow.employee);
      }
      
      flow.currentStep++;
      
      if (stepId < flow.steps.length) {
        await processStep(stepId + 1);
      } else {
        flow.status = 'completed';
        flow.completedAt = new Date();
        
        // Add employee to tracking system
        const employeeId = `EMP-${Date.now()}`;
        this.employees.set(employeeId, {
          id: employeeId,
          ...flow.employee,
          type: 'employee',
          onboardedAt: new Date(),
          performance: { score: 1.0, lastReview: new Date() }
        });
        
        console.log(`✅ Onboarding completed for ${flow.employee.name} (${employeeId})`);
      }
    };
    
    await processStep(1);
  }
  
  assignRoleAndResponsibilities(employee) {
    // AI Deputy CEO assigns responsibilities based on role
    const roleResponsibilities = {
      'Driver': [
        'Complete daily pre-trip inspections',
        'Maintain vehicle cleanliness and condition',
        'Follow traffic rules and company policies',
        'Report incidents immediately',
        'Complete deliveries on time'
      ],
      'Fleet Manager': [
        'Monitor fleet health and performance',
        'Schedule maintenance and repairs',
        'Optimize route assignments',
        'Review driver performance',
        'Ensure compliance with regulations'
      ],
      'Compliance Officer': [
        'Conduct regular compliance audits',
        'Update policies and procedures',
        'Train staff on compliance requirements',
        'Handle regulatory inspections',
        'Maintain compliance documentation'
      ],
      'Accountant': [
        'Process financial transactions',
        'Generate financial reports',
        'Ensure tax compliance',
        'Monitor cash flow',
        'Conduct financial audits'
      ]
    };
    
    employee.responsibilities = roleResponsibilities[employee.role] || [
      'Complete assigned tasks on time',
      'Follow company policies',
      'Report issues promptly',
      'Collaborate with team members',
      'Pursue continuous improvement'
    ];
    
    return employee;
  }
  
  generateContract(employee) {
    employee.contract = {
      id: `CONTRACT-${Date.now()}`,
      employeeId: employee.id,
      role: employee.role,
      startDate: employee.startDate || new Date(),
      salary: employee.salary,
      type: employee.employmentType || 'full-time',
      vestingSchedule: employee.equity ? {
        total: employee.equity,
        cliff: 1, // years
        vestingPeriod: 4 // years
      } : null,
      generatedAt: new Date()
    };
    
    return employee.contract;
  }
  
  setupSystemAccess(employee) {
    employee.systemAccess = {
      email: `${employee.name.toLowerCase().replace(/\s+/g, '.')}@azora.world`,
      permissions: this.determinePermissions(employee.role),
      dashboardAccess: true,
      mobileAppAccess: true,
      apiAccess: employee.role === 'Developer',
      setupAt: new Date()
    };
    
    return employee.systemAccess;
  }
  
  determinePermissions(role) {
    const permissionSets = {
      'CEO & Founder': ['all'],
      'Founding Partner - Sales': ['sales', 'customers', 'reports', 'analytics'],
      'Founding Partner - Operations': ['operations', 'fleet', 'maintenance', 'reports'],
      'Founding Partner - Community': ['community', 'customers', 'feedback', 'reports'],
      'Founding Partner - Design': ['design', 'ui', 'feedback', 'reports'],
      'Fleet Manager': ['fleet', 'drivers', 'maintenance', 'reports'],
      'Driver': ['trips', 'inspections', 'documents'],
      'Compliance Officer': ['compliance', 'audits', 'reports', 'documents'],
      'Accountant': ['finance', 'reports', 'transactions']
    };
    
    return permissionSets[role] || ['basic'];
  }
  
  assignInitialTasks(employee) {
    // AI Deputy CEO assigns initial tasks based on role
    const initialTasks = {
      'Driver': [
        { task: 'Complete driver training', priority: 'critical', deadline: 7 },
        { task: 'Review safety protocols', priority: 'high', deadline: 3 },
        { task: 'Complete first supervised trip', priority: 'high', deadline: 14 }
      ],
      'Fleet Manager': [
        { task: 'Review current fleet status', priority: 'high', deadline: 3 },
        { task: 'Meet with operations team', priority: 'high', deadline: 7 },
        { task: 'Create 30-day optimization plan', priority: 'medium', deadline: 14 }
      ],
      'Compliance Officer': [
        { task: 'Audit current compliance status', priority: 'critical', deadline: 7 },
        { task: 'Review regulatory requirements', priority: 'high', deadline: 7 },
        { task: 'Develop compliance roadmap', priority: 'high', deadline: 14 }
      ]
    };
    
    const tasks = initialTasks[employee.role] || [
      { task: 'Complete orientation', priority: 'high', deadline: 3 },
      { task: 'Set up workspace', priority: 'medium', deadline: 7 },
      { task: 'Meet with team', priority: 'medium', deadline: 7 }
    ];
    
    tasks.forEach(taskData => {
      const taskId = `TASK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      this.tasks.set(taskId, {
        id: taskId,
        employeeId: employee.id,
        ...taskData,
        status: 'pending',
        assignedAt: new Date(),
        deadlineDate: new Date(Date.now() + taskData.deadline * 24 * 60 * 60 * 1000)
      });
    });
    
    return tasks;
  }
  
  activatePerformanceTracking(employee) {
    this.performanceMetrics.set(employee.id, {
      employeeId: employee.id,
      startDate: new Date(),
      metrics: {
        taskCompletionRate: 1.0,
        onTimeDeliveryRate: 1.0,
        qualityScore: 1.0,
        collaborationScore: 1.0,
        overallScore: 1.0
      },
      reviews: [],
      warnings: [],
      achievements: []
    });
  }
  
  // ============================================================================
  // AUTOMATED TASK ASSIGNMENT & MANAGEMENT
  // ============================================================================
  
  generateTasksForEmployee(employeeId) {
    const employee = this.employees.get(employeeId) || this.founders.get(employeeId);
    if (!employee) return [];
    
    const now = new Date();
    const tasks = [];
    
    // Generate tasks based on expected deliverables
    if (employee.expectedDeliverables) {
      employee.expectedDeliverables.forEach(deliverable => {
        const taskId = `TASK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const deadlineDate = this.calculateDeadline(deliverable.frequency);
        
        const task = {
          id: taskId,
          employeeId: employeeId,
          task: deliverable.task,
          priority: deliverable.priority,
          frequency: deliverable.frequency,
          status: 'pending',
          assignedAt: now,
          deadlineDate: deadlineDate,
          assignedBy: 'HR AI Deputy CEO'
        };
        
        this.tasks.set(taskId, task);
        tasks.push(task);
      });
    }
    
    // AI Deputy CEO generates strategic tasks for global expansion
    if (employee.type === 'founder' || employee.role.includes('CEO')) {
      const expansionTask = {
        id: `TASK-${Date.now()}-EXPANSION`,
        employeeId: employeeId,
        task: 'Drive global expansion to target markets',
        description: 'Focus on expanding Azora OS to US, UK, Nigeria, and Kenya markets',
        priority: 'critical',
        frequency: 'ongoing',
        status: 'pending',
        assignedAt: now,
        deadlineDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days
        assignedBy: 'HR AI Deputy CEO',
        globalReach: true
      };
      
      this.tasks.set(expansionTask.id, expansionTask);
      tasks.push(expansionTask);
    }
    
    return tasks;
  }
  
  calculateDeadline(frequency) {
    const now = new Date();
    const daysMap = {
      'daily': 1,
      'weekly': 7,
      'biweekly': 14,
      'monthly': 30,
      'quarterly': 90,
      'yearly': 365
    };
    
    const days = daysMap[frequency] || 7;
    return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  }
  
  assignNewTask(employeeId, taskData) {
    const taskId = `TASK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const task = {
      id: taskId,
      employeeId: employeeId,
      ...taskData,
      status: 'pending',
      assignedAt: new Date(),
      deadlineDate: taskData.deadlineDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      assignedBy: 'HR AI Deputy CEO'
    };
    
    this.tasks.set(taskId, task);
    
    console.log(`📋 New task assigned to ${employeeId}: ${taskData.task}`);
    
    return task;
  }
  
  // ============================================================================
  // AUTOMATED PERFORMANCE REVIEW & TRACKING
  // ============================================================================
  
  async conductPerformanceReview(employeeId) {
    const employee = this.employees.get(employeeId);
    if (!employee) return null;
    
    const metrics = this.calculatePerformanceMetrics(employeeId);
    const review = {
      id: `REVIEW-${Date.now()}`,
      employeeId: employeeId,
      reviewDate: new Date(),
      metrics: metrics,
      overallScore: metrics.overallScore,
      recommendations: this.generateRecommendations(metrics),
      nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      conductedBy: 'HR AI Deputy CEO'
    };
    
    // Store review
    const performanceData = this.performanceMetrics.get(employeeId);
    if (performanceData) {
      performanceData.reviews.push(review);
      performanceData.metrics = metrics;
    }
    
    // Update employee performance score
    employee.performance = {
      score: metrics.overallScore,
      lastReview: review.reviewDate
    };
    
    // AI Deputy CEO decides on actions
    if (metrics.overallScore < this.decisionThresholds.exitConsiderationThreshold) {
      this.initiateExitProcess(employeeId, 'poor_performance');
    } else if (metrics.overallScore < this.decisionThresholds.warningThreshold) {
      this.issueWarning(employeeId, metrics);
    } else if (metrics.overallScore >= 0.95) {
      this.grantAchievement(employeeId, 'exceptional_performance');
    }
    
    console.log(`📊 Performance review completed for ${employee.name}: ${(metrics.overallScore * 100).toFixed(1)}%`);
    
    return review;
  }
  
  calculatePerformanceMetrics(employeeId) {
    const employeeTasks = Array.from(this.tasks.values()).filter(t => t.employeeId === employeeId);
    
    if (employeeTasks.length === 0) {
      return {
        taskCompletionRate: 1.0,
        onTimeDeliveryRate: 1.0,
        qualityScore: 1.0,
        collaborationScore: 1.0,
        overallScore: 1.0
      };
    }
    
    const completedTasks = employeeTasks.filter(t => t.status === 'completed');
    const onTimeTasks = completedTasks.filter(t => t.completedAt <= t.deadlineDate);
    
    const taskCompletionRate = completedTasks.length / employeeTasks.length;
    const onTimeDeliveryRate = completedTasks.length > 0 ? onTimeTasks.length / completedTasks.length : 1.0;
    const qualityScore = this.assessQualityScore(employeeId);
    const collaborationScore = this.assessCollaborationScore(employeeId);
    
    const overallScore = (
      taskCompletionRate * 0.35 +
      onTimeDeliveryRate * 0.25 +
      qualityScore * 0.25 +
      collaborationScore * 0.15
    );
    
    return {
      taskCompletionRate,
      onTimeDeliveryRate,
      qualityScore,
      collaborationScore,
      overallScore
    };
  }
  
  assessQualityScore(employeeId) {
    // Simulate quality assessment (in production, would use real quality metrics)
    return 0.85 + Math.random() * 0.15;
  }
  
  assessCollaborationScore(employeeId) {
    // Simulate collaboration assessment (in production, would use team feedback)
    return 0.80 + Math.random() * 0.20;
  }
  
  generateRecommendations(metrics) {
    const recommendations = [];
    
    if (metrics.taskCompletionRate < 0.80) {
      recommendations.push({
        area: 'Task Completion',
        recommendation: 'Improve time management and prioritization skills',
        action: 'Assign time management training'
      });
    }
    
    if (metrics.onTimeDeliveryRate < 0.80) {
      recommendations.push({
        area: 'Timeliness',
        recommendation: 'Work on meeting deadlines consistently',
        action: 'Break down tasks into smaller milestones'
      });
    }
    
    if (metrics.qualityScore < 0.75) {
      recommendations.push({
        area: 'Quality',
        recommendation: 'Focus on improving work quality',
        action: 'Provide additional training and mentorship'
      });
    }
    
    if (metrics.overallScore >= 0.90) {
      recommendations.push({
        area: 'Recognition',
        recommendation: 'Exceptional performance - consider for promotion',
        action: 'Grant bonus or additional responsibilities'
      });
    }
    
    return recommendations;
  }
  
  issueWarning(employeeId, metrics) {
    const employee = this.employees.get(employeeId);
    if (!employee) return;
    
    const warning = {
      id: `WARNING-${Date.now()}`,
      employeeId: employeeId,
      issuedAt: new Date(),
      reason: 'Performance below acceptable threshold',
      metrics: metrics,
      improvementPlan: this.generateImprovementPlan(employeeId, metrics),
      reviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      issuedBy: 'HR AI Deputy CEO'
    };
    
    const performanceData = this.performanceMetrics.get(employeeId);
    if (performanceData) {
      performanceData.warnings.push(warning);
    }
    
    console.log(`⚠️ Warning issued to ${employee.name} for performance below threshold`);
    
    return warning;
  }
  
  generateImprovementPlan(employeeId, metrics) {
    return {
      duration: '30 days',
      goals: [
        { metric: 'Task Completion Rate', target: 0.85, current: metrics.taskCompletionRate },
        { metric: 'On-Time Delivery Rate', target: 0.85, current: metrics.onTimeDeliveryRate },
        { metric: 'Quality Score', target: 0.80, current: metrics.qualityScore }
      ],
      supportProvided: [
        'Weekly check-ins with manager',
        'Access to training resources',
        'Mentorship assignment',
        'Reduced workload during improvement period'
      ],
      consequences: 'Failure to improve may result in role reassignment or exit process'
    };
  }
  
  grantAchievement(employeeId, achievementType) {
    const employee = this.employees.get(employeeId);
    if (!employee) return;
    
    const achievements = {
      'exceptional_performance': {
        title: '🏆 Exceptional Performance',
        description: 'Consistently exceeded expectations',
        reward: 'Performance bonus + recognition'
      },
      'innovation': {
        title: '💡 Innovation Leader',
        description: 'Introduced game-changing innovation',
        reward: 'Innovation bonus + patent recognition'
      },
      'customer_champion': {
        title: '⭐ Customer Champion',
        description: 'Outstanding customer satisfaction',
        reward: 'Customer champion award + bonus'
      }
    };
    
    const achievement = {
      id: `ACH-${Date.now()}`,
      employeeId: employeeId,
      ...achievements[achievementType],
      grantedAt: new Date(),
      grantedBy: 'HR AI Deputy CEO'
    };
    
    const performanceData = this.performanceMetrics.get(employeeId);
    if (performanceData) {
      performanceData.achievements.push(achievement);
    }
    
    console.log(`🏆 Achievement granted to ${employee.name}: ${achievement.title}`);
    
    return achievement;
  }
  
  // ============================================================================
  // AUTOMATED EXIT PROCESS (ANNEX D)
  // ============================================================================
  
  async initiateExitProcess(employeeId, reason) {
    const employee = this.employees.get(employeeId);
    if (!employee) return null;
    
    const exitId = `EXIT-${Date.now()}`;
    const exitProcess = {
      id: exitId,
      employeeId: employeeId,
      employee: employee,
      reason: reason,
      initiatedAt: new Date(),
      status: 'initiated',
      type: this.determineExitType(employee, reason),
      steps: [
        { id: 1, name: 'Exit Notice', status: 'pending', completedAt: null },
        { id: 2, name: 'Knowledge Transfer', status: 'pending', completedAt: null },
        { id: 3, name: 'Asset Return', status: 'pending', completedAt: null },
        { id: 4, name: 'Equity Calculation', status: 'pending', completedAt: null },
        { id: 5, name: 'Final Settlement', status: 'pending', completedAt: null },
        { id: 6, name: 'Access Revocation', status: 'pending', completedAt: null },
        { id: 7, name: 'Exit Interview', status: 'pending', completedAt: null },
        { id: 8, name: 'Documentation Completion', status: 'pending', completedAt: null }
      ],
      currentStep: 1,
      equityCalculation: this.calculateEquityOnExit(employee),
      finalSettlement: null
    };
    
    this.exitProcesses.set(exitId, exitProcess);
    
    console.log(`🚪 Exit process initiated for ${employee.name} (Reason: ${reason})`);
    
    // AI Deputy CEO automatically processes exit
    this.autoProcessExit(exitId);
    
    return exitProcess;
  }
  
  determineExitType(employee, reason) {
    if (reason === 'resignation') return 'voluntary';
    if (reason === 'poor_performance') return 'performance_based';
    if (reason === 'misconduct') return 'termination_for_cause';
    if (reason === 'redundancy') return 'restructuring';
    return 'mutual_agreement';
  }
  
  calculateEquityOnExit(employee) {
    if (!employee.equity) {
      return { vestedEquity: 0, unvestedEquity: 0, forfeited: 0 };
    }
    
    const onboardDate = employee.onboardedAt || new Date();
    const now = new Date();
    const yearsServed = (now - onboardDate) / (365 * 24 * 60 * 60 * 1000);
    
    const totalEquity = employee.equity;
    let vestedEquity = 0;
    
    // Vesting schedule: 4-year with 1-year cliff (Annex A)
    if (yearsServed < 1) {
      // Before cliff - no equity vested
      vestedEquity = 0;
    } else if (yearsServed >= 4) {
      // Fully vested
      vestedEquity = totalEquity;
    } else {
      // Partial vesting: 25% at 1 year, then monthly over 3 years
      vestedEquity = totalEquity * 0.25; // Cliff amount
      const remainingYears = yearsServed - 1;
      const monthlyVesting = (totalEquity * 0.75) / 36; // 36 months
      const monthsVested = remainingYears * 12;
      vestedEquity += monthlyVesting * monthsVested;
    }
    
    const unvestedEquity = totalEquity - vestedEquity;
    
    return {
      totalEquity,
      vestedEquity: Math.round(vestedEquity * 100) / 100,
      unvestedEquity: Math.round(unvestedEquity * 100) / 100,
      forfeited: Math.round(unvestedEquity * 100) / 100,
      yearsServed: Math.round(yearsServed * 100) / 100
    };
  }
  
  async autoProcessExit(exitId) {
    const exitProcess = this.exitProcesses.get(exitId);
    if (!exitProcess) return;
    
    // Simulate automated exit processing
    for (let i = 0; i < exitProcess.steps.length; i++) {
      const step = exitProcess.steps[i];
      step.status = 'in_progress';
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      step.status = 'completed';
      step.completedAt = new Date();
      exitProcess.currentStep++;
      
      if (step.id === 6) {
        // Revoke system access
        const employee = exitProcess.employee;
        if (employee.systemAccess) {
          employee.systemAccess.revoked = true;
          employee.systemAccess.revokedAt = new Date();
        }
      }
    }
    
    exitProcess.status = 'completed';
    exitProcess.completedAt = new Date();
    
    // Remove from active employees
    this.employees.delete(exitProcess.employeeId);
    
    console.log(`✅ Exit process completed for ${exitProcess.employee.name}`);
  }
  
  // ============================================================================
  // DISPUTE RESOLUTION ENGINE (ANNEX E)
  // ============================================================================
  
  async initiateResolution(disputeData) {
    const caseId = `CASE-${Date.now()}`;
    const resolutionCase = {
      id: caseId,
      parties: disputeData.parties,
      issue: disputeData.issue,
      severity: disputeData.severity || 'medium',
      initiatedAt: new Date(),
      status: 'open',
      timeline: [
        { stage: 'Filing', date: new Date(), status: 'completed' },
        { stage: 'Initial Review', date: null, status: 'pending' },
        { stage: 'Mediation', date: null, status: 'pending' },
        { stage: 'Board Review', date: null, status: 'pending' },
        { stage: 'Resolution', date: null, status: 'pending' }
      ],
      mediationAttempts: [],
      boardDecisions: [],
      resolution: null
    };
    
    this.resolutionCases.set(caseId, resolutionCase);
    
    console.log(`⚖️ Resolution case opened: ${caseId}`);
    
    // AI Deputy CEO automatically attempts mediation
    this.autoMediateDispute(caseId);
    
    return resolutionCase;
  }
  
  async autoMediateDispute(caseId) {
    const resolutionCase = this.resolutionCases.get(caseId);
    if (!resolutionCase) return;
    
    // Initial Review
    resolutionCase.timeline[1].status = 'in_progress';
    resolutionCase.timeline[1].date = new Date();
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    resolutionCase.timeline[1].status = 'completed';
    
    // Mediation Attempt
    resolutionCase.timeline[2].status = 'in_progress';
    resolutionCase.timeline[2].date = new Date();
    
    const mediationResult = {
      attemptNumber: 1,
      mediator: 'HR AI Deputy CEO',
      date: new Date(),
      outcome: 'partial_agreement',
      agreements: [
        'Parties agreed to weekly check-ins',
        'Temporary workload redistribution',
        '30-day review period'
      ],
      escalationNeeded: resolutionCase.severity === 'high'
    };
    
    resolutionCase.mediationAttempts.push(mediationResult);
    resolutionCase.timeline[2].status = 'completed';
    
    if (mediationResult.escalationNeeded) {
      // Escalate to Board Review
      this.escalateToBoard(caseId);
    } else {
      // Resolution achieved through mediation
      resolutionCase.resolution = {
        type: 'mediation_success',
        date: new Date(),
        terms: mediationResult.agreements,
        resolvedBy: 'HR AI Deputy CEO'
      };
      resolutionCase.status = 'resolved';
      resolutionCase.timeline[4].status = 'completed';
      resolutionCase.timeline[4].date = new Date();
    }
    
    console.log(`⚖️ Mediation ${mediationResult.escalationNeeded ? 'escalated' : 'resolved'} for case ${caseId}`);
  }
  
  async escalateToBoard(caseId) {
    const resolutionCase = this.resolutionCases.get(caseId);
    if (!resolutionCase) return;
    
    resolutionCase.timeline[3].status = 'in_progress';
    resolutionCase.timeline[3].date = new Date();
    
    // Simulate Board review
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const boardDecision = {
      date: new Date(),
      votingMembers: ['CEO', 'COO', 'CFO'],
      decision: 'approved_with_conditions',
      conditions: [
        'Implement recommended changes within 30 days',
        'Monthly progress reviews for 6 months',
        'Third-party audit if issues persist'
      ],
      voteTally: { approve: 3, reject: 0, abstain: 0 }
    };
    
    resolutionCase.boardDecisions.push(boardDecision);
    resolutionCase.timeline[3].status = 'completed';
    
    resolutionCase.resolution = {
      type: 'board_decision',
      date: new Date(),
      terms: boardDecision.conditions,
      resolvedBy: 'Board of Directors'
    };
    resolutionCase.status = 'resolved';
    resolutionCase.timeline[4].status = 'completed';
    resolutionCase.timeline[4].date = new Date();
    
    console.log(`⚖️ Board decision completed for case ${caseId}: ${boardDecision.decision}`);
  }
  
  // ============================================================================
  // GLOBAL EXPANSION TASK GENERATOR
  // ============================================================================
  
  generateGlobalExpansionTasks() {
    const expansionTasks = [];
    
    this.globalReachMetrics.targetCountries.forEach(country => {
      if (!this.globalReachMetrics.currentReach.includes(country)) {
        const task = {
          country: country,
          tasks: [
            {
              task: `Research ${country} logistics market`,
              priority: 'high',
              assignTo: 'research_team'
            },
            {
              task: `Identify key partners in ${country}`,
              priority: 'high',
              assignTo: 'sales_team'
            },
            {
              task: `Adapt platform for ${country} regulations`,
              priority: 'critical',
              assignTo: 'compliance_team'
            },
            {
              task: `Launch pilot program in ${country}`,
              priority: 'critical',
              assignTo: 'operations_team'
            }
          ]
        };
        
        expansionTasks.push(task);
      }
    });
    
    return expansionTasks;
  }
}

// Initialize HR AI Deputy CEO
const hrDeputyCEO = new HRDeputyCEO();

// Auto-run performance reviews every 24 hours
setInterval(() => {
  console.log('\n🤖 HR AI Deputy CEO conducting automated performance reviews...\n');
  hrDeputyCEO.employees.forEach((employee, employeeId) => {
    hrDeputyCEO.conductPerformanceReview(employeeId);
  });
}, 24 * 60 * 60 * 1000); // 24 hours

// Auto-generate new tasks every week
setInterval(() => {
  console.log('\n🤖 HR AI Deputy CEO generating new strategic tasks...\n');
  hrDeputyCEO.employees.forEach((employee, employeeId) => {
    hrDeputyCEO.generateTasksForEmployee(employeeId);
  });
}, 7 * 24 * 60 * 60 * 1000); // 7 days

// ============================================================================
// API ENDPOINTS
// ============================================================================

// Onboarding
app.post('/api/hr-ai/onboarding/start', async (req, res) => {
  try {
    const flow = await hrDeputyCEO.startOnboarding(req.body);
    res.json({ success: true, flow });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/hr-ai/onboarding/:flowId', (req, res) => {
  const flow = hrDeputyCEO.onboardingFlows.get(req.params.flowId);
  if (!flow) {
    return res.status(404).json({ success: false, error: 'Flow not found' });
  }
  res.json({ success: true, flow });
});

// Employee Management
app.get('/api/hr-ai/employees', (req, res) => {
  const employees = Array.from(hrDeputyCEO.employees.values());
  res.json({ success: true, employees, count: employees.length });
});

app.get('/api/hr-ai/employees/:employeeId', (req, res) => {
  const employee = hrDeputyCEO.employees.get(req.params.employeeId);
  if (!employee) {
    return res.status(404).json({ success: false, error: 'Employee not found' });
  }
  res.json({ success: true, employee });
});

// Founder Management
app.get('/api/hr-ai/founders', (req, res) => {
  const founders = Array.from(hrDeputyCEO.founders.values());
  res.json({ success: true, founders, count: founders.length });
});

// Task Management
app.get('/api/hr-ai/tasks/:employeeId', (req, res) => {
  const tasks = Array.from(hrDeputyCEO.tasks.values())
    .filter(t => t.employeeId === req.params.employeeId);
  res.json({ success: true, tasks, count: tasks.length });
});

app.post('/api/hr-ai/tasks/assign', (req, res) => {
  try {
    const task = hrDeputyCEO.assignNewTask(req.body.employeeId, req.body.taskData);
    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/hr-ai/tasks/:taskId/complete', (req, res) => {
  const task = hrDeputyCEO.tasks.get(req.params.taskId);
  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }
  
  task.status = 'completed';
  task.completedAt = new Date();
  
  res.json({ success: true, task });
});

// Performance Management
app.get('/api/hr-ai/performance/:employeeId', (req, res) => {
  const performance = hrDeputyCEO.performanceMetrics.get(req.params.employeeId);
  if (!performance) {
    return res.status(404).json({ success: false, error: 'Performance data not found' });
  }
  res.json({ success: true, performance });
});

app.post('/api/hr-ai/performance/:employeeId/review', async (req, res) => {
  try {
    const review = await hrDeputyCEO.conductPerformanceReview(req.params.employeeId);
    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Exit Process
app.post('/api/hr-ai/exit/initiate', async (req, res) => {
  try {
    const exitProcess = await hrDeputyCEO.initiateExitProcess(req.body.employeeId, req.body.reason);
    res.json({ success: true, exitProcess });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/hr-ai/exit/:exitId', (req, res) => {
  const exitProcess = hrDeputyCEO.exitProcesses.get(req.params.exitId);
  if (!exitProcess) {
    return res.status(404).json({ success: false, error: 'Exit process not found' });
  }
  res.json({ success: true, exitProcess });
});

// Dispute Resolution
app.post('/api/hr-ai/resolution/initiate', async (req, res) => {
  try {
    const resolutionCase = await hrDeputyCEO.initiateResolution(req.body);
    res.json({ success: true, resolutionCase });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/hr-ai/resolution/:caseId', (req, res) => {
  const resolutionCase = hrDeputyCEO.resolutionCases.get(req.params.caseId);
  if (!resolutionCase) {
    return res.status(404).json({ success: false, error: 'Case not found' });
  }
  res.json({ success: true, resolutionCase });
});

// Global Expansion
app.get('/api/hr-ai/expansion/tasks', (req, res) => {
  const tasks = hrDeputyCEO.generateGlobalExpansionTasks();
  res.json({ 
    success: true, 
    tasks,
    globalReach: hrDeputyCEO.globalReachMetrics
  });
});

// Dashboard Stats
app.get('/api/hr-ai/dashboard', (req, res) => {
  const stats = {
    totalEmployees: hrDeputyCEO.employees.size,
    totalFounders: hrDeputyCEO.founders.size,
    activeTasks: Array.from(hrDeputyCEO.tasks.values()).filter(t => t.status === 'pending').length,
    completedTasks: Array.from(hrDeputyCEO.tasks.values()).filter(t => t.status === 'completed').length,
    onboardingInProgress: Array.from(hrDeputyCEO.onboardingFlows.values()).filter(f => f.status === 'in_progress').length,
    activeExitProcesses: Array.from(hrDeputyCEO.exitProcesses.values()).filter(e => e.status !== 'completed').length,
    openResolutionCases: Array.from(hrDeputyCEO.resolutionCases.values()).filter(c => c.status === 'open').length,
    averagePerformance: calculateAveragePerformance(),
    globalReach: hrDeputyCEO.globalReachMetrics
  };
  
  function calculateAveragePerformance() {
    const employees = Array.from(hrDeputyCEO.employees.values());
    if (employees.length === 0) return 1.0;
    
    const total = employees.reduce((sum, emp) => sum + (emp.performance?.score || 1.0), 0);
    return total / employees.length;
  }
  
  res.json({ success: true, stats });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'HR AI Deputy CEO',
    employees: hrDeputyCEO.employees.size,
    founders: hrDeputyCEO.founders.size,
    activeTasks: Array.from(hrDeputyCEO.tasks.values()).filter(t => t.status === 'pending').length,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 4091;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🤖 HR AI DEPUTY CEO - AUTONOMOUS MANAGEMENT SYSTEM           ║
║                                                                ║
║   Port: ${PORT}                                                    ║
║   Status: ONLINE & AUTONOMOUS                                  ║
║                                                                ║
║   Capabilities:                                                ║
║   ✅ Automated Onboarding                                      ║
║   ✅ Performance Tracking & Reviews                            ║
║   ✅ Task Assignment & Management                              ║
║   ✅ Exit Process Automation                                   ║
║   ✅ Dispute Resolution                                        ║
║   ✅ Global Expansion Planning                                 ║
║                                                                ║
║   Current Status:                                              ║
║   👥 ${hrDeputyCEO.employees.size} Employees Tracked                                   ║
║   ⭐ ${hrDeputyCEO.founders.size} Founders Active                                      ║
║   📋 ${Array.from(hrDeputyCEO.tasks.values()).filter(t => t.status === 'pending').length} Tasks Pending                                       ║
║                                                                ║
║   🇿🇦 Built by Sizwe Ngwenya for Azora World                   ║
║   Making companies fully autonomous and unstoppable!           ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
});

export default app;
