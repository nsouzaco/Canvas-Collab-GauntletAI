import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePresence } from '../../hooks/usePresence';
import { subscribeToPresence } from '../../services/presence';

const CursorDebug = () => {
  const { currentUser } = useAuth();
  const { onlineUsers } = usePresence();
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToPresence((users) => {
      console.log('Debug - Raw users from Firebase:', users);
      setDebugInfo({
        totalUsers: users.length,
        currentUser: users.find(u => u.userId === currentUser.uid),
        otherUsers: users.filter(u => u.userId !== currentUser.uid),
        allUsers: users
      });
    });

    return unsubscribe;
  }, [currentUser]);

  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 1000,
      maxWidth: '300px'
    }}>
      <h4>Cursor Debug Info</h4>
      <p><strong>Current User:</strong> {currentUser?.uid}</p>
      <p><strong>Total Online Users:</strong> {debugInfo.totalUsers || 0}</p>
      <p><strong>Other Users:</strong> {debugInfo.otherUsers?.length || 0}</p>
      
      {debugInfo.otherUsers?.map((user, index) => (
        <div key={user.userId} style={{ marginTop: '5px', padding: '5px', background: 'rgba(255,255,255,0.1)' }}>
          <p><strong>User {index + 1}:</strong></p>
          <p>ID: {user.userId}</p>
          <p>Name: {user.displayName}</p>
          <p>Color: {user.cursorColor}</p>
          <p>Position: ({user.cursorX}, {user.cursorY})</p>
        </div>
      ))}
      
      <div style={{ marginTop: '10px' }}>
        <h5>Raw Data:</h5>
        <pre style={{ fontSize: '10px', overflow: 'auto', maxHeight: '200px' }}>
          {JSON.stringify(debugInfo.allUsers, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default CursorDebug;
