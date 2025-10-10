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

// TODO: Replace with real coupon data from API or state
const coupons: Coupon[] = [];

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
  coupons: coupons
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
