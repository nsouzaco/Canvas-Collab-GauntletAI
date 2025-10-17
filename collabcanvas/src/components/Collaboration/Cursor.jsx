import React from 'react';
import { Group, Circle, Text, Path, Rect } from 'react-konva';

const Cursor = ({ user, scale, stagePos }) => {
  // Debug logging
  console.log('Cursor component - user data:', user);
  
  // Check if cursor position data exists (including 0,0 positions)
  if (user.cursorX === undefined || user.cursorY === undefined) {
    console.log('Cursor component - missing position data');
    return null;
  }

  // Check if displayName exists
  if (!user.displayName) {
    console.log('Cursor component - missing displayName');
    return null;
  }

  // Convert canvas coordinates to screen coordinates
  const screenX = user.cursorX * scale + stagePos.x;
  const screenY = user.cursorY * scale + stagePos.y;

  // Generate a unique color for each user (darker for readability)
  const userColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
  ];
  const userColor = userColors[user.userId.length % userColors.length];

  return (
    <Group>
      {/* Cursor pointer - Lucide mouse-pointer-click icon */}
      <Path
        data="M14 4.1 12 6 M5.1 8-2.9-.8 M6 12-1.9 2 M7.2 2.2 8 5.1 M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z"
        x={screenX}
        y={screenY}
        fill="none"
        stroke={userColor}
        strokeWidth={2.5}
        scaleX={1.0}
        scaleY={1.0}
        offsetX={-12}
        offsetY={-12}
      />
      
      {/* User name label with background */}
      <Rect
        x={screenX + 15}
        y={screenY - 10}
        width={(user.displayName || 'User').length * 7 + 10}
        height={17}
        fill={userColor}
        cornerRadius={3}
      />
      <Text
        x={screenX + 20}
        y={screenY - 8}
        text={user.displayName || 'User'}
        fontSize={11}
        fontFamily="Inter, system-ui, sans-serif"
        fill="#ffffff"
        fontStyle="bold"
      />
    </Group>
  );
};


export default Cursor;
