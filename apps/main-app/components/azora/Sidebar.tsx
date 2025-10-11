import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, FaMoneyBillWave, FaAtom, FaMap, FaCog, FaTruck, 
  FaSnowflake, FaShieldAlt, FaChartLine, FaUserClock, FaBuilding, 
  FaHeadset, FaLightbulb, FaGavel, FaWallet, FaEnvelope, FaUsers 
} from 'react-icons/fa';
import { Navigation, Brain, Zap } from 'lucide-react';
import { type ComponentType } from 'react';
import { hasPermission, Permission } from '../../types/founders';

// For demo purposes, we'll use the CEO (Sizwe Ngwenya) as the default user
// In production, this would come from authentication context
const CURRENT_USER_ID = 'user_001'; // Sizwe Ngwenya - CEO & CTO

interface NavItem {
  path: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  highlight?: boolean;
  newFeature?: boolean;
  saMarket?: boolean;
  requiresPermission?: Permission | Permission[]; // Single permission or array of permissions (any match grants access)
}

const navItems: NavItem[] = [
  { path: '/sanctuary', label: 'Sanctuary', icon: FaHome },
  { path: '/dashboard', label: 'Dashboard', icon: FaChartLine },
  { path: '/driver', label: 'Driver AI', icon: FaTruck },
  { path: '/ai', label: 'Quantum AI', icon: Brain, highlight: true, newFeature: true },
  { path: '/evolution', label: 'AI Evolution 🇿🇦', icon: Zap, highlight: true, newFeature: true, saMarket: true },
  { path: '/tracking', label: 'Quantum Track', icon: Navigation, highlight: true },
  
  // Business Operations
  { path: '/attendance', label: 'Attendance', icon: FaUserClock, requiresPermission: ['view_all_hr', 'view_own_hr'] },
  { path: '/revenue', label: 'Revenue', icon: FaMoneyBillWave, requiresPermission: ['view_all_finances', 'view_own_finances'] },
  { path: '/operations', label: 'Operations', icon: FaBuilding, requiresPermission: ['manage_operations', 'view_operations'] },
  { path: '/support', label: 'Support', icon: FaHeadset, requiresPermission: ['manage_operations', 'view_operations'] },
  { path: '/ceo-insights', label: 'CEO Insights', icon: FaLightbulb, requiresPermission: ['view_all_finances', 'manage_operations'] },
  
  // Specialized Services
  { path: '/coldchain', label: 'Cold Chain', icon: FaSnowflake },
  { path: '/safety', label: 'Safety', icon: FaShieldAlt },
  
  // Security & Compliance
  { path: '/security', label: 'Security', icon: FaShieldAlt, requiresPermission: ['view_security', 'manage_security'] },
  { path: '/legal', label: 'Legal', icon: FaGavel, requiresPermission: ['view_compliance', 'manage_compliance'] },
  { path: '/finance', label: 'Finance', icon: FaWallet, requiresPermission: ['view_all_finances', 'view_own_finances'] },
  
  // Communication & Team
  { 
    path: '/emails', 
    label: 'Emails', 
    icon: FaEnvelope, 
    requiresPermission: 'access_emails',
    highlight: true,
    newFeature: true
  },
  { path: '/founders', label: 'Founders', icon: FaUsers, highlight: true, newFeature: true },
  
  // System
  { path: '/klipp', label: 'Klipp', icon: FaMoneyBillWave },
  { path: '/genesis-chamber', label: 'Genesis', icon: FaAtom },
  { path: '/ledger', label: 'Ledger', icon: FaMap },
  { path: '/settings', label: 'Settings', icon: FaCog },
];

export default function Sidebar() {
  const location = useLocation();

  // Filter nav items based on permissions
  const visibleNavItems = navItems.filter(item => {
    // If no permission required, show to everyone
    if (!item.requiresPermission) {
      return true;
    }

    // If permission is an array, check if user has ANY of them
    if (Array.isArray(item.requiresPermission)) {
      return item.requiresPermission.some(permission => 
        hasPermission(CURRENT_USER_ID, permission)
      );
    }

    // Single permission check
    return hasPermission(CURRENT_USER_ID, item.requiresPermission);
  });

  return (
    <aside className="w-72 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-black/95 backdrop-blur-2xl border-r border-cyan-500/20 shadow-2xl shadow-cyan-500/10 p-6 flex flex-col gap-4 relative z-10 overflow-y-auto">
      {/* Premium Header */}
      <div className="mb-6 relative">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Azora OS
            </h1>
            <p className="text-xs text-cyan-400/80 font-medium">Infinite Aura Platform</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500/20 via-yellow-500/20 to-green-500/20 border border-green-400/30 rounded-lg px-3 py-2 backdrop-blur-sm">
          <p className="text-xs text-green-300 font-semibold flex items-center gap-2">
            <span className="text-yellow-400">🚀</span>
            Launch Day: Oct 10, 2025
            <span className="ml-auto bg-green-500/30 px-2 py-0.5 rounded-full text-[10px]">LIVE</span>
          </p>
        </div>
      </div>
      
      {/* Premium Navigation */}
      <nav className="flex flex-col gap-1.5 flex-1">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ease-out ${
                isActive
                  ? item.highlight 
                    ? item.saMarket
                      ? 'bg-gradient-to-r from-green-600 via-yellow-500 to-green-600 text-white shadow-xl shadow-green-500/40 scale-105'
                      : item.newFeature
                      ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 text-white shadow-xl shadow-pink-500/40 scale-105'
                      : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white shadow-xl shadow-blue-500/40 scale-105'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                  : item.highlight
                    ? item.saMarket
                      ? 'text-white bg-gradient-to-r from-green-500/10 via-yellow-500/10 to-green-500/10 hover:from-green-500/25 hover:via-yellow-500/25 hover:to-green-500/25 border border-green-500/30 hover:border-green-400/50 hover:shadow-lg hover:shadow-green-500/20'
                      : item.newFeature
                      ? 'text-white bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 hover:from-purple-500/25 hover:via-pink-500/25 hover:to-purple-500/25 border border-pink-500/30 hover:border-pink-400/50 hover:shadow-lg hover:shadow-pink-500/20'
                      : 'text-white bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-blue-500/30 hover:border-blue-400/50'
                    : 'text-white/70 hover:bg-white/10 hover:text-white hover:shadow-md hover:scale-102'
              }`}
            >
              <Icon className={`w-5 h-5 ${item.highlight ? 'animate-pulse' : ''} ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
              <span className={`text-sm font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
              {item.highlight && !isActive && (
                <span className={`ml-auto text-[10px] px-2 py-1 rounded-full font-bold ${
                  item.saMarket
                    ? 'bg-gradient-to-r from-green-500 to-yellow-400 text-white shadow-md animate-pulse'
                    : item.newFeature 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-400 text-white shadow-md animate-pulse'
                    : 'bg-purple-500 text-white'
                }`}>
                  {item.saMarket ? '🚀' : item.newFeature ? '✨' : 'NEW'}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      
      {/* Premium User Info */}
      <div className="mt-auto pt-4 border-t border-cyan-500/20 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
            SN
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">Sizwe Ngwenya</p>
            <p className="text-xs text-cyan-400/80">CEO & CTO</p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full font-semibold border border-green-500/30">
            All Access ✓
          </span>
          <span className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full font-semibold border border-cyan-500/30">
            Founder
          </span>
        </div>
      </div>
    </aside>
  );
}
