import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { setUserOnline, setUserOffline, subscribeToPresence } from '../services/presence';
import { getDisplayName } from '../services/auth';

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
  
  console.log('usePresence hook called, currentUser:', currentUser);

  // Set user online when component mounts
  useEffect(() => {
    if (!currentUser) return;

    const displayName = getDisplayName(currentUser);
    const cursorColor = generateUserColor(currentUser.uid);

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
    });

    return unsubscribe;
  }, [currentUser]);

  return {
    onlineUsers,
    loading
  };
};
