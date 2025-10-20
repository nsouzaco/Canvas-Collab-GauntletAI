/**
 * Enhanced persistence utilities for better data recovery
 * Handles offline caching, reconnection, and state restoration
 */

// Storage keys for different data types
const STORAGE_KEYS = {
  CANVAS_STATE: 'collabcanvas_canvas_state',
  USER_PREFERENCES: 'collabcanvas_user_prefs',
  AI_ASSISTANT_STATE: 'collabcanvas_ai_state',
  PRESENCE_CACHE: 'collabcanvas_presence_cache',
  CONNECTION_STATE: 'collabcanvas_connection_state'
};

// Cache expiration times (in milliseconds)
const CACHE_EXPIRY = {
  CANVAS_STATE: 24 * 60 * 60 * 1000, // 24 hours
  USER_PREFERENCES: 7 * 24 * 60 * 60 * 1000, // 7 days
  AI_ASSISTANT_STATE: 60 * 60 * 1000, // 1 hour
  PRESENCE_CACHE: 5 * 60 * 1000, // 5 minutes
  CONNECTION_STATE: 10 * 60 * 1000 // 10 minutes
};

/**
 * Enhanced storage wrapper with expiration and error handling
 */
class PersistentStorage {
  static setItem(key, data, expiry = null) {
    try {
      const item = {
        data,
        timestamp: Date.now(),
        expiry: expiry || CACHE_EXPIRY[key] || 0
      };
      localStorage.setItem(key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.warn(`Failed to save ${key} to localStorage:`, error);
      return false;
    }
  }

  static getItem(key) {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      
      // Check if expired
      if (parsed.expiry > 0 && Date.now() - parsed.timestamp > parsed.expiry) {
        localStorage.removeItem(key);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.warn(`Failed to read ${key} from localStorage:`, error);
      return null;
    }
  }

  static removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Failed to remove ${key} from localStorage:`, error);
      return false;
    }
  }

  static clear() {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
      return false;
    }
  }
}

/**
 * Canvas state persistence
 */
export const CanvasPersistence = {
  saveCanvasState(shapes, metadata = {}) {
    const state = {
      shapes,
      metadata: {
        ...metadata,
        lastSaved: Date.now(),
        version: '1.0'
      }
    };
    return PersistentStorage.setItem(STORAGE_KEYS.CANVAS_STATE, state);
  },

  loadCanvasState() {
    const state = PersistentStorage.getItem(STORAGE_KEYS.CANVAS_STATE);
    if (state && state.shapes) {
      return state;
    }
    return null;
  },

  clearCanvasState() {
    return PersistentStorage.removeItem(STORAGE_KEYS.CANVAS_STATE);
  }
};

/**
 * User preferences persistence
 */
export const UserPreferencesPersistence = {
  savePreferences(preferences) {
    const prefs = {
      ...preferences,
      lastUpdated: Date.now()
    };
    return PersistentStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, prefs);
  },

  loadPreferences() {
    const prefs = PersistentStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    if (prefs) {
      return prefs;
    }
    return {
      theme: 'light',
      cursorColor: null,
      displayName: null,
      aiAssistantEnabled: true
    };
  },

  updatePreference(key, value) {
    const current = this.loadPreferences();
    const updated = { ...current, [key]: value };
    return this.savePreferences(updated);
  }
};

/**
 * AI Assistant state persistence
 */
export const AIAssistantPersistence = {
  saveAIState(state) {
    const aiState = {
      ...state,
      lastUpdated: Date.now()
    };
    return PersistentStorage.setItem(STORAGE_KEYS.AI_ASSISTANT_STATE, aiState);
  },

  loadAIState() {
    const state = PersistentStorage.getItem(STORAGE_KEYS.AI_ASSISTANT_STATE);
    if (state) {
      return state;
    }
    return {
      isVisible: true,
      lastCommand: null,
      suggestions: [],
      apiStatus: null
    };
  },

  saveLastCommand(command, result) {
    const current = this.loadAIState();
    const updated = {
      ...current,
      lastCommand: command,
      lastResult: result,
      lastUpdated: Date.now()
    };
    return this.saveAIState(updated);
  }
};

/**
 * Presence cache for offline users
 */
export const PresencePersistence = {
  savePresenceCache(users) {
    const cache = {
      users,
      lastUpdated: Date.now()
    };
    return PersistentStorage.setItem(STORAGE_KEYS.PRESENCE_CACHE, cache);
  },

  loadPresenceCache() {
    const cache = PersistentStorage.getItem(STORAGE_KEYS.PRESENCE_CACHE);
    if (cache && cache.users) {
      return cache.users;
    }
    return [];
  },

  clearPresenceCache() {
    return PersistentStorage.removeItem(STORAGE_KEYS.PRESENCE_CACHE);
  }
};

/**
 * Connection state management
 */
export const ConnectionPersistence = {
  saveConnectionState(state) {
    const connectionState = {
      ...state,
      lastUpdated: Date.now()
    };
    return PersistentStorage.setItem(STORAGE_KEYS.CONNECTION_STATE, connectionState);
  },

  loadConnectionState() {
    const state = PersistentStorage.getItem(STORAGE_KEYS.CONNECTION_STATE);
    if (state) {
      return state;
    }
    return {
      isOnline: false,
      lastConnected: null,
      reconnectAttempts: 0,
      offlineMode: false
    };
  },

  updateConnectionStatus(isOnline, metadata = {}) {
    const current = this.loadConnectionState();
    const updated = {
      ...current,
      isOnline,
      lastConnected: isOnline ? Date.now() : current.lastConnected,
      ...metadata
    };
    return this.saveConnectionState(updated);
  }
};

/**
 * Offline queue for actions that need to be synced when reconnected
 */
export class OfflineQueue {
  static QUEUE_KEY = 'collabcanvas_offline_queue';

  static addAction(action) {
    try {
      const queue = this.getQueue();
      queue.push({
        ...action,
        id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now()
      });
      localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
      return true;
    } catch (error) {
      console.warn('Failed to add action to offline queue:', error);
      return false;
    }
  }

  static getQueue() {
    try {
      const queue = localStorage.getItem(this.QUEUE_KEY);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.warn('Failed to read offline queue:', error);
      return [];
    }
  }

  static processQueue(processAction) {
    const queue = this.getQueue();
    if (queue.length === 0) return [];

    const results = [];
    
    queue.forEach(async (action) => {
      try {
        const result = await processAction(action);
        results.push({ action, result, success: true });
      } catch (error) {
        console.error('Failed to process offline action:', error);
        results.push({ action, error, success: false });
      }
    });

    // Clear processed actions
    this.clearQueue();
    return results;
  }

  static clearQueue() {
    try {
      localStorage.removeItem(this.QUEUE_KEY);
      return true;
    } catch (error) {
      console.warn('Failed to clear offline queue:', error);
      return false;
    }
  }
}

/**
 * Reconnection handler
 */
export class ReconnectionHandler {
  static async handleReconnection() {
    // Load cached state
    const canvasState = CanvasPersistence.loadCanvasState();
    const userPrefs = UserPreferencesPersistence.loadPreferences();
    const aiState = AIAssistantPersistence.loadAIState();
    const presenceCache = PresencePersistence.loadPresenceCache();
    const connectionState = ConnectionPersistence.loadConnectionState();

    // Process offline queue
    const queueResults = await OfflineQueue.processQueue(async (action) => {
      // This would be implemented based on the specific action type
      return { success: true };
    });

    return {
      canvasState,
      userPrefs,
      aiState,
      presenceCache,
      connectionState,
      queueResults
    };
  }

  static async saveStateBeforeDisconnect() {
    // This would be called when the user is about to disconnect
    // to ensure we have the latest state cached
    return {
      timestamp: Date.now(),
      saved: true
    };
  }
}

export default {
  CanvasPersistence,
  UserPreferencesPersistence,
  AIAssistantPersistence,
  PresencePersistence,
  ConnectionPersistence,
  OfflineQueue,
  ReconnectionHandler
};
