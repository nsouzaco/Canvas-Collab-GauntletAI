import React, { useState, useRef, useEffect } from 'react';
import { Palette } from 'lucide-react';

const ColorPicker = ({ selectedColor, onColorChange, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(selectedColor || '#3b82f6');
  const [recentColors, setRecentColors] = useState([]);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const colorPickerRef = useRef(null);
  const colorWheelRef = useRef(null);

  // Color conversion utilities
  const hexToHsl = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const hslToHex = (h, s, l) => {
    h /= 360;
    s /= 100;
    l /= 100;
    
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    const toHex = (c) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Predefined color palette
  const colorPalette = [
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#10b981', // Green
    '#f59e0b', // Yellow
    '#8b5cf6', // Purple
    '#f97316', // Orange
    '#06b6d4', // Cyan
    '#84cc16', // Lime
    '#ec4899', // Pink
    '#6b7280', // Gray
    '#000000', // Black
    '#ffffff', // White
  ];

  // Sync HSL values when selectedColor changes
  useEffect(() => {
    if (selectedColor) {
      const hsl = hexToHsl(selectedColor);
      setHue(hsl.h);
      setSaturation(hsl.s);
      setLightness(hsl.l);
      setCustomColor(selectedColor);
    }
  }, [selectedColor]);

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleColorSelect = (color) => {
    setCustomColor(color);
    onColorChange(color);
    
    // Add to recent colors (avoid duplicates and limit to 6)
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== color);
      return [color, ...filtered].slice(0, 6);
    });
    
    setIsOpen(false);
  };

  const handleCustomColorChange = (e) => {
    const color = e.target.value;
    setCustomColor(color);
    onColorChange(color);
    
    // Add to recent colors (avoid duplicates and limit to 6)
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== color);
      return [color, ...filtered].slice(0, 6);
    });
  };

  const handleHslChange = (newHue, newSaturation, newLightness) => {
    const newH = newHue !== undefined ? newHue : hue;
    const newS = newSaturation !== undefined ? newSaturation : saturation;
    const newL = newLightness !== undefined ? newLightness : lightness;
    
    setHue(newH);
    setSaturation(newS);
    setLightness(newL);
    
    const newColor = hslToHex(newH, newS, newL);
    setCustomColor(newColor);
    onColorChange(newColor);
    
    // Add to recent colors (avoid duplicates and limit to 6)
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== newColor);
      return [newColor, ...filtered].slice(0, 6);
    });
  };

  const handleColorWheelClick = (e) => {
    if (!colorWheelRef.current) return;
    
    const rect = colorWheelRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;
    
    const distance = Math.sqrt(x * x + y * y);
    const radius = Math.min(centerX, centerY) - 10;
    
    if (distance <= radius) {
      const angle = Math.atan2(y, x) * (180 / Math.PI);
      const newHue = (angle + 360) % 360;
      const newSaturation = Math.min(100, (distance / radius) * 100);
      
      handleHslChange(newHue, newSaturation, lightness);
    }
  };

  return (
    <div className="relative" ref={colorPickerRef}>
      {/* Color Picker Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors duration-200 group border-2 ${
          disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : isOpen 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200'
        }`}
        title={disabled ? "Select a shape to change its color" : "Change color"}
      >
        <div 
          className="w-6 h-6 rounded border border-gray-300"
          style={{ backgroundColor: selectedColor || '#3b82f6' }}
        />
        <Palette className="w-3 h-3 text-gray-500 absolute -top-1 -right-1" />
      </button>

      {/* Color Picker Dropdown */}
      {isOpen && (
        <div className="absolute top-12 left-0 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-[280px]">
          {/* Color Wheel */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Color Wheel</h4>
            <div className="flex items-center gap-3">
              <div 
                ref={colorWheelRef}
                onClick={handleColorWheelClick}
                className="relative w-32 h-32 rounded-full cursor-crosshair border-2 border-gray-300"
                style={{
                  background: `conic-gradient(
                    hsl(0, 100%, 50%) 0deg,
                    hsl(60, 100%, 50%) 60deg,
                    hsl(120, 100%, 50%) 120deg,
                    hsl(180, 100%, 50%) 180deg,
                    hsl(240, 100%, 50%) 240deg,
                    hsl(300, 100%, 50%) 300deg,
                    hsl(360, 100%, 50%) 360deg
                  )`
                }}
              >
                {/* Saturation/Lightness overlay */}
                <div 
                  className="absolute inset-2 rounded-full"
                  style={{
                    background: `radial-gradient(circle, 
                      hsla(${hue}, ${saturation}%, ${lightness}%, 0.3) 0%, 
                      transparent 70%
                    )`
                  }}
                />
                {/* Current selection indicator */}
                <div
                  className="absolute w-3 h-3 border-2 border-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${50 + (saturation / 100) * 40 * Math.cos((hue - 90) * Math.PI / 180)}%`,
                    top: `${50 + (saturation / 100) * 40 * Math.sin((hue - 90) * Math.PI / 180)}%`,
                    backgroundColor: hslToHex(hue, saturation, lightness)
                  }}
                />
              </div>
              
              {/* HSL Controls */}
              <div className="flex-1 space-y-2">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Hue: {hue}°</label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={hue}
                    onChange={(e) => handleHslChange(parseInt(e.target.value), undefined, undefined)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, 
                        hsl(0, 100%, 50%), 
                        hsl(60, 100%, 50%), 
                        hsl(120, 100%, 50%), 
                        hsl(180, 100%, 50%), 
                        hsl(240, 100%, 50%), 
                        hsl(300, 100%, 50%), 
                        hsl(360, 100%, 50%)
                      )`
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Saturation: {saturation}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={saturation}
                    onChange={(e) => handleHslChange(undefined, parseInt(e.target.value), undefined)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, 
                        hsl(${hue}, 0%, ${lightness}%), 
                        hsl(${hue}, 100%, ${lightness}%)
                      )`
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Lightness: {lightness}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={lightness}
                    onChange={(e) => handleHslChange(undefined, undefined, parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, 
                        hsl(${hue}, ${saturation}%, 0%), 
                        hsl(${hue}, ${saturation}%, 50%), 
                        hsl(${hue}, ${saturation}%, 100%)
                      )`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Predefined Colors */}
          <div className="mb-3">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Quick Colors</h4>
            <div className="grid grid-cols-6 gap-2">
              {colorPalette.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  className={`w-6 h-6 rounded border-2 transition-all duration-200 hover:scale-110 ${
                    selectedColor === color 
                      ? 'border-gray-800 scale-110' 
                      : 'border-gray-300 hover:border-gray-500'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Recently Used Colors */}
          {recentColors.length > 0 && (
            <div className="border-t border-gray-200 pt-3 mb-3">
              <h4 className="text-xs font-medium text-gray-700 mb-2">Recently Used</h4>
              <div className="grid grid-cols-6 gap-2">
                {recentColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className={`w-6 h-6 rounded border-2 transition-all duration-200 hover:scale-110 ${
                      selectedColor === color 
                        ? 'border-gray-800 scale-110' 
                        : 'border-gray-300 hover:border-gray-500'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Custom Color Input */}
          <div className="border-t border-gray-200 pt-3">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Custom Color</h4>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                title="Choose custom color"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => {
                  const color = e.target.value;
                  setCustomColor(color);
                  if (color.match(/^#[0-9A-Fa-f]{6}$/)) {
                    onColorChange(color);
                  }
                }}
                placeholder="#3b82f6"
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Enter hex color code"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
