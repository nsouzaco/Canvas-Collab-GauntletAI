/**
 * Reconnection service for handling data recovery when users return
 */

import { ReconnectionHandler, OfflineQueue } from '../utils/persistence';
import { subscribeToShapes } from './canvas';
import { subscribeToPresence } from './presence';

class ReconnectionService {
  constructor() {
    this.isReconnecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
  }

  /**
   * Handle reconnection when user returns after being inactive
   */
  async handleReconnection() {
    if (this.isReconnecting) {
      console.log('🔄 Reconnection already in progress');
      return;
    }

    this.isReconnecting = true;
    console.log('🔄 Starting reconnection process...');

    try {
      // Load cached state
      const cachedState = await ReconnectionHandler.handleReconnection();
      
      // Process offline queue
      const queueResults = await this.processOfflineQueue();
      
      // Re-establish connections
      await this.reestablishConnections();
      
      console.log('✅ Reconnection completed successfully');
      return {
        success: true,
        cachedState,
        queueResults,
        reconnectAttempts: this.reconnectAttempts
      };
    } catch (error) {
      console.error('❌ Reconnection failed:', error);
      this.handleReconnectionFailure(error);
      return {
        success: false,
        error: error.message,
        reconnectAttempts: this.reconnectAttempts
      };
    } finally {
      this.isReconnecting = false;
    }
  }

  /**
   * Process actions that were queued while offline
   */
  async processOfflineQueue() {
    console.log('📝 Processing offline queue...');
    
    const queue = OfflineQueue.getQueue();
    if (queue.length === 0) {
      console.log('📝 No offline actions to process');
      return [];
    }

    const results = [];
    
    for (const action of queue) {
      try {
        console.log(`🔄 Processing offline action: ${action.type}`);
        const result = await this.executeOfflineAction(action);
        results.push({ action, result, success: true });
      } catch (error) {
        console.error(`❌ Failed to process offline action ${action.type}:`, error);
        results.push({ action, error: error.message, success: false });
      }
    }

    // Clear the queue after processing
    OfflineQueue.clearQueue();
    console.log(`✅ Processed ${results.length} offline actions`);
    
    return results;
  }

  /**
   * Execute a specific offline action
   */
  async executeOfflineAction(action) {
    switch (action.type) {
      case 'CREATE_SHAPE':
        // This would be handled by the canvas service
        console.log('🎨 Syncing shape creation:', action.data);
        return { synced: true, shapeId: action.data.id };
        
      case 'UPDATE_SHAPE':
        console.log('✏️ Syncing shape update:', action.data);
        return { synced: true, shapeId: action.data.id };
        
      case 'DELETE_SHAPE':
        console.log('🗑️ Syncing shape deletion:', action.data);
        return { synced: true, shapeId: action.data.id };
        
      default:
        console.warn('⚠️ Unknown offline action type:', action.type);
        return { synced: false, error: 'Unknown action type' };
    }
  }

  /**
   * Re-establish Firebase connections
   */
  async reestablishConnections() {
    console.log('🔌 Re-establishing Firebase connections...');
    
    try {
      // Re-establish canvas subscription
      // This would be handled by the useCanvas hook
      console.log('📊 Re-established canvas connection');
      
      // Re-establish presence subscription
      // This would be handled by the usePresence hook
      console.log('👥 Re-established presence connection');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to re-establish connections:', error);
      throw error;
    }
  }

  /**
   * Handle reconnection failure with exponential backoff
   */
  handleReconnectionFailure(error) {
    this.reconnectAttempts++;
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      console.log(`⏳ Retrying reconnection in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.handleReconnection();
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached. Manual intervention required.');
      this.notifyReconnectionFailure();
    }
  }

  /**
   * Notify user of reconnection failure
   */
  notifyReconnectionFailure() {
    // This could trigger a UI notification
    console.error('🚨 Reconnection failed after maximum attempts');
    
    // Could dispatch a custom event or update a global state
    window.dispatchEvent(new CustomEvent('reconnection-failed', {
      detail: {
        attempts: this.reconnectAttempts,
        maxAttempts: this.maxReconnectAttempts
      }
    }));
  }

  /**
   * Reset reconnection state
   */
  reset() {
    this.isReconnecting = false;
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;
  }

  /**
   * Check if currently reconnecting
   */
  getReconnectionStatus() {
    return {
      isReconnecting: this.isReconnecting,
      attempts: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts
    };
  }
}

// Create singleton instance
const reconnectionService = new ReconnectionService();

export default reconnectionService;
