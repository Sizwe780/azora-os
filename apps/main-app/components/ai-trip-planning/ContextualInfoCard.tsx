import React from 'react';
import { motion } from 'framer-motion';
import { WeatherInfo, TrafficAlert } from '../../features/ai-trip-planning/mockCoPilot';
import { AlertTriangle } from 'lucide-react';

interface ContextualInfoCardProps {
  weather?: WeatherInfo[];
  traffic?: TrafficAlert[];
}

const severityClasses = {
  low: 'bg-green-900/50 text-green-300',
  medium: 'bg-yellow-900/50 text-yellow-300',
  high: 'bg-red-900/50 text-red-300',
}

const ContextualInfoCard: React.FC<ContextualInfoCardProps> = ({ weather, traffic }) => {
  const hasWeather = weather && weather.length > 0;
  const hasTraffic = traffic && traffic.length > 0;

  if (!hasWeather && !hasTraffic) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6"
    >
      {hasWeather && (
        <div>
          <h3 className="text-xl font-bold mb-4">Weather on Route</h3>
          <div className="flex justify-around text-center">
            {weather.map(w => (
              <div key={w.location}>
                <w.icon className="w-8 h-8 mx-auto text-yellow-400"/>
                <p className="font-bold mt-2 text-white">{w.temp}</p>
                <p className="text-xs text-gray-400">{w.location}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {hasWeather && hasTraffic && <div className="my-6 border-t border-gray-800" />}
      {hasTraffic && (
        <div>
          <h3 className="text-xl font-bold mb-4">Traffic Alerts</h3>
          <div className="space-y-3">
            {traffic.map((alert, i) => (
              <div key={i} className={`p-3 rounded-lg flex items-start gap-3 ${severityClasses[alert.severity]}`}>
                <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">{alert.location}</p>
                  <p className="text-xs opacity-80">{alert.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ContextualInfoCard;
