import { ref, set, onDisconnect, onValue, remove, update } from 'firebase/database';
import { rtdb } from './firebase';

const CANVAS_ID = 'global-canvas-v1';

// Set user as online
export const setUserOnline = async (userId, displayName, cursorColor) => {
  try {
    const userRef = ref(rtdb, `sessions/${CANVAS_ID}/${userId}`);
    
    const userData = {
      displayName,
      cursorColor,
      cursorX: 100, // Start at a more visible position
      cursorY: 100,
      lastSeen: Date.now()
    };
    
    await set(userRef, userData);
    console.log('User set online successfully');

    // Set user as offline when they disconnect
    onDisconnect(userRef).remove();
  } catch (error) {
    console.error('Error setting user online:', error);
    throw new Error('Failed to set user online. Please check your connection.');
  }
};

// Set user as offline
export const setUserOffline = async (userId) => {
  try {
    const userRef = ref(rtdb, `sessions/${CANVAS_ID}/${userId}`);
    await remove(userRef);
  } catch (error) {
    console.error('Error setting user offline:', error);
    // Don't throw error for offline - it's not critical
  }
};

// Update cursor position
export const updateCursorPosition = async (userId, x, y) => {
  try {
    const userRef = ref(rtdb, `sessions/${CANVAS_ID}/${userId}`);
    
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
export const subscribeToPresence = (callback) => {
  const presenceRef = ref(rtdb, `sessions/${CANVAS_ID}`);
  
  return onValue(presenceRef, (snapshot) => {

    const data = snapshot.val();
    const users = data ? Object.entries(data).map(([userId, userData]) => ({
      userId,
      ...userData
    })) : [];
    
    callback(users);
  });
};
