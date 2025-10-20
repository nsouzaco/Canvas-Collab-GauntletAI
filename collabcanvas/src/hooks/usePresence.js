import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCanvas } from '../contexts/CanvasContext';
import { setUserOnline, setUserOffline, subscribeToPresence, refreshUserPresence } from '../services/presence';
import { getDisplayName } from '../services/auth';
import { PresencePersistence, UserPreferencesPersistence } from '../utils/persistence';

// Generate a random color for the user
const generateUserColor = (userId) => {
  const colors = [
    '#FF5733', '#33C1FF', '#33FF57', '#FF33C1', 
    '#C133FF', '#FFC133', '#33FFC1', '#C1FF33'
  ];
  const hash = userId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return colors[Math.abs(hash) % colors.length];
};

export const usePresence = () => {
  const { currentUser } = useAuth();
  const { canvasId } = useCanvas();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  

  // Load cached presence data on mount
  useEffect(() => {
    if (!currentUser) return;

    const cachedUsers = PresencePersistence.loadPresenceCache();
    if (cachedUsers.length > 0) {
      setOnlineUsers(cachedUsers);
    }
  }, [currentUser]);

  // Set user online when component mounts
  useEffect(() => {
    if (!currentUser || !canvasId) return;

    const displayName = getDisplayName(currentUser);
    const cursorColor = generateUserColor(currentUser.uid);

    // Save user preferences
    UserPreferencesPersistence.updatePreference('cursorColor', cursorColor);
    UserPreferencesPersistence.updatePreference('displayName', displayName);

    setUserOnline(canvasId, currentUser.uid, displayName, cursorColor);

    return () => {
      setUserOffline(canvasId, currentUser.uid);
    };
  }, [currentUser, canvasId]);

  // Subscribe to presence changes
  useEffect(() => {
    if (!currentUser || !canvasId) return;

    const unsubscribe = subscribeToPresence(canvasId, (users) => {
      setOnlineUsers(users);
      setLoading(false);
      setIsOffline(false);
      
      // Cache the presence data
      PresencePersistence.savePresenceCache(users);
    });

    return unsubscribe;
  }, [currentUser, canvasId]);

  // Handle online/offline status and presence refresh
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Refresh presence when connection is restored
      if (currentUser && canvasId) {
        const displayName = getDisplayName(currentUser);
        const cursorColor = generateUserColor(currentUser.uid);
        refreshUserPresence(canvasId, currentUser.uid, displayName, cursorColor);
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    // Handle visibility change (when user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden && currentUser && canvasId) {
        const displayName = getDisplayName(currentUser);
        const cursorColor = generateUserColor(currentUser.uid);
        refreshUserPresence(canvasId, currentUser.uid, displayName, cursorColor);
      }
    };


    // Heartbeat system - refresh presence every 30 seconds
    const heartbeatInterval = setInterval(() => {
      if (currentUser && canvasId && !document.hidden) {
        const displayName = getDisplayName(currentUser);
        const cursorColor = generateUserColor(currentUser.uid);
        refreshUserPresence(canvasId, currentUser.uid, displayName, cursorColor);
      }
    }, 30000); // 30 seconds

    // Handle page refresh/unload - set user offline
    const handleBeforeUnload = async () => {
      if (currentUser && canvasId) {
        try {
          await setUserOffline(canvasId, currentUser.uid);
        } catch (error) {
          console.error('Error setting user offline on page refresh:', error);
        }
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      clearInterval(heartbeatInterval);
    };
  }, [currentUser, canvasId]);

  return {
    onlineUsers,
    loading,
    isOffline
  };
};
