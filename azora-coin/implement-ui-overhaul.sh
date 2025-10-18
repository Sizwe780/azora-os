#!/bin/bash

echo "🎨 Implementing UI Overhaul across Azora OS"

# Create a design system package that can be shared across apps
mkdir -p /workspaces/azora-os/packages/ui-core
cd /workspaces/azora-os/packages/ui-core

# Initialize package
npm init -y

# Update package.json
cat > package.json << 'PKGJSON'
{
  "name": "@azora/ui-core",
  "version": "1.0.0",
  "description": "Azora OS UI Design System",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch",
    "lint": "eslint src/**/*.ts*"
  },
  "keywords": ["azora", "ui", "design-system"],
  "author": "Azora World (Pty) Ltd",
  "license": "UNLICENSED",
  "private": true,
  "dependencies": {
    "framer-motion": "^10.16.4",
    "lucide-react": "^0.284.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "eslint": "^8.45.0",
    "tsup": "^7.2.0",
    "typescript": "^5.0.2"
  }
}
PKGJSON

# Create tsconfig
cat > tsconfig.json << 'TSCONFIG'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "declaration": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
TSCONFIG

# Create directory structure
mkdir -p src/components/layout
mkdir -p src/components/wallet
mkdir -p src/components/common
mkdir -p src/styles
mkdir -p src/hooks
mkdir -p src/icons
mkdir -p src/contexts

# Create base theme CSS
cat > src/styles/theme.css << 'CSS'
:root {
  /* Light Theme */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-glass: rgba(245, 247, 250, 0.85);
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border-primary: #e2e8f0;
  --accent-primary: #3b82f6;
  --accent-secondary: #2563eb;
  --shadow-glow: 0 0 15px rgba(59, 130, 246, 0.5);
  --shadow-elevation: 0 4px 12px rgba(0, 0, 0, 0.05);

  /* Shared */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
}

[data-theme="dark"] {
  /* Dark Theme */
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-glass: rgba(30, 41, 59, 0.85);
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --border-primary: #334155;
  --accent-primary: #3b82f6;
  --accent-secondary: #60a5fa;
  --shadow-glow: 0 0 20px rgba(59, 130, 246, 0.3);
  --shadow-elevation: 0 4px 12px rgba(0, 0, 0, 0.2);
}

body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

* {
  box-sizing: border-box;
}

/* Basic button styles */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: 10px 16px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  filter: brightness(1.1);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: transparent;
  color: var(--accent-primary);
  border: 1px solid var(--accent-primary);
  border-radius: var(--radius-md);
  padding: 10px 16px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--bg-glass);
}
CSS

# Create ThemeContext
cat > src/contexts/ThemeContext.tsx << 'TSX'
import React, { createContext, useState, useEffect, useContext } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('azora-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  // Update localStorage and apply theme when it changes
  useEffect(() => {
    localStorage.setItem('azora-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (!localStorage.getItem('azora-theme')) {
        setTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
TSX

# Create Sidebar component
cat > src/components/layout/Sidebar.tsx << 'TSX'
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
TSX

# Create index.ts to export all components
cat > src/index.ts << 'TS'
// Export styles
import './styles/theme.css';

// Export components
export { Sidebar } from './components/layout/Sidebar';

// Export contexts
export { ThemeProvider, useTheme } from './contexts/ThemeContext';

// Export types
export type { Theme } from './contexts/ThemeContext';
TS

# Copy UI components to all applications
echo "Copying UI components to all applications..."

# Copy to main app
mkdir -p /workspaces/azora-os/apps/main-app/src/components
cp -r src/components/layout /workspaces/azora-os/apps/main-app/src/components/
cp -r src/styles /workspaces/azora-os/apps/main-app/src/

# Copy to driver-pwa
mkdir -p /workspaces/azora-os/apps/driver-pwa/src/components
cp -r src/components/layout /workspaces/azora-os/apps/driver-pwa/src/components/
cp -r src/styles /workspaces/azora-os/apps/driver-pwa/src/

# Copy to compliance UI
mkdir -p /workspaces/azora-os/compliance-ui/src/components
cp -r src/components/layout /workspaces/azora-os/compliance-ui/src/components/
cp -r src/styles /workspaces/azora-os/compliance-ui/src/

echo "✅ UI components copied to all applications!"

# Create wallet components
mkdir -p /workspaces/azora-os/apps/main-app/src/components/wallet
cat > /workspaces/azora-os/apps/main-app/src/components/wallet/WalletCard.jsx << 'JSX'
import React from 'react';
import { Link } from 'react-router-dom';
import { Send, CreditCard } from 'lucide-react';

const WalletCard = ({ balance = '0.00', onSend, onWithdraw }) => {
  return (
    <div style={{
      padding: '20px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
      color: 'white',
      boxShadow: 'var(--shadow-elevation)',
      marginBottom: '24px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
      }}>
        <span style={{ fontSize: '14px', opacity: 0.9 }}>Azora Balance</span>
        <Link to="/wallet/transactions" style={{ 
          fontSize: '13px', 
          color: 'white',
          textDecoration: 'none',
          opacity: 0.9
        }}>
          View History
        </Link>
      </div>
      
      <div style={{ 
        fontSize: '32px', 
        fontWeight: '700',
        margin: '15px 0 25px'
      }}>
        {balance} <span style={{ fontSize: '18px', fontWeight: '500' }}>AZR</span>
      </div>
      
      <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
        <button onClick={onSend} style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '10px 0',
          fontSize: '14px',
          background: 'rgba(255, 255, 255, 0.2)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'background 0.2s ease'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
        >
          <Send size={16} />
          Send
        </button>
        
        <button onClick={onWithdraw} style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '10px 0',
          fontSize: '14px',
          background: 'rgba(255, 255, 255, 0.2)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'background 0.2s ease'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
        >
          <CreditCard size={16} />
          Withdraw
        </button>
      </div>
    </div>
  );
};

export default WalletCard;
JSX

echo "✅ UI Overhaul implementation complete!"
