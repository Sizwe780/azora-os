import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { ICONS, Stats } from '../../features/hr-deputy/mockData';

const { TrendingUp, Zap, AlertTriangle, Brain, Activity, CheckCircle, UserPlus, Award, Target, FileText } = ICONS;

interface DashboardContentProps {
  stats: Stats;
  tasks: any; // Using any for now as tasks structure is complex and not fully used here
}

const InsightCard: React.FC<{icon: LucideIcon, text: string, detail: string, color: string}> = ({ icon: Icon, text, detail, color }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`bg-${color}-500/10 border border-${color}-500/20 rounded-lg p-4 flex items-start gap-4 shadow-lg shadow-${color}-500/5`}
    >
        <Icon className={`w-6 h-6 text-${color}-400 mt-1 flex-shrink-0`} />
        <div>
            <p className={`text-${color}-300 font-semibold`}>{text}</p>
            <p className="text-cyan-200/80 text-sm mt-1">{detail}</p>
        </div>
    </motion.div>
);

const ActivityItem: React.FC<{icon: LucideIcon, text: string, time: string, color: string}> = ({ icon: Icon, text, time, color }) => (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-start gap-4 p-3 bg-cyan-500/5 rounded-lg border border-cyan-500/10"
    >
        <Icon className={`w-5 h-5 text-${color}-400 mt-0.5 flex-shrink-0`} />
        <div className="flex-1">
            <p className="text-white text-sm">{text}</p>
            <p className="text-gray-400 text-xs mt-1">{time}</p>
        </div>
    </motion.div>
);


const DashboardContent: React.FC<DashboardContentProps> = ({ stats }) => {
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
                <h3 className="text-xl font-bold text-cyan-100 mb-4 flex items-center gap-3">
                    <Brain className="w-6 h-6 text-purple-400" />
                    AI Insights
                </h3>
                <div className="space-y-4">
                    {insights.map((item, i) => (
                        <InsightCard key={i} {...item} />
                    ))}
                </div>
            </div>
            <div>
                <h3 className="text-xl font-bold text-cyan-100 mb-4 flex items-center gap-3">
                    <Activity className="w-6 h-6 text-cyan-400" />
                    Recent Activity
                </h3>
                <div className="space-y-3">
                    {activities.map((activity, i) => (
                       <ActivityItem key={i} {...activity} />
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default DashboardContent;
