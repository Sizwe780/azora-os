import { motion } from 'framer-motion';
import { MapPin, Clock, CloudRain, Navigation } from 'lucide-react';
import { RouteInfo } from '../../features/driver-command/mockData';

interface RouteInfoPanelProps {
  routeInfo: RouteInfo;
}

const trafficColorMap = {
  light: { text: 'text-green-400', bg: 'bg-green-500' },
  moderate: { text: 'text-yellow-400', bg: 'bg-yellow-500' },
  heavy: { text: 'text-red-400', bg: 'bg-red-500' },
};

const RouteInfoPanel = ({ routeInfo }: RouteInfoPanelProps) => {
  const traffic = trafficColorMap[routeInfo.traffic];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.3 }}
      className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Live Navigation</h2>
        <span className="flex items-center gap-2 text-sm text-cyan-300">
            <Navigation size={16} />
            Online
        </span>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
          <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-400">Current Location</p>
            <p className="text-white font-medium">{routeInfo.currentLeg}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
          <Clock className="w-5 h-5 text-green-400 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-400">Next Stop: {routeInfo.nextStop}</p>
            <p className="text-white font-medium">ETA: {routeInfo.eta}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
          <div className={`w-5 h-5 flex-shrink-0 flex items-center justify-center`}>
            <div className={`w-3 h-3 rounded-full ${traffic.bg} animate-pulse`}></div>
          </div>
          <div>
            <p className="text-sm text-gray-400">Traffic Condition</p>
            <p className={`font-medium ${traffic.text} capitalize`}>{routeInfo.traffic}</p>
          </div>
        </div>
      </div>
      <div className="aspect-video bg-gray-800/50 border border-gray-700 rounded-lg flex items-center justify-center mt-4 overflow-hidden">
        <div className="w-full h-full bg-cover bg-center" style={{backgroundImage: "url('https://cdn.dribbble.com/users/2345793/screenshots/14795923/media/313c2c2ddee10338a7ad24a3415d4903.png')"}}>
            <div className="w-full h-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                <p className="text-gray-300 bg-black/50 px-4 py-2 rounded-lg">Live map placeholder</p>
            </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RouteInfoPanel;
