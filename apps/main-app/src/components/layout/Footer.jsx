import React from 'react'

const Footer = () => {
  return (
    <footer style={{
      padding: '16px 24px',
      borderTop: '1px solid var(--border-primary)',
      background: 'var(--bg-secondary)',
      textAlign: 'center'
    }}>
      <p style={{
        fontSize: '14px',
        color: 'var(--text-secondary)',
        margin: 0
      }}>
        Built by <span style={{ color: 'var(--accent-primary)', fontWeight: '500' }}>Azora World (Pty) Ltd</span> — Sovereign. Compliant. Autonomous.
      </p>
    </footer>
  )
}

export default Footer
