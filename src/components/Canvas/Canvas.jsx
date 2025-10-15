import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Line } from 'react-konva';
import { useCanvas } from '../../contexts/CanvasContext';
import { useAuth } from '../../contexts/AuthContext';
import { usePresence } from '../../hooks/usePresence';
import { useCursors } from '../../hooks/useCursors';
import { CANVAS_WIDTH, CANVAS_HEIGHT, VIEWPORT_WIDTH, VIEWPORT_HEIGHT, MIN_ZOOM, MAX_ZOOM } from '../../utils/constants';
import Shape from './Shape';
import InlineTextEditor from './InlineTextEditor';
import Cursor from '../Collaboration/Cursor';

const GRID_SIZE = 20;

// Grid component to render grid lines
const Grid = () => {
  const lines = [];
  
  // Vertical lines
  for (let i = 0; i <= CANVAS_WIDTH / GRID_SIZE; i++) {
    lines.push(
      <Line
        key={`v${i}`}
        points={[i * GRID_SIZE, 0, i * GRID_SIZE, CANVAS_HEIGHT]}
        stroke="#e0e0e0"
        strokeWidth={0.5}
        listening={false}
      />
    );
  }
  
  // Horizontal lines
  for (let j = 0; j <= CANVAS_HEIGHT / GRID_SIZE; j++) {
    lines.push(
      <Line
        key={`h${j}`}
        points={[0, j * GRID_SIZE, CANVAS_WIDTH, j * GRID_SIZE]}
        stroke="#e0e0e0"
        strokeWidth={0.5}
        listening={false}
      />
    );
  }
  
  return <>{lines}</>;
};

const Canvas = () => {
  const { shapes, selectedId, stageRef, selectShape, deselectAll, updateShape, deleteShape, loading, lockShape, unlockShape } = useCanvas();
  const { currentUser } = useAuth();
  const { onlineUsers } = usePresence();
  const gridLayerRef = useRef();
  const containerRef = useRef();
  
  // Center the canvas in the viewport initially
  const [stagePos, setStagePos] = useState({ 
    x: (VIEWPORT_WIDTH - CANVAS_WIDTH) / 2, 
    y: (VIEWPORT_HEIGHT - CANVAS_HEIGHT) / 2 
  });
  const [scale, setScale] = useState(1);
  const [editingTextId, setEditingTextId] = useState(null);
  const [editingText, setEditingText] = useState('');

  // Initialize cursor tracking
  const { handleMouseMove } = useCursors(stagePos, scale);

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
        
        // Trigger zoom through Konva
        if (stageRef.current) {
          const stage = stageRef.current;
          const scaleBy = 1.1;
          const oldScale = stage.scaleX();
          
          // Calculate pointer position relative to stage
          const stageRect = stage.content.getBoundingClientRect();
          const pointerX = mouseX - stageRect.left;
          const pointerY = mouseY - stageRect.top;
          
          const mousePointTo = {
            x: (pointerX - stagePos.x) / oldScale,
            y: (pointerY - stagePos.y) / oldScale,
          };
          
          const newScale = e.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
          const clampedScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newScale));
          
          setScale(clampedScale);
          
          const newPos = {
            x: pointerX - mousePointTo.x * clampedScale,
            y: pointerY - mousePointTo.y * clampedScale,
          };
          
          setStagePos(newPos);
        }
      }
      // If mouse is outside, do nothing and let the browser handle scroll
    };

    container.addEventListener('wheel', handleNativeWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleNativeWheel);
    };
  }, [stagePos, MIN_ZOOM, MAX_ZOOM]);

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

  // Handle shape drag start - disable stage dragging and lock shape
  const handleShapeDragStart = async (e) => {
    e.cancelBubble = true;
    const shapeId = e.target.id();
    
    // Lock the shape to prevent other users from moving it
    await lockShape(shapeId);
    
    // Disable stage dragging while dragging a shape
    const stage = e.target.getStage();
    stage.draggable(false);
  };

  // Handle shape drag
  const handleShapeDragEnd = async (e) => {
    e.cancelBubble = true;
    const shapeId = e.target.id();
    const newPos = e.target.position();
    
    // Update shape position without constraints - allow free movement
    try {
      await updateShape(shapeId, {
        x: newPos.x,
        y: newPos.y
      });
    } catch (error) {
      console.error('Error updating position:', error);
    }
    
    // Unlock the shape
    await unlockShape(shapeId);
    
    // Re-enable stage dragging
    const stage = e.target.getStage();
    stage.draggable(true);
  };

  // Handle shape resize
  const handleShapeResize = async (shapeId, updates) => {
    await updateShape(shapeId, updates);
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

  const handleTextCancel = () => {
    setEditingTextId(null);
    setEditingText('');
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
    <div ref={containerRef} className="relative">
      <Stage
        ref={stageRef}
        width={VIEWPORT_WIDTH}
        height={VIEWPORT_HEIGHT}
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
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            fill="#ffffff"
            onClick={handleStageClick}
            onTap={handleStageClick}
            name="background"
          />
          
          {/* Grid lines */}
          <Grid />
          
          {/* Canvas boundary indicator */}
          <Rect
            x={0}
            y={0}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
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
          {shapes.map((shape) => (
            <Shape
              key={shape.id}
              shape={shape}
              isSelected={shape.id === selectedId}
              onSelect={selectShape}
              onDragStart={handleShapeDragStart}
              onDragEnd={handleShapeDragEnd}
              onResize={handleShapeResize}
              onDelete={deleteShape}
              onTextEdit={handleTextEdit}
              currentUser={currentUser}
              onlineUsers={onlineUsers}
            />
          ))}
        </Layer>

        {/* Cursors Layer - Above shapes */}
        <Layer>
          {/* Render other users' cursors */}
          {onlineUsers
            .filter(user => user.userId !== currentUser?.uid)
            .map((user) => (
              <Cursor
                key={user.userId}
                user={user}
                scale={scale}
                stagePos={stagePos}
              />
            ))}
        </Layer>
      </Stage>

      {/* Inline Text Editor */}
      {editingTextId && (() => {
        const shape = shapes.find(s => s.id === editingTextId);
        if (shape) {
          return (
            <InlineTextEditor
              x={shape.x * scale + stagePos.x}
              y={shape.y * scale + stagePos.y}
              width={shape.width}
              height={shape.height}
              value={editingText}
              onChange={setEditingText}
              onSave={handleTextSave}
              onCancel={handleTextCancel}
              scale={scale}
            />
          );
        }
        return null;
      })()}
    </div>
  );
};

export default Canvas;
