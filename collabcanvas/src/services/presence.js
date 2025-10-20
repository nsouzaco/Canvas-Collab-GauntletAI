import { ref, set, onDisconnect, onValue, remove, update } from 'firebase/database';
import { rtdb } from './firebase';

// Set user as online
export const setUserOnline = async (canvasId, userId, displayName, cursorColor) => {
  try {
    const userRef = ref(rtdb, `sessions/${canvasId}/${userId}`);
    
    const userData = {
      displayName,
      cursorColor,
      cursorX: 100, // Start at a more visible position
      cursorY: 100,
      lastSeen: Date.now()
    };
    
    await set(userRef, userData);
    console.log('✅ User set online successfully');

    // Set user as offline when they disconnect
    onDisconnect(userRef).remove();
  } catch (error) {
    console.error('❌ Error setting user online:', error);
    throw new Error('Failed to set user online. Please check your connection.');
  }
};

// Refresh user presence (for reconnection scenarios)
export const refreshUserPresence = async (canvasId, userId, displayName, cursorColor) => {
  try {
    const userRef = ref(rtdb, `sessions/${canvasId}/${userId}`);
    
    const updateData = {
      lastSeen: Date.now(),
      displayName,
      cursorColor
    };
    
    await update(userRef, updateData);
    console.log('🔄 User presence refreshed successfully');
  } catch (error) {
    console.error('❌ Error refreshing user presence:', error);
    // Don't throw error for refresh - it's not critical
  }
};

// Set user as offline
export const setUserOffline = async (canvasId, userId) => {
  try {
    const userRef = ref(rtdb, `sessions/${canvasId}/${userId}`);
    await remove(userRef);
  } catch (error) {
    console.error('Error setting user offline:', error);
    // Don't throw error for offline - it's not critical
  }
};

// Update cursor position
export const updateCursorPosition = async (canvasId, userId, x, y) => {
  try {
    const userRef = ref(rtdb, `sessions/${canvasId}/${userId}`);
    
    const updateData = {
      cursorX: x,
      cursorY: y,
      lastSeen: Date.now()
    };
    
    // Use update to only change cursor position, preserve other data
    await update(userRef, updateData);
  } catch (error) {
    console.error('Error updating cursor position:', error);
    // Don't throw error for cursor updates - they're not critical
  }
};

// Subscribe to presence changes
export const subscribeToPresence = (canvasId, callback) => {
  const presenceRef = ref(rtdb, `sessions/${canvasId}`);
  
  return onValue(presenceRef, (snapshot) => {

    const data = snapshot.val();
    const users = data ? Object.entries(data).map(([userId, userData]) => ({
      userId,
      ...userData
    })) : [];
    
    callback(users);
  });
};
