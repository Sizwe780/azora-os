# WRewards Coupon Popup Component

This component implements a modular, visually engaging coupon popup UI for the Woolworths Voice Copilot & WRewards demo (Scenario 1).

## Features

- ✅ **Woolworths Branding**: Green color scheme matching Woolworths brand
- ✅ **Multiple Categories**: Different gradient colors for groceries, apparel, and general coupons
- ✅ **Animated Popup**: Smooth fade-in and scale-in animations with bouncy effect
- ✅ **Auto-dismiss**: Automatically closes after 8 seconds
- ✅ **Interactive Elements**: 
  - Copy-to-clipboard for coupon codes
  - Manual close button
  - Click outside to dismiss
- ✅ **Responsive Design**: Tablet-friendly layout (tested at 768x1024)
- ✅ **Expiry Countdown**: Real-time display of days until coupon expires
- ✅ **State Management**: Context-based coupon management using React Context API

## Components

### `CouponPopup.tsx`
The main modal component that displays coupon details with animations and interactions.

### `CouponProvider.tsx`
Context provider that manages coupon state and includes mock coupon data for demo purposes.

### `App.tsx`
Demo interface with simulator controls to trigger coupon popups.

## Usage

```tsx
import { CouponProvider } from './context/CouponProvider';
import { CouponPopup } from './components/CouponPopup';

function App() {
  return (
    <CouponProvider>
      <YourApp />
      <CouponPopup />
    </CouponProvider>
  );
}
```

To show a coupon:
```tsx
import { useCoupon } from './context/CouponProvider';

function YourComponent() {
  const { showCoupon, coupons } = useCoupon();
  
  return (
    <button onClick={() => showCoupon(coupons[0])}>
      Show Coupon
    </button>
  );
}
```

## Mock Data

The component includes 3 mock coupons:
1. **20% Off Premium Apparel** - Purple/Pink gradient
2. **R50 Off Groceries** - Green gradient (Woolworths signature)
3. **Free Delivery** - Blue gradient

## Demo

Run the demo:
```bash
cd apps/staff-pwa
npm run dev
```

Then open http://localhost:5173 to interact with the coupon simulator.

## Scenario Context

This component is part of Scenario 1 for the Woolworths FY2025 demo, where customers earn WRewards coupons by engaging with the Voice Copilot for product recommendations, dietary preferences, and shopping assistance in the Apparel section.
