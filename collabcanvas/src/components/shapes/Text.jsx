import React from 'react';
import { Rect, Text as KonvaText, Group } from 'react-konva';

const Text = ({ 
  shape, 
  isSelected, 
  isMultiSelected, 
  isBeingMovedByOther, 
  isLockedByAnotherUser,
  shapeRef,
  onDoubleClick
}) => {
  return (
    <>
      {/* Container Rectangle */}
      <Rect
        ref={shapeRef}
        x={0}
        y={0}
        width={shape.width}
        height={shape.height}
        fill="transparent"
        stroke={isLockedByAnotherUser ? "#ef4444" : isSelected ? "#3b82f6" : isBeingMovedByOther ? "#f59e0b" : "transparent"}
        strokeWidth={isLockedByAnotherUser ? 3 : isSelected ? 3 : isBeingMovedByOther ? 2 : 0}
        dash={isLockedByAnotherUser ? [8, 4] : undefined}
        opacity={isBeingMovedByOther ? 0.8 : 1}
      />

      {/* Text Content */}
      <KonvaText
        x={0}
        y={0}
        width={Math.max(shape.width, 150)}
        height={shape.height}
        text={shape.text || "Text"}
        fontSize={shape.fontSize || 14}
        fontFamily="Inter, system-ui, sans-serif"
        fill="#1F2937"
        align="center"
        verticalAlign="middle"
        fontStyle="500"
        wrap="word"
        ellipsis={false}
        listening={false}
      />
    </>
  );
};

export default Text;
