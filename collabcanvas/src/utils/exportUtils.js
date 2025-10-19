/**
 * Export utilities for Canvas
 * Handles PNG and SVG export functionality
 */

import { Stage, Layer, Rect, Circle, Text, Group } from 'react-konva';

/**
 * Export canvas as PNG
 * @param {Object} stageRef - Reference to Konva stage
 * @param {Object} options - Export options
 * @returns {Promise<Blob>} PNG blob
 */
export const exportAsPNG = async (stageRef, options = {}) => {
  if (!stageRef?.current) {
    throw new Error('Stage reference not available');
  }

  const stage = stageRef.current;
  const {
    quality = 1,
    mimeType = 'image/png',
    showGrid = false
  } = options;

  // Get stage dimensions
  const stageWidth = stage.width();
  const stageHeight = stage.height();

  // Create export configuration
  const exportConfig = {
    x: 0,
    y: 0,
    width: stageWidth,
    height: stageHeight,
    pixelRatio: quality,
    mimeType,
    backgroundColor: showGrid ? '#f8f9fa' : '#ffffff'
  };

  try {
    // Export the stage as data URL
    const dataURL = stage.toDataURL(exportConfig);
    
    // Convert data URL to blob
    const response = await fetch(dataURL);
    const blob = await response.blob();
    
    return blob;
  } catch (error) {
    console.error('Error exporting PNG:', error);
    throw new Error('Failed to export PNG');
  }
};

/**
 * Export canvas as JPEG
 * @param {Object} stageRef - Reference to Konva stage
 * @param {Object} options - Export options
 * @returns {Promise<Blob>} JPEG blob
 */
export const exportAsJPEG = async (stageRef, options = {}) => {
  if (!stageRef?.current) {
    throw new Error('Stage reference not available');
  }

  const stage = stageRef.current;
  const {
    quality = 0.9,
    showGrid = false
  } = options;

  // Get stage dimensions
  const stageWidth = stage.width();
  const stageHeight = stage.height();

  // Create export configuration
  const exportConfig = {
    x: 0,
    y: 0,
    width: stageWidth,
    height: stageHeight,
    pixelRatio: 1,
    mimeType: 'image/jpeg',
    backgroundColor: showGrid ? '#f8f9fa' : '#ffffff',
    quality: quality
  };

  try {
    // Export the stage as data URL
    const dataURL = stage.toDataURL(exportConfig);
    
    // Convert data URL to blob
    const response = await fetch(dataURL);
    const blob = await response.blob();
    
    return blob;
  } catch (error) {
    console.error('Error exporting JPEG:', error);
    throw new Error('Failed to export JPEG');
  }
};

/**
 * Download blob as file
 * @param {Blob} blob - Blob to download
 * @param {string} filename - Filename for download
 */
export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Download string as file
 * @param {string} content - String content to download
 * @param {string} filename - Filename for download
 * @param {string} mimeType - MIME type for the file
 */
export const downloadString = (content, filename, mimeType = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
};

/**
 * Export canvas with automatic filename
 * @param {Object} stageRef - Reference to Konva stage
 * @param {string} format - Export format ('png' or 'jpeg')
 * @param {Object} options - Export options
 */
export const exportCanvas = async (stageRef, format = 'png', options = {}) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `canvas-export-${timestamp}.${format}`;

  try {
    if (format === 'png') {
      const blob = await exportAsPNG(stageRef, options);
      downloadBlob(blob, filename);
    } else if (format === 'jpeg') {
      const blob = await exportAsJPEG(stageRef, options);
      downloadBlob(blob, filename);
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
};

/**
 * Get canvas bounds for export
 * @param {Array} shapes - Array of shapes
 * @returns {Object} Bounds object with x, y, width, height
 */
export const getCanvasBounds = (shapes) => {
  if (!shapes || shapes.length === 0) {
    return { x: 0, y: 0, width: 100, height: 100 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  shapes.forEach(shape => {
    const x = shape.x || 0;
    const y = shape.y || 0;
    const width = shape.width || 0;
    const height = shape.height || 0;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
};
