import { motion } from 'framer-motion';

interface TabButtonProps {
    label: string;
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const TabButton = ({ label, activeTab, setActiveTab }: TabButtonProps) => {
    const isActive = activeTab === label.toLowerCase();
    return (
        <motion.button
            onClick={() => setActiveTab(label.toLowerCase())}
            className={`relative px-4 py-2.5 rounded-lg font-semibold transition-colors text-sm whitespace-nowrap ${isActive
                    ? 'text-white'
                    : 'text-cyan-200/80 hover:bg-cyan-500/10 hover:text-cyan-100'
                }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            {isActive && (
                <motion.div
                    layoutId="hr-tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
            )}
            {label}
        </motion.button>
    );
};

export default TabButton;
