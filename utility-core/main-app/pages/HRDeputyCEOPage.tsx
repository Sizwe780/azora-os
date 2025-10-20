import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { getHRDeputyCEOData, Person } from '../features/hr-deputy/mockData';
import StatCard from '../components/hr-deputy/StatCard';
import TabButton from '../components/hr-deputy/TabButton';
import PersonCard from '../components/hr-deputy/PersonCard';
import DashboardContent from '../components/hr-deputy/DashboardContent';
import { Brain, Users, Target, CheckCircle, UserPlus, Award, Search } from 'lucide-react';

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
        switch (activeTab.toLowerCase()) {
            case 'founders':
            case 'employees':
                const isFounders = activeTab.toLowerCase() === 'founders';
                const data: Person[] = isFounders ? filteredFounders : filteredEmployees;
                const title = isFounders ? 'Founder Performance' : 'Employee Management';
                const Icon = isFounders ? Award : Users;
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                <Icon className={`w-7 h-7 text-${isFounders ? 'purple' : 'blue'}-400`} />
                                {title}
                            </h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-gray-950/70 border border-cyan-500/20 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all backdrop-blur-md"
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
            case 'dashboard':
            default:
                return <DashboardContent tasks={tasks} stats={stats} />;
        }
    };

    return (
        <>
            <Helmet>
                <title>HR AI Deputy CEO | Azora</title>
            </Helmet>
            <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-6 lg:p-8">
                <div className="absolute inset-0 -z-10 h-full w-full bg-gray-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                <div className="absolute top-0 left-0 -z-10 h-1/3 w-full bg-gradient-to-b from-purple-500/20 to-transparent"></div>

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3 tracking-tight">
                                <Brain className="w-10 h-10 text-purple-400" />
                                HR AI Deputy CEO
                            </h1>
                            <p className="text-cyan-200/80">Autonomous Human Resources & Performance Orchestrator</p>
                        </div>
                        <div className="flex items-center gap-4 bg-gray-950/70 border border-cyan-500/20 rounded-xl p-4 backdrop-blur-md">
                            <div className="text-right">
                                <p className="text-sm text-cyan-200/80">Avg. Performance</p>
                                <p className={`text-2xl font-bold ${getScoreColor(stats.averagePerformance)}`}>
                                    {(stats.averagePerformance * 100).toFixed(1)}%
                                </p>
                            </div>
                            <div className="h-12 w-px bg-cyan-500/20" />
                            <div className="text-right">
                                <p className="text-sm text-cyan-200/80">Global Reach</p>
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

                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                    {['Dashboard', 'Founders', 'Employees', 'Onboarding', 'Compliance', 'Compensation', 'Recruitment', 'Expansion'].map((tab) => (
                        <TabButton key={tab} label={tab} activeTab={activeTab} setActiveTab={setActiveTab} />
                    ))}
                </div>

                <div className="bg-gray-950/70 border border-cyan-500/20 rounded-2xl p-6 min-h-[400px] backdrop-blur-lg shadow-2xl shadow-cyan-500/5">
                    {renderContent()}
                </div>
            </div>
        </>
    );
}

export default HRDeputyCEOPage;