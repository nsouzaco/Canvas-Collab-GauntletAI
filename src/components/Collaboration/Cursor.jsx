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

  // Convert canvas coordinates to screen coordinates
  const screenX = user.cursorX * scale + stagePos.x;
  const screenY = user.cursorY * scale + stagePos.y;

  return (
    <Group>
      {/* Background circle for better visibility */}
      <Circle
        x={screenX}
        y={screenY}
        radius={8}
        fill={user.cursorColor}
        opacity={0.3}
      />
      
      {/* Cursor pointer */}
      <Path
        data="M0,0 L0,20 L6,14 L12,20 L20,12 L14,6 L20,0 Z"
        x={screenX}
        y={screenY}
        fill={user.cursorColor}
        stroke="#ffffff"
        strokeWidth={2}
        scaleX={1.2}
        scaleY={1.2}
        offsetX={10}
        offsetY={10}
      />
      
      {/* User name label with background */}
      <Rect
        x={screenX + 15}
        y={screenY - 20}
        width={user.displayName.length * 8 + 10}
        height={20}
        fill="rgba(0,0,0,0.7)"
        cornerRadius={4}
      />
      <Text
        x={screenX + 20}
        y={screenY - 8}
        text={user.displayName}
        fontSize={12}
        fontFamily="Inter, system-ui, sans-serif"
        fill="#ffffff"
        fontStyle="bold"
      />
    </Group>
  );
};

export default Cursor;
