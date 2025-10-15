import React from 'react';
import { usePresence } from '../../hooks/usePresence';

const PresenceList = () => {
  const { onlineUsers, loading } = usePresence();

  if (loading) {
    return (
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Online Users</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">Online</h3>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {onlineUsers.length}
        </span>
      </div>
      <div className="space-y-2">
        {onlineUsers.map((user) => (
          <div 
            key={user.userId} 
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
            <span className="text-sm font-medium text-gray-700 truncate">
              {user.displayName}
            </span>
          </div>
        ))}
        {onlineUsers.length === 0 && (
          <div className="text-center py-3">
            <p className="text-xs text-gray-400">No other users online</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PresenceList;
