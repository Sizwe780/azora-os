import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

const PageHeader = ({ icon: Icon, title, subtitle }: PageHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3 tracking-tight">
            <Icon className="w-10 h-10 text-cyan-400" />
            {title}
          </h1>
          <p className="text-cyan-200/80">{subtitle}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default PageHeader;
