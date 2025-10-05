import { useContext } from 'react';
import { NotificationContext } from '../NotificationProvider';

/**
 * Provides direct access to the `notify` function from the NotificationProvider.
 * This is the primary hook for triggering notifications from any component.
 * @returns {function} The `notify` function.
 * @throws {Error} If used outside of a NotificationProvider.
 */
export function useNotify() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotify must be used within a NotificationProvider');
  }
  return context.notify;
}
