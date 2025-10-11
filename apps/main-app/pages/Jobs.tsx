import React, { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { jobsBoard, Job, JobStatus } from '../features/jobs/jobsBoard';
import { JobCard } from '../components/jobs/JobCard';
import { FilterBar } from '../components/jobs/FilterBar';
import { Package, ServerCrash } from 'lucide-react';

import React, { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { jobsBoard, Job, JobStatus } from '../features/jobs/jobsBoard';
import { JobCard } from '../components/jobs/JobCard';
import { FilterBar } from '../components/jobs/FilterBar';
import { Package, ServerCrash } from 'lucide-react';

import React, { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { jobsBoard, Job, JobStatus } from '../features/jobs/jobsBoard';
import { JobCard } from '../components/jobs/JobCard';
import { FilterBar } from '../components/jobs/FilterBar';
import { Package, ServerCrash } from 'lucide-react';

const JobsPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ status: JobStatus | 'all'; priority: string }>({ status: 'all', priority: 'all' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadJobs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        const fetchedJobs = await jobsBoard.getJobs();
        setJobs(fetchedJobs);
      } catch (err) {
        console.error("Failed to load jobs:", err);
        setError("Failed to load job data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    loadJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs
      .filter(job => filters.status === 'all' || job.status === filters.status)
      .filter(job => filters.priority === 'all' || job.priority === filters.priority)
      .filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [jobs, filters, searchTerm]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  return (
    <>
      <Helmet>
        <title>Job Board | Azora</title>
        <meta name="description" content="Live operational tasks and assignments on the Azora platform." />
      </Helmet>
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen text-white bg-grid-gray-700/10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold tracking-tighter flex items-center gap-3">
              <Package className="w-9 h-9 text-blue-400" />
              Job Board
            </h1>
            <p className="text-gray-400 mt-1">Live operational tasks and assignments.</p>
          </div>
        </motion.div>

        <FilterBar 
          filters={filters}
          setFilters={setFilters}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {isLoading ? (
          <div className="text-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block p-4 bg-blue-500/10 rounded-full"
            >
              <Package className="w-12 h-12 text-blue-400" />
            </motion.div>
            <p className="mt-4 text-lg font-semibold">Loading Jobs...</p>
            <p className="text-gray-400">Connecting to the logistics network.</p>
          </div>
        ) : error ? (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 bg-red-900/20 border border-red-500/30 rounded-xl"
            >
                <ServerCrash className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-xl font-semibold text-red-300">Connection Error</p>
                <p className="text-gray-400 mt-2">{error}</p>
            </motion.div>
        ) : (
          <motion.div 
            layout 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <AnimatePresence>
              {filteredJobs.length > 0 ? (
                filteredJobs.map(job => <JobCard key={job.id} job={job} />)
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 bg-black/20 backdrop-blur-lg border border-gray-700/50 rounded-xl"
                >
                  <p className="text-xl font-semibold">No jobs match your criteria.</p>
                  <p className="text-gray-400 mt-2">Try adjusting your filters or search term.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default JobsPage;





const JobCard = ({ job }: { job: Job }) => {
  const priorityStyles = {
    Critical: 'border-red-500/50 bg-red-500/10 text-red-400',
    High: 'border-orange-500/50 bg-orange-500/10 text-orange-400',
    Medium: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400',
    Low: 'border-blue-500/50 bg-blue-500/10 text-blue-400',
  };

  const statusStyles: Record<JobStatus, string> = {
    in_progress: 'text-yellow-300',
    scheduled: 'text-blue-300',
    completed: 'text-green-300',
    canceled: 'text-red-400',
    pending: 'text-purple-300',
  };

  const statusIcons: Record<JobStatus, React.ElementType> = {
    in_progress: Zap,
    scheduled: Calendar,
    completed: CheckCircle,
    canceled: AlertTriangle,
    pending: Clock,
  };
  const StatusIcon = statusIcons[job.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-900/50 border border-gray-700/50 rounded-xl overflow-hidden"
    >
      <div className={`p-5 border-l-4 ${priorityStyles[job.priority].split(' ')[0]}`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg text-white">{job.title}</h3>
            <p className="text-sm text-gray-400">{job.description}</p>
          </div>
          <span className={`text-xs font-bold uppercase px-3 py-1 border rounded-full ${priorityStyles[job.priority]}`}>
            {job.priority}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <p className="text-gray-500 font-semibold text-xs mb-1">ROUTE</p>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="font-mono text-gray-300">{job.pickup.location}</span>
              <span className="text-gray-500">→</span>
              <span className="font-mono text-gray-300">{job.dropoff.location}</span>
            </div>
          </div>
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <p className="text-gray-500 font-semibold text-xs mb-1">CARGO</p>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">{job.cargo.type} ({job.cargo.weight})</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <StatusIcon className={`w-5 h-5 ${statusStyles[job.status]}`} />
            <span className={`font-semibold capitalize ${statusStyles[job.status]}`}>
              {job.status.replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            {job.assignedDriver?.name === 'AZORA AI' ? <Bot className="w-4 h-4 text-purple-400" /> : <User className="w-4 h-4" />}
            <span>{job.assignedDriver?.name || 'Unassigned'}</span>
            <span className="text-gray-600">|</span>
            <Truck className="w-4 h-4" />
            <span className="font-mono">{job.assignedVehicle.id}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const JobsPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<{ status: JobStatus | 'all'; priority: string }>({ status: 'all', priority: 'all' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadJobs = async () => {
      setIsLoading(true);
      try {
        const fetchedJobs = await jobsBoard.getJobs();
        setJobs(fetchedJobs);
      } catch (error) {
        console.error("Failed to load jobs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs
      .filter(job => filters.status === 'all' || job.status === filters.status)
      .filter(job => filters.priority === 'all' || job.priority === filters.priority)
      .filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [jobs, filters, searchTerm]);

  const FilterButton = ({ type, value, children }) => (
    <button
      onClick={() => setFilters(prev => ({ ...prev, [type]: value }))}
      className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
        filters[type] === value ? 'bg-blue-600 text-white' : 'bg-gray-800/60 hover:bg-gray-700/80 text-gray-300'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen text-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3"><Package className="w-9 h-9 text-blue-400" /> Job Board</h1>
          <p className="text-gray-400 mt-1">Live operational tasks and assignments.</p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-900/30 border border-gray-700/50 rounded-xl p-4 mb-8"
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Filter className="w-5 h-5" />
            <span className="font-semibold">Filters:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterButton type="status" value="all">All Statuses</FilterButton>
            <FilterButton type="status" value="pending">Pending</FilterButton>
            <FilterButton type="status" value="scheduled">Scheduled</FilterButton>
            <FilterButton type="status" value="in_progress">In Progress</FilterButton>
            <FilterButton type="status" value="completed">Completed</FilterButton>
          </div>
          <div className="w-px h-6 bg-gray-700 hidden md:block" />
          <div className="flex flex-wrap gap-2">
            <FilterButton type="priority" value="all">All Priorities</FilterButton>
            <FilterButton type="priority" value="Critical">Critical</FilterButton>
            <FilterButton type="priority" value="High">High</FilterButton>
            <FilterButton type="priority" value="Medium">Medium</FilterButton>
          </div>
          <div className="flex-grow relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="text-center py-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <Package className="w-12 h-12 text-blue-500" />
          </motion.div>
          <p className="mt-4 text-lg">Loading jobs...</p>
        </div>
      ) : (
        <motion.div layout className="space-y-4">
          <AnimatePresence>
            {filteredJobs.length > 0 ? (
              filteredJobs.map(job => <JobCard key={job.id} job={job} />)
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 bg-gray-900/30 rounded-xl"
              >
                <p className="text-xl font-semibold">No jobs match your criteria.</p>
                <p className="text-gray-400 mt-2">Try adjusting your filters or search term.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default JobsPage;