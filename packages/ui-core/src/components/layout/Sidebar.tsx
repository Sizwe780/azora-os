import React from 'react';
import { motion } from 'framer-motion';
import { 
  Home, Settings, Shield, Truck, Brain, Snowflake, 
  MapPin, BarChart3, FileText, Wrench, Users, 
  Route, Lock, Navigation, Package, Scissors,
  UserCheck, Eye, Zap, Accessibility, UserCog,
  Bot, CreditCard, Menu, X
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  pathname: string;
  onNavigate: (path: string) => void;
}

const services = [
  { id: 'dashboard', name: 'Dashboard', icon: Home, path: '/dashboard' },
  { id: 'retail-partner', name: 'Retail Partner', icon: Package, path: '/services/retail-partner' },
  { id: 'ev-leader', name: 'EV Leader Ops', icon: Truck, path: '/services/ev-leader' },
  { id: 'neural-context', name: 'Neural Context', icon: Brain, path: '/services/neural-context' },
  { id: 'safety-orchestrator', name: 'Safety Orchestrator', icon: Shield, path: '/services/safety-orchestrator' },
  { id: 'cold-chain', name: 'Cold Chain', icon: Snowflake, path: '/services/cold-chain' },
  { id: 'tracking-engine', name: 'Tracking Engine', icon: MapPin, path: '/services/tracking-engine' },
  { id: 'deep-mind', name: 'Deep Mind', icon: Brain, path: '/services/deep-mind' },
  { id: 'analytics', name: 'Analytics', icon: BarChart3, path: '/services/analytics' },
  { id: 'compliance', name: 'Compliance', icon: Shield, path: '/services/compliance' },
  { id: 'document-vault', name: 'Document Vault', icon: FileText, path: '/services/document-vault' },
  { id: 'maintenance', name: 'Maintenance', icon: Wrench, path: '/services/maintenance' },
  { id: 'employee-onboarding', name: 'HR Onboarding', icon: Users, path: '/services/employee-onboarding' },
  { id: 'traffic-routing', name: 'Traffic Routing', icon: Route, path: '/services/traffic-routing' },
  { id: 'crypto-ledger', name: 'Crypto Ledger', icon: Lock, path: '/services/crypto-ledger' },
  { id: 'trip-planning', name: 'Trip Planning', icon: Navigation, path: '/services/trip-planning' },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle, pathname, onNavigate }) => {
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-primary)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid var(--border-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)'
            }}>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>A</span>
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '16px' }}>Azora OS</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sovereign System</div>
            </div>
          </motion.div>
        )}
        
        <button
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1,
        padding: '20px 0',
        overflow: 'auto'
      }}>
        {services.map((service) => {
          const Icon = service.icon;
          const isActive = pathname === service.path;
          
          return (
            <div
              key={service.id}
              onClick={() => onNavigate(service.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: collapsed ? '12px 20px' : '12px 20px',
                margin: '2px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--bg-glass)' : 'transparent',
                border: isActive ? '1px solid var(--accent-primary)' : '1px solid transparent',
                transition: 'all 0.3s ease',
                justifyContent: collapsed ? 'center' : 'flex-start',
                cursor: 'pointer'
              }}
            >
              <Icon size={20} />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ fontSize: '14px', fontWeight: '500' }}
                >
                  {service.name}
                </motion.span>
              )}
            </div>
          );
        })}
      </nav>

      {/* Wallet Widget */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            padding: '15px',
            margin: '0 12px 15px',
            borderRadius: '8px',
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-primary)'
          }}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '10px' 
          }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Azora Balance</span>
            <span 
              style={{ 
                fontSize: '12px', 
                color: 'var(--accent-primary)', 
                cursor: 'pointer' 
              }}
              onClick={() => onNavigate('/wallet')}
            >
              View
            </span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '5px' }}>
            256.43 <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>AZR</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button
              onClick={() => onNavigate('/wallet/send')}
              style={{
                flex: 1,
                border: 'none',
                padding: '6px 0',
                fontSize: '13px',
                textAlign: 'center',
                borderRadius: '6px',
                background: 'var(--accent-primary)',
                color: 'white',
                cursor: 'pointer'
              }}
            >Send</button>
            <button
              onClick={() => onNavigate('/wallet/withdraw')}
              style={{
                flex: 1,
                padding: '6px 0',
                fontSize: '13px',
                textAlign: 'center',
                borderRadius: '6px',
                border: '1px solid var(--accent-primary)',
                background: 'transparent',
                color: 'var(--accent-primary)',
                cursor: 'pointer'
              }}
            >Withdraw</button>
          </div>
        </motion.div>
      )}

      {/* Subscription CTA */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            padding: '20px',
            borderTop: '1px solid var(--border-primary)'
          }}
        >
          <button
            onClick={() => onNavigate('/subscription')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              fontSize: '14px',
              gap: '8px',
              padding: '10px 0',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              color: 'white',
              borderRadius: '6px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            <CreditCard size={16} />
            Upgrade Plan
          </button>
        </motion.div>
      )}
    </motion.aside>
  );
};
