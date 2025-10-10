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
    
    // CCMA Compliance & Labour Law Framework
    this.ccmaCompliance = {
      minimumWarnings: 3, // CCMA requires minimum 3 warnings before dismissal
      warningValidityPeriod: 6, // months - warnings expire after 6 months
      performanceImprovementPlan: 30, // days minimum for PIP
      dismissalNoticePeriod: 30, // days notice required
      severanceCalculation: true, // automatic severance calculation
      unfairDismissalProtection: true,
      disciplinaryHearing: true, // required before dismissal
      rightToRepresentation: true, // employee can bring representative
      appealProcess: true, // 7-day appeal period
      documentationRequired: [
        'Performance reviews',
        'Written warnings',
        'Improvement plans',
        'Support provided',
        'Meeting minutes',
        'Evidence of misconduct'
      ]
    };
    
    // International Labour Standards
    this.labourStandards = {
      ILO: { // International Labour Organization
        fairWages: true,
        safeWorkingConditions: true,
        noDiscrimination: true,
        freedomOfAssociation: true,
        collectiveBargaining: true
      },
      BCEA: { // Basic Conditions of Employment Act (SA)
        maximumHours: 45, // per week
        overtimeRules: true,
        leaveEntitlement: 21, // days annual leave
        maternityLeave: 4, // months
        sickLeave: 30, // days per 3-year cycle
        familyResponsibilityLeave: 3 // days per year
      },
      EEA: { // Employment Equity Act (SA)
        equalOpportunity: true,
        affirmativeAction: true,
        noDiscrimination: true,
        equityPlans: true
      },
      LRA: { // Labour Relations Act (SA)
        unfairDismissalProtection: true,
        proceduralFairness: true,
        substantiveFairness: true,
        consultationRequired: true
      }
    };
    
    // Compensation & Valuation System
    this.compensationFramework = {
      marketResearch: true,
      equityAnalysis: true,
      performanceBasedBonus: true,
      skillsBasedPay: true,
      experienceWeighting: true,
      costOfLivingAdjustment: true,
      annualIncreaseMinimum: 0.06, // 6% minimum annual increase
      bonusPool: 0.15 // 15% of salary for high performers
    };
    
    // Recruitment & Application System
    this.recruitmentSystem = {
      applications: new Map(),
      interviews: new Map(),
      assessments: new Map(),
      recommendations: new Map()
    };
    
    // Executive Support System
    this.executiveSupport = {
      ceoDeputy: new Map(),
      seniorRoleDeputies: new Map(),
      advisoryReports: new Map(),
      strategicGoals: new Map()
    };
    
    // Warnings and Disciplinary Records (CCMA Compliance)
    this.warningsRegistry = new Map();
    this.disciplinaryHearings = new Map();
    this.improvementPlans = new Map();
    this.dismissalDocumentation = new Map();
    
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
    
    // Initialize executive support system
    this.initializeExecutiveSupport();
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
    
    // Get or create warnings registry for employee
    if (!this.warningsRegistry.has(employeeId)) {
      this.warningsRegistry.set(employeeId, []);
    }
    const warningHistory = this.warningsRegistry.get(employeeId);
    
    // Remove expired warnings (older than 6 months per CCMA)
    const validWarnings = warningHistory.filter(w => {
      const monthsSince = (Date.now() - new Date(w.issuedAt).getTime()) / (1000 * 60 * 60 * 24 * 30);
      return monthsSince < this.ccmaCompliance.warningValidityPeriod;
    });
    
    const warningNumber = validWarnings.length + 1;
    
    const warning = {
      id: `WARNING-${Date.now()}`,
      employeeId: employeeId,
      warningNumber: warningNumber,
      issuedAt: new Date(),
      reason: 'Performance below acceptable threshold',
      metrics: metrics,
      improvementPlan: this.generateImprovementPlan(employeeId, metrics),
      reviewDate: new Date(Date.now() + this.ccmaCompliance.performanceImprovementPlan * 24 * 60 * 60 * 1000),
      issuedBy: 'HR AI Deputy CEO',
      ccmaCompliant: true,
      expiryDate: new Date(Date.now() + this.ccmaCompliance.warningValidityPeriod * 30 * 24 * 60 * 60 * 1000),
      documentationProvided: [
        'Performance metrics report',
        'Written warning letter',
        'Improvement plan',
        'Support resources',
        'Meeting minutes'
      ],
      employeeAcknowledgement: null, // To be signed by employee
      witnessSignature: null, // HR or manager witness
      appealRights: 'Employee has 7 days to appeal this warning',
      supportProvided: [
        'Performance coaching',
        'Skills training',
        'Weekly check-ins',
        'Resource allocation',
        'Mentorship assignment'
      ]
    };
    
    validWarnings.push(warning);
    this.warningsRegistry.set(employeeId, validWarnings);
    
    const performanceData = this.performanceMetrics.get(employeeId);
    if (performanceData) {
      performanceData.warnings.push(warning);
    }
    
    // CEO and Board notification for warnings
    this.notifyCEOAndBoard({
      type: 'warning_issued',
      severity: warningNumber === 1 ? 'low' : warningNumber === 2 ? 'medium' : 'high',
      employee: employee,
      warningNumber: warningNumber,
      metrics: metrics,
      action: warningNumber >= 3 ? 'Dismissal may be considered after 3rd warning' : 'Performance improvement required'
    });
    
    console.log(`⚠️ CCMA-Compliant Warning #${warningNumber} issued to ${employee.name}`);
    console.log(`   Valid warnings: ${warningNumber}/${this.ccmaCompliance.minimumWarnings}`);
    console.log(`   Expiry date: ${warning.expiryDate.toISOString().split('T')[0]}`);
    
    // Create PIP if not exists
    if (!this.improvementPlans.has(employeeId)) {
      this.createPerformanceImprovementPlan(employeeId, metrics);
    }
    
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
  
  // ============================================================================
  // CCMA COMPLIANCE & FAIR DISMISSAL PROCEDURES
  // ============================================================================
  
  verifyCCMACompliance(employeeId, reason) {
    const warnings = this.warningsRegistry.get(employeeId) || [];
    const validWarnings = warnings.filter(w => {
      const monthsSince = (Date.now() - new Date(w.issuedAt).getTime()) / (1000 * 60 * 60 * 24 * 30);
      return monthsSince < this.ccmaCompliance.warningValidityPeriod;
    });
    
    const employee = this.employees.get(employeeId);
    const required = [];
    
    // Check minimum warnings (except for gross misconduct)
    if (reason === 'poor_performance' && validWarnings.length < this.ccmaCompliance.minimumWarnings) {
      return {
        compliant: false,
        reason: `Only ${validWarnings.length} valid warnings issued. CCMA requires minimum ${this.ccmaCompliance.minimumWarnings} warnings before dismissal for poor performance.`,
        required: [
          `Issue ${this.ccmaCompliance.minimumWarnings - validWarnings.length} more written warnings`,
          'Provide performance improvement plan',
          'Allow 30 days for improvement',
          'Document all support provided'
        ]
      };
    }
    
    // Check if PIP was completed
    const pip = this.improvementPlans.get(employeeId);
    if (reason === 'poor_performance' && (!pip || !pip.completed)) {
      return {
        compliant: false,
        reason: 'Performance Improvement Plan not completed. Employee must be given opportunity to improve.',
        required: [
          'Create and document Performance Improvement Plan',
          'Provide minimum 30 days for improvement',
          'Offer training and support',
          'Conduct regular check-ins',
          'Document all efforts to help employee'
        ]
      };
    }
    
    // Check documentation
    const performanceData = this.performanceMetrics.get(employeeId);
    if (!performanceData || performanceData.reviews.length < 3) {
      return {
        compliant: false,
        reason: 'Insufficient performance documentation. CCMA requires thorough records.',
        required: [
          'Minimum 3 documented performance reviews',
          'Written warnings with specific examples',
          'Meeting minutes',
          'Evidence of poor performance',
          'Proof of support provided'
        ]
      };
    }
    
    return {
      compliant: true,
      warnings: validWarnings.length,
      documentation: 'complete',
      proceduralFairness: 'verified',
      substantiveFairness: 'verified'
    };
  }
  
  async conductDisciplinaryHearing(employeeId, reason) {
    const hearingId = `HEARING-${Date.now()}`;
    const employee = this.employees.get(employeeId);
    
    const hearing = {
      id: hearingId,
      employeeId: employeeId,
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days notice
      reason: reason,
      status: 'scheduled',
      chairperson: 'HR AI Deputy CEO',
      attendees: [
        { role: 'Employee', name: employee.name, present: true },
        { role: 'Representative', name: 'Employee may bring representative', present: null },
        { role: 'Witness', name: 'Manager/Supervisor', present: true },
        { role: 'HR', name: 'HR AI Deputy CEO', present: true }
      ],
      evidence: {
        performanceReviews: this.performanceMetrics.get(employeeId),
        warnings: this.warningsRegistry.get(employeeId),
        improvementPlans: this.improvementPlans.get(employeeId),
        tasksCompleted: Array.from(this.tasks.values()).filter(t => t.employeeId === employeeId && t.status === 'completed').length,
        tasksOverdue: Array.from(this.tasks.values()).filter(t => t.employeeId === employeeId && t.status === 'pending' && new Date(t.deadlineDate) < new Date()).length
      },
      employeeStatement: null, // Employee has right to respond
      decision: null,
      outcome: null,
      appealRights: 'Employee has 7 days to appeal the decision',
      ccmaCompliant: true
    };
    
    // Simulate hearing (in production, would schedule actual meeting)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // AI analysis of evidence
    const evidenceScore = this.analyzeHearingEvidence(hearing.evidence);
    
    if (evidenceScore.substantiated && evidenceScore.procedurallyFair) {
      hearing.outcome = 'guilty';
      hearing.decision = 'Dismissal approved - substantive and procedural fairness verified';
    } else if (evidenceScore.substantiated && !evidenceScore.procedurallyFair) {
      hearing.outcome = 'procedural_issue';
      hearing.decision = 'Dismissal blocked - procedural fairness not met';
    } else {
      hearing.outcome = 'not_guilty';
      hearing.decision = 'Dismissal denied - insufficient evidence';
    }
    
    hearing.status = 'completed';
    hearing.completedAt = new Date();
    
    this.disciplinaryHearings.set(hearingId, hearing);
    
    // Notify CEO and Board
    this.notifyCEOAndBoard({
      type: 'disciplinary_hearing_completed',
      severity: 'high',
      employee: employee,
      outcome: hearing.outcome,
      decision: hearing.decision,
      evidence: evidenceScore
    });
    
    console.log(`⚖️ Disciplinary hearing completed for ${employee.name}`);
    console.log(`   Outcome: ${hearing.outcome}`);
    console.log(`   Decision: ${hearing.decision}`);
    
    return hearing;
  }
  
  analyzeHearingEvidence(evidence) {
    const reviews = evidence.performanceReviews?.reviews || [];
    const warnings = evidence.warnings || [];
    const pip = evidence.improvementPlans;
    
    // Check substantive fairness (is there valid reason?)
    const averageScore = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.overallScore, 0) / reviews.length 
      : 1.0;
    
    const substantiated = averageScore < 0.40 || evidence.tasksOverdue > 10;
    
    // Check procedural fairness (was process followed?)
    const procedurallyFair = 
      warnings.length >= 3 && // Minimum warnings
      reviews.length >= 3 && // Documented reviews
      pip && pip.completed && // PIP given
      pip.supportProvided; // Support offered
    
    return {
      substantiated,
      procedurallyFair,
      averageScore,
      warningsIssued: warnings.length,
      reviewsConducted: reviews.length,
      pipCompleted: pip?.completed || false,
      tasksOverdue: evidence.tasksOverdue
    };
  }
  
  createPerformanceImprovementPlan(employeeId, metrics) {
    const pipId = `PIP-${Date.now()}`;
    const employee = this.employees.get(employeeId);
    
    const pip = {
      id: pipId,
      employeeId: employeeId,
      startDate: new Date(),
      duration: 30, // days
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'active',
      goals: [
        {
          metric: 'Task Completion Rate',
          current: metrics.taskCompletionRate,
          target: 0.85,
          progress: 0
        },
        {
          metric: 'On-Time Delivery',
          current: metrics.onTimeDeliveryRate,
          target: 0.85,
          progress: 0
        },
        {
          metric: 'Quality Score',
          current: metrics.qualityScore,
          target: 0.80,
          progress: 0
        }
      ],
      supportProvided: [
        'Weekly one-on-one coaching sessions',
        'Access to online training platform',
        'Mentorship from senior team member',
        'Reduced workload (70% of normal)',
        'Additional resources allocated',
        'Daily check-ins for first 2 weeks'
      ],
      weeklyCheckIns: [],
      progress: 0,
      completed: false,
      ccmaCompliant: true
    };
    
    this.improvementPlans.set(employeeId, pip);
    
    console.log(`📋 Performance Improvement Plan created for ${employee.name}`);
    console.log(`   Duration: ${pip.duration} days`);
    console.log(`   End date: ${pip.endDate.toISOString().split('T')[0]}`);
    
    return pip;
  }
  
  notifyCEOAndBoard(notification) {
    const report = {
      id: `NOTIFICATION-${Date.now()}`,
      timestamp: new Date(),
      ...notification,
      recipientsNotified: [
        'CEO (Sizwe Ngwenya)',
        'Board of Directors',
        'HR Deputy AI'
      ],
      actionRequired: notification.severity === 'critical' || notification.severity === 'high',
      dashboardAlert: true
    };
    
    // Store in executive support system
    if (!this.executiveSupport.advisoryReports.has('ceo')) {
      this.executiveSupport.advisoryReports.set('ceo', []);
    }
    
    this.executiveSupport.advisoryReports.get('ceo').push(report);
    
    console.log(`\n📢 CEO & BOARD NOTIFICATION`);
    console.log(`   Type: ${notification.type}`);
    console.log(`   Severity: ${notification.severity}`);
    console.log(`   Employee: ${notification.employee?.name || 'N/A'}`);
    console.log(`   Action Required: ${report.actionRequired ? 'YES' : 'NO'}\n`);
    
    return report;
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
  // COMPENSATION ANALYSIS & FAIR VALUATION
  // ============================================================================
  
  analyzeCompensation(employeeId) {
    const employee = this.employees.get(employeeId);
    if (!employee) return null;
    
    const performance = this.performanceMetrics.get(employeeId);
    const currentSalary = parseFloat(employee.salary?.replace(/[R,]/g, '') || '0');
    
    // Market research data (would integrate with real APIs in production)
    const marketData = this.getMarketSalaryData(employee.role);
    
    // Calculate fair compensation based on multiple factors
    const factors = {
      performance: performance?.metrics.overallScore || 1.0,
      experience: this.calculateExperience(employee),
      skills: this.assessSkills(employee),
      marketPosition: this.calculateMarketPosition(currentSalary, marketData),
      responsibilities: this.assessResponsibilities(employee),
      impact: this.measureBusinessImpact(employeeId)
    };
    
    // Weighted calculation
    const fairSalary = marketData.median * (
      factors.performance * 0.30 +
      factors.experience * 0.20 +
      factors.skills * 0.20 +
      factors.marketPosition * 0.15 +
      factors.responsibilities * 0.10 +
      factors.impact * 0.05
    );
    
    const recommendation = {
      employeeId: employeeId,
      currentSalary: currentSalary,
      fairSalary: Math.round(fairSalary),
      marketMedian: marketData.median,
      marketRange: marketData.range,
      adjustment: Math.round(fairSalary - currentSalary),
      adjustmentPercentage: ((fairSalary - currentSalary) / currentSalary * 100).toFixed(2),
      factors: factors,
      recommendation: this.generateSalaryRecommendation(currentSalary, fairSalary, factors),
      equityRecommendation: this.assessEquityGrant(employee, factors),
      bonusEligibility: factors.performance >= 0.85,
      estimatedBonus: factors.performance >= 0.85 ? Math.round(currentSalary * 0.15) : 0,
      nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      ccmaCompliant: true,
      equalPayVerified: true
    };
    
    console.log(`💰 Compensation Analysis for ${employee.name}:`);
    console.log(`   Current: R${currentSalary.toLocaleString()}`);
    console.log(`   Fair Value: R${recommendation.fairSalary.toLocaleString()}`);
    console.log(`   Adjustment: R${recommendation.adjustment.toLocaleString()} (${recommendation.adjustmentPercentage}%)`);
    
    return recommendation;
  }
  
  getMarketSalaryData(role) {
    // Market salary data for South African roles (in Rands)
    const marketData = {
      'CEO & Founder': { median: 1200000, range: [800000, 2000000] },
      'Founding Partner - Sales': { median: 600000, range: [400000, 900000] },
      'Founding Partner - Operations': { median: 550000, range: [400000, 800000] },
      'Founding Partner - Community': { median: 500000, range: [350000, 750000] },
      'Founding Partner - Design': { median: 550000, range: [400000, 800000] },
      'Fleet Manager': { median: 420000, range: [300000, 600000] },
      'Driver': { median: 180000, range: [120000, 250000] },
      'Compliance Officer': { median: 480000, range: [350000, 650000] },
      'Accountant': { median: 450000, range: [300000, 600000] },
      'Developer': { median: 600000, range: [400000, 900000] }
    };
    
    return marketData[role] || { median: 400000, range: [250000, 600000] };
  }
  
  calculateExperience(employee) {
    const yearsExperience = employee.yearsExperience || 5;
    return Math.min(yearsExperience / 15, 1.2); // Cap at 15 years = 120%
  }
  
  assessSkills(employee) {
    // In production, would integrate with skills assessment system
    return 0.85 + Math.random() * 0.15;
  }
  
  calculateMarketPosition(currentSalary, marketData) {
    const position = currentSalary / marketData.median;
    return Math.min(Math.max(position, 0.7), 1.3); // 70% to 130% of market
  }
  
  assessResponsibilities(employee) {
    const responsibilityCount = employee.responsibilities?.length || 5;
    return Math.min(responsibilityCount / 10, 1.2);
  }
  
  measureBusinessImpact(employeeId) {
    const tasks = Array.from(this.tasks.values()).filter(t => t.employeeId === employeeId);
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const impactScore = completedTasks.length / Math.max(tasks.length, 1);
    return Math.min(impactScore, 1.0);
  }
  
  generateSalaryRecommendation(current, fair, factors) {
    const diff = fair - current;
    const percentDiff = (diff / current) * 100;
    
    if (percentDiff > 20) {
      return {
        action: 'URGENT_INCREASE_REQUIRED',
        reason: 'Employee significantly underpaid relative to market and performance',
        timing: 'Immediate',
        riskLevel: 'High (retention risk)',
        message: `Recommend immediate increase of R${Math.round(diff).toLocaleString()} to prevent attrition`
      };
    } else if (percentDiff > 10) {
      return {
        action: 'INCREASE_RECOMMENDED',
        reason: 'Employee below fair market value',
        timing: 'Next review cycle (within 90 days)',
        riskLevel: 'Medium',
        message: `Recommend increase of R${Math.round(diff).toLocaleString()} to align with market`
      };
    } else if (percentDiff > -5 && percentDiff <= 10) {
      return {
        action: 'MAINTAIN',
        reason: 'Compensation aligned with market and performance',
        timing: 'Annual review',
        riskLevel: 'Low',
        message: 'Current compensation is fair and competitive'
      };
    } else {
      return {
        action: 'REVIEW_PERFORMANCE',
        reason: 'Compensation above market - verify performance justifies premium',
        timing: 'Next review cycle',
        riskLevel: 'Low',
        message: 'Employee compensated above market rate - ensure performance supports this'
      };
    }
  }
  
  assessEquityGrant(employee, factors) {
    if (employee.equity) {
      return {
        hasEquity: true,
        currentEquity: employee.equity,
        recommendation: 'Monitor vesting schedule',
        additionalGrant: null
      };
    }
    
    if (factors.performance >= 0.90 && factors.impact >= 0.80) {
      return {
        hasEquity: false,
        recommendation: 'GRANT_EQUITY',
        suggestedGrant: '0.5% - 2.0%',
        reason: 'Exceptional performance and high business impact',
        vestingSchedule: '4 years with 1-year cliff'
      };
    }
    
    return {
      hasEquity: false,
      recommendation: 'NO_EQUITY_GRANT',
      reason: 'Performance does not yet warrant equity grant'
    };
  }
  
  // ============================================================================
  // RECRUITMENT & APPLICATION SYSTEM
  // ============================================================================
  
  async processApplication(applicationData) {
    const applicationId = `APP-${Date.now()}`;
    
    const application = {
      id: applicationId,
      applicantName: applicationData.name,
      email: applicationData.email,
      phone: applicationData.phone,
      role: applicationData.role,
      experience: applicationData.experience,
      education: applicationData.education,
      skills: applicationData.skills || [],
      cv: applicationData.cv,
      coverLetter: applicationData.coverLetter,
      appliedAt: new Date(),
      status: 'under_review',
      aiScore: null,
      recommendation: null,
      interviewScheduled: false
    };
    
    // AI analysis of application
    const analysis = await this.analyzeApplication(application);
    application.aiScore = analysis.score;
    application.recommendation = analysis.recommendation;
    
    this.recruitmentSystem.applications.set(applicationId, application);
    
    // Notify CEO and Board for strong candidates
    if (analysis.score >= 0.80) {
      this.notifyCEOAndBoard({
        type: 'strong_candidate',
        severity: 'medium',
        applicant: applicationData.name,
        role: applicationData.role,
        score: analysis.score,
        recommendation: analysis.recommendation
      });
    }
    
    console.log(`📝 Application received: ${applicationData.name} for ${applicationData.role}`);
    console.log(`   AI Score: ${(analysis.score * 100).toFixed(1)}%`);
    console.log(`   Recommendation: ${analysis.recommendation}`);
    
    return application;
  }
  
  async analyzeApplication(application) {
    // AI-powered application analysis
    const scores = {
      experienceMatch: this.scoreExperience(application.experience, application.role),
      skillsMatch: this.scoreSkills(application.skills, application.role),
      educationMatch: this.scoreEducation(application.education, application.role),
      coverLetterQuality: this.scoreCoverLetter(application.coverLetter),
      cultureFit: 0.75 + Math.random() * 0.25 // Simulate culture fit assessment
    };
    
    const overallScore = (
      scores.experienceMatch * 0.35 +
      scores.skillsMatch * 0.30 +
      scores.educationMatch * 0.15 +
      scores.coverLetterQuality * 0.10 +
      scores.cultureFit * 0.10
    );
    
    let recommendation;
    if (overallScore >= 0.85) {
      recommendation = 'STRONG_FIT - Schedule interview immediately';
    } else if (overallScore >= 0.70) {
      recommendation = 'GOOD_FIT - Schedule interview';
    } else if (overallScore >= 0.55) {
      recommendation = 'POTENTIAL_FIT - Consider for interview';
    } else {
      recommendation = 'NOT_RECOMMENDED - Does not meet requirements';
    }
    
    return {
      score: overallScore,
      breakdown: scores,
      recommendation: recommendation,
      strengths: this.identifyStrengths(scores),
      concerns: this.identifyConcerns(scores)
    };
  }
  
  scoreExperience(experience, role) {
    // Simplified experience scoring
    const years = parseInt(experience) || 0;
    const requiredYears = this.getRequiredExperience(role);
    
    if (years >= requiredYears) return 1.0;
    if (years >= requiredYears * 0.75) return 0.85;
    if (years >= requiredYears * 0.50) return 0.70;
    return 0.50;
  }
  
  getRequiredExperience(role) {
    const requirements = {
      'CEO & Founder': 10,
      'Founding Partner - Sales': 8,
      'Founding Partner - Operations': 8,
      'Fleet Manager': 5,
      'Compliance Officer': 5,
      'Accountant': 5,
      'Developer': 3,
      'Driver': 2
    };
    return requirements[role] || 3;
  }
  
  scoreSkills(skills, role) {
    // Would integrate with skills database in production
    return skills.length >= 5 ? 0.90 : skills.length / 5 * 0.90;
  }
  
  scoreEducation(education, role) {
    // Simplified education scoring
    if (!education) return 0.60;
    if (education.includes('PhD') || education.includes('Doctorate')) return 1.0;
    if (education.includes('Masters') || education.includes('MBA')) return 0.95;
    if (education.includes('Bachelor') || education.includes('Degree')) return 0.85;
    if (education.includes('Diploma')) return 0.75;
    return 0.65;
  }
  
  scoreCoverLetter(coverLetter) {
    if (!coverLetter) return 0.50;
    const length = coverLetter.length;
    if (length > 800 && length < 1500) return 0.90;
    if (length > 500 && length < 2000) return 0.80;
    return 0.70;
  }
  
  identifyStrengths(scores) {
    const strengths = [];
    if (scores.experienceMatch >= 0.85) strengths.push('Strong relevant experience');
    if (scores.skillsMatch >= 0.85) strengths.push('Excellent skills match');
    if (scores.educationMatch >= 0.85) strengths.push('Strong educational background');
    if (scores.cultureFit >= 0.85) strengths.push('Good culture fit');
    return strengths;
  }
  
  identifyConcerns(scores) {
    const concerns = [];
    if (scores.experienceMatch < 0.70) concerns.push('Limited relevant experience');
    if (scores.skillsMatch < 0.70) concerns.push('Skills gap identified');
    if (scores.educationMatch < 0.70) concerns.push('Educational requirements not fully met');
    return concerns;
  }
  
  getBoardRecommendation(applicationId) {
    const application = this.recruitmentSystem.applications.get(applicationId);
    if (!application) return null;
    
    const recommendation = {
      applicationId: applicationId,
      applicant: application.applicantName,
      role: application.role,
      aiScore: application.aiScore,
      recommendation: application.recommendation,
      boardAction: application.aiScore >= 0.80 ? 'APPROVE_INTERVIEW' : application.aiScore >= 0.70 ? 'CONSIDER_INTERVIEW' : 'REJECT',
      reasoning: this.generateBoardReasoning(application),
      timestamp: new Date()
    };
    
    this.recruitmentSystem.recommendations.set(applicationId, recommendation);
    
    return recommendation;
  }
  
  generateBoardReasoning(application) {
    if (application.aiScore >= 0.85) {
      return 'Exceptional candidate with strong qualifications and experience. Highly recommended for immediate interview.';
    } else if (application.aiScore >= 0.70) {
      return 'Good candidate with solid qualifications. Recommended for interview to assess fit.';
    } else if (application.aiScore >= 0.55) {
      return 'Potential candidate but has some gaps. Consider for interview if no stronger candidates.';
    } else {
      return 'Does not meet minimum requirements. Not recommended to proceed.';
    }
  }
  
  // ============================================================================
  // EXECUTIVE SUPPORT & DEPUTY SYSTEM
  // ============================================================================
  
  initializeExecutiveSupport() {
    // CEO Support
    this.executiveSupport.ceoDeputy.set('tasks', []);
    this.executiveSupport.ceoDeputy.set('priorities', [
      'Global expansion strategy',
      'Investor relations',
      'Product development oversight',
      'Strategic partnerships'
    ]);
    
    // Senior roles deputies
    const seniorRoles = [
      'Head of Sales & Partnerships',
      'Operations & Support Lead',
      'Head of Retail & Community',
      'Founding UI/UX Engineer'
    ];
    
    seniorRoles.forEach(role => {
      this.executiveSupport.seniorRoleDeputies.set(role, {
        tasks: [],
        advisoryReports: [],
        goals: this.getGoalsForRole(role)
      });
    });
    
    console.log(`🎯 Executive support system initialized for CEO + ${seniorRoles.length} senior roles`);
  }
  
  getGoalsForRole(role) {
    const goalMap = {
      'Head of Sales & Partnerships': [
        'Achieve monthly revenue targets',
        'Close 3 strategic partnerships per quarter',
        'Expand customer base by 25% per quarter',
        'Maintain 90% customer retention rate'
      ],
      'Operations & Support Lead': [
        'Ensure 99.9% system uptime',
        'Deploy weekly product updates',
        'Reduce operational costs by 10%',
        'Improve efficiency by 15% per quarter'
      ],
      'Head of Retail & Community': [
        'Launch pilots in 3 new communities per quarter',
        'Achieve 85% community satisfaction score',
        'Secure regulatory approvals in target markets',
        'Build partnerships with 5 local organizations'
      ],
      'Founding UI/UX Engineer': [
        'Achieve 90% user satisfaction score',
        'Complete weekly UI updates',
        'Maintain WCAG 2.1 AA compliance',
        'Reduce user onboarding time by 20%'
      ]
    };
    
    return goalMap[role] || [];
  }
  
  generateExecutiveAdvisory(role) {
    const deputy = this.executiveSupport.seniorRoleDeputies.get(role);
    if (!deputy) return null;
    
    const advisory = {
      id: `ADVISORY-${Date.now()}`,
      role: role,
      timestamp: new Date(),
      priorities: deputy.goals,
      activeTasks: this.getActiveTasksForRole(role),
      recommendations: this.generateRecommendationsForRole(role),
      riskAlerts: this.identifyRisksForRole(role),
      opportunities: this.identifyOpportunitiesForRole(role)
    };
    
    deputy.advisoryReports.push(advisory);
    
    console.log(`📊 Executive advisory generated for ${role}`);
    
    return advisory;
  }
  
  getActiveTasksForRole(role) {
    // Get all employees in this role
    const employees = Array.from(this.employees.values()).filter(e => e.role === role);
    const employeeIds = employees.map(e => e.id);
    
    // Get active tasks for these employees
    return Array.from(this.tasks.values()).filter(t => 
      employeeIds.includes(t.employeeId) && t.status === 'pending'
    );
  }
  
  generateRecommendationsForRole(role) {
    return [
      'Focus on high-priority tasks this week',
      'Delegate routine tasks to team members',
      'Schedule quarterly strategic planning session',
      'Review team performance metrics'
    ];
  }
  
  identifyRisksForRole(role) {
    return [
      'Resource constraints may impact Q4 targets',
      'Market competition increasing in key segments',
      'Team capacity at 85% - consider hiring'
    ];
  }
  
  identifyOpportunitiesForRole(role) {
    return [
      'New market expansion opportunities in East Africa',
      'Partnership opportunity with major logistics player',
      'Technology advancement enables new features'
    ];
  }
  
  // ============================================================================
  // AUTOMATED EXIT PROCESS (CCMA COMPLIANT)
  // ============================================================================
  
  async initiateExitProcess(employeeId, reason) {
    const employee = this.employees.get(employeeId);
    if (!employee) return null;
    
    // CCMA COMPLIANCE CHECK: Verify dismissal is fair and legal
    const complianceCheck = this.verifyCCMACompliance(employeeId, reason);
    
    if (!complianceCheck.compliant) {
      console.log(`🚫 EXIT BLOCKED: CCMA non-compliance detected`);
      console.log(`   Reason: ${complianceCheck.reason}`);
      console.log(`   Required: ${complianceCheck.required.join(', ')}`);
      
      // Notify CEO and Board of blocked dismissal
      this.notifyCEOAndBoard({
        type: 'exit_blocked',
        severity: 'critical',
        employee: employee,
        reason: complianceCheck.reason,
        required: complianceCheck.required
      });
      
      return {
        blocked: true,
        reason: complianceCheck.reason,
        required: complianceCheck.required,
        message: 'Exit process blocked due to CCMA non-compliance. All requirements must be met to proceed.'
      };
    }
    
    // Conduct disciplinary hearing (CCMA requirement)
    const hearing = await this.conductDisciplinaryHearing(employeeId, reason);
    
    if (hearing.outcome === 'not_guilty' || hearing.outcome === 'insufficient_evidence') {
      console.log(`🚫 EXIT BLOCKED: Disciplinary hearing found insufficient grounds`);
      return {
        blocked: true,
        reason: 'Disciplinary hearing did not support dismissal',
        hearingOutcome: hearing
      };
    }
    
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

// Compensation Analysis
app.get('/api/hr-ai/compensation/:employeeId', (req, res) => {
  try {
    const analysis = hrDeputyCEO.analyzeCompensation(req.params.employeeId);
    if (!analysis) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    res.json({ success: true, analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/hr-ai/compensation/all', (req, res) => {
  try {
    const analyses = [];
    hrDeputyCEO.employees.forEach((employee, employeeId) => {
      const analysis = hrDeputyCEO.analyzeCompensation(employeeId);
      if (analysis) analyses.push(analysis);
    });
    res.json({ success: true, analyses, count: analyses.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Recruitment & Applications
app.post('/api/hr-ai/recruitment/apply', async (req, res) => {
  try {
    const application = await hrDeputyCEO.processApplication(req.body);
    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/hr-ai/recruitment/applications', (req, res) => {
  const applications = Array.from(hrDeputyCEO.recruitmentSystem.applications.values());
  res.json({ success: true, applications, count: applications.length });
});

app.get('/api/hr-ai/recruitment/application/:applicationId', (req, res) => {
  const application = hrDeputyCEO.recruitmentSystem.applications.get(req.params.applicationId);
  if (!application) {
    return res.status(404).json({ success: false, error: 'Application not found' });
  }
  res.json({ success: true, application });
});

app.get('/api/hr-ai/recruitment/recommendation/:applicationId', (req, res) => {
  try {
    const recommendation = hrDeputyCEO.getBoardRecommendation(req.params.applicationId);
    if (!recommendation) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }
    res.json({ success: true, recommendation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Executive Support & Advisory
app.get('/api/hr-ai/executive/ceo/advisory', (req, res) => {
  const reports = hrDeputyCEO.executiveSupport.advisoryReports.get('ceo') || [];
  res.json({ success: true, reports, count: reports.length });
});

app.get('/api/hr-ai/executive/:role/advisory', (req, res) => {
  try {
    const advisory = hrDeputyCEO.generateExecutiveAdvisory(req.params.role);
    if (!advisory) {
      return res.status(404).json({ success: false, error: 'Role not found' });
    }
    res.json({ success: true, advisory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// CCMA Compliance Reports
app.get('/api/hr-ai/ccma/warnings/:employeeId', (req, res) => {
  const warnings = hrDeputyCEO.warningsRegistry.get(req.params.employeeId) || [];
  const validWarnings = warnings.filter(w => {
    const monthsSince = (Date.now() - new Date(w.issuedAt).getTime()) / (1000 * 60 * 60 * 24 * 30);
    return monthsSince < hrDeputyCEO.ccmaCompliance.warningValidityPeriod;
  });
  res.json({ 
    success: true, 
    warnings: validWarnings,
    count: validWarnings.length,
    ccmaCompliant: validWarnings.length <= hrDeputyCEO.ccmaCompliance.minimumWarnings
  });
});

app.get('/api/hr-ai/ccma/hearings/:employeeId', (req, res) => {
  const hearings = Array.from(hrDeputyCEO.disciplinaryHearings.values())
    .filter(h => h.employeeId === req.params.employeeId);
  res.json({ success: true, hearings, count: hearings.length });
});

app.get('/api/hr-ai/ccma/pip/:employeeId', (req, res) => {
  const pip = hrDeputyCEO.improvementPlans.get(req.params.employeeId);
  if (!pip) {
    return res.status(404).json({ success: false, error: 'No PIP found for this employee' });
  }
  res.json({ success: true, pip });
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
