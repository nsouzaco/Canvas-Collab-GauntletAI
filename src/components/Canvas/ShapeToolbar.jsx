import React from 'react';
import { Square, Circle, Type } from 'lucide-react';
import { useCanvas } from '../../contexts/CanvasContext';

const ShapeToolbar = () => {
  const { addShape, stageRef } = useCanvas();

  const handleAddShape = async (shapeType) => {
    // Add shape at random position within canvas bounds
    const CANVAS_WIDTH = Math.min(1200, window.innerWidth - 300);
    const CANVAS_HEIGHT = 1000;
    const SHAPE_SIZE = 100; // Default shape size
    
    // Generate random position within canvas bounds
    const randomX = Math.random() * (CANVAS_WIDTH - SHAPE_SIZE);
    const randomY = Math.random() * (CANVAS_HEIGHT - SHAPE_SIZE);
    
    await addShape(shapeType, { x: randomX, y: randomY });
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

