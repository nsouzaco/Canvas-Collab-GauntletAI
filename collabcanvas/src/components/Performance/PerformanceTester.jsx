import React, { useState, useRef } from 'react';
import { createBulkObjects, createPatternObjects, performanceTestUtils } from '../../utils/bulkObjectCreator';
import { useCanvas } from '../../contexts/CanvasContext';

const PerformanceTester = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [objectCount, setObjectCount] = useState(500);
  const [selectedPattern, setSelectedPattern] = useState('random');
  const fpsRef = useRef(null);
  const { addShape, addShapeWithoutSelection, shapes, deleteShape, clearAllSelections, selectShape } = useCanvas();

  const handleBulkCreate = async () => {
    setIsLoading(true);
    setTestResults(null);
    
    const startTime = performance.now();
    
    try {
      // Start FPS monitoring
      if (fpsRef.current) {
        clearInterval(fpsRef.current);
      }
      
      const fpsMonitor = performanceTestUtils.measureFPS();
      fpsRef.current = setInterval(fpsMonitor, 1000);
      
      // Create objects based on pattern
      let result;
      if (selectedPattern === 'random') {
        result = await createBulkObjects(objectCount, addShapeWithoutSelection);
      } else {
        result = await createPatternObjects(selectedPattern, addShapeWithoutSelection);
      }
      
      // Only select the last created object for better performance
      if (result.success && result.lastShapeId) {
        await selectShape(result.lastShapeId);
      }
      
      const endTime = performance.now();
      const totalDuration = endTime - startTime;
      
      // Stop FPS monitoring
      if (fpsRef.current) {
        clearInterval(fpsRef.current);
        fpsRef.current = null;
      }
      
      // Monitor memory usage
      performanceTestUtils.monitorMemory();
      
      setTestResults({
        success: result.success,
        objectCount: result.count,
        duration: totalDuration,
        averageTime: result.averageTime,
        error: result.error
      });
      
    } catch (error) {
      console.error('Performance test failed:', error);
      setTestResults({
        success: false,
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCanvas = async () => {
    if (!shapes || shapes.length === 0) {
      console.log('Canvas is already empty');
      return;
    }

    console.log(`🧹 Clearing ${shapes.length} objects from canvas...`);
    
    try {
      // Clear all selections first
      await clearAllSelections();
      
      // Delete all shapes
      const deletePromises = shapes.map(shape => deleteShape(shape.id));
      await Promise.all(deletePromises);
      
      console.log(`✅ Cleared ${shapes.length} objects from canvas`);
      
      // Clear test results
      setTestResults(null);
      
    } catch (error) {
      console.error('❌ Error clearing canvas:', error);
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors z-50"
        title="Performance Tester"
      >
        🚀 Performance Test
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80 z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Performance Tester</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        {/* Object Count Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Objects
          </label>
          <input
            type="number"
            value={objectCount}
            onChange={(e) => setObjectCount(parseInt(e.target.value) || 100)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            min="1"
            max="1000"
          />
        </div>

        {/* Pattern Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pattern
          </label>
          <select
            value={selectedPattern}
            onChange={(e) => setSelectedPattern(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="random">Random Distribution</option>
            <option value="grid">Grid Pattern</option>
            <option value="spiral">Spiral Pattern</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handleBulkCreate}
            disabled={isLoading}
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
          >
            {isLoading ? 'Creating...' : 'Create Objects'}
          </button>
          
          <button
            onClick={handleClearCanvas}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Clear Canvas
          </button>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className={`p-3 rounded-md ${
            testResults.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <h4 className="font-medium text-sm mb-2">
              {testResults.success ? '✅ Test Results' : '❌ Test Failed'}
            </h4>
            
            {testResults.success ? (
              <div className="text-sm space-y-1">
                <div>Objects Created: {testResults.objectCount}</div>
                <div>Total Time: {testResults.duration?.toFixed(2)}ms</div>
                <div>Average per Object: {testResults.averageTime?.toFixed(2)}ms</div>
                <div className="text-xs text-gray-600">
                  Performance: {testResults.objectCount / (testResults.duration / 1000)} objects/sec
                </div>
              </div>
            ) : (
              <div className="text-sm text-red-600">
                Error: {testResults.error}
              </div>
            )}
          </div>
        )}

        {/* Performance Tips */}
        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-md">
          <h5 className="font-medium mb-1">Performance Tips:</h5>
          <ul className="space-y-1">
            <li>• Start with 100 objects to test</li>
            <li>• Use Chrome DevTools to monitor FPS</li>
            <li>• Check Network tab for Firebase limits</li>
            <li>• Monitor Memory usage in DevTools</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PerformanceTester;
