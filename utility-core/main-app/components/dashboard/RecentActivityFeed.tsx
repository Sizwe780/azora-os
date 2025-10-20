import { motion } from 'framer-motion';
import { RecentActivityData } from '../../features/dashboard/mockDashboardData';
import { ArrowRight } from 'lucide-react';

const RecentActivityFeed = ({ activities }: { activities: RecentActivityData[] }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.6, duration: 0.4 }}
    className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
  >
    <h3 className="text-xl font-bold text-white mb-4">Live Activity Feed</h3>
    <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 + index * 0.1 }}
          className="flex items-start gap-4"
        >
          <div className="flex-shrink-0 mt-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
          <div className="flex-grow">
            <p className="text-sm text-white">
              <span className="font-semibold text-cyan-300">{activity.user}</span>: {activity.action}
            </p>
            <p className="text-xs text-gray-400">{activity.details}</p>
          </div>
          <p className="text-xs text-gray-500 flex-shrink-0">{activity.timestamp}</p>
        </motion.div>
      ))}
    </div>
    <button className="w-full mt-4 text-sm font-semibold text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-2 group">
      View All Activity <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
    </button>
  </motion.div>
);

export default RecentActivityFeed;
