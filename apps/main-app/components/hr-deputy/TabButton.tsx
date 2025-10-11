interface TabButtonProps {
    label: string;
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const TabButton = ({ label, activeTab, setActiveTab }: TabButtonProps) => (
    <button
        onClick={() => setActiveTab(label.toLowerCase())}
        className={`px-4 py-2.5 rounded-lg font-semibold transition-all text-sm whitespace-nowrap ${activeTab === label.toLowerCase()
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/80'
            }`}
    >
        {label}
    </button>
);

export default TabButton;
