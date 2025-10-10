import React, { useState } from 'react';
import CouponPopup, { CouponData } from '../components/CouponPopup';

// TODO: Replace with real coupon data from API
const coupon: CouponData = {
  title: 'Demo Coupon',
  description: 'This is a placeholder coupon for demonstration purposes.',
  expiry: '2025-12-31',
  rewards: 'Demo rewards',
  brandLogoUrl: '',
};

const DemoCouponScenario: React.FC = () => {
  const [showCoupon, setShowCoupon] = useState(true);

  // TODO: Implement real coupon fetching logic
  const handleClose = () => setShowCoupon(false);

  return (
    <div>
      {/* TODO: Add proper demo UI */}
      <CouponPopup coupon={coupon} visible={showCoupon} onClose={handleClose} />
    </div>
  );
};

export default DemoCouponScenario;
