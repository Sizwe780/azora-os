/**
 * Azora OS - Offline Sync Manager
 * Manages offline operations and synchronization
 */

class OfflineSyncManager {
  constructor() {
    this.db = null;
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    
    this.init();
  }
  
  async init() {
    // Open IndexedDB
    this.db = await this.openDB();
    
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    
    // Register service worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('✅ Service Worker registered:', registration);
        
        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data.type === 'SYNC_COMPLETE') {
            console.log('✅ Background sync completed:', event.data.operationsCount, 'operations');
            this.showSyncNotification(event.data.operationsCount);
          }
        });
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    }
    
    // Check if there are pending operations
    const pendingCount = await this.getPendingOperationsCount();
    if (pendingCount > 0) {
      console.log(`📊 ${pendingCount} operations pending sync`);
      this.showPendingNotification(pendingCount);
    }
  }
  
  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('AzoraOfflineDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains('pendingOperations')) {
          const store = db.createObjectStore('pendingOperations', { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('userData')) {
          db.createObjectStore('userData', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('transactions')) {
          const store = db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('synced', 'synced', { unique: false });
        }
      };
    });
  }
  
  async queueOperation(operation) {
    const tx = this.db.transaction('pendingOperations', 'readwrite');
    const store = tx.objectStore('pendingOperations');
    
    const operationWithTimestamp = {
      ...operation,
      timestamp: Date.now(),
      synced: false,
    };
    
    await store.add(operationWithTimestamp);
    
    console.log('📥 Operation queued for sync:', operation.method, operation.url);
    
    // Try to sync immediately if online
    if (this.isOnline) {
      this.syncNow();
    }
  }
  
  async getPendingOperationsCount() {
    const tx = this.db.transaction('pendingOperations', 'readonly');
    const store = tx.objectStore('pendingOperations');
    const count = await store.count();
    return count;
  }
  
  async syncNow() {
    if (this.syncInProgress) {
      console.log('⏳ Sync already in progress');
      return;
    }
    
    this.syncInProgress = true;
    
    try {
      const tx = this.db.transaction('pendingOperations', 'readwrite');
      const store = tx.objectStore('pendingOperations');
      const operations = await store.getAll();
      
      console.log(`🔄 Syncing ${operations.length} operations...`);
      
      for (const operation of operations) {
        try {
          const response = await fetch(operation.url, {
            method: operation.method,
            headers: operation.headers,
            body: operation.body,
          });
          
          if (response.ok) {
            await store.delete(operation.id);
            console.log('✅ Synced:', operation.method, operation.url);
          }
        } catch (error) {
          console.error('❌ Failed to sync:', error);
        }
      }
      
      console.log('✅ Sync complete!');
      this.showSyncNotification(operations.length);
    } catch (error) {
      console.error('❌ Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }
  
  handleOnline() {
    console.log('🌐 Connection restored!');
    this.isOnline = true;
    this.showNotification('Back Online', 'Connection restored. Syncing data...');
    this.syncNow();
  }
  
  handleOffline() {
    console.log('📵 Connection lost. Operating in offline mode.');
    this.isOnline = false;
    this.showNotification('Offline Mode', 'No internet connection. Your data will sync when reconnected.');
  }
  
  showNotification(title, message) {
    // Show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/icons/icon-192.png',
      });
    }
    
    // Show in-app notification
    console.log(`📢 ${title}: ${message}`);
  }
  
  showPendingNotification(count) {
    this.showNotification(
      'Pending Sync',
      `${count} operation(s) waiting to sync when online.`
    );
  }
  
  showSyncNotification(count) {
    this.showNotification(
      'Sync Complete',
      `${count} operation(s) synced successfully.`
    );
  }
  
  // Save transaction locally
  async saveTransactionLocally(transaction) {
    const tx = this.db.transaction('transactions', 'readwrite');
    const store = tx.objectStore('transactions');
    
    const localTransaction = {
      ...transaction,
      timestamp: Date.now(),
      synced: false,
      offline: true,
    };
    
    await store.add(localTransaction);
    console.log('💾 Transaction saved locally:', transaction);
    
    // Queue for sync
    await this.queueOperation({
      method: 'POST',
      url: '/api/transactions/sync',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    });
  }
  
  // Get local transactions
  async getLocalTransactions() {
    const tx = this.db.transaction('transactions', 'readonly');
    const store = tx.objectStore('transactions');
    const transactions = await store.getAll();
    return transactions;
  }
  
  // Save user data locally
  async saveUserDataLocally(data) {
    const tx = this.db.transaction('userData', 'readwrite');
    const store = tx.objectStore('userData');
    await store.put(data);
    console.log('💾 User data saved locally');
  }
  
  // Get user data from local storage
  async getUserDataLocally(userId) {
    const tx = this.db.transaction('userData', 'readonly');
    const store = tx.objectStore('userData');
    const data = await store.get(userId);
    return data;
  }
}

// Initialize global instance
const offlineSync = new OfflineSyncManager();

// Export for use in other modules
window.AzoraOfflineSync = offlineSync;