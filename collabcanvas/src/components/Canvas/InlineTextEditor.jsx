import React, { useEffect, useRef } from 'react';

const InlineTextEditor = ({ x, y, width, height, value, onChange, onSave, onCancel, scale = 1, fontSize = 14 }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={onSave}
      style={{
        position: 'absolute',
        left: `${x * scale}px`,
        top: `${y * scale}px`,
        width: `${width * scale}px`,
        height: `${height * scale}px`,
        fontSize: `${fontSize * scale}px`,
        fontFamily: 'Inter, system-ui, sans-serif',
        textAlign: 'center',
        border: '2px solid #3b82f6',
        borderRadius: '4px',
        outline: 'none',
        resize: 'none',
        padding: '8px',
        backgroundColor: 'white',
        color: '#1F2937',
        zIndex: 1000,
      }}
    />
  );
};

export default InlineTextEditor;

