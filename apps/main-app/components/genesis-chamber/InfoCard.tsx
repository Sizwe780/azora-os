import { motion } from 'framer-motion';
import { ElementType } from 'react';

interface InfoCardProps {
  icon: ElementType;
  title: string;
  children: React.ReactNode;
  color: string;
}

const InfoCard = ({ icon: Icon, title, children, color }: InfoCardProps) => (
  <motion.div
    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
    className={`bg-gray-900/50 border border-${color}-500/30 rounded-xl p-6 shadow-lg backdrop-blur-sm`}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className={`p-2 bg-${color}-500/10 rounded-full`}>
        <Icon className={`w-6 h-6 text-${color}-400`} />
      </div>
      <h3 className="font-bold text-lg text-white">{title}</h3>
    </div>
    <div className="text-gray-300 space-y-2">{children}</div>
  </motion.div>
);

export default InfoCard;
