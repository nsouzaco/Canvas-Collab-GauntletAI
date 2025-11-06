import React, { useEffect, useRef, useState } from "react";
import { Rect, Circle, Text, Group, Transformer } from "react-konva";
import List from '../shapes/List';

const MIN_SIZE = 30;

// Helper functions for text styling
const getTextFontSize = (textType, baseFontSize = 14) => {
  const sizeMap = {
    'title': Math.max(baseFontSize * 2.5, 32),
    'subtitle': Math.max(baseFontSize * 1.5, 20),
    'heading1': Math.max(baseFontSize * 1.8, 24),
    'heading2': Math.max(baseFontSize * 1.4, 18),
    'heading3': Math.max(baseFontSize * 1.2, 16),
    'normal': baseFontSize
  };
  return sizeMap[textType] || baseFontSize;
};

// Helper function to calculate text dimensions with canvas boundary constraints
const calculateTextDimensions = (text, textType, baseFontSize, fontFamily, shapeX = 0, canvasWidth = 1200) => {
  const fontSize = getTextFontSize(textType, baseFontSize);
  const fontStyle = getTextFontStyle(textType);
  
  // Create a temporary canvas to measure text
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  // Set font with fallback
  const fontFamilyWithFallback = fontFamily ? `${fontFamily}, Inter, system-ui, sans-serif` : 'Inter, system-ui, sans-serif';
  context.font = `${fontStyle} ${fontSize}px ${fontFamilyWithFallback}`;
  
  const lines = text.split('\n');
  let maxWidth = 0;
  let totalHeight = 0;
  
  // Handle empty text
  if (!text || text.trim() === '') {
    return {
      width: 150,
      height: Math.max(fontSize * 1.5, 40)
    };
  }
  
  lines.forEach(line => {
    // Handle empty lines
    const lineText = line.trim() === '' ? ' ' : line;
    const metrics = context.measureText(lineText);
    maxWidth = Math.max(maxWidth, metrics.width);
    totalHeight += fontSize * 1.3; // Slightly increased line height for better spacing
  });
  
  // Add generous padding based on font size
  const padding = Math.max(20, fontSize * 0.5);
  const minWidth = Math.max(150, fontSize * 8); // Minimum width based on font size
  const minHeight = Math.max(40, fontSize * 1.5); // Minimum height based on font size
  
  // Calculate desired dimensions
  const desiredWidth = Math.max(maxWidth + padding, minWidth);
  const desiredHeight = Math.max(totalHeight + padding, minHeight);
  
  // Calculate maximum allowed width based on canvas boundaries
  const maxAllowedWidth = canvasWidth - shapeX - 50; // Leave 50px margin from right edge
  
  // If text would overflow, enable word wrapping
  let finalWidth = desiredWidth;
  let finalHeight = desiredHeight;
  
  if (desiredWidth > maxAllowedWidth) {
    // Calculate how many lines we need with word wrapping
    const words = text.split(' ');
    let currentLine = '';
    let wrappedLines = [];
    let maxLineWidth = 0;
    
    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = context.measureText(testLine).width;
      
      if (testWidth <= maxAllowedWidth - padding) {
        currentLine = testLine;
        maxLineWidth = Math.max(maxLineWidth, testWidth);
      } else {
        if (currentLine) {
          wrappedLines.push(currentLine);
          currentLine = word;
        } else {
          // Single word is too long, force it
          wrappedLines.push(word);
        }
      }
    });
    
    if (currentLine) {
      wrappedLines.push(currentLine);
    }
    
    // Recalculate dimensions with wrapped text
    finalWidth = Math.min(maxAllowedWidth, Math.max(maxLineWidth + padding, minWidth));
    finalHeight = Math.max(wrappedLines.length * fontSize * 1.3 + padding, minHeight);
  }
  
  return {
    width: finalWidth,
    height: finalHeight
  };
};

const getTextColor = (textType) => {
  const colorMap = {
    'title': '#1F2937',
    'subtitle': '#6B7280',
    'heading1': '#1F2937',
    'heading2': '#1F2937',
    'heading3': '#1F2937',
    'normal': '#1F2937'
  };
  return colorMap[textType] || '#1F2937';
};

const getTextFontStyle = (textType) => {
  const styleMap = {
    'title': 'bold',
    'subtitle': 'normal',
    'heading1': 'bold',
    'heading2': 'bold',
    'heading3': 'bold',
    'normal': 'normal'
  };
  return styleMap[textType] || 'normal';
};

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
  const lastResizeRef = useRef({ width: 0, height: 0, timestamp: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

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

  // 🔹 Auto-resize text area ONLY when user is actively editing (disabled for passive viewing)
  useEffect(() => {
    // Only auto-resize if the user is actively editing this text (selected and locked by current user)
    const isActivelyEditing = shape.type === 'text' && 
                             shape.isSelected && 
                             shape.lockedBy === currentUser?.uid;
    
    if (isActivelyEditing && onResize && !isResizing && !isDragging && !isTransforming) {
      const resizeTimeout = setTimeout(() => {
        const newDimensions = calculateTextDimensions(
          shape.text || 'Text',
          shape.textType || 'normal',
          shape.fontSize || 14,
          shape.fontFamily || 'Inter'
        );
        
        // Only resize if the calculated dimensions are significantly different
        const widthDiff = Math.abs(newDimensions.width - shape.width);
        const heightDiff = Math.abs(newDimensions.height - shape.height);
        
        // More sensitive resizing for text type changes (which can dramatically change size)
        const isTextTypeChange = shape.textType && shape.textType !== 'normal';
        const threshold = isTextTypeChange ? 15 : 25; // Increased thresholds to prevent unwanted resizing
        
        // Additional check: only resize if the shape is not currently being modified by another user
        const isBeingModifiedByOther = shape.lockedBy && shape.lockedBy !== currentUser?.uid;
        
        // Prevent rapid successive resizes by checking if we just resized this shape recently
        const now = Date.now();
        const timeSinceLastResize = now - lastResizeRef.current.timestamp;
        const isRecentResize = timeSinceLastResize < 3000; // 3 second cooldown
        const isSameDimensions = lastResizeRef.current.width === newDimensions.width && 
                                lastResizeRef.current.height === newDimensions.height;
        
        if ((widthDiff > threshold || heightDiff > threshold) && 
            !isBeingModifiedByOther && 
            !isRecentResize && 
            !isSameDimensions) {
          // Auto-resizing text area for better content fit
          
          // Update the last resize tracking
          lastResizeRef.current = {
            width: newDimensions.width,
            height: newDimensions.height,
            timestamp: now
          };
          
          setIsResizing(true);
          onResize(shape.id, newDimensions);
          
          // Reset resizing state after a short delay
          setTimeout(() => {
            setIsResizing(false);
          }, 300);
        }
      }, 500); // Debounce resize by 500ms to prevent rapid auto-resizing
      
      return () => clearTimeout(resizeTimeout);
    }
  }, [shape.text, shape.textType, shape.fontSize, shape.fontFamily, shape.isSelected, onResize, isResizing, currentUser?.uid, shape.lockedBy]);

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

  const handleTransformMove = (e) => {
    e.cancelBubble = true;
    // Only send real-time updates if we're actively transforming
    if (!isTransforming) {
      return;
    }
    
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = node.rotation();

    // Compute new size
    const newWidth = Math.max(MIN_SIZE, node.width() * scaleX);
    const newHeight = Math.max(MIN_SIZE, node.height() * scaleY);

    // Don't send updates to Firebase during transformation - only update on transform end
    // This prevents race conditions and excessive Firebase calls
  };

  const handleTransformEnd = (e) => {
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = node.rotation();

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
    
    // Save shape updates to Firebase - ensure this is called
    if (onResize) {
      onResize(shape.id, newAttrs);
    } else {
      console.error(`❌ onResize not available for shape ${shape.id}`);
    }
    
    // Delay resetting transformation state to prevent jumping
    setTimeout(() => {
      setIsTransforming(false);
    }, 200);
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
        onTransformMove={handleTransformMove}
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
            stroke={isLockedByAnotherUser ? "#ef4444" : isSelected ? "#3b82f6" : isMultiSelected ? "#8B5CF6" : isBeingMovedByOther ? "#f59e0b" : "#E5E7EB"}
            strokeWidth={isLockedByAnotherUser ? 3 : isSelected ? 3 : isMultiSelected ? 3 : isBeingMovedByOther ? 2 : 1}
            dashEnabled={isLockedByAnotherUser ? true : false}
            dash={isLockedByAnotherUser ? [8, 4] : undefined}
            opacity={isBeingMovedByOther ? 0.8 : 1}
            onTransformMove={handleTransformMove}
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
            stroke={isLockedByAnotherUser ? "#ef4444" : isSelected ? "#3b82f6" : isMultiSelected ? "#8B5CF6" : isBeingMovedByOther ? "#f59e0b" : "#E5E7EB"}
            strokeWidth={isLockedByAnotherUser ? 3 : isSelected ? 3 : isMultiSelected ? 3 : isBeingMovedByOther ? 2 : 1}
            dashEnabled={isLockedByAnotherUser ? true : false}
            dash={isLockedByAnotherUser ? [8, 4] : undefined}
            opacity={isBeingMovedByOther ? 0.8 : 1}
            onTransformMove={handleTransformMove}
            onTransformEnd={handleTransformEnd}
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
            stroke={isLockedByAnotherUser ? "#ef4444" : isSelected ? "#3b82f6" : isBeingMovedByOther ? "#f59e0b" : isResizing ? "#10b981" : "transparent"}
            strokeWidth={isLockedByAnotherUser ? 3 : isSelected ? 3 : isBeingMovedByOther ? 2 : isResizing ? 2 : 0}
            dashEnabled={isLockedByAnotherUser ? true : false}
            dash={isLockedByAnotherUser ? [8, 4] : undefined}
            opacity={isBeingMovedByOther ? 0.8 : isResizing ? 0.9 : 1}
            onDblClick={handleDoubleClick}
            onDblTap={handleDoubleClick}
            onTransformStart={handleTransformStart}
            onTransformMove={handleTransformMove}
            onTransformEnd={handleTransformEnd}
          />
        )}




        {shape.type === "text" && (
          <Text
            x={0}
            y={0}
            width={shape.width}
            height={shape.height}
            text={shape.text || "Text"}
            fontSize={getTextFontSize(shape.textType, shape.fontSize)}
            fontFamily={shape.fontFamily || "Inter, system-ui, sans-serif"}
            fill={getTextColor(shape.textType)}
            align="center"
            verticalAlign="middle"
            fontStyle={getTextFontStyle(shape.textType)}
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
            fill={shape.fill || "#FEF68A"}
            stroke={isLockedByAnotherUser ? "#ef4444" : isSelected ? "#3b82f6" : isMultiSelected ? "#8B5CF6" : isBeingMovedByOther ? "#f59e0b" : "#E5E7EB"}
            strokeWidth={isLockedByAnotherUser ? 3 : isSelected ? 3 : isMultiSelected ? 3 : isBeingMovedByOther ? 2 : 1}
            dashEnabled={isLockedByAnotherUser ? true : false}
            dash={isLockedByAnotherUser ? [8, 4] : undefined}
            opacity={isBeingMovedByOther ? 0.8 : 1}
            cornerRadius={8}
            shadowColor="rgba(0,0,0,0.1)"
            shadowBlur={4}
            shadowOffset={{ x: 0, y: 2 }}
            onDblClick={handleDoubleClick}
            onDblTap={handleDoubleClick}
            onTransformMove={handleTransformMove}
            onTransformEnd={handleTransformEnd}
          />
        )}

        {/* Sticky Note Text Content */}
        {shape.type === "stickyNote" && (
          <Text
            x={15}
            y={15}
            width={shape.width - 30}
            height={shape.height - 30}
            text={shape.text || "Note"}
            fontSize={14}
            fontFamily="Segoe UI, Arial, sans-serif"
            fill="#333"
            align="left"
            verticalAlign="top"
            wrap="word"
            ellipsis={true}
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
            fill={shape.fill || "#FFFFFF"}
            stroke={isLockedByAnotherUser ? "#ef4444" : isSelected ? "#3b82f6" : isMultiSelected ? "#8B5CF6" : isBeingMovedByOther ? "#f59e0b" : "#E5E7EB"}
            strokeWidth={isLockedByAnotherUser ? 3 : isSelected ? 3 : isMultiSelected ? 3 : isBeingMovedByOther ? 2 : 1}
            dashEnabled={isLockedByAnotherUser ? true : false}
            dash={isLockedByAnotherUser ? [8, 4] : undefined}
            opacity={isBeingMovedByOther ? 0.8 : 1}
            cornerRadius={8}
            shadowColor="rgba(0,0,0,0.1)"
            shadowBlur={10}
            shadowOffset={{ x: 2, y: 2 }}
            onDblClick={handleDoubleClick}
            onDblTap={handleDoubleClick}
            onTransformMove={handleTransformMove}
            onTransformEnd={handleTransformEnd}
          />
        )}

        {/* Card Header Background */}
        {shape.type === "card" && (
          <Rect
            x={0}
            y={0}
            width={shape.width}
            height={40}
            fill="#F8FAFC"
            cornerRadius={[8, 8, 0, 0]}
            listening={false}
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

        {/* Card Content - Text (always show if content exists, but adjust height if items present) */}
        {shape.type === "card" && shape.content && (
          <Text
            x={15}
            y={50}
            width={shape.width - 30}
            height={shape.items && shape.items.length > 0 ? 40 : shape.height - 70}
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

        {/* Card List Items */}
        {shape.type === "card" && shape.items && shape.items.length > 0 && (
          <Group>
            {shape.items.map((item, index) => {
              // Start list items below content text (y=50 + 40px for content + 10px spacing)
              const itemY = 50 + (shape.content ? 50 : 0) + index * 28;
              const isEven = index % 2 === 0;
              
              return (
                <Group key={index}>
                  {/* Item Background (alternating colors) */}
                  <Rect
                    x={15}
                    y={itemY - 2}
                    width={shape.width - 30}
                    height={24}
                    fill={isEven ? "rgba(248, 250, 252, 0.5)" : "transparent"}
                    cornerRadius={4}
                    listening={false}
                  />
                  
                  {/* Checkbox Circle */}
                  <Circle
                    x={25}
                    y={itemY + 8}
                    radius={6}
                    fill="white"
                    stroke="#D1D5DB"
                    strokeWidth={1}
                    listening={false}
                  />
                  
                  {/* Item Text */}
                  <Text
                    x={40}
                    y={itemY}
                    width={shape.width - 55}
                    height={20}
                    text={item}
                    fontSize={14}
                    fontFamily="Inter, system-ui, sans-serif"
                    fill="#374151"
                    align="left"
                    verticalAlign="top"
                    wrap="word"
                    ellipsis={true}
                    onDblClick={handleDoubleClick}
                    onDblTap={handleDoubleClick}
                  />
                  
                  {/* Item Number */}
                  <Text
                    x={15}
                    y={itemY}
                    width={20}
                    height={20}
                    text={`${index + 1}.`}
                    fontSize={12}
                    fontFamily="Inter, system-ui, sans-serif"
                    fill="#9CA3AF"
                    align="center"
                    verticalAlign="top"
                    listening={false}
                  />
                </Group>
              );
            })}
            
            {/* Card List Footer with Item Count */}
            <Text
              x={15}
              y={shape.height - 20}
              width={shape.width - 30}
              height={15}
              text={`${shape.items.length} item${shape.items.length !== 1 ? 's' : ''}`}
              fontSize={12}
              fontFamily="Inter, system-ui, sans-serif"
              fill="#9CA3AF"
              align="left"
              verticalAlign="top"
              listening={false}
            />
          </Group>
        )}

        {/* List Shape */}
        {shape.type === "list" && (
          <List
            shape={shape}
            isSelected={isSelected}
            isMultiSelected={isMultiSelected}
            isBeingMovedByOther={isBeingMovedByOther}
            isLockedByAnotherUser={isLockedByAnotherUser}
            onDoubleClick={handleDoubleClick}
            shapeRef={shapeRef}
            onTransformMove={handleTransformMove}
          />
        )}

        {/* Multi-Selection Indicator */}
        {isMultiSelected && !isDragging && (
          <Group
            x={-25}
            y={-25}
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
            x={shape.width + 20}
            y={shape.height - 1}
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
