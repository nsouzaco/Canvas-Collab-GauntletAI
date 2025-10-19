import React, { useEffect, useRef, useState } from "react";
import { Rect, Circle, Text, Group, Transformer } from "react-konva";
import List from '../shapes/List';

const MIN_SIZE = 30;

const Shape = ({
  shape,
  isSelected,
  isMultiSelected = false,
  isBeingMovedByOther = false,
  onSelect,
  onToggleSelection,
  onDragStart,
  onDragMove,
  onDragEnd,
  onResize,
  onDelete,
  onTextEdit,
  currentUser,
  onlineUsers = [],
  currentTool = 'select',
}) => {
  const shapeRef = useRef(null);
  const transformerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);

  // 🔹 Attach transformer to selected shape
  useEffect(() => {
    if (isSelected && transformerRef.current && shapeRef.current) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  // 🔹 Re-attach transformer after dragging ends
  useEffect(() => {
    if (isSelected && !isDragging && transformerRef.current && shapeRef.current) {
      // Small delay to ensure the shape is fully positioned after drag
      setTimeout(() => {
        if (transformerRef.current && shapeRef.current) {
          transformerRef.current.nodes([shapeRef.current]);
          transformerRef.current.getLayer().batchDraw();
        }
      }, 50);
    }
  }, [isSelected, isDragging]);

  // 🔹 Reset scale after remote size updates (from Firebase or others)
  useEffect(() => {
    if (shapeRef.current) {
      shapeRef.current.scaleX(1);
      shapeRef.current.scaleY(1);
    }
  }, [shape.width, shape.height]);

  // 🔹 Monitor rotation changes (completely disabled during transformation)
  useEffect(() => {
    if (shapeRef.current && shape.rotation !== undefined && !isTransforming && !isDragging) {
      // Only apply Firebase rotation if not actively transforming or dragging
      const currentRotation = shapeRef.current.rotation();
      const newRotation = shape.rotation;
      // Only apply if significantly different (more than 1 degree)
      if (Math.abs(currentRotation - newRotation) > 1) {
        shapeRef.current.rotation(newRotation);
      }
    }
  }, [shape.rotation, isTransforming, isDragging]);

  // 🔹 Event handlers
  const handleClick = (e) => {
    e.cancelBubble = true;
    
    // Don't allow selection if locked by another user
    if (isLockedByAnotherUser) {
      return;
    }

    if (currentTool === 'multiselect') {
      // Multi-selection mode - toggle selection
      onToggleSelection?.(shape.id);
    } else {
      // Allow selection regardless of tool (except multiselect)
      // This enables clicking any shape to select it
      onSelect?.(shape.id);
    }
  };

  const handleDoubleClick = (e) => {
    if (shape.type === 'text' && onTextEdit) {
      e.cancelBubble = true;
      onTextEdit(shape.id);
    }
  };

  const handleDragStart = (e) => {
    e.cancelBubble = true;
    // Only allow dragging if select or multiselect tool is active
    if (currentTool !== 'select' && currentTool !== 'multiselect') {
      return;
    }
    // Don't allow dragging if locked by another user
    if (isLockedByAnotherUser) {
      return;
    }
    // Don't allow dragging if being moved by another user
    if (isBeingMovedByOther) {
      console.log(`🚫 Shape ${shape.id} is being moved by another user, preventing drag`);
      return;
    }
    
    // Auto-select the shape if it's not already selected by current user
    if (currentTool === 'select' && !isSelected) {
      onSelect?.(shape.id);
    } else if (currentTool === 'multiselect' && !isMultiSelected) {
      onToggleSelection?.(shape.id);
    }
    
    setIsDragging(true);
    onDragStart?.(e);
  };

  const handleDragMove = (e) => {
    e.cancelBubble = true;
    onDragMove?.(e);
  };

  const handleDragEnd = (e) => {
    e.cancelBubble = true;
    onDragEnd?.(e);
    setIsDragging(false);
  };

  const handleTransformStart = (e) => {
    e.cancelBubble = true;
    // Only allow transforming if select or multiselect tool is active
    if (currentTool !== 'select' && currentTool !== 'multiselect') {
      return;
    }
    // Don't allow transforming if locked by another user
    if (isLockedByAnotherUser) {
      return;
    }
    
    // Auto-select the shape if it's not already selected by current user
    if (currentTool === 'select' && (!isSelected || !isLockedByCurrentUser)) {
      onSelect?.(shape.id);
    } else if (currentTool === 'multiselect' && !isMultiSelected) {
      onToggleSelection?.(shape.id);
    }
    
    setIsTransforming(true);
  };

  const handleTransformEnd = (e) => {
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = node.rotation();

    // Debug logging removed for cleaner console

    // Compute new size
    const newWidth = Math.max(MIN_SIZE, node.width() * scaleX);
    const newHeight = Math.max(MIN_SIZE, node.height() * scaleY);

    // Reset scale to 1 (avoid compounding)
    node.scaleX(1);
    node.scaleY(1);
    // Don't reset rotation - keep it applied

    const newAttrs = { 
      width: newWidth, 
      height: newHeight,
      rotation: rotation
    };
    
    // Saving shape updates to Firebase
    
    // Delay resetting transformation state to prevent jumping
    setTimeout(() => {
      setIsTransforming(false);
    }, 200);
    
    onResize?.(shape.id, newAttrs);
  };

  // 🔹 Determine user indicators and lock status
  const editingUser = onlineUsers.find((u) => u.userId === shape.lockedBy)?.displayName;
  const selectedByUser = onlineUsers.find((u) => u.userId === shape.selectedBy)?.displayName;
  const isLockedByAnotherUser = shape.lockedBy && shape.lockedBy !== currentUser?.uid;
  
  const isLockedByCurrentUser = shape.lockedBy === currentUser?.uid;
  
  

  // Shape rendering with rotation support

  return (
    <>
      <Group
        x={shape.x}
        y={shape.y}
        rotation={shape.rotation || 0}
        draggable={!isLockedByAnotherUser && !isBeingMovedByOther && (isSelected || isMultiSelected)}
        onClick={handleClick}
        onTap={handleClick}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onTransformStart={handleTransformStart}
        onTransformEnd={handleTransformEnd}
        id={shape.id}
      >
        {/* ─────────────── Shape Types ─────────────── */}
        {shape.type === "rectangle" && (
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
          />
        )}

        {/* Locked object border for rectangles */}
        {shape.type === "rectangle" && isLockedByAnotherUser && (
          <Rect
            x={-3}
            y={-3}
            width={shape.width + 6}
            height={shape.height + 6}
            fill="transparent"
            stroke="#ef4444"
            strokeWidth={3}
            dash={[8, 4]}
            listening={false}
          />
        )}

        {shape.type === "circle" && (
          <Circle
            ref={shapeRef}
            x={shape.width / 2}
            y={shape.height / 2}
            radius={Math.min(shape.width, shape.height) / 2}
            fill={shape.fill}
            stroke={isSelected ? "#3b82f6" : isMultiSelected ? "#8B5CF6" : isBeingMovedByOther ? "#f59e0b" : "#E5E7EB"}
            strokeWidth={isSelected ? 3 : isMultiSelected ? 3 : isBeingMovedByOther ? 2 : 1}
            opacity={isBeingMovedByOther ? 0.8 : 1}
          />
        )}

        {/* Locked object border for circles */}
        {shape.type === "circle" && isLockedByAnotherUser && (
          <Circle
            x={shape.width / 2}
            y={shape.height / 2}
            radius={Math.min(shape.width, shape.height) / 2 + 3}
            fill="transparent"
            stroke="#ef4444"
            strokeWidth={3}
            dash={[8, 4]}
            listening={false}
          />
        )}

        {shape.type === "text" && (
          <Rect
            ref={shapeRef}
            x={0}
            y={0}
            width={shape.width}
            height={shape.height}
            fill="transparent"
            stroke={isSelected ? "#3b82f6" : isBeingMovedByOther ? "#f59e0b" : "transparent"}
            strokeWidth={isSelected ? 3 : isBeingMovedByOther ? 2 : 0}
            opacity={isBeingMovedByOther ? 0.8 : 1}
            onDblClick={handleDoubleClick}
            onDblTap={handleDoubleClick}
            onTransformStart={handleTransformStart}
            onTransformEnd={handleTransformEnd}
          />
        )}

        {/* Locked object border for text */}
        {shape.type === "text" && isLockedByAnotherUser && (
          <Rect
            x={-3}
            y={-3}
            width={shape.width + 6}
            height={shape.height + 6}
            fill="transparent"
            stroke="#ef4444"
            strokeWidth={3}
            dash={[8, 4]}
            listening={false}
          />
        )}

        {/* Locked object border for sticky notes */}
        {shape.type === "stickyNote" && isLockedByAnotherUser && (
          <Rect
            x={-3}
            y={-3}
            width={shape.width + 6}
            height={shape.height + 6}
            fill="transparent"
            stroke="#ef4444"
            strokeWidth={3}
            dash={[8, 4]}
            listening={false}
            cornerRadius={2}
          />
        )}

        {/* Locked object border for cards */}
        {shape.type === "card" && isLockedByAnotherUser && (
          <Rect
            x={-3}
            y={-3}
            width={shape.width + 6}
            height={shape.height + 6}
            fill="transparent"
            stroke="#ef4444"
            strokeWidth={3}
            dash={[8, 4]}
            listening={false}
            cornerRadius={8}
          />
        )}

        {/* Locked object border for lists */}
        {shape.type === "list" && isLockedByAnotherUser && (
          <Rect
            x={-3}
            y={-3}
            width={shape.width + 6}
            height={shape.height + 6}
            fill="transparent"
            stroke="#ef4444"
            strokeWidth={3}
            dash={[8, 4]}
            listening={false}
            cornerRadius={6}
          />
        )}

        {shape.type === "text" && (
          <Text
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
            onDblClick={handleDoubleClick}
            onDblTap={handleDoubleClick}
          />
        )}

        {shape.type === "stickyNote" && (
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
            cornerRadius={2}
            onDblClick={handleDoubleClick}
            onDblTap={handleDoubleClick}
          />
        )}

        {/* Sticky Note Text Content */}
        {shape.type === "stickyNote" && (
          <Text
            x={20}
            y={50}
            width={shape.width - 40}
            height={shape.height - 100}
            text={shape.text || "Remember to:\n\n• Buy groceries\n• Call mom\n• Finish project\n• Water plants"}
            fontSize={18}
            fontFamily="Segoe UI, Arial, sans-serif"
            fill="#333"
            align="left"
            verticalAlign="top"
            wrap="word"
            ellipsis={false}
            onDblClick={handleDoubleClick}
            onDblTap={handleDoubleClick}
          />
        )}

        {/* Sticky Note Pin Emoji */}
        {shape.type === "stickyNote" && (
          <Text
            x={shape.width / 2 - 20}
            y={-30}
            text="📌"
            fontSize={40}
            fontFamily="Arial, sans-serif"
            align="center"
            verticalAlign="middle"
          />
        )}

        {/* Card Shape */}
        {shape.type === "card" && (
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
            shadowBlur={10}
            shadowOffset={{ x: 2, y: 2 }}
            onDblClick={handleDoubleClick}
            onDblTap={handleDoubleClick}
          />
        )}

        {/* Card Title */}
        {shape.type === "card" && (
          <Text
            x={15}
            y={15}
            width={shape.width - 30}
            height={30}
            text={shape.title || "Card Title"}
            fontSize={18}
            fontFamily="Inter, system-ui, sans-serif"
            fill="#1F2937"
            align="left"
            verticalAlign="top"
            fontStyle="bold"
            wrap="word"
            ellipsis={true}
            onDblClick={handleDoubleClick}
            onDblTap={handleDoubleClick}
          />
        )}

        {/* Card Content */}
        {shape.type === "card" && (
          <Text
            x={15}
            y={50}
            width={shape.width - 30}
            height={shape.height - 70}
            text={shape.content || "This is a card with some content. You can edit this text by double-clicking."}
            fontSize={14}
            fontFamily="Inter, system-ui, sans-serif"
            fill="#4B5563"
            align="left"
            verticalAlign="top"
            wrap="word"
            ellipsis={false}
            onDblClick={handleDoubleClick}
            onDblTap={handleDoubleClick}
          />
        )}

        {/* List Shape */}
        {shape.type === "list" && (
          <List
            shape={shape}
            isSelected={isSelected}
            isMultiSelected={isMultiSelected}
            isBeingMovedByOther={isBeingMovedByOther}
            onDoubleClick={handleDoubleClick}
            shapeRef={shapeRef}
          />
        )}
      </Group>

      {/* ─────────────── User Indicators (Outside rotating Group) ─────────────── */}
      {/* Show lock label only to other users (not to the user who locked it) */}
      {editingUser && isLockedByAnotherUser && (
        <Group
          x={shape.x + shape.width + 10}
          y={shape.y - 20}
        >
          <Rect
            x={0}
            y={0}
            width={120}
            height={20}
            fill="#ef4444"
            cornerRadius={3}
          />
          <Text
            x={3}
            y={3}
            text={`🔒 ${editingUser}`}
            fontSize={11}
            fill="white"
            fontStyle="bold"
          />
        </Group>
      )}

      {/* Multi-Selection Indicator */}
      {isMultiSelected && !isDragging && (
        <Group
          x={shape.x - 25}
          y={shape.y - 25}
        >
          <Circle
            x={0}
            y={0}
            radius={10}
            fill="#8B5CF6"
          />
          <Text
            x={0}
            y={0}
            text="✓"
            fontSize={14}
            fill="white"
            fontStyle="bold"
            align="center"
            verticalAlign="middle"
            offsetX={3}
            offsetY={4}
          />
        </Group>
      )}

      {/* Delete Button - Show when selected but hidden during dragging for cleaner UX */}
      {isSelected && !isDragging && (
        <Group
          x={shape.x + shape.width + 20}
          y={shape.y + shape.height - 1}
          onClick={(e) => {
            e.cancelBubble = true;
            onDelete(shape.id);
          }}
          onTap={(e) => {
            e.cancelBubble = true;
            onDelete(shape.id);
          }}
        >
          <Circle
            x={0}
            y={0}
            radius={12}
            fill="#ef4444"
          />
          <Text
            x={0}
            y={0}
            text="×"
            fontSize={20}
            fill="white"
            fontStyle="bold"
            align="center"
            verticalAlign="middle"
            offsetX={5}
            offsetY={10}
          />
        </Group>
      )}

      {/* ─────────────── Transformer (Resize Handles) ─────────────── */}
      {isSelected && !isDragging && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Only enforce minimum size constraints
            newBox.width = Math.max(MIN_SIZE, newBox.width);
            newBox.height = Math.max(MIN_SIZE, newBox.height);

            return newBox;
          }}
          enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
          borderEnabled={true}
          borderStroke="#3b82f6"
          borderStrokeWidth={2}
          anchorStroke="#3b82f6"
          anchorFill="#fff"
          anchorStrokeWidth={2}
          anchorSize={8}
          rotateEnabled={true}
          rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
          keepRatio={false}
          centeredScaling={false}
        />
      )}
    </>
  );
};

export default Shape;
