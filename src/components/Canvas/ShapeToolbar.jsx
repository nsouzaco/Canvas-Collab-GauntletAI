import React from 'react';
import { Square, Circle, Type } from 'lucide-react';
import { useCanvas } from '../../contexts/CanvasContext';

const ShapeToolbar = () => {
  const { addShape, stageRef } = useCanvas();

  const handleAddShape = async (shapeType) => {
    // Add shape at strategic position in mid-top center area
    const CANVAS_WIDTH = Math.min(1200, window.innerWidth - 300);
    const CANVAS_HEIGHT = 1000;
    const SHAPE_SIZE = 100; // Default shape size
    
    // Define the target area: mid-top center with some randomization
    const TARGET_CENTER_X = CANVAS_WIDTH / 2;
    const TARGET_CENTER_Y = CANVAS_HEIGHT * 0.3; // 30% from top (mid-top)
    
    // Create a more natural spread pattern
    const OFFSET_RANGE = 100; // Maximum offset from center
    const SPREAD_ANGLE = Math.random() * 2 * Math.PI; // Random angle for spread
    const SPREAD_DISTANCE = Math.random() * OFFSET_RANGE; // Random distance from center
    
    // Calculate offset using polar coordinates for more natural distribution
    const randomOffsetX = Math.cos(SPREAD_ANGLE) * SPREAD_DISTANCE;
    const randomOffsetY = Math.sin(SPREAD_ANGLE) * SPREAD_DISTANCE;
    
    // Add a small time-based offset to create a subtle spiral pattern
    const timeOffset = (Date.now() % 10000) / 10000; // 0 to 1 based on time
    const spiralOffsetX = Math.cos(timeOffset * 2 * Math.PI) * 20; // Small spiral
    const spiralOffsetY = Math.sin(timeOffset * 2 * Math.PI) * 20;
    
    // Calculate final position with bounds checking
    const finalX = Math.max(0, Math.min(
      CANVAS_WIDTH - SHAPE_SIZE, 
      TARGET_CENTER_X + randomOffsetX + spiralOffsetX
    ));
    const finalY = Math.max(0, Math.min(
      CANVAS_HEIGHT - SHAPE_SIZE, 
      TARGET_CENTER_Y + randomOffsetY + spiralOffsetY
    ));
    
    await addShape(shapeType, { x: finalX, y: finalY });
  };

  return (
    <div className="flex items-center bg-white rounded-lg shadow-md border border-gray-200 mb-3">
      {/* Rectangle Icon */}
      <button
        onClick={() => handleAddShape('rectangle')}
        className="flex items-center justify-center w-10 h-10 rounded-l-lg hover:bg-gray-100 transition-colors duration-200 group"
        title="Add Rectangle"
      >
        <Square className="w-5 h-5 text-gray-700 group-hover:text-blue-600" />
      </button>

      {/* Separator */}
      <div className="w-px h-6 bg-gray-300"></div>

      {/* Circle Icon */}
      <button
        onClick={() => handleAddShape('circle')}
        className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 transition-colors duration-200 group"
        title="Add Circle"
      >
        <Circle className="w-5 h-5 text-gray-700 group-hover:text-blue-600" />
      </button>

      {/* Separator */}
      <div className="w-px h-6 bg-gray-300"></div>

      {/* Text Icon */}
      <button
        onClick={() => handleAddShape('text')}
        className="flex items-center justify-center w-10 h-10 rounded-r-lg hover:bg-gray-100 transition-colors duration-200 group"
        title="Add Text"
      >
        <Type className="w-5 h-5 text-gray-700 group-hover:text-blue-600" />
      </button>
    </div>
  );
};

export default ShapeToolbar;

