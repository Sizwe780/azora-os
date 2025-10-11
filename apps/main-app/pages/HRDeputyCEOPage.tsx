import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { getHRDeputyCEOData, ICONS, Person, Task } from '../features/hr-deputy/mockData';
import StatCard from '../components/hr-deputy/StatCard';
import TabButton from '../components/hr-deputy/TabButton';
import PersonCard from '../components/hr-deputy/PersonCard';
import DashboardContent from '../components/hr-deputy/DashboardContent';

const { Brain, Users, Target, CheckCircle, UserPlus, Award, Search } = ICONS;

const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-green-400';
    if (score >= 0.8) return 'text-blue-400';
    if (score >= 0.7) return 'text-yellow-400';
    return 'text-red-400';
};

const HRDeputyCEOPage = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { founders, employees, tasks, stats } = getHRDeputyCEOData();

    const handleSelectPerson = (id: string) => {
        setSelectedPerson(selectedPerson === id ? null : id);
    };

    const filteredFounders = useMemo(() =>
        founders.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())),
        [founders, searchTerm]
    );

    const filteredEmployees = useMemo(() =>
        employees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase())),
        [employees, searchTerm]
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'founders':
            case 'employees':
                const data: Person[] = activeTab === 'founders' ? filteredFounders : filteredEmployees;
                const title = activeTab === 'founders' ? 'Founder Performance' : 'Employee Management';
                const Icon = activeTab === 'founders' ? Award : Users;
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                <Icon className={`w-7 h-7 text-${activeTab === 'founders' ? 'purple' : 'blue'}-400`} />
                                {title}
                            </h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-gray-900/50 border border-gray-700/50 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {data.map(person => (
                                <PersonCard
                                    key={person.id}
                                    person={person}
                                    tasks={tasks[person.id] || []}
                                    onSelect={handleSelectPerson}
                                    isSelected={selectedPerson === person.id}
                                />
                            ))}
                        </div>
                    </motion.div>
                );
            default:
                return <DashboardContent />;
        }
    };

    return (
        <>
            <Helmet>
                <title>HR AI Deputy CEO | Azora</title>
            </Helmet>
            <div className="min-h-screen bg-transparent text-white p-4 sm:p-6 lg:p-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                                <Brain className="w-10 h-10 text-purple-400" />
                                HR AI Deputy CEO
                            </h1>
                            <p className="text-gray-400">Autonomous Human Resources & Performance Orchestrator</p>
                        </div>
                        <div className="flex items-center gap-4 bg-gray-900/50 border border-gray-700/50 rounded-xl p-4 backdrop-blur-sm">
                            <div className="text-right">
                                <p className="text-sm text-gray-400">Avg. Performance</p>
                                <p className={`text-2xl font-bold ${getScoreColor(stats.averagePerformance)}`}>
                                    {(stats.averagePerformance * 100).toFixed(1)}%
                                </p>
                            </div>
                            <div className="h-12 w-px bg-gray-700" />
                            <div className="text-right">
                                <p className="text-sm text-gray-400">Global Reach</p>
                                <p className="text-2xl font-bold text-blue-400">
                                    {stats.globalReach.currentReach.length}/{stats.globalReach.targetCountries.length}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                >
                    <StatCard icon={Users} label="Total Workforce" value={stats.totalEmployees + stats.totalFounders} color="blue" />
                    <StatCard icon={Target} label="Active Tasks" value={stats.activeTasks} color="purple" />
                    <StatCard icon={CheckCircle} label="Completed Tasks" value={stats.completedTasks} color="green" />
                    <StatCard icon={UserPlus} label="Onboarding" value={stats.onboardingInProgress} color="cyan" />
                </motion.div>

                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['Dashboard', 'Founders', 'Employees', 'Onboarding', 'Compliance', 'Compensation', 'Recruitment', 'Expansion'].map((tab) => (
                        <TabButton key={tab} label={tab} activeTab={activeTab} setActiveTab={setActiveTab} />
                    ))}
                </div>

                <div className="bg-gray-900/30 border border-gray-700/50 rounded-2xl p-6 min-h-[400px] backdrop-blur-lg">
                    {renderContent()}
                </div>
            </div>
        </>
    );
}

export default HRDeputyCEOPage;


// --- MAIN PAGE COMPONENT ---

export default function HRDeputyCEOPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSelectPerson = (id) => {
    setSelectedPerson(selectedPerson === id ? null : id);
  };

  const filteredFounders = useMemo(() => 
    mockFounders.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [searchTerm]
  );

  const filteredEmployees = useMemo(() =>
    mockEmployees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [searchTerm]
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'founders':
      case 'employees':
        const data = activeTab === 'founders' ? filteredFounders : filteredEmployees;
        const title = activeTab === 'founders' ? 'Founder Performance' : 'Employee Management';
        const icon = activeTab === 'founders' ? Award : Users;
        return (
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <Icon className={`w-7 h-7 text-${activeTab === 'founders' ? 'purple' : 'blue'}-400`} iconNode={[]} />
                {title}
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-900/50 border border-gray-700/50 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {data.map(person => (
                <PersonCard 
                  key={person.id} 
                  person={person} 
                  onSelect={handleSelectPerson}
                  isSelected={selectedPerson === person.id}
                />
              ))}
            </div>
          </motion.div>
        );
      // Add other tab cases here
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Brain className="w-10 h-10 text-purple-400" />
              HR AI Deputy CEO
            </h1>
            <p className="text-gray-400">Autonomous Human Resources & Performance Orchestrator</p>
          </div>
          <div className="flex items-center gap-4 bg-gray-900/50 border border-gray-700/50 rounded-xl p-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Avg. Performance</p>
              <p className={`text-2xl font-bold ${getScoreColor(mockStats.averagePerformance)}`}>
                {(mockStats.averagePerformance * 100).toFixed(1)}%
              </p>
            </div>
            <div className="h-12 w-px bg-gray-700" />
            <div className="text-right">
              <p className="text-sm text-gray-400">Global Reach</p>
              <p className="text-2xl font-bold text-blue-400">
                {mockStats.globalReach.currentReach.length}/{mockStats.globalReach.targetCountries.length}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <StatCard icon={Users} label="Total Workforce" value={mockStats.totalEmployees + mockStats.totalFounders} color="blue" />
        <StatCard icon={Target} label="Active Tasks" value={mockStats.activeTasks} color="purple" />
        <StatCard icon={CheckCircle} label="Completed Tasks" value={mockStats.completedTasks} color="green" />
        <StatCard icon={UserPlus} label="Onboarding" value={mockStats.onboardingInProgress} color="cyan" />
      </motion.div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['Dashboard', 'Founders', 'Employees', 'Onboarding', 'Compliance', 'Compensation', 'Recruitment', 'Expansion'].map((tab) => (
          <TabButton key={tab} label={tab} activeTab={activeTab} setActiveTab={setActiveTab} />
        ))}
      </div>

      <div className="bg-gray-900/30 border border-gray-700/50 rounded-2xl p-6 min-h-[400px]">
        {renderContent()}
      </div>
    </div>
  );
}

const DashboardContent = () => {
  const insights = [
    { icon: TrendingUp, text: 'Performance Trending Up', detail: 'Team performance increased by 12% this quarter.', color: 'green' },
    { icon: Zap, text: 'High Task Velocity', detail: `${mockStats.completedTasks} tasks completed with 94% on-time rate.`, color: 'blue' },
    { icon: AlertTriangle, text: 'Expansion Ready', detail: '9 target markets identified for global expansion.', color: 'yellow' },
  ];

  const activities = [
    { icon: CheckCircle, text: 'Performance review completed for Operations Lead', time: '2 mins ago', color: 'green' },
    { icon: UserPlus, text: 'New task assigned to Sales Lead', time: '15 mins ago', color: 'blue' },
    { icon: Award, text: 'Achievement granted: Exceptional Performance', time: '1 hour ago', color: 'purple' },
    { icon: Target, text: 'Global expansion task created for US market', time: '2 hours ago', color: 'cyan' },
    { icon: FileText, text: 'Contract generated for new employee', time: '3 hours ago', color: 'yellow' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-400" />
          AI Insights
        </h3>
        <div className="space-y-4">
          {insights.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-${item.color}-500/10 border border-${item.color}-500/30 rounded-lg p-4 flex items-start gap-3`}
            >
              <item.icon className={`w-5 h-5 text-${item.color}-400 mt-1 flex-shrink-0`} />
              <div>
                <p className={`text-${item.color}-400 font-semibold`}>{item.text}</p>
                <p className="text-gray-300 text-sm mt-1">{item.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-cyan-400" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {activities.map((activity, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg"
            >
              <activity.icon className={`w-5 h-5 text-${activity.color}-400 mt-0.5 flex-shrink-0`} />
              <div className="flex-1">
                <p className="text-white text-sm">{activity.text}</p>
                <p className="text-gray-400 text-xs mt-1">{activity.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};