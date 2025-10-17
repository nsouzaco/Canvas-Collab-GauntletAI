import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { setUserOnline, setUserOffline, subscribeToPresence } from '../services/presence';
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
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  
  console.log('usePresence hook called, currentUser:', currentUser);

  // Load cached presence data on mount
  useEffect(() => {
    if (!currentUser) return;

    const cachedUsers = PresencePersistence.loadPresenceCache();
    if (cachedUsers.length > 0) {
      console.log('👥 Loading cached presence data');
      setOnlineUsers(cachedUsers);
    }
  }, [currentUser]);

  // Set user online when component mounts
  useEffect(() => {
    if (!currentUser) return;

    const displayName = getDisplayName(currentUser);
    const cursorColor = generateUserColor(currentUser.uid);

    // Save user preferences
    UserPreferencesPersistence.updatePreference('cursorColor', cursorColor);
    UserPreferencesPersistence.updatePreference('displayName', displayName);

    setUserOnline(currentUser.uid, displayName, cursorColor);

    return () => {
      setUserOffline(currentUser.uid);
    };
  }, [currentUser]);

  // Subscribe to presence changes
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToPresence((users) => {
      console.log('usePresence - received users:', users);
      setOnlineUsers(users);
      setLoading(false);
      setIsOffline(false);
      
      // Cache the presence data
      PresencePersistence.savePresenceCache(users);
    });

    return unsubscribe;
  }, [currentUser]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Presence connection restored');
      setIsOffline(false);
    };

    const handleOffline = () => {
      console.log('📴 Presence connection lost');
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    onlineUsers,
    loading,
    isOffline
  };
};
