import React, { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { jobsBoard, Job, JobStatus } from '../features/jobs/jobsBoard';
import { JobCard } from '../components/jobs/JobCard';
import { FilterBar } from '../components/jobs/FilterBar';
import { Package, ServerCrash, Zap, Calendar, CheckCircle, AlertTriangle, Clock, MapPin, User, Truck, Bot, Filter, Search } from 'lucide-react';

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