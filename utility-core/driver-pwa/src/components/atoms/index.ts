/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Barrel file for the atomic directory.
 * This simplifies imports for organisms and pages.
 */
export * from '../../context/NotificationProvider';
export * from '../../hooks/azora/useNotify';
export { default as NotificationToast } from '../molecules/NotificationToast';
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js');
  }
  