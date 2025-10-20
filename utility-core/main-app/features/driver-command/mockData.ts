import {
  DollarSign,
  Zap,
  Heart,
  Shield,
  Route,
  Coffee,
  Map,
  Mic,
} from 'lucide-react';
import { subMinutes, addMinutes, format } from 'date-fns';

export interface DriverStats {
  earnings: number;
  deliveries: number;
  energyLevel: number;
  safetyScore: number;
  nextBreakIn: number; // in minutes
}

export interface CoPilotAction {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  buttonText: string;
  color: string;
  path: string;
}

export interface RouteInfo {
  currentLeg: string;
  nextStop: string;
  eta: string;
  traffic: 'light' | 'moderate' | 'heavy';
}

export const initialStats: DriverStats = {
  earnings: 125.50,
  deliveries: 8,
  energyLevel: 82,
  safetyScore: 98,
  nextBreakIn: 112,
};

export const coPilotActions: CoPilotAction[] = [
  {
    id: 'route',
    icon: Route,
    title: 'Autonomous Route',
    description: 'Aura has optimized your route for maximum efficiency and earnings.',
    buttonText: 'View Route',
    color: 'blue',
    path: '/route-details',
  },
  {
    id: 'break',
    icon: Coffee,
    title: 'Smart Break',
    description: 'Aura will find the best rest stop with your preferred amenities.',
    buttonText: 'Find Coffee Stop',
    color: 'orange',
    path: '/find-break',
  },
  {
    id: 'traffic',
    icon: Map,
    title: 'Live Traffic',
    description: 'AI is monitoring all routes for congestion and hazards for you.',
    buttonText: 'See Risks',
    color: 'green',
    path: '/traffic-overview',
  },
];

export const initialRouteInfo: RouteInfo = {
    currentLeg: 'N1 Highway, approaching Midrand',
    nextStop: 'Sandton Distribution Hub',
    eta: format(addMinutes(new Date(), 28), 'HH:mm'),
    traffic: 'moderate',
};

export const auraResponses = {
  listening: 'Listening...',
  processing: 'Processing...',
  ready: 'Aura is ready. Tap the mic to begin.',
  responses: [
    'Optimizing your route for maximum earnings.',
    'Found a faster route, saving you 8 minutes.',
    'Heavy traffic detected ahead. Rerouting now.',
    'Your energy levels are dipping. Suggesting a break soon.',
    'Safety alert: harsh braking detected. Is everything okay?',
  ],
};
