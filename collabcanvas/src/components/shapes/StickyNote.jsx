import React, { useRef, useEffect, useState } from 'react';

export default function StickyNote() {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 100 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(position.x + 5, position.y + 5, 200, 60);

    // Draw sticky note
    ctx.fillStyle = '#fef68a';
    ctx.fillRect(position.x, position.y, 200, 60);

    // Draw lines
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(position.x + 20, position.y + 50 + i * 40);
      ctx.lineTo(position.x + 280, position.y + 50 + i * 40);
      ctx.stroke();
    }

    // Draw text
    ctx.fillStyle = '#333';
    ctx.font = '18px Segoe UI, Arial';
    const lines = [
      'Remember to:',
      '',
      '• Buy groceries',
      '• Call mom',
      '• Finish project',
      '• Water plants'
    ];
    lines.forEach((line, i) => {
      ctx.fillText(line, position.x + 20, position.y + 50 + i * 30);
    });

    // Draw pin shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.arc(position.x + 152, position.y - 48, 20, 0, Math.PI * 2);
    ctx.fill();

    // Draw pin emoji
    ctx.font = '40px Arial';
    ctx.fillText('📌', position.x + 130, position.y - 30);
  }, [position]);

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x >= position.x && x <= position.x + 200 && y >= position.y && y <= position.y + 60) {
      setIsDragging(true);
      setDragStart({ x: x - position.x, y: y - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setPosition({ x: x - dragStart.x, y: y - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="sticky-note-container">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '8px',
          border: '1px solid #ddd'
        }}
      />
    </div>
  );
}



