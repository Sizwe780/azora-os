export type Job = {
  id: string;
  title: string;
  pickup: string;
  dropoff: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'canceled';
};

export const jobsBoard = {
  async getJobs(): Promise<Job[]> {
    // Mock data for now
    return [
      {
        id: 'job-001',
        title: 'Package Delivery',
        pickup: 'JNB-OPS',
        dropoff: 'CPT-CARGO',
        status: 'scheduled',
      },
      {
        id: 'job-002',
        title: 'Medical Supplies',
        pickup: 'DBN-HUB',
        dropoff: 'JNB-OPS',
        status: 'in_progress',
      },
    ];
  },
};