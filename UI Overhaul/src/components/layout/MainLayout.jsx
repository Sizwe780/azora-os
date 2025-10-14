import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import Footer from './Footer'

const MainLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: 'var(--bg-primary)'
    }}>
      <Sidebar 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        marginLeft: sidebarCollapsed ? '80px' : '280px',
        transition: 'margin-left 0.3s ease'
      }}>
        <TopBar />
        
        <main style={{
          flex: 1,
          padding: '24px',
          overflow: 'auto',
          background: 'var(--bg-primary)'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
        
        <Footer />
      </div>
    </div>
  )
}

export default MainLayout
