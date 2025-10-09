import React from 'react';
import { CouponProvider, useCoupon } from './context/CouponProvider';
import { CouponPopup } from './components/CouponPopup';
import './styles.css';

// Demo interface component
const DemoInterface: React.FC = () => {
  const { showCoupon, coupons } = useCoupon();

  return (
    <div className="container">
      <div className="header">
        <h1>Azora Copilot — Woolworths</h1>
        <p>Voice Copilot & WRewards Demo (Scenario 1)</p>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>
          🎁 WRewards Coupon Simulator
        </h2>
        <p style={{ marginBottom: '1.5rem', color: 'var(--muted)' }}>
          Click a coupon below to simulate earning it through Voice Copilot interactions
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {coupons.map((coupon) => (
            <button
              key={coupon.id}
              onClick={() => showCoupon(coupon)}
              className="button"
              style={{ 
                width: '100%', 
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                  {coupon.title}
                </div>
                <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                  {coupon.description}
                </div>
              </div>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: 700,
                marginLeft: '1rem' 
              }}>
                {coupon.discount}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ background: 'var(--glass)', borderColor: 'var(--border)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '0.75rem', fontSize: '1rem', fontWeight: 600 }}>
          📱 Demo Features
        </h3>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
          <li>Visually engaging popup with animations</li>
          <li>Woolworths brand colors and styling</li>
          <li>Auto-dismiss after 8 seconds</li>
          <li>Copy-to-clipboard for coupon codes</li>
          <li>Responsive tablet-friendly design</li>
          <li>Real-time expiry countdown</li>
        </ul>
      </div>

      <div className="card" style={{ background: 'rgba(76, 175, 80, 0.1)', borderColor: 'rgba(76, 175, 80, 0.3)' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text)' }}>
          <strong>Scenario 1 Context:</strong> Customer earns WRewards coupons by engaging with Voice Copilot 
          for product recommendations, dietary preferences, and shopping assistance in the Woolworths Apparel section.
        </p>
      </div>
    </div>
  );
};

// Main App component with provider
const App: React.FC = () => {
  return (
    <CouponProvider>
      <DemoInterface />
      <CouponPopup />
    </CouponProvider>
  );
};

export default App;
