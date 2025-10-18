import React, { useState, useEffect } from 'react';
import { usePerformanceMonitor } from '../../utils/performanceMonitor';

/**
 * Performance Dashboard Component
 * 
 * Displays real-time performance metrics for the collaboration system.
 * This helps monitor the effectiveness of optimizations.
 */
const PerformanceDashboard = ({ isVisible = false }) => {
  const { getSummary, reset } = usePerformanceMonitor();
  const [metrics, setMetrics] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      const summary = getSummary();
      setMetrics(summary);
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [isVisible, getSummary]);

  if (!isVisible || !metrics) return null;

  const getPerformanceColor = (value, thresholds) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceStatus = () => {
    if (metrics.isPerformingWell) {
      return { text: 'Excellent', color: 'text-green-600' };
    }
    if (metrics.averageLatency < 100 && metrics.currentFrameRate > 20) {
      return { text: 'Good', color: 'text-yellow-600' };
    }
    return { text: 'Needs Optimization', color: 'text-red-600' };
  };

  const status = getPerformanceStatus();

  return (
    <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[300px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Performance Monitor</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          <button
            onClick={reset}
            className="text-xs text-gray-500 hover:text-gray-700"
            title="Reset metrics"
          >
            🔄
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {/* Overall Status */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Status:</span>
          <span className={`text-xs font-medium ${status.color}`}>
            {status.text}
          </span>
        </div>

        {/* Key Metrics */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Frame Rate:</span>
          <span className={`text-xs font-medium ${getPerformanceColor(metrics.currentFrameRate, { good: 50, warning: 30 })}`}>
            {metrics.currentFrameRate} FPS
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Avg Latency:</span>
          <span className={`text-xs font-medium ${getPerformanceColor(metrics.averageLatency, { good: 30, warning: 50 })}`}>
            {metrics.averageLatency.toFixed(1)}ms
          </span>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Position Updates:</span>
              <span className="text-xs font-medium text-gray-800">
                {metrics.totalPositionUpdates}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Render Cycles:</span>
              <span className="text-xs font-medium text-gray-800">
                {metrics.totalRenderCycles}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Last Update:</span>
              <span className="text-xs font-medium text-gray-800">
                {metrics.timeSinceLastUpdate}ms ago
              </span>
            </div>

            {/* Performance Tips */}
            <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
              <div className="font-medium text-gray-700 mb-1">Tips:</div>
              <ul className="text-gray-600 space-y-1">
                {metrics.averageLatency > 50 && (
                  <li>• High latency detected - check network connection</li>
                )}
                {metrics.currentFrameRate < 30 && (
                  <li>• Low frame rate - reduce shape complexity</li>
                )}
                {metrics.totalPositionUpdates > 1000 && (
                  <li>• Many position updates - consider throttling</li>
                )}
                {metrics.isPerformingWell && (
                  <li>• Performance is optimal! 🎉</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceDashboard;
