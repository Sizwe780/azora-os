/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000; // Port should be managed by orchestrator
const SERVICE_NAME = 'batch-processor';

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: SERVICE_NAME,
    timestamp: new Date().toISOString()
  });
});

// Add service-specific routes below this line

app.listen(PORT, () => {
  console.log();
});

// --- Existing code from original file ---

const express = require('express');
const cors = require('cors');
const { Worker } = require('worker_threads');
const path = require('path');
const fs = require('fs/promises');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4098;
const COMPLIANCE = process.env.COMPLIANCE_SERVICE_URL || 'http://localhost:4081';
const BILLING = process.env.BILLING_SERVICE_URL || 'http://localhost:4095';
const MAX_CONCURRENT = parseInt(process.env.MAX_CONCURRENT || '20', 10);
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '100', 10);
const LOG_DIR = process.env.LOG_DIR || '/workspaces/azora-os/logs/batches';

// Create log directory if it doesn't exist
(async () => {
  try {
    await fs.mkdir(LOG_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create log directory:', err);
  }
})();

// Track active workers and jobs
const activeWorkers = new Map();
const jobQueue = [];
const completedJobs = [];

// Worker pool management
function startNextBatchIfPossible() {
  if (jobQueue.length === 0 || activeWorkers.size >= MAX_CONCURRENT) return;
  
  const job = jobQueue.shift();
  const workerId = `worker-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  
  const worker = new Worker(path.join(__dirname, 'worker.js'), {
    workerData: {
      jobId: job.id,
      jobType: job.type,
      data: job.data,
      batchSize: BATCH_SIZE,
      complianceUrl: COMPLIANCE,
      billingUrl: BILLING
    }
  });
  
  activeWorkers.set(workerId, { worker, job, startedAt: Date.now() });
  
  worker.on('message', async (message) => {
    if (message.type === 'progress') {
      job.progress = message.progress;
      job.processed = message.processed;
      job.errors = message.errors;
    } else if (message.type === 'completed') {
      job.status = 'completed';
      job.completedAt = Date.now();
      job.results = message.results;
      job.duration = job.completedAt - job.createdAt;
      
      // Log job completion
      try {
        await fs.writeFile(
          path.join(LOG_DIR, `${job.id}-completed.json`), 
          JSON.stringify(job, null, 2)
        );
      } catch (err) {
        console.error('Failed to write job log:', err);
      }
      
      completedJobs.push(job);
      if (completedJobs.length > 100) completedJobs.shift(); // Keep last 100
      
      activeWorkers.delete(workerId);
      startNextBatchIfPossible(); // Process next job
    }
  });
  
  worker.on('error', (err) => {
    console.error(`Worker ${workerId} error:`, err);
    job.status = 'failed';
    job.error = err.message;
    activeWorkers.delete(workerId);
    startNextBatchIfPossible();
  });
  
  worker.on('exit', (code) => {
    if (code !== 0) {
      console.error(`Worker ${workerId} exited with code ${code}`);
      job.status = 'failed';
      job.error = `Worker exited with code ${code}`;
    }
    activeWorkers.delete(workerId);
  });
  
  job.status = 'processing';
  job.startedAt = Date.now();
}

// Job types and validators
const jobTypes = {
  'subscription-batch': (data) => {
    if (!Array.isArray(data.users)) throw new Error('users must be an array');
    if (!data.country) throw new Error('country required');
    if (!data.currency) throw new Error('currency required');
    return true;
  },
  'billing-batch': (data) => {
    if (!Array.isArray(data.subscriptions)) throw new Error('subscriptions must be an array');
    return true;
  },
  'export-batch': (data) => {
    if (!data.format) throw new Error('format required');
    if (!['csv', 'json', 'excel'].includes(data.format)) throw new Error('invalid format');
    return true;
  }
};

// API endpoints
app.post('/api/batch/jobs', async (req, res) => {
  const { type, data, priority = 5 } = req.body || {};
  
  if (!type || !jobTypes[type]) {
    return res.status(400).json({ error: 'invalid_job_type' });
  }
  
  try {
    jobTypes[type](data); // Validate
  } catch (err) {
    return res.status(400).json({ error: 'validation_failed', message: err.message });
  }
  
  const job = {
    id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type,
    data,
    priority,
    status: 'queued',
    createdAt: Date.now(),
    progress: 0,
    processed: 0,
    errors: []
  };
  
  // Insert in queue based on priority (higher priority = lower index)
  let insertIndex = jobQueue.findIndex(j => j.priority < priority);
  if (insertIndex === -1) insertIndex = jobQueue.length;
  jobQueue.splice(insertIndex, 0, job);
  
  // Log job creation
  try {
    await fs.writeFile(
      path.join(LOG_DIR, `${job.id}-created.json`), 
      JSON.stringify(job, null, 2)
    );
  } catch (err) {
    console.error('Failed to write job log:', err);
  }
  
  // Start processing if possible
  startNextBatchIfPossible();
  
  res.status(201).json({ jobId: job.id });
  
  // Notify compliance about batch job creation
  try {
    await fetch(`${COMPLIANCE}/api/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        type: 'batch-processor', 
        event: 'job.created',
        jobId: job.id,
        jobType: job.type,
        dataSize: Array.isArray(data.users) ? data.users.length : 
                 Array.isArray(data.subscriptions) ? data.subscriptions.length : 
                 'unknown',
        ts: new Date().toISOString() 
      })
    });
  } catch (err) {
    console.error('Failed to log to compliance service:', err);
  }
});

app.get('/api/batch/jobs', (req, res) => {
  const limit = parseInt(req.query.limit || '20', 10);
  const activeJobs = Array.from(activeWorkers.values()).map(({ job }) => job);
  const pendingJobs = jobQueue.slice(0, limit);
  const recentJobs = completedJobs.slice(-limit);
  
  res.json({
    active: activeJobs,
    pending: pendingJobs,
    completed: recentJobs,
    stats: {
      active: activeJobs.length,
      pending: jobQueue.length,
      completed: completedJobs.length,
      capacity: {
        used: activeWorkers.size,
        total: MAX_CONCURRENT,
        available: MAX_CONCURRENT - activeWorkers.size
      }
    },
    transparencyNote: 'Batch operations log actions to the compliance service.'
  });
});

app.get('/api/batch/jobs/:id', (req, res) => {
  const { id } = req.params;
  
  // Check active workers
  for (const { job } of activeWorkers.values()) {
    if (job.id === id) return res.json(job);
  }
  
  // Check pending
  const pendingJob = jobQueue.find(j => j.id === id);
  if (pendingJob) return res.json(pendingJob);
  
  // Check completed
  const completedJob = completedJobs.find(j => j.id === id);
  if (completedJob) return res.json(completedJob);
  
  res.status(404).json({ error: 'job_not_found' });
});

app.listen(PORT, () => console.log(`Batch processor service listening on port ${PORT}`));
