import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Coupon, CouponEvent } from '../types/coupon';

interface CouponContextType {
  currentCoupon: Coupon | null;
  showPopup: boolean;
  showCoupon: (coupon: Coupon) => void;
  dismissCoupon: () => void;
  coupons: Coupon[];
}

const CouponContext = createContext<CouponContextType | undefined>(undefined);

// Mock coupon data for demo
const mockCoupons: Coupon[] = [
  {
    id: 'WW-COUP-001',
    title: '20% Off Premium Apparel',
    description: 'Save on selected premium fashion items',
    discount: '20%',
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    code: 'STYLE20',
    category: 'apparel',
  },
  {
    id: 'WW-COUP-002',
    title: 'R50 Off Groceries',
    description: 'Spend R300 or more on groceries',
    discount: 'R50',
    expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    code: 'FRESH50',
    category: 'groceries',
  },
  {
    id: 'WW-COUP-003',
    title: 'Free Delivery',
    description: 'Free delivery on your next online order',
    discount: 'Free Delivery',
    expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    code: 'DELIVER',
    category: 'general',
  },
];

export const CouponProvider = ({ children }: { children: ReactNode }) => {
  const [currentCoupon, setCurrentCoupon] = useState<Coupon | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const showCoupon = useCallback((coupon: Coupon) => {
    setCurrentCoupon(coupon);
    setShowPopup(true);
  }, []);

  const dismissCoupon = useCallback(() => {
    setShowPopup(false);
    // Wait for animation to complete before clearing coupon
    setTimeout(() => setCurrentCoupon(null), 300);
  }, []);

  return (
    <CouponContext.Provider 
      value={{ 
        currentCoupon, 
        showPopup, 
        showCoupon, 
        dismissCoupon,
        coupons: mockCoupons 
      }}
    >
      {children}
    </CouponContext.Provider>
  );
};

export const useCoupon = () => {
  const context = useContext(CouponContext);
  if (!context) {
    throw new Error('useCoupon must be used within a CouponProvider');
  }
  return context;
};
