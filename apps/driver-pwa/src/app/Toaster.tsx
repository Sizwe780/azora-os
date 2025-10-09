// src/app/Toaster.tsx
import { Toaster, toast } from 'react-hot-toast';

export default function AppToaster() {
  return <Toaster position="bottom-right" />;
}

// Example handlers (put in your component, not at top-level)
async function assignDriver(jobId: string) {
  // await your API call...
  toast.success('Driver assigned');
}

async function updateStatus(jobId: string, s: string) {
  // await your API call...
  toast.success('Status updated');
}