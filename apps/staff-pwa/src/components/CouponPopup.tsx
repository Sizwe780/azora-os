import React, { useEffect } from 'react';
import { useCoupon } from '../context/CouponProvider';

export const CouponPopup: React.FC = () => {
  const { currentCoupon, showPopup, dismissCoupon } = useCoupon();

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => {
        dismissCoupon();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [showPopup, dismissCoupon]);

  if (!showPopup || !currentCoupon) {
    return null;
  }

  const formatExpiryDate = (date: Date) => {
    const days = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Expires today';
    if (days === 1) return 'Expires tomorrow';
    return `Expires in ${days} days`;
  };

  const getCategoryGradient = (category: string) => {
    switch (category) {
      case 'apparel':
        return 'linear-gradient(135deg, #9333ea 0%, #db2777 100%)';
      case 'groceries':
        return 'linear-gradient(135deg, #16a34a 0%, #059669 100%)';
      default:
        return 'linear-gradient(135deg, #2563eb 0%, #0891b2 100%)';
    }
  };

  return (
    <div 
      className="animate-fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={dismissCoupon}
    >
      <div 
        className="animate-scale-in"
        style={{
          position: 'relative',
          background: 'white',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '448px',
          width: '100%',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={dismissCoupon}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10,
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s',
          }}
          aria-label="Close"
        >
          <svg style={{ width: '20px', height: '20px', color: '#374151' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header with Gradient */}
        <div style={{
          background: getCategoryGradient(currentCoupon.category),
          padding: '32px 24px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Animated Background Circles */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '128px',
            height: '128px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            transform: 'translate(50%, -50%)',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '96px',
            height: '96px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            transform: 'translate(-50%, 50%)',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            animationDelay: '75ms',
          }}></div>
          
          {/* WRewards Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(4px)',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              🎁 WRewards
            </div>
          </div>

          {/* Discount Amount */}
          <div style={{ position: 'relative', zIndex: 10 }}>
            <div style={{
              fontSize: '48px',
              fontWeight: 700,
              marginBottom: '8px',
              textShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}>
              {currentCoupon.discount}
            </div>
            <div style={{
              fontSize: '18px',
              fontWeight: 500,
              opacity: 0.9,
            }}>
              {currentCoupon.title}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Description */}
          <p style={{
            color: '#374151',
            fontSize: '16px',
            lineHeight: 1.6,
            marginTop: 0,
            marginBottom: '16px',
          }}>
            {currentCoupon.description}
          </p>

          {/* Coupon Code */}
          <div style={{
            background: '#f9fafb',
            border: '2px dashed #16a34a',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
          }}>
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '4px',
              fontWeight: 600,
            }}>
              Coupon Code
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <code style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#16a34a',
                letterSpacing: '0.1em',
              }}>
                {currentCoupon.code}
              </code>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(currentCoupon.code);
                }}
                style={{
                  background: '#16a34a',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#15803d'}
                onMouseOut={(e) => e.currentTarget.style.background = '#16a34a'}
              >
                Copy
              </button>
            </div>
          </div>

          {/* Expiry Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '16px',
          }}>
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span style={{ fontWeight: 500 }}>
              {formatExpiryDate(currentCoupon.expiryDate)}
            </span>
          </div>

          {/* Action Button */}
          <button
            onClick={dismissCoupon}
            style={{
              width: '100%',
              background: '#16a34a',
              color: 'white',
              fontWeight: 600,
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#15803d';
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#16a34a';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
            }}
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
