import React, { useEffect, useRef, useState } from "react";
import { Rect, Circle, Text, Group, Transformer } from "react-konva";
import { getCachedUser } from "../../utils/userCache";

const MIN_SIZE = 30;

const Shape = ({
  shape,
  isSelected,
  onSelect,
  onDragStart,
  onDrag,
  onDragEnd,
  onResize,
  onDelete,
  onTextEdit,
  currentUser,
  onlineUsers = [],
  selectedTool,
}) => {
  const shapeRef = useRef(null);
  const transformerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // 🔹 Attach transformer to selected shape
  useEffect(() => {
  if (isSelected && transformerRef.current && shapeRef.current) {
    transformerRef.current.nodes([shapeRef.current]);
    transformerRef.current.getLayer().batchDraw();
  }
}, [isSelected]);

// 🔹 Reset scale after remote size updates (from Firebase or others)
useEffect(() => {
  if (shapeRef.current) {
    shapeRef.current.scaleX(1);
    shapeRef.current.scaleY(1);
  }
}, [shape.width, shape.height]);

// 🔹 Event handlers
const handleClick = (e) => {
  e.cancelBubble = true;
  
  // Debug logging
  console.log('🔍 Shape click debug:', {
    shapeId: shape.id,
    lockedBy: shape.lockedBy,
    currentUser: currentUser?.uid,
    isLocked: shape.isLocked,
    canSelect: !(shape.lockedBy && shape.lockedBy !== currentUser?.uid),
    toolSelected: selectedTool,
    selectedBy: shape.selectedBy,
    fullShape: shape
  });
  
  // Check if shape is locked by another user
  if (shape.lockedBy && shape.lockedBy !== currentUser?.uid) {
    console.log('🚫 Shape is locked by another user:', shape.lockedBy);
    return; // Prevent selection
  }
  
  if (onSelect) {
    console.log('✅ Shape can be selected');
    onSelect(shape.id);
  } else {
    console.log('🚫 Selection disabled - cursor tool not selected');
  }
};

const handleDoubleClick = (e) => {
  if (shape.type === 'text' && onTextEdit) {
    e.cancelBubble = true;
    
    // Check if shape is locked by another user
    if (shape.lockedBy && shape.lockedBy !== currentUser?.uid) {
      console.log('Cannot edit text locked by another user:', shape.lockedBy);
      return; // Prevent text editing
    }
    
    onTextEdit(shape.id);
  }
};

const handleDragStart = (e) => {
  e.cancelBubble = true;
  
  // Check if shape is locked by another user
  if (shape.lockedBy && shape.lockedBy !== currentUser?.uid) {
    console.log('Cannot drag shape locked by another user:', shape.lockedBy);
    return; // Prevent dragging
  }
  
  // Check if cursor tool is selected
  if (!onSelect) {
    console.log('Cannot drag - cursor tool not selected');
    return; // Prevent dragging
  }
  
  setIsDragging(true);
  onDragStart?.(e);
};

const handleDrag = (e) => {
  e.cancelBubble = true;
  onDrag?.(e);
};

const handleDragEnd = (e) => {
  e.cancelBubble = true;
  onDragEnd?.(e);
  setIsDragging(false);
};

const handleTransformEnd = (e) => {
  const node = shapeRef.current;
  const scaleX = node.scaleX();
  const scaleY = node.scaleY();
  const rotation = node.rotation();

  // Debug logging for rotation
  console.log('🔄 Transform end - rotation:', rotation, 'for shape:', shape.id);
  console.log('🔄 Previous rotation was:', shape.rotation);

  // For text shapes, we need to handle rotation differently
  if (shape.type === 'text') {
    // For text, we keep the original dimensions but save the rotation
    // The expanded bounds are calculated dynamically in the render
    const newAttrs = { 
      rotation: rotation
    };
    
    console.log('🔄 Saving text rotation to Firebase:', newAttrs);
    onResize?.(shape.id, newAttrs);
  } else {
    // For other shapes, handle normal resize
    const newWidth = Math.max(MIN_SIZE, node.width() * scaleX);
    const newHeight = Math.max(MIN_SIZE, node.height() * scaleY);

    // Reset scale to 1 (avoid compounding)
    node.scaleX(1);
    node.scaleY(1);

    const newAttrs = { 
      width: newWidth, 
      height: newHeight,
      rotation: rotation
    };
    
    console.log('🔄 Saving shape transform to Firebase:', newAttrs);
    onResize?.(shape.id, newAttrs);
  }
};

// 🔹 Determine user indicators with fallback
const getDisplayName = (userId) => {
  if (!userId) return null;
  
  // First try to find in online users
  const onlineUser = onlineUsers.find((u) => u.userId === userId);
  if (onlineUser?.displayName) {
    return onlineUser.displayName;
  }
  
  // Fallback: if it's the current user, use their display name
  if (userId === currentUser?.uid && currentUser?.displayName) {
    return currentUser.displayName;
  }
  
  // Fallback: extract from email if available
  if (userId === currentUser?.uid && currentUser?.email) {
    const emailPrefix = currentUser.email.split('@')[0];
    return emailPrefix.length > 20 ? emailPrefix.substring(0, 20) : emailPrefix;
  }
  
  // Try cached user data
  const cachedUser = getCachedUser(userId);
  if (cachedUser?.displayName) {
    return cachedUser.displayName;
  }
  
  // Last resort: show "User" instead of "unknown"
  return "User";
};

const editingUser = getDisplayName(shape.lockedBy);
const selectedByUser = getDisplayName(shape.selectedBy);
const isLockedByOther = shape.lockedBy && shape.lockedBy !== currentUser?.uid;

return (
  <>
    <Group
      x={shape.x}
      y={shape.y}
      draggable={isSelected && selectedTool === 'cursor'}
      onClick={handleClick}
      onTap={handleClick}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
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
          stroke={isSelected ? "#3b82f6" : isLockedByOther ? "#f59e0b" : "#E5E7EB"}
          strokeWidth={isSelected ? 3 : isLockedByOther ? 2 : 1}
          onTransformEnd={handleTransformEnd}
        />
      )}

      {shape.type === "circle" && (
        <Circle
          ref={shapeRef}
          x={shape.width / 2}
          y={shape.height / 2}
          radius={Math.min(shape.width, shape.height) / 2}
          fill={shape.fill}
          stroke={isSelected ? "#3b82f6" : isLockedByOther ? "#f59e0b" : "#E5E7EB"}
          strokeWidth={isSelected ? 3 : isLockedByOther ? 2 : 1}
          onTransformEnd={handleTransformEnd}
        />
      )}

      {shape.type === "text" && (() => {
        // Debug logging for text rotation
        console.log('📝 Rendering text shape:', shape.id, 'with rotation:', shape.rotation);
        
        const rotation = shape.rotation || 0;
        
        // For rotated text, we need to use a larger container to prevent clipping
        const needsExpandedBounds = Math.abs(rotation) > 0.1; // Small threshold to avoid floating point issues
        
        if (needsExpandedBounds) {
          // Calculate the diagonal of the original bounds to ensure we have enough space
          const diagonal = Math.sqrt(shape.width * shape.width + shape.height * shape.height);
          const expandedSize = Math.max(shape.width, shape.height, diagonal);
          const offset = (expandedSize - Math.min(shape.width, shape.height)) / 2;
          
          return (
            <Group
              ref={shapeRef}
              rotation={rotation}
              x={0}
              y={0}
              onDblClick={handleDoubleClick}
              onDblTap={handleDoubleClick}
              onTransformEnd={handleTransformEnd}
            >
              <Rect
                x={-offset}
                y={-offset}
                width={expandedSize}
                height={expandedSize}
                fill="transparent"
                stroke={isSelected ? "#3b82f6" : isLockedByOther ? "#f59e0b" : "transparent"}
                strokeWidth={isSelected ? 3 : isLockedByOther ? 2 : 0}
              />
              <Text
                x={-offset + (expandedSize - shape.width) / 2}
                y={-offset + (expandedSize - shape.height) / 2}
                width={shape.width}
                height={shape.height}
                text={shape.text || "Text"}
                fontSize={18}
                fontFamily="Inter, system-ui, sans-serif"
                fill="#1F2937"
                align="center"
                verticalAlign="middle"
                fontStyle="500"
                wrap="none"
                ellipsis={false}
              />
            </Group>
          );
        } else {
          // For non-rotated text, use normal bounds
          return (
            <Group
              ref={shapeRef}
              rotation={rotation}
              x={0}
              y={0}
              onDblClick={handleDoubleClick}
              onDblTap={handleDoubleClick}
              onTransformEnd={handleTransformEnd}
            >
              <Rect
                x={0}
                y={0}
                width={shape.width}
                height={shape.height}
                fill="transparent"
                stroke={isSelected ? "#3b82f6" : isLockedByOther ? "#f59e0b" : "transparent"}
                strokeWidth={isSelected ? 3 : isLockedByOther ? 2 : 0}
              />
              <Text
                x={0}
                y={0}
                width={shape.width}
                height={shape.height}
                text={shape.text || "Text"}
                fontSize={18}
                fontFamily="Inter, system-ui, sans-serif"
                fill="#1F2937"
                align="center"
                verticalAlign="middle"
                fontStyle="500"
                wrap="none"
                ellipsis={false}
              />
            </Group>
          );
        }
      })()}

      {/* ─────────────── User Indicators ─────────────── */}
      {/* Show single label for user who is editing/selected the shape */}
      {(editingUser || selectedByUser) && (
        <Group>
          <Rect
            x={shape.width + 5}
            y={-25}
            width={120}
            height={18}
            fill={isLockedByOther ? "#f59e0b" : "#10b981"}
            cornerRadius={3}
          />
          <Text
            x={shape.width + 8}
            y={-22}
            text={`${isLockedByOther ? '🔒' : '👤'} ${editingUser || selectedByUser}`}
            fontSize={10}
            fill="white"
            fontStyle="bold"
          />
        </Group>
      )}

      {/* Delete Button - Show when selected */}
      {isSelected && (
        <Group
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
            x={shape.width + 12}
            y={shape.height - 8}
            radius={12}
            fill="#ef4444"
            shadowColor="rgba(0, 0, 0, 0.3)"
            shadowBlur={4}
            shadowOffset={{ x: 0, y: 2 }}
          />
          <Text
            x={shape.width + 12}
            y={shape.height - 8}
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
    </Group>

    {/* ─────────────── Transformer ─────────────── */}
    {isSelected && (
      <Transformer
        ref={transformerRef}
        boundBoxFunc={(oldBox, newBox) => {
          // Only enforce minimum size constraints
          newBox.width = Math.max(MIN_SIZE, newBox.width);
          newBox.height = Math.max(MIN_SIZE, newBox.height);

          return newBox;
        }}
        enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
        rotateEnabled={true}
        borderEnabled
        borderStroke="#3b82f6"
        borderStrokeWidth={2}
        anchorStroke="#3b82f6"
        anchorFill="#fff"
        anchorStrokeWidth={2}
        anchorSize={8}
        rotationAnchorOffset={20}
      />
    )}
  </>
);
};

export default Shape;
