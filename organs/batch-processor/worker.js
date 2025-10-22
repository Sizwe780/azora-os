/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const { workerData, parentPort } = require('worker_threads');
const fetch = require('node-fetch');

const { jobId, jobType, data, batchSize, complianceUrl, billingUrl } = workerData;

// Report progress back to main thread
function reportProgress(processed, total, errors = []) {
  const progress = total > 0 ? Math.round((processed / total) * 100) : 0;
  parentPort.postMessage({
    type: 'progress',
    jobId,
    processed,
    total,
    progress,
    errors
  });
}

// Process items in batches
async function processBatch(items, processFn) {
  const results = [];
  const errors = [];
  
  // Process in chunks of batchSize
  for (let i = 0; i < items.length; i += batchSize) {
    const chunk = items.slice(i, i + batchSize);
    const chunkPromises = chunk.map(item => processFn(item).catch(err => {
      errors.push({ item, error: err.message });
      return { error: err.message };
    }));
    
    const chunkResults = await Promise.all(chunkPromises);
    results.push(...chunkResults);
    
    // Report progress after each batch
    reportProgress(i + chunk.length, items.length, errors);
  }
  
  return { results, errors };
}

// Job handlers
const jobHandlers = {
  'subscription-batch': async () => {
    const { users, country, currency, startTomorrow = false } = data;
    
    // Process subscriptions
    return processBatch(users, async (user) => {
      const resp = await fetch(`${billingUrl}/api/billing/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id || user.userId,
          country,
          currency,
          startTomorrow,
          acceptedTerms: true,
          popiaConsent: country.toUpperCase() === 'ZA'
        })
      });
      
      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.message || `Failed to create subscription: ${resp.status}`);
      }
      
      return resp.json();
    });
  },
  
  'billing-batch': async () => {
    const { subscriptions, action } = data;
    
    if (action === 'invoice') {
      return processBatch(subscriptions, async (sub) => {
        // This is a stub - in a real implementation, you'd implement invoice generation logic
        await new Promise(r => setTimeout(r, 50)); // Simulate processing time
        return { subId: sub.id, processed: true, action: 'invoice' };
      });
    } else if (action === 'prepay') {
      return processBatch(subscriptions, async (sub) => {
        const resp = await fetch(`${billingUrl}/api/billing/prepay`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: sub.userId,
            country: sub.country || 'ZA',
            currency: sub.currency || 'ZAR'
          })
        });
        
        if (!resp.ok) {
          throw new Error(`Failed to process prepay: ${resp.status}`);
        }
        
        return resp.json();
      });
    }
    
    throw new Error(`Unsupported billing action: ${action}`);
  },
  
  'export-batch': async () => {
    const { format, query } = data;
    
    // This is a stub - in a real implementation, you'd fetch real data and format it
    const mockData = Array.from({ length: 1000 }, (_, i) => ({
      id: `sub-${i}`,
      status: Math.random() > 0.2 ? 'active' : 'trial',
      amount: Math.floor(Math.random() * 100) + 50
    }));
    
    // Simulate processing time based on format
    if (format === 'excel') {
      await new Promise(r => setTimeout(r, 2000));
    } else {
      await new Promise(r => setTimeout(r, 500));
    }
    
    return {
      format,
      recordCount: mockData.length,
      fileUrl: `/exports/batch-${jobId}.${format}`,
      generatedAt: new Date().toISOString()
    };
  }
};

// Run the job
async function runJob() {
  try {
    if (!jobHandlers[jobType]) {
      throw new Error(`Unsupported job type: ${jobType}`);
    }
    
    const results = await jobHandlers[jobType]();
    
    // Log completion to compliance service
    try {
      await fetch(`${complianceUrl}/api/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'batch-processor',
          event: 'job.completed',
          jobId,
          jobType,
          resultsCount: results.results?.length || 0,
          errorsCount: results.errors?.length || 0,
          ts: new Date().toISOString()
        })
      });
    } catch (err) {
      console.error('Failed to log to compliance service:', err);
    }
    
    // Send completion message
    parentPort.postMessage({
      type: 'completed',
      jobId,
      results
    });
  } catch (err) {
    console.error(`Job ${jobId} failed:`, err);
    parentPort.postMessage({
      type: 'completed',
      jobId,
      error: err.message,
      results: { error: err.message }
    });
  }
}

// Start job execution
runJob();