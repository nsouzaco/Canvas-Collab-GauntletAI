import React, { useState, useEffect, useRef } from 'react';
import { Square, Circle, Type, MousePointer, ALargeSmall, ChevronDown, StickyNote, CreditCard, List, SquareDashed } from 'lucide-react';
import { useCanvas } from '../../contexts/CanvasContext';
import ColorPicker from './ColorPicker';

const ShapeToolbar = () => {
  const { addShape, stageRef, setCurrentTool, deselectAll, selectedId, shapes, updateShape, currentTool } = useCanvas();
  const [isFontSizeOpen, setIsFontSizeOpen] = useState(false);
  const fontSizeRef = useRef(null);

  const handleToolSwitch = async (tool) => {
    // Release any locks when switching tools
    await deselectAll();
    setCurrentTool(tool);
  };

  const handleAddShape = async (shapeType) => {
    // Ensure we're in select mode for immediate draggability
    setCurrentTool('select');
    
    // Release any locks from currently selected shapes before adding new shape
    await deselectAll();
    
    // Add shape at strategic position in mid-top center area with truly random positioning
    const CANVAS_WIDTH = Math.min(1200, window.innerWidth - 40); // Use responsive width
    const CANVAS_HEIGHT = Math.max(1000, window.innerHeight - 160); // Use responsive height
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

  // Handle font size change for selected text shape
  const handleFontSizeChange = async (fontSize) => {
    if (selectedId) {
      console.log(`📝 Changing font size of shape ${selectedId} to ${fontSize}px`);
      await updateShape(selectedId, { fontSize: parseInt(fontSize) });
      setIsFontSizeOpen(false);
    }
  };

  // Get the selected shape's current properties
  const selectedShape = selectedId ? shapes.find(shape => shape.id === selectedId) : null;
  const selectedColor = selectedShape?.fill || '#3b82f6';
  const selectedFontSize = selectedShape?.fontSize || 14;
  const isTextShape = selectedShape?.type === 'text';


  // Close font size dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fontSizeRef.current && !fontSizeRef.current.contains(event.target)) {
        setIsFontSizeOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex items-center bg-white rounded-lg shadow-md border border-gray-200 mb-3 max-w-full overflow-visible">
      {/* Cursor/Selection Tool */}
      <button
        onClick={() => handleToolSwitch('select')}
        className={`flex items-center justify-center w-10 h-10 rounded-l-lg hover:bg-gray-100 transition-colors duration-200 group ${
          currentTool === 'select' ? 'bg-blue-50' : ''
        }`}
        title="Select Tool"
      >
        <MousePointer className={`w-5 h-5 ${
          currentTool === 'select' ? 'text-blue-600' : 'text-gray-700 group-hover:text-blue-600'
        }`} />
      </button>

      {/* Multi-Select Tool */}
      <button
        onClick={() => handleToolSwitch('multiselect')}
        className={`flex items-center justify-center w-10 h-10 hover:bg-gray-100 transition-colors duration-200 group ${
          currentTool === 'multiselect' ? 'bg-blue-50' : ''
        }`}
        title="Multi-Select Tool"
      >
        <SquareDashed className={`w-5 h-5 ${
          currentTool === 'multiselect' ? 'text-blue-600' : 'text-gray-700 group-hover:text-blue-600'
        }`} />
      </button>

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

      {/* Sticky Note Icon */}
      <button
        onClick={async () => {
          await handleToolSwitch('stickyNote');
          await handleAddShape('stickyNote');
        }}
        className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 transition-colors duration-200 group"
        title="Add Sticky Note"
      >
        <StickyNote className="w-5 h-5 text-gray-700 group-hover:text-blue-600" />
      </button>

      {/* Card Icon */}
      <button
        onClick={async () => {
          await handleToolSwitch('card');
          await handleAddShape('card');
        }}
        className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 transition-colors duration-200 group"
        title="Add Card"
      >
        <CreditCard className="w-5 h-5 text-gray-700 group-hover:text-blue-600" />
      </button>

      {/* List Icon */}
      <button
        onClick={async () => {
          await handleToolSwitch('list');
          await handleAddShape('list');
        }}
        className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 transition-colors duration-200 group"
        title="Add List"
      >
        <List className="w-5 h-5 text-gray-700 group-hover:text-blue-600" />
      </button>




      
      {/* Font Size Dropdown - Always visible */}
      <div className="relative" ref={fontSizeRef}>
        <button
          onClick={() => {
            if (isTextShape) {
              setIsFontSizeOpen(!isFontSizeOpen);
            }
          }}
          className={`flex items-center justify-center w-10 h-10 transition-colors duration-200 group ${
            !isTextShape 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-gray-100'
          }`}
          title={!isTextShape ? "Select a text shape to change font size" : "Font Size"}
        >
          <ALargeSmall className={`w-5 h-5 ${!isTextShape ? 'text-gray-400' : 'text-gray-700 group-hover:text-blue-600'}`} />
        </button>
          
        {/* Font Size Dropdown Menu */}
        {isFontSizeOpen && (
          <div className="absolute bottom-12 left-0 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-[120px]">
            <div className="space-y-1">
              {[10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map((size) => (
                <button
                  key={size}
                  onClick={() => handleFontSizeChange(size)}
                  disabled={!isTextShape}
                  className={`w-full text-left px-3 py-2 text-sm rounded transition-colors duration-200 ${
                    !isTextShape 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : selectedFontSize === size 
                        ? 'bg-blue-50 text-blue-600 font-medium hover:bg-gray-100' 
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {size}px
                </button>
              ))}
            </div>
            
          </div>
          
        )}
      </div>
      
      <ColorPicker
        selectedColor={selectedColor}
        onColorChange={handleColorChange}
        disabled={!selectedId}
      />  
    </div>
  );
};

export default ShapeToolbar;

