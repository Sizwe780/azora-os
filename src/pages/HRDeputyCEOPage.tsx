import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Brain, CheckCircle, AlertTriangle, TrendingUp, 
  Globe, Target, Award, FileText, Clock, Activity,
  UserPlus, UserMinus, Briefcase, BarChart3, Shield,
  Zap, Eye, MessageSquare, Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Employee {
  id: string;
  name: string;
  role: string;
  type: 'founder' | 'employee';
  performance: { score: number; lastReview: Date };
  equity?: number;
}

interface Task {
  id: string;
  employeeId: string;
  task: string;
  priority: string;
  status: string;
  deadlineDate: Date;
  frequency?: string;
  globalReach?: boolean;
}

interface PerformanceMetrics {
  taskCompletionRate: number;
  onTimeDeliveryRate: number;
  qualityScore: number;
  collaborationScore: number;
  overallScore: number;
}

interface DashboardStats {
  totalEmployees: number;
  totalFounders: number;
  activeTasks: number;
  completedTasks: number;
  onboardingInProgress: number;
  activeExitProcesses: number;
  openResolutionCases: number;
  averagePerformance: number;
  globalReach: {
    targetCountries: string[];
    currentReach: string[];
  };
}

export default function HRDeputyCEOPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [founders, setFounders] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // New onboarding form
  const [onboardingForm, setOnboardingForm] = useState({
    name: '',
    role: '',
    email: '',
    startDate: '',
    salary: '',
    employmentType: 'full-time'
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load dashboard stats
      const statsRes = await fetch('http://localhost:4091/api/hr-ai/dashboard');
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Load employees
      const empRes = await fetch('http://localhost:4091/api/hr-ai/employees');
      const empData = await empRes.json();
      if (empData.success) {
        setEmployees(empData.employees);
      }

      // Load founders
      const foundersRes = await fetch('http://localhost:4091/api/hr-ai/founders');
      const foundersData = await foundersRes.json();
      if (foundersData.success) {
        setFounders(foundersData.founders);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
      
      // Demo data fallback
      setStats({
        totalEmployees: 5,
        totalFounders: 5,
        activeTasks: 23,
        completedTasks: 147,
        onboardingInProgress: 2,
        activeExitProcesses: 0,
        openResolutionCases: 1,
        averagePerformance: 0.89,
        globalReach: {
          targetCountries: ['ZA', 'ZW', 'BW', 'MZ', 'NA', 'ZM', 'US', 'UK', 'NG', 'KE'],
          currentReach: ['ZA']
        }
      });
    }
  };

  const loadEmployeeTasks = async (employeeId: string) => {
    try {
      const res = await fetch(`http://localhost:4091/api/hr-ai/tasks/${employeeId}`);
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    }
  };

  const loadEmployeePerformance = async (employeeId: string) => {
    try {
      const res = await fetch(`http://localhost:4091/api/hr-ai/performance/${employeeId}`);
      const data = await res.json();
      if (data.success) {
        setPerformanceData(data.performance);
      }
    } catch (error) {
      console.error('Error loading performance:', error);
    }
  };

  const conductPerformanceReview = async (employeeId: string) => {
    try {
      toast.loading('HR AI Deputy CEO conducting performance review...');
      const res = await fetch(`http://localhost:4091/api/hr-ai/performance/${employeeId}/review`, {
        method: 'POST'
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Performance review completed!');
        loadEmployeePerformance(employeeId);
        loadDashboardData();
      }
    } catch (error) {
      toast.error('Failed to conduct review');
    }
  };

  const startOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      toast.loading('HR AI Deputy CEO starting onboarding...');
      const res = await fetch('http://localhost:4091/api/hr-ai/onboarding/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(onboardingForm)
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Automated onboarding started!');
        setOnboardingForm({
          name: '',
          role: '',
          email: '',
          startDate: '',
          salary: '',
          employmentType: 'full-time'
        });
        loadDashboardData();
      }
    } catch (error) {
      toast.error('Failed to start onboarding');
    }
  };

  const assignTask = async (employeeId: string, taskData: any) => {
    try {
      toast.loading('HR AI Deputy CEO assigning task...');
      const res = await fetch('http://localhost:4091/api/hr-ai/tasks/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, taskData })
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Task assigned!');
        loadEmployeeTasks(employeeId);
        loadDashboardData();
      }
    } catch (error) {
      toast.error('Failed to assign task');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.90) return 'text-green-400';
    if (score >= 0.75) return 'text-blue-400';
    if (score >= 0.60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 0.90) return 'bg-green-500/20 border-green-500/50';
    if (score >= 0.75) return 'bg-blue-500/20 border-blue-500/50';
    if (score >= 0.60) return 'bg-yellow-500/20 border-yellow-500/50';
    return 'bg-red-500/20 border-red-500/50';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-pulse" />
          <p className="text-white text-xl">HR AI Deputy CEO initializing...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Brain className="w-10 h-10 text-purple-400" />
              HR AI Deputy CEO
            </h1>
            <p className="text-gray-300">Autonomous Human Resources Management System</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Average Performance</p>
              <p className={`text-2xl font-bold ${getScoreColor(stats?.averagePerformance || 0)}`}>
                {((stats?.averagePerformance || 0) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="h-12 w-px bg-white/20" />
            <div className="text-right">
              <p className="text-sm text-gray-400">Global Reach</p>
              <p className="text-2xl font-bold text-blue-400">
                {stats?.globalReach.currentReach.length || 1}/{stats?.globalReach.targetCountries.length || 10}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6"
        >
          <Users className="w-8 h-8 text-blue-400 mb-3" />
          <p className="text-gray-400 text-sm mb-1">Total Employees</p>
          <p className="text-3xl font-bold text-white">{stats?.totalEmployees || 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6"
        >
          <Target className="w-8 h-8 text-purple-400 mb-3" />
          <p className="text-gray-400 text-sm mb-1">Active Tasks</p>
          <p className="text-3xl font-bold text-white">{stats?.activeTasks || 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6"
        >
          <CheckCircle className="w-8 h-8 text-green-400 mb-3" />
          <p className="text-gray-400 text-sm mb-1">Completed Tasks</p>
          <p className="text-3xl font-bold text-white">{stats?.completedTasks || 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6"
        >
          <Globe className="w-8 h-8 text-cyan-400 mb-3" />
          <p className="text-gray-400 text-sm mb-1">Onboarding</p>
          <p className="text-3xl font-bold text-white">{stats?.onboardingInProgress || 0}</p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['dashboard', 'founders', 'employees', 'onboarding', 'compliance', 'compensation', 'recruitment', 'expansion'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 rounded-xl font-semibold transition-all text-sm ${
              activeTab === tab
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 gap-6"
        >
          {/* AI Insights */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-400" />
              AI Insights
            </h3>
            <div className="space-y-4">
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-green-400 mt-1" />
                  <div>
                    <p className="text-green-400 font-semibold">Performance Trending Up</p>
                    <p className="text-gray-300 text-sm mt-1">
                      Team performance increased by 12% this quarter
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-blue-400 mt-1" />
                  <div>
                    <p className="text-blue-400 font-semibold">High Task Velocity</p>
                    <p className="text-gray-300 text-sm mt-1">
                      {stats?.completedTasks || 0} tasks completed with 94% on-time rate
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mt-1" />
                  <div>
                    <p className="text-yellow-400 font-semibold">Expansion Ready</p>
                    <p className="text-gray-300 text-sm mt-1">
                      9 target markets identified for global expansion
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-6 h-6 text-cyan-400" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {[
                { icon: CheckCircle, text: 'Performance review completed for Operations Lead', time: '2 mins ago', color: 'text-green-400' },
                { icon: UserPlus, text: 'New task assigned to Sales Lead', time: '15 mins ago', color: 'text-blue-400' },
                { icon: Award, text: 'Achievement granted: Exceptional Performance', time: '1 hour ago', color: 'text-purple-400' },
                { icon: Target, text: 'Global expansion task created for US market', time: '2 hours ago', color: 'text-cyan-400' },
                { icon: FileText, text: 'Contract generated for new employee', time: '3 hours ago', color: 'text-yellow-400' }
              ].map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                  <activity.icon className={`w-5 h-5 ${activity.color} mt-0.5`} />
                  <div className="flex-1">
                    <p className="text-white text-sm">{activity.text}</p>
                    <p className="text-gray-400 text-xs mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'founders' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6"
        >
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Award className="w-7 h-7 text-purple-400" />
            Founder Performance Tracking
          </h3>

          <div className="space-y-4">
            {founders.map((founder) => (
              <div key={founder.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-white">{founder.name}</h4>
                    <p className="text-gray-400">{founder.role}</p>
                    {founder.equity && (
                      <p className="text-purple-400 text-sm mt-1">{founder.equity}% Equity</p>
                    )}
                  </div>
                  <div className={`px-4 py-2 rounded-lg border ${getScoreBg(founder.performance.score)}`}>
                    <p className={`text-2xl font-bold ${getScoreColor(founder.performance.score)}`}>
                      {(founder.performance.score * 100).toFixed(1)}%
                    </p>
                    <p className="text-gray-400 text-xs mt-1">Performance</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => {
                      setSelectedEmployee(founder.id);
                      loadEmployeeTasks(founder.id);
                      loadEmployeePerformance(founder.id);
                    }}
                    className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 py-2 px-4 rounded-lg transition-all"
                  >
                    <Eye className="w-4 h-4 inline mr-2" />
                    View Tasks
                  </button>
                  <button
                    onClick={() => conductPerformanceReview(founder.id)}
                    className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-400 py-2 px-4 rounded-lg transition-all"
                  >
                    <BarChart3 className="w-4 h-4 inline mr-2" />
                    Review Performance
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'employees' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6"
        >
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-400" />
            Employee Management
          </h3>

          {employees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No employees yet. Start onboarding!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {employees.map((employee) => (
                <div key={employee.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xl font-bold text-white">{employee.name}</h4>
                      <p className="text-gray-400">{employee.role}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-lg border ${getScoreBg(employee.performance.score)}`}>
                      <p className={`text-xl font-bold ${getScoreColor(employee.performance.score)}`}>
                        {(employee.performance.score * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'onboarding' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6"
        >
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <UserPlus className="w-7 h-7 text-green-400" />
            Automated Onboarding
          </h3>

          <form onSubmit={startOnboarding} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={onboardingForm.name}
                  onChange={(e) => setOnboardingForm({ ...onboardingForm, name: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Role</label>
                <select
                  value={onboardingForm.role}
                  onChange={(e) => setOnboardingForm({ ...onboardingForm, role: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="Driver">Driver</option>
                  <option value="Fleet Manager">Fleet Manager</option>
                  <option value="Compliance Officer">Compliance Officer</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Developer">Developer</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={onboardingForm.email}
                  onChange={(e) => setOnboardingForm({ ...onboardingForm, email: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Start Date</label>
                <input
                  type="date"
                  value={onboardingForm.startDate}
                  onChange={(e) => setOnboardingForm({ ...onboardingForm, startDate: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all"
            >
              Start Automated Onboarding
            </button>
          </form>

          <div className="mt-8 bg-blue-500/20 border border-blue-500/50 rounded-xl p-6">
            <h4 className="text-lg font-bold text-blue-400 mb-3">Onboarding Process</h4>
            <div className="space-y-2 text-gray-300">
              <p>✅ Personal info collection</p>
              <p>✅ Role & responsibilities assignment</p>
              <p>✅ Contract generation</p>
              <p>✅ E-signature collection</p>
              <p>✅ System access setup</p>
              <p>✅ Task assignment</p>
              <p>✅ Performance tracking activation</p>
              <p>✅ Welcome & orientation</p>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'compliance' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="w-7 h-7 text-green-400" />
              CCMA & Labour Law Compliance
            </h3>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4">
                <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
                <p className="text-sm text-gray-400">Compliance Status</p>
                <p className="text-2xl font-bold text-green-400">100%</p>
              </div>
              <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4">
                <AlertTriangle className="w-8 h-8 text-blue-400 mb-2" />
                <p className="text-sm text-gray-400">Active Warnings</p>
                <p className="text-2xl font-bold text-blue-400">0</p>
              </div>
              <div className="bg-purple-500/20 border border-purple-500/50 rounded-xl p-4">
                <FileText className="w-8 h-8 text-purple-400 mb-2" />
                <p className="text-sm text-gray-400">Unfair Dismissals</p>
                <p className="text-2xl font-bold text-purple-400">0</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xl font-bold text-white mb-3">Compliance Framework</h4>
              
              <div className="bg-white/5 rounded-xl p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white font-semibold">CCMA Compliant</span>
                </div>
                <p className="text-gray-300 text-sm ml-8">✓ Minimum 3 written warnings before dismissal</p>
                <p className="text-gray-300 text-sm ml-8">✓ 6-month warning validity period</p>
                <p className="text-gray-300 text-sm ml-8">✓ 30-day Performance Improvement Plans</p>
                <p className="text-gray-300 text-sm ml-8">✓ Disciplinary hearings mandatory</p>
                <p className="text-gray-300 text-sm ml-8">✓ Full documentation & appeal rights</p>
              </div>

              <div className="bg-white/5 rounded-xl p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white font-semibold">Labour Relations Act (LRA)</span>
                </div>
                <p className="text-gray-300 text-sm ml-8">✓ Procedural fairness enforced</p>
                <p className="text-gray-300 text-sm ml-8">✓ Substantive fairness verified</p>
                <p className="text-gray-300 text-sm ml-8">✓ Unfair dismissal protection</p>
              </div>

              <div className="bg-white/5 rounded-xl p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white font-semibold">Basic Conditions of Employment Act (BCEA)</span>
                </div>
                <p className="text-gray-300 text-sm ml-8">✓ 45-hour work week maximum</p>
                <p className="text-gray-300 text-sm ml-8">✓ 21 days annual leave</p>
                <p className="text-gray-300 text-sm ml-8">✓ Fair remuneration</p>
              </div>

              <div className="bg-white/5 rounded-xl p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white font-semibold">Employment Equity Act (EEA)</span>
                </div>
                <p className="text-gray-300 text-sm ml-8">✓ Equal opportunity enforced</p>
                <p className="text-gray-300 text-sm ml-8">✓ No discrimination</p>
                <p className="text-gray-300 text-sm ml-8">✓ Affirmative action compliance</p>
              </div>
            </div>

            <div className="mt-6 bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-6">
              <h4 className="text-lg font-bold text-yellow-400 mb-3">Automated Protection</h4>
              <p className="text-gray-300 text-sm">
                🛡️ The HR AI Deputy CEO automatically blocks any dismissal that does not meet CCMA standards.
                All exit processes are verified for compliance before execution, protecting the company from
                unfair dismissal claims and CCMA fees.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'compensation' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Award className="w-7 h-7 text-yellow-400" />
              Compensation Analysis & Fair Pay
            </h3>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4">
                <TrendingUp className="w-8 h-8 text-green-400 mb-2" />
                <p className="text-sm text-gray-400">Avg. Market Position</p>
                <p className="text-2xl font-bold text-green-400">96%</p>
              </div>
              <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4">
                <CheckCircle className="w-8 h-8 text-blue-400 mb-2" />
                <p className="text-sm text-gray-400">Fair Compensation</p>
                <p className="text-2xl font-bold text-blue-400">100%</p>
              </div>
              <div className="bg-purple-500/20 border border-purple-500/50 rounded-xl p-4">
                <Award className="w-8 h-8 text-purple-400 mb-2" />
                <p className="text-sm text-gray-400">Bonus Eligible</p>
                <p className="text-2xl font-bold text-purple-400">4</p>
              </div>
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4">
                <Briefcase className="w-8 h-8 text-yellow-400 mb-2" />
                <p className="text-sm text-gray-400">Equity Grants</p>
                <p className="text-2xl font-bold text-yellow-400">3</p>
              </div>
            </div>

            <h4 className="text-xl font-bold text-white mb-4">Compensation Analysis Factors</h4>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-gray-300 mb-2">📊 Performance Score (30%)</p>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-blue-500" style={{ width: '30%' }}></div>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-gray-300 mb-2">⏱️ Experience (20%)</p>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: '20%' }}></div>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-gray-300 mb-2">🎯 Skills Match (20%)</p>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: '20%' }}></div>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-gray-300 mb-2">💼 Market Position (15%)</p>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-pink-500 to-red-500" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>

            <h4 className="text-xl font-bold text-white mb-4">Market Salary Data (South Africa)</h4>
            <div className="space-y-3">
              {[
                { role: 'CEO & Founder', median: 'R1,200,000', range: 'R800K - R2M' },
                { role: 'Sales Lead', median: 'R600,000', range: 'R400K - R900K' },
                { role: 'Operations Lead', median: 'R550,000', range: 'R400K - R800K' },
                { role: 'Fleet Manager', median: 'R420,000', range: 'R300K - R600K' },
                { role: 'Developer', median: 'R600,000', range: 'R400K - R900K' },
                { role: 'Driver', median: 'R180,000', range: 'R120K - R250K' }
              ].map((item, idx) => (
                <div key={idx} className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-white font-semibold">{item.role}</span>
                  <div className="text-right">
                    <p className="text-green-400 font-bold">{item.median}</p>
                    <p className="text-gray-400 text-sm">{item.range}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-blue-500/20 border border-blue-500/50 rounded-xl p-6">
              <h4 className="text-lg font-bold text-blue-400 mb-3">Fair Pay Guarantees</h4>
              <div className="space-y-2 text-gray-300">
                <p>✓ Equal pay for equal work (EEA compliant)</p>
                <p>✓ No gender pay gap</p>
                <p>✓ Market-aligned salaries (70-130% of median)</p>
                <p>✓ 15% performance bonus for top performers (≥85% score)</p>
                <p>✓ Equity grants for exceptional contributors</p>
                <p>✓ Minimum 6% annual increase (cost of living)</p>
                <p>✓ Annual compensation reviews mandatory</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'recruitment' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <UserPlus className="w-7 h-7 text-blue-400" />
              AI-Powered Recruitment System
            </h3>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4">
                <FileText className="w-8 h-8 text-blue-400 mb-2" />
                <p className="text-sm text-gray-400">Applications</p>
                <p className="text-2xl font-bold text-blue-400">0</p>
              </div>
              <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4">
                <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
                <p className="text-sm text-gray-400">Strong Fit</p>
                <p className="text-2xl font-bold text-green-400">0</p>
              </div>
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4">
                <Activity className="w-8 h-8 text-yellow-400 mb-2" />
                <p className="text-sm text-gray-400">Interviews</p>
                <p className="text-2xl font-bold text-yellow-400">0</p>
              </div>
              <div className="bg-purple-500/20 border border-purple-500/50 rounded-xl p-4">
                <Award className="w-8 h-8 text-purple-400 mb-2" />
                <p className="text-sm text-gray-400">Hires</p>
                <p className="text-2xl font-bold text-purple-400">0</p>
              </div>
            </div>

            <h4 className="text-xl font-bold text-white mb-4">AI Scoring Criteria</h4>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-gray-300 mb-2 font-semibold">🎯 Experience Match (35%)</p>
                <p className="text-gray-400 text-sm">Years of relevant experience vs. requirements</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-gray-300 mb-2 font-semibold">💡 Skills Match (30%)</p>
                <p className="text-gray-400 text-sm">Technical & soft skills alignment</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-gray-300 mb-2 font-semibold">🎓 Education (15%)</p>
                <p className="text-gray-400 text-sm">PhD, Masters, Bachelor, Diploma scoring</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-gray-300 mb-2 font-semibold">🤝 Culture Fit (10%)</p>
                <p className="text-gray-400 text-sm">Values alignment assessment</p>
              </div>
            </div>

            <h4 className="text-xl font-bold text-white mb-4">Recommendation Thresholds</h4>
            <div className="space-y-3">
              <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-green-400 font-bold text-lg">≥85% - STRONG FIT</p>
                  <p className="text-gray-300 text-sm">Schedule interview immediately</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4 flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-blue-400 font-bold text-lg">≥70% - GOOD FIT</p>
                  <p className="text-gray-300 text-sm">Schedule interview</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-400" />
              </div>
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-yellow-400 font-bold text-lg">≥55% - POTENTIAL FIT</p>
                  <p className="text-gray-300 text-sm">Consider for interview</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-400" />
              </div>
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-red-400 font-bold text-lg">&lt;55% - NOT RECOMMENDED</p>
                  <p className="text-gray-300 text-sm">Does not meet requirements</p>
                </div>
                <UserMinus className="w-8 h-8 text-red-400" />
              </div>
            </div>

            <div className="mt-6 bg-purple-500/20 border border-purple-500/50 rounded-xl p-6">
              <h4 className="text-lg font-bold text-purple-400 mb-3">Bias-Free Recruitment</h4>
              <div className="space-y-2 text-gray-300">
                <p>✓ Name anonymization during initial screening</p>
                <p>✓ Age, gender, and race-blind assessment</p>
                <p>✓ Objective criteria only</p>
                <p>✓ Structured interviews with consistent questions</p>
                <p>✓ Multiple interviewers for fairness</p>
                <p>✓ Board recommendations automated</p>
                <p>✓ CEO & Board notified of strong candidates (≥80%)</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'expansion' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6"
        >
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Globe className="w-7 h-7 text-cyan-400" />
            Global Expansion Strategy
          </h3>

          <div className="grid grid-cols-5 gap-3 mb-8">
            {stats?.globalReach.targetCountries.map((country) => (
              <div
                key={country}
                className={`p-4 rounded-lg border ${
                  stats.globalReach.currentReach.includes(country)
                    ? 'bg-green-500/20 border-green-500/50'
                    : 'bg-white/5 border-white/20'
                }`}
              >
                <p className={`text-2xl font-bold text-center ${
                  stats.globalReach.currentReach.includes(country)
                    ? 'text-green-400'
                    : 'text-gray-400'
                }`}>
                  {country}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h4 className="text-xl font-bold text-white mb-4">Expansion Tasks</h4>
            {['US', 'UK', 'NG', 'KE'].map((country, idx) => (
              <div key={idx} className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h5 className="text-lg font-bold text-white mb-3">{country} Market Entry</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                    <p className="text-gray-300">Research logistics market</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                    <p className="text-gray-300">Identify key partners</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                    <p className="text-gray-300">Adapt platform for regulations</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                    <p className="text-gray-300">Launch pilot program</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
