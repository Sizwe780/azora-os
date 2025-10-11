import { motion } from 'framer-motion';
import { ICONS, getHRDeputyCEOData } from '../../features/hr-deputy/mockData';

const { TrendingUp, Zap, AlertTriangle, Brain, Activity, CheckCircle, UserPlus, Award, Target, FileText } = ICONS;
const { stats } = getHRDeputyCEOData();

const DashboardContent = () => {
    const insights = [
        { icon: TrendingUp, text: 'Performance Trending Up', detail: 'Team performance increased by 12% this quarter.', color: 'green' },
        { icon: Zap, text: 'High Task Velocity', detail: `${stats.completedTasks} tasks completed with 94% on-time rate.`, color: 'blue' },
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

export default DashboardContent;
