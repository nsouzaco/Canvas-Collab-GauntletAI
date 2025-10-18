import React from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useCanvas } from '../../contexts/CanvasContext';
import { getViewportDimensions, getCanvasDimensions, MIN_ZOOM, MAX_ZOOM } from '../../utils/constants';

const ZoomControls = () => {
  const { stageRef } = useCanvas();

  const smoothZoom = (targetScale) => {
    const stage = stageRef.current;
    if (!stage) return;

    const viewportDimensions = getViewportDimensions();
    const canvasDimensions = getCanvasDimensions();
    
    // Get current scale and position
    const currentScale = stage.scaleX();
    const currentPos = stage.position();
    
    // Calculate center of viewport
    const centerX = viewportDimensions.width / 2;
    const centerY = viewportDimensions.height / 2;
    
    // Calculate the point in canvas coordinates that should stay at the center
    const canvasCenterX = (centerX - currentPos.x) / currentScale;
    const canvasCenterY = (centerY - currentPos.y) / currentScale;
    
    // Calculate new position to keep the center point in the same screen position
    const newPos = {
      x: centerX - canvasCenterX * targetScale,
      y: centerY - canvasCenterY * targetScale,
    };
    
    // Apply smooth transition
    stage.scaleX(targetScale);
    stage.scaleY(targetScale);
    stage.x(newPos.x);
    stage.y(newPos.y);
  };

  const handleZoomIn = () => {
    const stage = stageRef.current;
    if (stage) {
      const currentScale = stage.scaleX();
      const newScale = Math.min(MAX_ZOOM, currentScale * 1.2);
      smoothZoom(newScale);
    }
  };

  const handleZoomOut = () => {
    const stage = stageRef.current;
    if (stage) {
      const currentScale = stage.scaleX();
      const newScale = Math.max(MIN_ZOOM, currentScale / 1.2);
      smoothZoom(newScale);
    }
  };

  const handleResetView = () => {
    const stage = stageRef.current;
    if (stage) {
      const viewportDimensions = getViewportDimensions();
      const canvasDimensions = getCanvasDimensions();
      
      // Reset to centered position
      const centerX = (viewportDimensions.width - canvasDimensions.width) / 2;
      const centerY = (viewportDimensions.height - canvasDimensions.height) / 2;
      
      stage.scaleX(1);
      stage.scaleY(1);
      stage.x(centerX);
      stage.y(centerY);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col bg-white rounded-lg shadow-md border border-gray-200">
      {/* Reset View */}
      <button
        onClick={handleResetView}
        className="flex items-center justify-center w-10 h-10 rounded-t-lg hover:bg-gray-100 transition-colors duration-200 group"
        title="Reset View"
      >
        <Maximize2 className="w-5 h-5 text-gray-700 group-hover:text-blue-600" />
      </button>

      {/* Separator */}
      <div className="h-px w-10 bg-gray-300"></div>

      {/* Zoom In */}
      <button
        onClick={handleZoomIn}
        className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 transition-colors duration-200 group"
        title="Zoom In"
      >
        <ZoomIn className="w-5 h-5 text-gray-700 group-hover:text-blue-600" />
      </button>

      {/* Separator */}
      <div className="h-px w-10 bg-gray-300"></div>

      {/* Zoom Out */}
      <button
        onClick={handleZoomOut}
        className="flex items-center justify-center w-10 h-10 rounded-b-lg hover:bg-gray-100 transition-colors duration-200 group"
        title="Zoom Out"
      >
        <ZoomOut className="w-5 h-5 text-gray-700 group-hover:text-blue-600" />
      </button>
    </div>
  );
};

export default ZoomControls;

