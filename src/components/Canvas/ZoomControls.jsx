import React from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useCanvas } from '../../contexts/CanvasContext';
import { VIEWPORT_WIDTH, VIEWPORT_HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../utils/constants';

const ZoomControls = () => {
  const { stageRef } = useCanvas();

  const handleZoomIn = () => {
    const stage = stageRef.current;
    if (stage) {
      const newScale = Math.min(3, stage.scaleX() * 1.2);
      stage.scaleX(newScale);
      stage.scaleY(newScale);
    }
  };

  const handleZoomOut = () => {
    const stage = stageRef.current;
    if (stage) {
      const newScale = Math.max(0.1, stage.scaleX() / 1.2);
      stage.scaleX(newScale);
      stage.scaleY(newScale);
    }
  };

  const handleResetView = () => {
    const stage = stageRef.current;
    if (stage) {
      stage.scaleX(1);
      stage.scaleY(1);
      // Reset to centered position
      stage.x((VIEWPORT_WIDTH - CANVAS_WIDTH) / 2);
      stage.y((VIEWPORT_HEIGHT - CANVAS_HEIGHT) / 2);
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

