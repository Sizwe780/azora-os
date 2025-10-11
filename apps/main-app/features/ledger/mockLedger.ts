import { FileText, DollarSign, Truck, User, Building, AlertTriangle } from 'lucide-react';

export type LedgerEntry = {
  uid: string;
  type: 'PAYMENT' | 'TRIP_COMPLETION' | 'USER_REGISTRATION' | 'COMPANY_REGISTRATION' | 'DOCUMENT_UPLOAD' | 'COMPLIANCE_FLAG';
  entityId: string;
  relatedIds: {
    companyId?: string;
    driverId?: string;
    tripId?: string;
  };
  createdAt: string;
  hash: string;
  payload: Record<string, any>;
};

const generateRandomId = (prefix: string) => `${prefix}-${Math.random().toString(36).substring(2, 12)}`;
const generateHash = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const mockLedgerData: LedgerEntry[] = [
  {
    uid: generateRandomId('le'),
    type: 'PAYMENT',
    entityId: generateRandomId('pay'),
    relatedIds: {
      companyId: 'comp-123',
      driverId: 'drv-abc',
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    hash: generateHash(),
    payload: { amount: 5000, currency: 'ZAR', method: 'EFT' },
  },
  {
    uid: generateRandomId('le'),
    type: 'TRIP_COMPLETION',
    entityId: generateRandomId('trip'),
    relatedIds: {
      companyId: 'comp-456',
      driverId: 'drv-def',
      tripId: 'trip-xyz',
    },
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    hash: generateHash(),
    payload: { distance: 150, duration: '3 hours', cargo: 'Electronics' },
  },
  {
    uid: generateRandomId('le'),
    type: 'USER_REGISTRATION',
    entityId: generateRandomId('user'),
    relatedIds: {
      driverId: 'drv-ghi',
    },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    hash: generateHash(),
    payload: { name: 'John Doe', role: 'Driver' },
  },
  {
    uid: generateRandomId('le'),
    type: 'COMPANY_REGISTRATION',
    entityId: generateRandomId('comp'),
    relatedIds: {
      companyId: 'comp-789',
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    hash: generateHash(),
    payload: { name: 'Logistics Inc.', registration: '2023/123456/07' },
  },
  {
    uid: generateRandomId('le'),
    type: 'DOCUMENT_UPLOAD',
    entityId: generateRandomId('doc'),
    relatedIds: {
      driverId: 'drv-abc',
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    hash: generateHash(),
    payload: { documentType: 'Drivers License', fileName: 'license.pdf' },
  },
  {
    uid: generateRandomId('le'),
    type: 'COMPLIANCE_FLAG',
    entityId: generateRandomId('flag'),
    relatedIds: {
      tripId: 'trip-xyz',
    },
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    hash: generateHash(),
    payload: { reason: 'Unscheduled Stop Detected', severity: 'High' },
  },
  {
    uid: generateRandomId('le'),
    type: 'PAYMENT',
    entityId: generateRandomId('pay'),
    relatedIds: {
      companyId: 'comp-456',
    },
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    hash: generateHash(),
    payload: { amount: 12500, currency: 'ZAR', method: 'Card' },
  },
];

export const getMockLedgerEntries = (filters: {
  type?: string;
  from?: string;
  to?: string;
  companyId?: string;
  driverId?: string;
}): LedgerEntry[] => {
  return mockLedgerData.filter(entry => {
    if (filters.type && !entry.type.toLowerCase().includes(filters.type.toLowerCase())) return false;
    if (filters.companyId && entry.relatedIds.companyId !== filters.companyId) return false;
    if (filters.driverId && entry.relatedIds.driverId !== filters.driverId) return false;
    const entryDate = new Date(entry.createdAt);
    if (filters.from && entryDate < new Date(filters.from)) return false;
    if (filters.to && entryDate > new Date(filters.to)) return false;
    return true;
  });
};

export const ledgerEntryIcons = {
  PAYMENT: DollarSign,
  TRIP_COMPLETION: Truck,
  USER_REGISTRATION: User,
  COMPANY_REGISTRATION: Building,
  DOCUMENT_UPLOAD: FileText,
  COMPLIANCE_FLAG: AlertTriangle,
};

export const ledgerEntryColors = {
    PAYMENT: 'green',
    TRIP_COMPLETION: 'blue',
    USER_REGISTRATION: 'purple',
    COMPANY_REGISTRATION: 'indigo',
    DOCUMENT_UPLOAD: 'yellow',
    COMPLIANCE_FLAG: 'red',
};
