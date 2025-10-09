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

const woolworthsGreen = '#007A33';
const woolworthsYellow = '#FFD600';

export const CouponPopup: React.FC<CouponPopupProps> = ({ coupon, onClose, visible }) => {
  const [show, setShow] = useState(visible);
  useEffect(() => {
    setShow(visible);
  }, [visible]);

  // Animation: fade-in/out
  return (
    <div className={`woolworths-coupon-modal ${show ? 'show' : 'hide'}`}>  
      <div className="woolworths-coupon-content">
        <button className="woolworths-coupon-close" onClick={onClose} aria-label="Close">×</button>
        <div className="woolworths-coupon-header">
          {coupon.brandLogoUrl && (
            <img src={coupon.brandLogoUrl} alt="Woolworths Logo" className="woolworths-logo" />
          )}
          <h2 style={{ color: woolworthsGreen }}>{coupon.title}</h2>
        </div>
        <div className="woolworths-coupon-body">
          <p>{coupon.description}</p>
          <div className="woolworths-coupon-rewards" style={{ color: woolworthsYellow }}>
            {coupon.rewards}
          </div>
          <div className="woolworths-coupon-expiry">
            Expires: <span>{coupon.expiry}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponPopup;
