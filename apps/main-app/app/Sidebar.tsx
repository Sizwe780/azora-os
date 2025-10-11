import { type ComponentType } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, FaMoneyBillWave, FaAtom, FaMap, FaCog, FaTruck, FaStore, 
  FaSnowflake, FaShieldAlt, FaChartLine, FaUserClock, FaBuilding, 
  FaHeadset, FaLightbulb, FaGavel, FaWallet, FaEnvelope, FaUsers 
} from 'react-icons/fa';
import { Navigation, Brain, Zap } from 'lucide-react';
import { hasPermission, Permission } from '../types/founders';

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
  { path: '/', label: 'Sanctuary', icon: FaHome },
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
  { path: '/retail-partner', label: 'Retail Partner', icon: FaStore },
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
    <aside className="w-64 bg-slate-800/50 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col gap-4 relative z-10 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-cyan-300">Azora OS</h1>
        <p className="text-sm text-white/60">Infinite Aura</p>
        <p className="text-xs text-cyan-400 mt-2">🚀 Launch Day: Oct 10, 2025</p>
      </div>
      
      <nav className="flex flex-col gap-2">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? item.highlight 
                    ? item.saMarket
                      ? 'bg-gradient-to-r from-green-600 via-yellow-600 to-green-600 text-white shadow-lg shadow-green-500/50'
                      : item.newFeature
                      ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/50'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-cyan-600 text-white'
                  : item.highlight
                    ? item.saMarket
                      ? 'text-white bg-gradient-to-r from-green-500/20 via-yellow-500/20 to-green-500/20 hover:from-green-500/30 hover:via-yellow-500/30 hover:to-green-500/30 border border-green-500/40'
                      : item.newFeature
                      ? 'text-white bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 hover:from-purple-500/30 hover:via-pink-500/30 hover:to-purple-500/30 border border-pink-500/40'
                      : 'text-white bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-purple-500/30'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className={item.highlight ? 'animate-pulse' : ''} />
              <span className="text-sm">{item.label}</span>
              {item.highlight && !isActive && (
                <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                  item.saMarket
                    ? 'bg-gradient-to-r from-green-500 to-yellow-500 text-white animate-pulse'
                    : item.newFeature 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse'
                    : 'bg-purple-500 text-white'
                }`}>
                  {item.saMarket ? '🚀' : item.newFeature ? '✨' : 'NEW'}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      
      {/* User info at bottom */}
      <div className="mt-auto pt-4 border-t border-white/10">
        <div className="text-xs text-white/60">
          <p className="font-semibold text-white">Sizwe Ngwenya</p>
          <p>CEO & CTO</p>
          <p className="text-cyan-400 mt-1">All Access ✓</p>
        </div>
      </div>
    </aside>
  );
}
