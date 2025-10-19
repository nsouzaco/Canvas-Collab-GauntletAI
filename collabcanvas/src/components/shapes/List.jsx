import React from 'react';
import { Rect, Circle, Text, Group } from 'react-konva';

const List = ({ 
  shape, 
  isSelected, 
  isMultiSelected, 
  isBeingMovedByOther, 
  onDoubleClick,
  shapeRef
}) => {
  return (
    <Group>
      {/* List Shape - Main Container */}
      <Rect
        ref={shapeRef}
        x={0}
        y={0}
        width={shape.width}
        height={shape.height}
        fill={shape.fill}
        stroke={isSelected ? "#3b82f6" : isMultiSelected ? "#8B5CF6" : isBeingMovedByOther ? "#f59e0b" : "#E5E7EB"}
        strokeWidth={isSelected ? 3 : isMultiSelected ? 3 : isBeingMovedByOther ? 2 : 1}
        opacity={isBeingMovedByOther ? 0.8 : 1}
        cornerRadius={8}
        shadowColor="rgba(0,0,0,0.1)"
        shadowBlur={4}
        shadowOffset={{ x: 0, y: 2 }}
        onDblClick={onDoubleClick}
        onDblTap={onDoubleClick}
      />

      {/* List Header Background */}
      <Rect
        x={0}
        y={0}
        width={shape.width}
        height={40}
        fill="#F8FAFC"
        cornerRadius={[8, 8, 0, 0]}
        listening={false}
      />

      {/* List Title with Icon */}
      <Text
        x={45}
        y={15}
        width={shape.width - 60}
        height={25}
        text={shape.title || "Project Tasks"}
        fontSize={16}
        fontFamily="Inter, system-ui, sans-serif"
        fill="#1F2937"
        align="left"
        verticalAlign="top"
        fontStyle="bold"
        wrap="word"
        ellipsis={true}
        onDblClick={onDoubleClick}
        onDblTap={onDoubleClick}
      />

      {/* List Icon */}
      <Text
        x={15}
        y={12}
        text="📋"
        fontSize={20}
        fontFamily="Arial, sans-serif"
        align="center"
        verticalAlign="middle"
        listening={false}
      />

      {/* List Items Container */}
      <Rect
        x={10}
        y={45}
        width={shape.width - 20}
        height={shape.height - 55}
        fill="transparent"
        listening={false}
      />

      {/* List Items with Enhanced Styling */}
      {shape.items && shape.items.map((item, index) => {
        const itemY = 50 + index * 28;
        const isEven = index % 2 === 0;
        
        return (
          <Group key={index}>
            {/* Item Background (alternating colors) */}
            <Rect
              x={15}
              y={itemY - 2}
              width={shape.width - 30}
              height={24}
              fill={isEven ? "rgba(248, 250, 252, 0.5)" : "transparent"}
              cornerRadius={4}
              listening={false}
            />
            
            {/* Checkbox Circle */}
            <Circle
              x={25}
              y={itemY + 8}
              radius={6}
              fill="white"
              stroke="#D1D5DB"
              strokeWidth={1}
              listening={false}
            />
            
            {/* Item Text */}
            <Text
              x={40}
              y={itemY}
              width={shape.width - 55}
              height={20}
              text={item}
              fontSize={14}
              fontFamily="Inter, system-ui, sans-serif"
              fill="#374151"
              align="left"
              verticalAlign="top"
              wrap="word"
              ellipsis={true}
              onDblClick={onDoubleClick}
              onDblTap={onDoubleClick}
            />
            
            {/* Item Number */}
            <Text
              x={15}
              y={itemY}
              width={20}
              height={20}
              text={`${index + 1}.`}
              fontSize={12}
              fontFamily="Inter, system-ui, sans-serif"
              fill="#9CA3AF"
              align="center"
              verticalAlign="top"
              listening={false}
            />
          </Group>
        );
      })}

      {/* List Footer with Item Count */}
      {shape.items && (
        <Text
          x={15}
          y={shape.height - 20}
          width={shape.width - 30}
          height={15}
          text={`${shape.items.length} item${shape.items.length !== 1 ? 's' : ''}`}
          fontSize={12}
          fontFamily="Inter, system-ui, sans-serif"
          fill="#9CA3AF"
          align="left"
          verticalAlign="top"
          listening={false}
        />
      )}
    </Group>
  );
};

export default List;
