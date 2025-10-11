import React, { useEffect, useState } from 'react';
import './CouponPopup.css';

export interface CouponData {
  title: string;
  description: string;
  expiry: string;
  rewards: string;
  brandLogoUrl?: string;
}

interface CouponPopupProps {
  coupon: CouponData;
  onClose: () => void;
  visible: boolean;
}

const retail-partnerGreen = '#007A33';
const retail-partnerYellow = '#FFD600';

export const CouponPopup: React.FC<CouponPopupProps> = ({ coupon, onClose, visible }) => {
  const [show, setShow] = useState(visible);
  useEffect(() => {
    setShow(visible);
  }, [visible]);

  // Animation: fade-in/out
  return (
    <div className={`retail-partner-coupon-modal ${show ? 'show' : 'hide'}`}>  
      <div className="retail-partner-coupon-content">
        <button className="retail-partner-coupon-close" onClick={onClose} aria-label="Close">×</button>
        <div className="retail-partner-coupon-header">
          {coupon.brandLogoUrl && (
            <img src={coupon.brandLogoUrl} alt="Retail Partner Logo" className="retail-partner-logo" />
          )}
          <h2 style={{ color: retail-partnerGreen }}>{coupon.title}</h2>
        </div>
        <div className="retail-partner-coupon-body">
          <p>{coupon.description}</p>
          <div className="retail-partner-coupon-rewards" style={{ color: retail-partnerYellow }}>
            {coupon.rewards}
          </div>
          <div className="retail-partner-coupon-expiry">
            Expires: <span>{coupon.expiry}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponPopup;
