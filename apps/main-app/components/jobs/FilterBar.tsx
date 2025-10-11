import React from 'react';
import { motion } from 'framer-motion';
import { Filter, Search } from 'lucide-react';
import { JobStatus } from '../../features/jobs/jobsBoard';

type FilterType = 'status' | 'priority';

interface FilterButtonProps {
  type: FilterType;
  value: string;
  currentFilter: string;
  onClick: (type: FilterType, value: string) => void;
  children: React.ReactNode;
}

const FilterButton: React.FC<FilterButtonProps> = ({ type, value, currentFilter, onClick, children }) => (
  <button
    onClick={() => onClick(type, value)}
    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${
      currentFilter === value 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'bg-gray-800/60 hover:bg-gray-700/80 text-gray-300'
    }`}
  >
    {children}
  </button>
);

interface FilterBarProps {
    filters: { status: JobStatus | 'all'; priority: string };
    setFilters: React.Dispatch<React.SetStateAction<{ status: JobStatus | 'all'; priority: string }>>;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters, searchTerm, setSearchTerm }) => {
    
    const handleFilterClick = (type: FilterType, value: string) => {
        setFilters(prev => ({ ...prev, [type]: value }));
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-black/20 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-4 mb-8 shadow-lg"
        >
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-gray-400">
                    <Filter className="w-5 h-5" />
                    <span className="font-semibold">Filters:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    <FilterButton type="status" value="all" currentFilter={filters.status} onClick={handleFilterClick}>All Statuses</FilterButton>
                    <FilterButton type="status" value="pending" currentFilter={filters.status} onClick={handleFilterClick}>Pending</FilterButton>
                    <FilterButton type="status" value="scheduled" currentFilter={filters.status} onClick={handleFilterClick}>Scheduled</FilterButton>
                    <FilterButton type="status" value="in_progress" currentFilter={filters.status} onClick={handleFilterClick}>In Progress</FilterButton>
                    <FilterButton type="status" value="completed" currentFilter={filters.status} onClick={handleFilterClick}>Completed</FilterButton>
                </div>
                <div className="w-px h-6 bg-gray-700 hidden md:block mx-2" />
                <div className="flex flex-wrap gap-2">
                    <FilterButton type="priority" value="all" currentFilter={filters.priority} onClick={handleFilterClick}>All Priorities</FilterButton>
                    <FilterButton type="priority" value="Critical" currentFilter={filters.priority} onClick={handleFilterClick}>Critical</FilterButton>
                    <FilterButton type="priority" value="High" currentFilter={filters.priority} onClick={handleFilterClick}>High</FilterButton>
                    <FilterButton type="priority" value="Medium" currentFilter={filters.priority} onClick={handleFilterClick}>Medium</FilterButton>
                </div>
                <div className="flex-grow relative min-w-[200px]">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search jobs by ID, title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg pl-11 pr-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
            </div>
        </motion.div>
    );
};
