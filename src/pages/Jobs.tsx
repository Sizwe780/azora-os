import React, { useEffect, useState } from 'react';
import { jobsBoard, Job } from '../features/jobs/jobsBoard';
import { useMetrics } from '../context/MetricsProvider';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';

const JobsPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const { updateMetricsFromJobs } = useMetrics();

  useEffect(() => {
    const loadJobs = async () => {
      setIsLoading(true);
      try {
        const fetchedJobs = await jobsBoard.getJobs();
        setJobs(fetchedJobs);
        updateMetricsFromJobs(fetchedJobs);
      } catch (error) {
        console.error("Failed to load jobs:", error);
        // Handle error state if needed
      } finally {
        setIsLoading(false);
      }
    };
    loadJobs();
  }, [updateMetricsFromJobs]);

  const jobStatusStyles = {
    scheduled: 'text-blue-400 border-blue-400',
    in_progress: 'text-yellow-400 border-yellow-400',
    completed: 'text-green-400 border-green-400',
    canceled: 'text-red-400 border-red-400',
  };

  const renderSkeletons = () => (
    <>
      <div className="glass p-4 rounded-lg flex justify-between items-center">
        <div>
          <Skeleton className="h-5 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="glass p-4 rounded-lg flex justify-between items-center">
        <div>
          <Skeleton className="h-5 w-40 mb-2" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
    </>
  );

  return (
    <Card title="Job Listings">
      {isLoading ? renderSkeletons() : (
        jobs.length > 0 ? jobs.map(job => (
          <div key={job.id} className="glass p-4 rounded-lg flex justify-between items-center">
            <div>
              <h3 className="font-bold">{job.title}</h3>
              <p className="text-sm text-white/60">
                {job.pickup} → {job.dropoff}
              </p>
            </div>
            <span 
              className={`text-xs font-bold uppercase px-2 py-1 border rounded-full ${jobStatusStyles[job.status]}`}
            >
              {job.status.replace('_', ' ')}
            </span>
          </div>
        )) : (
          <p className="text-white/70">No jobs available at the moment.</p>
        )
      )}
    </Card>
  );
};

export default JobsPage;
