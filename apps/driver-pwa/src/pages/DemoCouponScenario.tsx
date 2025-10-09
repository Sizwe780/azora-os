import React, { useState } from 'react';
import CouponPopup, { CouponData } from '../components/CouponPopup';

const mockCoupon: CouponData = {
  title: 'WRewards: 20% Off Apparel',
  description: 'Enjoy 20% off on all Woolworths apparel. Exclusive for WRewards members!',
  expiry: '2025-10-31',
  rewards: 'Earn 200 bonus points',
  brandLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Woolworths_South_Africa_logo.svg',
};

const DemoCouponScenario: React.FC = () => {
  const [showCoupon, setShowCoupon] = useState(true);

  // Simulate real-time event (for demo, just show on mount)
  const handleClose = () => setShowCoupon(false);

  return (
    <div>
      {/* Other demo UI ... */}
      <CouponPopup coupon={mockCoupon} visible={showCoupon} onClose={handleClose} />
    </div>
  );
};

export default DemoCouponScenario;
