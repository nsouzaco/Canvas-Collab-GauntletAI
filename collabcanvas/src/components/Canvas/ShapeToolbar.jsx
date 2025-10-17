import React from 'react';
import { Square, Circle, Type, MousePointer } from 'lucide-react';
import { useCanvas } from '../../contexts/CanvasContext';
import ColorPicker from './ColorPicker';

const ShapeToolbar = () => {
  const { addShape, stageRef, setCurrentTool, deselectAll, selectedId, shapes, updateShape } = useCanvas();

  const handleToolSwitch = async (tool) => {
    // Release any locks when switching tools
    await deselectAll();
    setCurrentTool(tool);
  };

  const handleAddShape = async (shapeType) => {
    // Release any locks from currently selected shapes before adding new shape
    await deselectAll();
    
    // Add shape at strategic position in mid-top center area with truly random positioning
    const CANVAS_WIDTH = Math.min(1200, window.innerWidth - 300);
    const CANVAS_HEIGHT = 1000;
    const SHAPE_SIZE = 100; // Default shape size
    
    // Define the target area: mid-top center with randomization
    const TARGET_CENTER_X = CANVAS_WIDTH / 2;
    const TARGET_CENTER_Y = CANVAS_HEIGHT * 0.3; // 30% from top (mid-top)
    
    // Create a truly random spread pattern - different for each shape
    const OFFSET_RANGE = 150; // Increased range for more variety
    const SPREAD_ANGLE = Math.random() * 2 * Math.PI; // Random angle for spread
    const SPREAD_DISTANCE = Math.random() * OFFSET_RANGE; // Random distance from center
    
    // Calculate offset using polar coordinates for natural distribution
    const randomOffsetX = Math.cos(SPREAD_ANGLE) * SPREAD_DISTANCE;
    const randomOffsetY = Math.sin(SPREAD_ANGLE) * SPREAD_DISTANCE;
    
    // Add additional random variation for more uniqueness
    const extraRandomX = (Math.random() - 0.5) * 100; // -50 to +50
    const extraRandomY = (Math.random() - 0.5) * 100; // -50 to +50
    
    // Calculate final position with bounds checking
    const finalX = Math.max(50, Math.min(
      CANVAS_WIDTH - SHAPE_SIZE - 50, 
      TARGET_CENTER_X + randomOffsetX + extraRandomX
    ));
    const finalY = Math.max(50, Math.min(
      CANVAS_HEIGHT - SHAPE_SIZE - 50, 
      TARGET_CENTER_Y + randomOffsetY + extraRandomY
    ));
    
    console.log('🎨 Manual shape creation - truly random position:', {
      position: { x: finalX, y: finalY },
      angle: SPREAD_ANGLE,
      distance: SPREAD_DISTANCE,
      extraRandom: { x: extraRandomX, y: extraRandomY }
    });
    
    await addShape(shapeType, { x: finalX, y: finalY });
  };

  // Handle color change for selected shape
  const handleColorChange = async (color) => {
    if (selectedId) {
      console.log(`🎨 Changing color of shape ${selectedId} to ${color}`);
      await updateShape(selectedId, { fill: color });
    }
  };

  // Get the selected shape's current color
  const selectedShape = selectedId ? shapes.find(shape => shape.id === selectedId) : null;
  const selectedColor = selectedShape?.fill || '#3b82f6';

  return (
    <div className="flex items-center bg-white rounded-lg shadow-md border border-gray-200 mb-3">
      {/* Cursor/Selection Tool */}
      <button
        onClick={() => handleToolSwitch('select')}
        className="flex items-center justify-center w-10 h-10 rounded-l-lg hover:bg-gray-100 transition-colors duration-200 group bg-blue-50"
        title="Select Tool"
      >
        <MousePointer className="w-5 h-5 text-blue-600" />
      </button>

      {/* Separator */}
      <div className="w-px h-6 bg-gray-300"></div>

      {/* Rectangle Icon */}
      <button
        onClick={async () => {
          await handleToolSwitch('rectangle');
          await handleAddShape('rectangle');
        }}
        className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 transition-colors duration-200 group"
        title="Add Rectangle"
      >
        <Square className="w-5 h-5 text-gray-700 group-hover:text-blue-600" />
      </button>

      {/* Separator */}
      <div className="w-px h-6 bg-gray-300"></div>

      {/* Circle Icon */}
      <button
        onClick={async () => {
          await handleToolSwitch('circle');
          await handleAddShape('circle');
        }}
        className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 transition-colors duration-200 group"
        title="Add Circle"
      >
        <Circle className="w-5 h-5 text-gray-700 group-hover:text-blue-600" />
      </button>

      {/* Separator */}
      <div className="w-px h-6 bg-gray-300"></div>

      {/* Text Icon */}
      <button
        onClick={async () => {
          await handleToolSwitch('text');
          await handleAddShape('text');
        }}
        className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 transition-colors duration-200 group"
        title="Add Text"
      >
        <Type className="w-5 h-5 text-gray-700 group-hover:text-blue-600" />
      </button>

      {/* Separator */}
      <div className="w-px h-6 bg-gray-300"></div>

      {/* Color Picker */}
      <ColorPicker
        selectedColor={selectedColor}
        onColorChange={handleColorChange}
        disabled={!selectedId}
      />
    </div>
  );
};

export default ShapeToolbar;

