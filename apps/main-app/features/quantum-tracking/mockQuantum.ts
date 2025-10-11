import L from 'leaflet';

export interface Vehicle {
  id: string;
  driver: string;
  model: string;
  status: 'active' | 'charging' | 'idle';
  mission: string;
  location: {
    lat: number;
    lng: number;
    speed: number;
  };
  telemetry: {
    battery: number;
    temperature: number;
    power_usage: number;
    efficiency: number;
  };
  route: {
    optimal: boolean;
    waypoints: { lat: number; lng: number }[];
  };
  ai_insights: {
    driver_score: number;
    eco_score: number;
    safety_score: number;
    predicted_arrival: string;
    confidence: number;
  };
}

export interface SwarmData {
    active: number;
    total_vehicles: number;
    coordination_score: number;
    energy_savings: number;
    time_savings: number;
    fleet_efficiency: number;
}

export const generateMockVehicle = (id: number): Vehicle => {
  const lat = -33.9249 + (Math.random() - 0.5) * 0.1;
  const lng = 18.4241 + (Math.random() - 0.5) * 0.1;
  const statuses: ('active' | 'charging' | 'idle')[] = ['active', 'charging', 'idle'];
  return {
    id: `AZ-${1000 + id}`,
    driver: `Driver ${100 + id}`,
    model: 'Azora One',
    status: statuses[id % 3],
    mission: `Delivery to CPT-${200 + id}`,
    location: { lat, lng, speed: Math.floor(Math.random() * 80) },
    telemetry: {
      battery: Math.floor(Math.random() * 80) + 20,
      temperature: Math.floor(Math.random() * 10) + 15,
      power_usage: parseFloat((Math.random() * 5).toFixed(1)),
      efficiency: parseFloat((Math.random() * 5 + 10).toFixed(1)),
    },
    route: {
      optimal: Math.random() > 0.2,
      waypoints: [
        { lat: lat - 0.01, lng: lng - 0.01 },
        { lat, lng },
        { lat: lat + 0.01, lng: lng + 0.01 },
      ],
    },
    ai_insights: {
      driver_score: Math.floor(Math.random() * 15) + 85,
      eco_score: Math.floor(Math.random() * 20) + 80,
      safety_score: Math.floor(Math.random() * 10) + 90,
      predicted_arrival: `${Math.floor(Math.random() * 2) + 10}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      confidence: parseFloat(Math.random().toFixed(2)),
    },
  };
};

export const getMockFleet = (count: number): Vehicle[] => {
    return Array.from({ length: count }, (_, i) => generateMockVehicle(i));
}

export const getMockSwarmData = (fleet: Vehicle[]): SwarmData => {
    return {
        active: fleet.filter(v => v.status === 'active').length,
        total_vehicles: fleet.length,
        coordination_score: 98.5,
        energy_savings: 12.3,
        time_savings: 8.7,
        fleet_efficiency: 95.2,
    };
}

// Fix for default marker icon in React-Leaflet
export const leafletIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});