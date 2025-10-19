import React, { useState, useRef, useEffect } from 'react';
import { Download, Image, FileImage, Settings, ChevronDown } from 'lucide-react';
import { useCanvas } from '../../contexts/CanvasContext';
import { exportCanvas, exportAsPNG, exportAsJPEG } from '../../utils/exportUtils';

const ExportControls = () => {
  const { stageRef, shapes, toggleGridVisibilityForExport } = useCanvas();
  const [isExporting, setIsExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const dropdownRef = useRef(null);
  const [exportOptions, setExportOptions] = useState({
    showGrid: false,
    format: 'png'
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleExport = async (format) => {
    if (!stageRef?.current) {
      alert('Canvas not ready for export');
      return;
    }

    setIsExporting(true);
    setShowDropdown(false); // Close dropdown after starting export
    
    // Store original grid visibility state
    const originalGridVisibility = true; // Grid is always visible by default
    
    try {
      // Hide grid for export if showGrid is false
      if (!exportOptions.showGrid) {
        toggleGridVisibilityForExport(false);
        // Wait a bit for the grid to disappear from the stage
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      await exportCanvas(stageRef, format, exportOptions);
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error.message}`);
    } finally {
      // Always restore grid visibility
      toggleGridVisibilityForExport(originalGridVisibility);
      setIsExporting(false);
    }
  };

  const handleOptionChange = (key, value) => {
    setExportOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Export Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={shapes.length === 0}
        className="bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 p-3 rounded-lg shadow-md border border-gray-200 transition-colors duration-200 flex items-center gap-2"
        title={shapes.length === 0 ? "No shapes to export" : "Export Canvas"}
      >
        <Download className="w-5 h-5" />
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900 text-sm">Export Options</h3>
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Advanced Options"
              >
                <Settings className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Export Options */}
          {showOptions && (
            <div className="p-3 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Show Grid
                </label>
                <input
                  type="checkbox"
                  checked={exportOptions.showGrid}
                  onChange={(e) => handleOptionChange('showGrid', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Export Options */}
          <div className="p-2">
            <button
              onClick={() => handleExport('png')}
              disabled={isExporting}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Image className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900 text-sm">Export as PNG</div>
                <div className="text-xs text-gray-500">Raster image format</div>
              </div>
            </button>

            <button
              onClick={() => handleExport('jpeg')}
              disabled={isExporting}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileImage className="w-5 h-5 text-orange-600" />
              <div>
                <div className="font-medium text-gray-900 text-sm">Export as JPEG</div>
                <div className="text-xs text-gray-500">Compressed image format</div>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="px-3 py-2 border-t border-gray-100 bg-gray-50 rounded-b-lg">
            <div className="text-xs text-gray-500 text-center">
              {isExporting ? 'Exporting...' : `${shapes.length} shape${shapes.length !== 1 ? 's' : ''} on canvas`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportControls;
