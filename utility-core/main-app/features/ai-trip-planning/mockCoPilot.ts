import { Sun, Wind, CloudRain, Zap, TrafficCone, Coffee } from 'lucide-react';

export interface Message {
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

export interface TripPlan {
  destination: string;
  route: string;
  estimatedTime: string;
  distance: string;
  stops: { type: 'Rest' | 'Fuel' | 'Delivery'; name: string; duration: string }[];
  optimizations: {
    timeSaved: string;
    fuelSaved: string;
    complianceRiskAvoided: boolean;
  };
}

export interface WeatherInfo {
  location: string;
  icon: React.ElementType;
  temp: string;
  condition: string;
}

export interface TrafficAlert {
  location: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface CoPilotState {
  messages: Message[];
  tripPlan: TripPlan | null;
  weather: WeatherInfo[];
  traffic: TrafficAlert[];
}

const initialMessages: Message[] = [
  { role: 'assistant', content: "I'm your AI Co-Pilot. How can I help you plan your journey today?", timestamp: new Date() },
];

export const getMockCoPilotState = (): CoPilotState => ({
  messages: initialMessages,
  tripPlan: null,
  weather: [],
  traffic: [],
});

export const getDemoResponse = (message: string): { response: string; tripPlan?: TripPlan; weather?: WeatherInfo[]; traffic?: TrafficAlert[] } => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('durban')) {
    return {
      response: "Of course. I've planned your trip to Durban via the N3. I've optimized for traffic, fuel costs, and included mandatory rest stops. You can see the full plan on the right.",
      tripPlan: {
        destination: 'Durban, KZN',
        route: 'N3 Highway',
        estimatedTime: '6h 15m',
        distance: '568 km',
        stops: [
          { type: 'Rest', name: 'Harrismith', duration: '30min' },
          { type: 'Fuel', name: 'Mooi River', duration: '15min' },
        ],
        optimizations: {
          timeSaved: '45 min',
          fuelSaved: 'R185',
          complianceRiskAvoided: true,
        },
      },
    };
  }
  if (lowerMessage.includes('schedule')) {
    return {
      response: "You have two deliveries today: one to Sandton at 11:00 AM and another to Pretoria at 3:00 PM. Both are on schedule.",
    };
  }
  if (lowerMessage.includes('fuel')) {
    return {
      response: "The cheapest fuel nearby is at Sasol on Rivonia Rd for R22.80/L diesel. It's 5km away and on your current route.",
    };
  }
  if (lowerMessage.includes('weather')) {
    return {
      response: "I'm checking the weather along the N3 for you. It looks clear for most of the way, with a chance of rain as you approach Durban. I've added weather details to the sidebar.",
      weather: [
        { location: 'Johannesburg', icon: Sun, temp: '24°C', condition: 'Clear' },
        { location: 'Harrismith', icon: Wind, temp: '18°C', condition: 'Windy' },
        { location: 'Durban', icon: CloudRain, temp: '26°C', condition: 'Rainy' },
      ],
    };
  }
  if (lowerMessage.includes('traffic')) {
    return {
        response: "There's a high level of traffic on the M1 South near the city center. I'd recommend an alternative route via the M2. I've highlighted the congestion areas for you.",
        traffic: [
            { location: 'M1 South', severity: 'high', description: 'Accident near Crown Interchange' },
            { location: 'N1 Western Bypass', severity: 'medium', description: 'Heavy congestion near Beyers Naudé' },
        ]
    }
  }
  return {
    response: "I can help with that. Could you provide a bit more detail?",
  };
};
