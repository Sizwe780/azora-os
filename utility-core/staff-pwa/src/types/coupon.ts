/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// Coupon types for WRewards integration
export interface Coupon {
  id: string;
  title: string;
  description: string;
  discount: string;
  expiryDate: Date;
  code: string;
  category: 'groceries' | 'apparel' | 'general';
  imageUrl?: string;
}

export interface CouponEvent {
  type: 'earned' | 'reminder' | 'expired';
  coupon: Coupon;
  timestamp: Date;
}
