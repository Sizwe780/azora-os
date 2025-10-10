/**
 * Firebase Configuration (Optional - Only for push notifications)
 * 
 * NOTE: This is OPTIONAL. Firebase is only used for:
 * - Push notifications to drivers
 * - Real-time updates (can be replaced with WebSocket)
 * 
 * Your AI (Quantum Deep Mind) is 100% local and does NOT use Firebase.
 * Your tracking system is 100% local and does NOT use Firebase.
 * 
 * You can completely remove this file if you don't need push notifications.
 */

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkqPwshtV2NRoAPTGefVyBDWgZT3YBasU",
  authDomain: "azora-f9383.firebaseapp.com",
  projectId: "azora-f9383",
  storageBucket: "azora-f9383.firebasestorage.app",
  messagingSenderId: "586102684407",
  appId: "1:586102684407:web:ffef77b69ce419f6cfb1f2",
  measurementId: "G-ZPTHGX4864"
};

// Mock exports for now (install firebase package if you need push notifications)
const app = null;
const analytics = null;

export { app, analytics, firebaseConfig };
