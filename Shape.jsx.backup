import React, { useEffect, useRef, useState } from "react";
import { Rect, Circle, Text, Group, Transformer } from "react-konva";

const MIN_SIZE = 30;

const Shape = ({
  shape,
  isSelected,
  onSelect,
  onDragStart,
  onDragEnd,
  onResize,
  onDelete,
  onTextEdit,
  currentUser,
  onlineUsers = [],
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
    onSelect?.(shape.id);
  };

  const handleDoubleClick = (e) => {
    if (shape.type === 'text' && onTextEdit) {
      e.cancelBubble = true;
      onTextEdit(shape.id);
    }
  };

  const handleDragStart = (e) => {
    e.cancelBubble = true;
    setIsDragging(true);
    onDragStart?.(e);
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

    // Compute new size
    const newWidth = Math.max(MIN_SIZE, node.width() * scaleX);
    const newHeight = Math.max(MIN_SIZE, node.height() * scaleY);

    // Reset scale to 1 (avoid compounding)
    node.scaleX(1);
    node.scaleY(1);

    const newAttrs = { width: newWidth, height: newHeight };
    onResize?.(shape.id, newAttrs);
  };

  // 🔹 Determine user indicators
  const editingUser = onlineUsers.find((u) => u.userId === shape.lockedBy)?.displayName;
  const selectedByUser = onlineUsers.find((u) => u.userId === shape.selectedBy)?.displayName;

  return (
    <>
      <Group
        x={shape.x}
        y={shape.y}
        draggable
        onClick={handleClick}
        onTap={handleClick}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
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
            stroke={isSelected ? "#3b82f6" : "#E5E7EB"}
            strokeWidth={isSelected ? 3 : 1}
          />
        )}

        {shape.type === "circle" && (
          <Circle
            ref={shapeRef}
            x={shape.width / 2}
            y={shape.height / 2}
            radius={Math.min(shape.width, shape.height) / 2}
            fill={shape.fill}
            stroke={isSelected ? "#3b82f6" : "#E5E7EB"}
            strokeWidth={isSelected ? 3 : 1}
          />
        )}

        {shape.type === "text" && (
          <>
            <Rect
              ref={shapeRef}
              x={0}
              y={0}
              width={shape.width}
              height={shape.height}
              fill="transparent"
              stroke={isSelected ? "#3b82f6" : "transparent"}
              strokeWidth={isSelected ? 3 : 0}
              onDblClick={handleDoubleClick}
              onDblTap={handleDoubleClick}
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
              onDblClick={handleDoubleClick}
              onDblTap={handleDoubleClick}
            />
          </>
        )}

        {/* ─────────────── User Indicators ─────────────── */}
        {editingUser && (
          <Group>
            <Rect
              x={shape.width + 5}
              y={0}
              width={120}
              height={20}
              fill="#3b82f6"
              cornerRadius={3}
            />
            <Text
              x={shape.width + 8}
              y={3}
              text={`👤 ${editingUser}`}
              fontSize={11}
              fill="white"
              fontStyle="bold"
            />
          </Group>
        )}

        {selectedByUser && (
          <Group>
            <Rect
              x={shape.width + 5}
              y={-25}
              width={100}
              height={18}
              fill="#10b981"
              cornerRadius={3}
            />
            <Text
              x={shape.width + 8}
              y={-22}
              text={`👤 ${selectedByUser}`}
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
          borderEnabled
          borderStroke="#3b82f6"
          borderStrokeWidth={2}
          anchorStroke="#3b82f6"
          anchorFill="#fff"
          anchorStrokeWidth={2}
          anchorSize={8}
        />
      )}
    </>
  );
};

export default Shape;
