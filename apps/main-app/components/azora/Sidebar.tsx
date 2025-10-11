import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Settings, Users, Brain, Zap, Navigation, 
  Shield, Snowflake, Truck, BarChart, LifeBuoy, Landmark,
  FileText, Briefcase, Mail, UserCircle
} from 'lucide-react';
import { type ComponentType } from 'react';
import { hasPermission, Permission } from '../../types/founders';

const CURRENT_USER_ID = 'user_001'; // Sizwe Ngwenya - CEO & CTO

interface NavItem {
  path: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  permission?: Permission | Permission[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Core',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/ai', label: 'Quantum AI', icon: Brain },
      { path: '/evolution', label: 'AI Evolution', icon: Zap },
    ],
  },
  {
    title: 'Logistics',
    items: [
      { path: '/tracking', label: 'Quantum Track', icon: Navigation },
      { path: '/driver', label: 'Driver AI', icon: Truck },
      { path: '/coldchain', label: 'Cold Chain', icon: Snowflake },
    ],
  },
  {
    title: 'Operations',
    items: [
      { path: '/operations', label: 'Operations', icon: Briefcase, permission: ['manage_operations', 'view_operations'] },
      { path: '/revenue', label: 'Revenue', icon: BarChart, permission: ['view_all_finances', 'view_own_finances'] },
      { path: '/support', label: 'Support', icon: LifeBuoy, permission: ['manage_operations', 'view_operations'] },
    ],
  },
  {
    title: 'Governance',
    items: [
      { path: '/security', label: 'Security', icon: Shield, permission: ['view_security', 'manage_security'] },
      { path: '/legal', label: 'Legal', icon: FileText, permission: ['view_compliance', 'manage_compliance'] },
      { path: '/finance', label: 'Finance', icon: Landmark, permission: ['view_all_finances', 'view_own_finances'] },
    ],
  },
  {
    title: 'Team',
    items: [
      { path: '/emails', label: 'Emails', icon: Mail, permission: 'access_emails' },
      { path: '/founders', label: 'Founders', icon: Users },
    ],
  },
];

const NavLink = ({ item, isActive }: { item: NavItem; isActive: boolean }) => (
  <Link
    to={item.path}
    className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-white/10 text-white'
        : 'text-gray-400 hover:bg-white/5 hover:text-white'
    }`}
  >
    <item.icon className="h-5 w-5" />
    <span>{item.label}</span>
  </Link>
);

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden w-64 flex-col border-r border-white/10 bg-gray-900/50 p-4 sm:flex">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-xl font-bold text-white">Azora OS</h1>
      </div>
      
      <nav className="flex-1 space-y-4">
        {navSections.map((section) => {
          const visibleItems = section.items.filter(item => 
            !item.permission || (Array.isArray(item.permission) 
              ? item.permission.some(p => hasPermission(CURRENT_USER_ID, p))
              : hasPermission(CURRENT_USER_ID, item.permission))
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title}>
              <h2 className="mb-2 px-3 text-xs font-semibold uppercase text-gray-500">
                {section.title}
              </h2>
              <div className="space-y-1">
                {visibleItems.map((item) => (
                  <NavLink key={item.path} item={item} isActive={location.pathname.startsWith(item.path)} />
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="space-y-1">
          <NavLink item={{ path: '/settings', label: 'Settings', icon: Settings }} isActive={location.pathname.startsWith('/settings')} />
          <NavLink item={{ path: '/profile', label: 'Sizwe Ngwenya', icon: UserCircle }} isActive={location.pathname.startsWith('/profile')} />
        </div>
      </div>
    </aside>
  );
}
