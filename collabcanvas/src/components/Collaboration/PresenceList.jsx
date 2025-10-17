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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Online Users</h3>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
          {onlineUsers.length}
        </span>
      </div>
      <div className="space-y-2">
        {onlineUsers.map((user) => (
          <div 
            key={user.userId} 
            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="relative">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
              <div className="absolute inset-0 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping opacity-20"></div>
            </div>
            <span className="text-sm font-medium text-gray-700 truncate group-hover:text-gray-900">
              {user.displayName}
            </span>
          </div>
        ))}
        {onlineUsers.length === 0 && (
          <div className="text-center py-4">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-xs text-gray-400">No other users online</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PresenceList;
