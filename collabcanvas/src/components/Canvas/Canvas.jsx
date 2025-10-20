import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Line } from 'react-konva';
import { useCanvas } from '../../contexts/CanvasContext';
import { useAuth } from '../../contexts/AuthContext';
import { usePresence } from '../../hooks/usePresence';
import { useCursors } from '../../hooks/useCursors';
import { useOptimizedPositioning } from '../../hooks/useOptimizedPositioning';
import { getSmoothRemotePosition, clearAllRemotePositionCaches, clearRemotePositionCache } from '../../utils/remotePositionInterpolation';
import { getCanvasDimensions, getViewportDimensions, MIN_ZOOM, MAX_ZOOM } from '../../utils/constants';
import { snapToGrid, snapPositionToGrid, getGridLines } from '../../utils/snapUtils';
import ExportControls from './ExportControls';
import Shape from './Shape';
import InlineTextEditor from './InlineTextEditor';
import Cursor from '../Collaboration/Cursor';
import PerformanceDashboard from '../Debug/PerformanceDashboard';
import Toast from './Toast';
import PropertiesPanel from './PropertiesPanel';

const GRID_SIZE = 20;

// Grid component to render grid lines
const Grid = ({ canvasWidth, canvasHeight }) => {
  const lines = [];
  
  // Vertical lines
  for (let i = 0; i <= canvasWidth / GRID_SIZE; i++) {
    lines.push(
      <Line
        key={`v${i}`}
        points={[i * GRID_SIZE, 0, i * GRID_SIZE, canvasHeight]}
        stroke="#e0e0e0"
        strokeWidth={0.5}
        listening={false}
      />
    );
  }
  
  // Horizontal lines
  for (let j = 0; j <= canvasHeight / GRID_SIZE; j++) {
    lines.push(
      <Line
        key={`h${j}`}
        points={[0, j * GRID_SIZE, canvasWidth, j * GRID_SIZE]}
        stroke="#e0e0e0"
        strokeWidth={0.5}
        listening={false}
      />
    );
  }
  
  return <>{lines}</>;
};

const Canvas = ({ snapToGridEnabled: propSnapToGridEnabled }) => {
  const { 
    canvasId,
    shapes, 
    selectedId, 
    selectedIds,
    currentTool, 
    stageRef, 
    selectShape, 
    toggleShapeSelection,
    deselectAll, 
    updateShape, 
    deleteShape, 
    deleteSelectedShapes,
    loading, 
    lockShape, 
    unlockShape,
    realTimePositions,
    updateRealTimePosition,
    clearRealTimePosition,
    executeAIOperation,
    isGridVisibleForExport,
    toast
  } = useCanvas();
  const { currentUser } = useAuth();
  const { onlineUsers } = usePresence();
  const { startDrag, updateDragPosition, endDrag } = useOptimizedPositioning(canvasId);
  const gridLayerRef = useRef();
  const containerRef = useRef();
  
  // Get responsive viewport and canvas dimensions
  const [viewportDimensions, setViewportDimensions] = useState(getViewportDimensions());
  const [canvasDimensions, setCanvasDimensions] = useState(getCanvasDimensions());
  
  // Position canvas to show both left and right boundaries
  const [stagePos, setStagePos] = useState({ 
    x: 0, // Start at left edge
    y: (viewportDimensions.height - canvasDimensions.height) / 2 // Center vertically
  });
  
  const [scale, setScale] = useState(1);
  const [editingTextId, setEditingTextId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [snapToGridEnabled, setSnapToGridEnabled] = useState(propSnapToGridEnabled ?? true);
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);
  

  const { handleMouseMove } = useCursors(stagePos, scale);
  
  // Sync snap-to-grid prop with local state
  useEffect(() => {
    setSnapToGridEnabled(propSnapToGridEnabled ?? true);
  }, [propSnapToGridEnabled]);
  
  // Handle window resize for responsive canvas
  useEffect(() => {
    const handleResize = () => {
      const newViewportDimensions = getViewportDimensions();
      const newCanvasDimensions = getCanvasDimensions();
      setViewportDimensions(newViewportDimensions);
      setCanvasDimensions(newCanvasDimensions);
      
      // Position canvas to show both boundaries after resize
      setStagePos({
        x: 0, // Start at left edge
        y: (newViewportDimensions.height - newCanvasDimensions.height) / 2 // Center vertically
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update stage position when viewport dimensions change
  useEffect(() => {
    setStagePos({
      x: 0, // Start at left edge
      y: (viewportDimensions.height - canvasDimensions.height) / 2 // Center vertically
    });
  }, [viewportDimensions, canvasDimensions]);

  // Cleanup remote position caches on unmount
  useEffect(() => {
    return () => {
      clearAllRemotePositionCaches();
    };
  }, []);

  // Clean up remote position caches when shapes are no longer being moved
  useEffect(() => {
    const currentTime = Date.now();
    const timeout = 1000; // 1 second timeout for remote movements (reduced from 2 seconds)
    
    Object.entries(realTimePositions).forEach(([shapeId, position]) => {
      if (position.updatedBy !== currentUser?.uid) {
        // Check if this position is stale (no updates for 1 second)
        if (currentTime - position.timestamp > timeout) {
          clearRemotePositionCache(shapeId, position.updatedBy);
          // Also clear the real-time position from the state
          clearRealTimePosition(shapeId);
        }
      }
    });
  }, [realTimePositions, currentUser, clearRealTimePosition]);

  // Ensure grid layer stays at the bottom
  useEffect(() => {
    if (gridLayerRef.current) {
      gridLayerRef.current.moveToBottom();
    }
  }, []);

  // Add wheel event listener to container to properly handle zoom vs scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleNativeWheel = (e) => {
      // Check if mouse is over the canvas
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      // Only prevent scroll and zoom if mouse is within canvas bounds
      if (mouseX >= rect.left && mouseX <= rect.right && 
          mouseY >= rect.top && mouseY <= rect.bottom) {
        e.preventDefault();
        
        // Only zoom if no shape is selected (no locks)
        if (selectedId) return;
        
        // Smooth zoom with center focus
        if (stageRef.current) {
          const stage = stageRef.current;
          const scaleBy = 1.1;
          const oldScale = stage.scaleX();
          
          // Calculate new scale
          const newScale = e.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
          const clampedScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newScale));
          
          // Calculate center of viewport for smooth zoom
          const centerX = viewportDimensions.width / 2;
          const centerY = viewportDimensions.height / 2;
          
          // Calculate the point in canvas coordinates that should stay at the center
          const canvasCenterX = (centerX - stagePos.x) / oldScale;
          const canvasCenterY = (centerY - stagePos.y) / oldScale;
          
          // Calculate new position to keep the center point in the same screen position
          const newPos = {
            x: centerX - canvasCenterX * clampedScale,
            y: centerY - canvasCenterY * clampedScale,
          };
          
          // Apply smooth transition
          setScale(clampedScale);
          setStagePos(newPos);
        }
      }
    };

    container.addEventListener('wheel', handleNativeWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleNativeWheel);
    };
  }, [stagePos, viewportDimensions, selectedId, MIN_ZOOM, MAX_ZOOM]);

  // Handle stage drag (panning) - only when not dragging a shape
  const handleStageDrag = (e) => {
    // Only allow stage dragging if we're not dragging a shape
    if (e.target === e.target.getStage()) {
      const newPos = e.target.position();
      setStagePos(newPos);
    }
  };



  // Handle stage click (deselect)
  const handleStageClick = async (e) => {
    // Check if click is on stage, layer, or background rect (empty canvas)
    const isCanvasClick = e.target === e.target.getStage() || 
                          e.target.getType() === 'Layer' || 
                          e.target.getType() === 'Rect' ||
                          e.target.name() === 'background' ||
                          e.target.name() === '' ||
                          e.target.id() === '';
    
    if (isCanvasClick) {
      await deselectAll();
    }
  };

  // Handle shape drag start - disable stage dragging (shape should already be locked)
  const handleShapeDragStart = async (e) => {
    e.cancelBubble = true;
    const shapeId = e.target.id();
    
    // Ensure the shape is selected and locked
    await selectShape(shapeId);
    
    // Start optimized drag tracking for the dragged shape
    startDrag(shapeId);
    
    // If we're in multi-select mode and this shape is part of the selection,
    // start tracking all selected shapes
    if (currentTool === 'multiselect' && selectedIds?.includes(shapeId)) {
      // Store initial positions of all selected shapes
      const initialPositions = {};
      selectedIds?.forEach(id => {
        const shape = shapes.find(s => s.id === id);
        if (shape) {
          initialPositions[id] = { x: shape.x, y: shape.y };
        }
      });
      e.target.setAttr('initialPositions', initialPositions);
    }
    
    // Disable stage dragging while dragging a shape
    const stage = e.target.getStage();
    stage.draggable(false);
  };

  // Handle shape drag move - optimized real-time position updates
  const handleShapeDragMove = (e) => {
    e.cancelBubble = true;
    const shapeId = e.target.id();
    let newPos = e.target.position();
    
    // Apply snap-to-grid if enabled
    if (snapToGridEnabled) {
      newPos = snapPositionToGrid(newPos);
      e.target.position(newPos);
    }
    
    // Use optimized positioning with interpolation for the dragged shape
    updateDragPosition(shapeId, newPos.x, newPos.y);
    
    // If we're in multi-select mode and this shape is part of the selection,
    // move all selected shapes together
    if (currentTool === 'multiselect' && selectedIds?.includes(shapeId)) {
      const initialPositions = e.target.getAttr('initialPositions');
      if (initialPositions) {
        const draggedShape = shapes.find(s => s.id === shapeId);
        if (draggedShape) {
          const deltaX = newPos.x - initialPositions[shapeId].x;
          const deltaY = newPos.y - initialPositions[shapeId].y;
          
          // Move all other selected shapes by the same delta
          selectedIds?.forEach(id => {
            if (id !== shapeId) {
              const initialPos = initialPositions[id];
              if (initialPos) {
                let targetPos = { x: initialPos.x + deltaX, y: initialPos.y + deltaY };
                
                // Apply snap-to-grid to other shapes too
                if (snapToGridEnabled) {
                  targetPos = snapPositionToGrid(targetPos);
                }
                
                updateDragPosition(id, targetPos.x, targetPos.y);
              }
            }
          });
        }
      }
    }
  };

  // Handle shape drag end - optimized cleanup
  const handleShapeDragEnd = async (e) => {
    e.cancelBubble = true;
    const shapeId = e.target.id();
    const newPos = e.target.position();
    
    // End optimized drag tracking for the dragged shape
    await endDrag(shapeId);
    
    // Explicitly clear real-time position to remove yellow border
    clearRealTimePosition(shapeId);
    
    // Update final position in Firestore for the dragged shape
    try {
      await updateShape(shapeId, {
        x: newPos.x,
        y: newPos.y
      });
    } catch (error) {
      console.error('Error updating position:', error);
    }
    
    // If we're in multi-select mode and this shape is part of the selection,
    // update all selected shapes' final positions
    if (currentTool === 'multiselect' && selectedIds?.includes(shapeId)) {
      const initialPositions = e.target.getAttr('initialPositions');
      if (initialPositions) {
        const deltaX = newPos.x - initialPositions[shapeId].x;
        const deltaY = newPos.y - initialPositions[shapeId].y;
        
        // Update all other selected shapes' final positions
        const updatePromises = selectedIds?.map(async (id) => {
          if (id !== shapeId) {
            const initialPos = initialPositions[id];
            if (initialPos) {
              const finalX = initialPos.x + deltaX;
              const finalY = initialPos.y + deltaY;
              
              try {
                await updateShape(id, { x: finalX, y: finalY });
                // Clear real-time position for each shape to remove yellow border
                clearRealTimePosition(id);
              } catch (error) {
                console.error(`Error updating position for shape ${id}:`, error);
              }
            }
          }
        });
        
        await Promise.all(updatePromises);
      }
    }
    
    // DO NOT unlock the shape - it should stay locked and selected
    // The shape will only be unlocked when user clicks elsewhere
    
    // Re-enable stage dragging
    const stage = e.target.getStage();
    stage.draggable(true);
  };

  // Handle shape resize
  const handleShapeResize = async (shapeId, updates) => {
    try {
      await updateShape(shapeId, updates);
    } catch (error) {
      console.error(`❌ Canvas: Error updating shape ${shapeId}:`, error);
    }
  };

  // Handle text edit
  const handleTextEdit = (shapeId) => {
    const shape = shapes.find(s => s.id === shapeId);
    if (shape && shape.type === 'text') {
      setEditingTextId(shapeId);
      setEditingText(shape.text || 'Text');
    }
  };

  const handleTextSave = async () => {
    if (editingTextId) {
      await updateShape(editingTextId, { text: editingText });
      setEditingTextId(null);
      setEditingText('');
      // Deselect the shape after saving
      await deselectAll();
    }
  };

  const handleTextCancel = async () => {
    setEditingTextId(null);
    setEditingText('');
    // Deselect the shape after canceling text edit
    await deselectAll();
  };

  // Handle AI operations (create, move, delete, resize)
  const handleAIOperation = async (parsedCommand) => {
    try {
      const result = await executeAIOperation(parsedCommand);
      return result;
    } catch (error) {
      console.error('Error executing AI operation:', error);
      throw error; // Re-throw to let AIChatInput handle the error display
    }
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedId && (e.key === 'Delete' || e.key === 'Backspace')) {
        deleteShape(selectedId);
      }
      if (e.key === 'Escape') {
        deselectAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, deleteShape, deselectAll]);

  // Show loading state
  if (loading) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <Stage
        ref={stageRef}
        width={viewportDimensions.width}
        height={viewportDimensions.height}
        scaleX={scale}
        scaleY={scale}
        x={stagePos.x}
        y={stagePos.y}
        draggable
        onDragEnd={handleStageDrag}
        onClick={handleStageClick}
        onTap={handleStageClick}
        onMouseMove={handleMouseMove}
      >
        {/* Grid Layer - Always at the bottom */}
        <Layer ref={gridLayerRef}>
          {/* Canvas background */}
          <Rect
            x={0}
            y={0}
            width={canvasDimensions.width}
            height={canvasDimensions.height}
            fill="#ffffff"
            onClick={handleStageClick}
            onTap={handleStageClick}
            name="background"
          />
          
          {/* Grid lines - always show if grid is visible for export */}
          {isGridVisibleForExport && (
            <Grid canvasWidth={canvasDimensions.width} canvasHeight={canvasDimensions.height} />
          )}
          
          {/* Canvas boundary indicator */}
          <Rect
            x={0}
            y={0}
            width={canvasDimensions.width}
            height={canvasDimensions.height}
            fill="transparent"
            stroke="#3b82f6"
            strokeWidth={1}
            dash={[5, 5]}
            opacity={0.3}
          />
        </Layer>
        
        {/* Shapes Layer - Above grid */}
        <Layer>
          {/* Render shapes */}
          {shapes.map((shape) => {
            // Get real-time position if available
            const realTimePos = realTimePositions[shape.id];
            const isBeingMovedByOther = realTimePos && realTimePos.updatedBy !== currentUser?.uid;
            
            
            // Get smooth interpolated position only for remote users' movements
            const smoothRemotePos = realTimePos ? 
              getSmoothRemotePosition(shape.id, realTimePos, currentUser?.uid) : null;
            
            // Use smooth position for remote movements, immediate position for local dragging
            const displayShape = smoothRemotePos ? {
              ...shape,
              x: smoothRemotePos.x,
              y: smoothRemotePos.y
            } : shape;
            
            return (
              <Shape
                key={shape.id}
                shape={displayShape}
                isSelected={shape.id === selectedId}
                isMultiSelected={selectedIds?.includes(shape.id) || false}
                isBeingMovedByOther={isBeingMovedByOther}
                onSelect={selectShape}
                onToggleSelection={toggleShapeSelection}
                onDragStart={handleShapeDragStart}
                onDragMove={handleShapeDragMove}
                onDragEnd={handleShapeDragEnd}
                onResize={handleShapeResize}
                onDelete={deleteShape}
                onTextEdit={handleTextEdit}
                currentUser={currentUser}
                onlineUsers={onlineUsers}
                currentTool={currentTool}
              />
            );
          })}
        </Layer>

        {/* Cursors Layer - Above shapes */}
        <Layer>
          {/* Render other users' cursors */}
          {onlineUsers
            .filter(user => user.userId !== currentUser?.uid)
            .map((user) => {
              return (
                <Cursor
                  key={user.userId}
                  user={user}
                  scale={scale}
                  stagePos={stagePos}
                />
              );
            })}
        </Layer>
      </Stage>

      {/* Bulk Delete Button for Multi-Selected Shapes */}
      {selectedIds?.length > 1 && (
        <div
          className="fixed top-20 right-4 z-50"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top right'
          }}
        >
          <button
            onClick={deleteSelectedShapes}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center gap-2"
            title={`Delete ${selectedIds?.length || 0} selected shapes`}
          >
            <span className="text-lg">🗑️</span>
            <span>Delete {selectedIds?.length || 0} shapes</span>
          </button>
        </div>
      )}

      {/* Inline Text Editor */}
      {editingTextId && (() => {
        const shape = shapes.find(s => s.id === editingTextId);
        if (shape) {
          return (
            <InlineTextEditor
              x={shape.x * scale + stagePos.x}
              y={shape.y * scale + stagePos.y}
              width={shape.width * scale}
              height={shape.height * scale}
              value={editingText}
              onChange={setEditingText}
              onSave={handleTextSave}
              onCancel={handleTextCancel}
              scale={scale}
              fontSize={shape.fontSize || 14}
            />
          );
        }
        return null;
      })()}

      {/* AI Chat Input - moved to sidebar */}
      
      {/* Performance Dashboard */}
      <PerformanceDashboard isVisible={showPerformanceDashboard} />
      
      {/* Toast Notifications */}
      <Toast toast={toast} />

      {/* Properties Panel */}
      <PropertiesPanel
        selectedShape={selectedId ? shapes.find(s => s.id === selectedId) : null}
        onUpdateShape={updateShape}
        onDeleteShape={deleteShape}
        onClose={() => selectShape(null)}
        isVisible={!!selectedId && ['stickyNote', 'card', 'list'].includes(shapes.find(s => s.id === selectedId)?.type)}
      />
    </div>
  );
};

export default Canvas;
