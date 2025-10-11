import { Drone, BatteryCharging, PowerOff, Wrench, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { subHours, subMinutes, formatDistanceToNow } from 'date-fns';

export interface DroneData {
  id: string;
  status: 'active' | 'charging' | 'offline' | 'maintenance';
  location: string;
  battery: number;
  lastCheck: string;
  driver: string;
  trip: string;
  model: string;
  flightTime: number; // in hours
}

export const initialDrones: DroneData[] = [
  { id: 'AZ-D-001', status: 'active', location: 'JNB-GIGA-01', battery: 87, lastCheck: subMinutes(new Date(), 5).toISOString(), driver: 'Sizwe M.', trip: 'TRIP-JNB-PTA-042', model: 'Azora-V3-Long-Range', flightTime: 124.5 },
  { id: 'AZ-D-002', status: 'charging', location: 'CPT-HUB-03', battery: 45, lastCheck: subHours(new Date(), 1).toISOString(), driver: 'Thandi L.', trip: 'TRIP-CPT-STL-019', model: 'Azora-V2-City', flightTime: 302.1 },
  { id: 'AZ-D-003', status: 'offline', location: 'JNB-GIGA-01', battery: 0, lastCheck: subHours(new Date(), 2).toISOString(), driver: 'Mpho K.', trip: 'TRIP-JNB-DBN-011', model: 'Azora-V3-Long-Range', flightTime: 88.0 },
  { id: 'AZ-D-004', status: 'active', location: 'DBN-PORT-02', battery: 95, lastCheck: subMinutes(new Date(), 10).toISOString(), driver: 'John P.', trip: 'TRIP-DBN-RBG-088', model: 'Azora-V3-Long-Range', flightTime: 215.7 },
  { id: 'AZ-D-005', status: 'maintenance', location: 'CPT-HUB-03', battery: 15, lastCheck: subHours(new Date(), 24).toISOString(), driver: 'N/A', trip: 'N/A', model: 'Azora-V2-City', flightTime: 512.3 },
  { id: 'AZ-D-006', status: 'active', location: 'JNB-GIGA-01', battery: 72, lastCheck: subMinutes(new Date(), 25).toISOString(), driver: 'Lerato N.', trip: 'TRIP-JNB-SOW-105', model: 'Azora-V2-City', flightTime: 15.2 },
];

export const statusConfig = {
  active: { icon: Drone, color: 'green', label: 'Active' },
  charging: { icon: BatteryCharging, color: 'yellow', label: 'Charging' },
  offline: { icon: PowerOff, color: 'red', label: 'Offline' },
  maintenance: { icon: Wrench, color: 'gray', label: 'Maintenance' },
};

export const getDroneInsight = (drone: DroneData) => {
    if (drone.status === 'maintenance') return { insight: 'Drone is currently undergoing scheduled maintenance.', icon: Wrench, color: 'gray' };
    if (drone.battery < 10) return { insight: 'CRITICAL: Battery level critical. Immediate retrieval and charge required.', icon: AlertTriangle, color: 'red' };
    if (drone.battery < 30) return { insight: 'WARNING: Low battery. Recommend returning to base for charging.', icon: AlertTriangle, color: 'yellow' };
    if (drone.status === 'offline') return { insight: 'ERROR: Drone is offline. Investigate potential hardware failure or signal loss.', icon: XCircle, color: 'red' };
    return { insight: 'All systems nominal. Drone is operating within expected parameters.', icon: CheckCircle, color: 'green' };
};

export const generateLogsheet = (drone: DroneData) => {
    const insight = getDroneInsight(drone);
    return `
AZORA-OS DRONE OPERATIONS LOG
=============================
DRONE ID:       ${drone.id}
MODEL:          ${drone.model}
ASSIGNED PILOT: ${drone.driver}
CURRENT TRIP:   ${drone.trip}
-----------------------------
STATUS:         ${drone.status.toUpperCase()}
BATTERY:        ${drone.battery}%
FLIGHT TIME:    ${drone.flightTime.toFixed(1)} hours
LOCATION:       ${drone.location}
LAST SYNC:      ${new Date(drone.lastCheck).toLocaleString('en-ZA')} (${formatDistanceToNow(new Date(drone.lastCheck))} ago)
-----------------------------
AI DIAGNOSTIC:
[${insight.insight}]
=============================
END OF LOG
    `;
};
