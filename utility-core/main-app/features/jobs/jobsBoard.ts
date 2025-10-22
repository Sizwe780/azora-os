/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

export type JobStatus = 'scheduled' | 'in_progress' | 'completed' | 'canceled' | 'pending';

export type Job = {
  id: string;
  title: string;
  description: string;
  pickup: {
    location: string;
    time: string;
  };
  dropoff: {
    location: string;
    time: string;
  };
  status: JobStatus;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedVehicle: {
    id: string;
    type: 'Drone' | 'Van' | 'Truck';
  };
  assignedDriver?: {
    name: string;
    id: string;
  };
  cargo: {
    type: string;
    quantity: number;
    weight: string;
  };
  createdAt: string;
};

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

export const jobsBoard = {
  async getJobs(): Promise<Job[]> {
    // Mock data with more details
    return [
      {
        id: generateId('JOB'),
        title: 'Urgent Medical Supplies Delivery',
        description: 'Transport temperature-sensitive vaccines from central depot to regional hospital.',
        pickup: { location: 'JNB-OPS-DEPOT', time: '2024-07-29T09:00:00Z' },
        dropoff: { location: 'CPT-HOSPITAL-A', time: '2024-07-29T17:00:00Z' },
        status: 'in_progress',
        priority: 'Critical',
        assignedVehicle: { id: 'DRN-QTM-007', type: 'Drone' },
        assignedDriver: { name: 'AZORA AI', id: 'AI-001' },
        cargo: { type: 'Vaccines', quantity: 500, weight: '25kg' },
        createdAt: '2024-07-29T08:00:00Z',
      },
      {
        id: generateId('JOB'),
        title: 'Standard Cargo Transfer',
        description: 'Bulk transfer of non-perishable goods between hubs.',
        pickup: { location: 'DBN-HUB-01', time: '2024-07-30T10:00:00Z' },
        dropoff: { location: 'JNB-HUB-02', time: '2024-07-31T14:00:00Z' },
        status: 'scheduled',
        priority: 'Medium',
        assignedVehicle: { id: 'TRK-MAN-012', type: 'Truck' },
        assignedDriver: { name: 'John Smith', id: 'EMP-002' },
        cargo: { type: 'Electronics', quantity: 2, weight: '1.5t' },
        createdAt: '2024-07-28T15:30:00Z',
      },
      {
        id: generateId('JOB'),
        title: 'Retail Partner Restock',
        description: 'Deliver new inventory to a retail partner store.',
        pickup: { location: 'JNB-WAREHOUSE', time: '2024-07-28T11:00:00Z' },
        dropoff: { location: 'RETAIL-SANDTON-04', time: '2024-07-28T13:00:00Z' },
        status: 'completed',
        priority: 'High',
        assignedVehicle: { id: 'VAN-MB-031', type: 'Van' },
        assignedDriver: { name: 'Jane Doe', id: 'EMP-003' },
        cargo: { type: 'Apparel', quantity: 350, weight: '300kg' },
        createdAt: '2024-07-28T09:00:00Z',
      },
      {
        id: generateId('JOB'),
        title: 'Emergency Document Courier',
        description: 'Transport sensitive legal documents for signing.',
        pickup: { location: 'LEGAL-HQ', time: '2024-07-29T14:00:00Z' },
        dropoff: { location: 'GOV-PTA-01', time: '2024-07-29T16:00:00Z' },
        status: 'pending',
        priority: 'High',
        assignedVehicle: { id: 'DRN-SEC-002', type: 'Drone' },
        assignedDriver: undefined,
        cargo: { type: 'Documents', quantity: 1, weight: '2kg' },
        createdAt: '2024-07-29T13:00:00Z',
      },
      {
        id: generateId('JOB'),
        title: 'Cancelled Farm Produce Pickup',
        description: 'Pickup of fresh produce was cancelled by the supplier due to quality issues.',
        pickup: { location: 'FARM-LM-087', time: '2024-07-27T09:00:00Z' },
        dropoff: { location: 'JNB-HUB-01', time: '2024-07-27T12:00:00Z' },
        status: 'canceled',
        priority: 'Medium',
        assignedVehicle: { id: 'TRK-VOL-009', type: 'Truck' },
        assignedDriver: { name: 'Peter Jones', id: 'EMP-004' },
        cargo: { type: 'Fresh Produce', quantity: 0, weight: '0kg' },
        createdAt: '2024-07-26T18:00:00Z',
      },
    ];
  },
};