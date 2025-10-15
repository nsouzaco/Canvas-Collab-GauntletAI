import React from 'react';
import { Group, Circle, Text, Path } from 'react-konva';

const Cursor = ({ user, scale, stagePos }) => {
  if (!user.cursorX && !user.cursorY) return null;

  // Convert canvas coordinates to screen coordinates
  const screenX = user.cursorX * scale + stagePos.x;
  const screenY = user.cursorY * scale + stagePos.y;

  return (
    <Group>
      {/* Cursor pointer */}
      <Path
        data="M0,0 L0,20 L6,14 L12,20 L20,12 L14,6 L20,0 Z"
        x={screenX}
        y={screenY}
        fill={user.cursorColor}
        stroke="#ffffff"
        strokeWidth={1}
        scaleX={0.8}
        scaleY={0.8}
        offsetX={10}
        offsetY={10}
      />
      
      {/* User name label */}
      <Text
        x={screenX + 15}
        y={screenY - 5}
        text={user.displayName}
        fontSize={12}
        fontFamily="Inter, system-ui, sans-serif"
        fill={user.cursorColor}
        fontStyle="bold"
        shadowColor="rgba(0,0,0,0.3)"
        shadowBlur={2}
        shadowOffset={{ x: 1, y: 1 }}
      />
    </Group>
  );
};

export default Cursor;
