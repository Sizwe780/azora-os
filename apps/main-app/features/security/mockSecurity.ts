export interface SecurityLayer {
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  lastCheck: string;
}

export interface SecurityAlarm {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  resolved: boolean;
}

export interface BackupStatus {
  lastBackup: string;
  locations: string[];
  size: string;
  nextBackup: string;
  redundancy: number;
}

export interface IntrusionDetection {
  active: boolean;
  lastScan: string;
  threatsDetected: number;
  threatsBlocked: number;
}

export interface SystemHealth {
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  responseTime: number;
}

export interface SecurityData {
  layers: SecurityLayer[];
  alarms: SecurityAlarm[];
  backupStatus: BackupStatus;
  intrusionDetection: IntrusionDetection;
  systemHealth: SystemHealth;
}

export const getMockSecurityData = (): SecurityData => {
  return {
    layers: [
      { name: 'Quantum Encryption', description: 'End-to-end quantum-resistant encryption for all data streams.', status: 'active', lastCheck: new Date().toISOString() },
      { name: 'Biometric Authentication', description: 'Multi-factor biometric access control for all personnel.', status: 'active', lastCheck: new Date().toISOString() },
      { name: 'AI Threat Analysis', description: 'Real-time predictive threat analysis and response.', status: 'active', lastCheck: new Date().toISOString() },
      { name: 'Decentralized Data Vaults', description: 'Geographically distributed and sharded data storage.', status: 'active', lastCheck: new Date().toISOString() },
      { name: 'Physical Security Mesh', description: 'Drone and sensor-based physical perimeter control.', status: 'error', lastCheck: new Date().toISOString() },
    ],
    alarms: [
      { id: 'ALM-001', type: 'Perimeter Breach', severity: 'critical', description: 'Unauthorized drone detected near Sector-7G.', timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), resolved: false },
      { id: 'ALM-002', type: 'Anomalous Access', severity: 'high', description: 'Repeated failed login attempts for user: Dr. Aris Thorne.', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), resolved: false },
      { id: 'ALM-003', type: 'Data Spike', severity: 'medium', description: 'Unusual data egress from vault 3B.', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), resolved: true },
    ],
    backupStatus: {
      lastBackup: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      locations: ['AWS-EU-WEST-1', 'AZURE-US-EAST', 'GCP-ASIA-SOUTH1', 'ARCTIC-VAULT'],
      size: '1.2 PB',
      nextBackup: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      redundancy: 4,
    },
    intrusionDetection: {
      active: true,
      lastScan: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
      threatsDetected: 3,
      threatsBlocked: 2,
    },
    systemHealth: {
      uptime: 99.99,
      memoryUsage: 68,
      cpuUsage: 45,
      responseTime: 12,
    },
  };
};
