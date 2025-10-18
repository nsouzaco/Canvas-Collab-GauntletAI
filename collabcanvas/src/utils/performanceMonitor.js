/**
 * Performance Monitoring Utilities for Real-time Collaboration
 * 
 * This module provides utilities to monitor and optimize performance
 * of real-time positioning and collaboration features.
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      positionUpdates: 0,
      renderCycles: 0,
      averageLatency: 0,
      frameRate: 0,
      lastUpdateTime: 0
    };
    
    this.frameCount = 0;
    this.lastFrameTime = 0;
    this.latencyHistory = [];
    this.maxHistorySize = 100;
  }

  /**
   * Record a position update
   * @param {number} latency - Update latency in milliseconds
   */
  recordPositionUpdate(latency = 0) {
    this.metrics.positionUpdates++;
    this.metrics.lastUpdateTime = Date.now();
    
    if (latency > 0) {
      this.latencyHistory.push(latency);
      if (this.latencyHistory.length > this.maxHistorySize) {
        this.latencyHistory.shift();
      }
      
      // Calculate average latency
      this.metrics.averageLatency = this.latencyHistory.reduce((a, b) => a + b, 0) / this.latencyHistory.length;
    }
  }

  /**
   * Record a render cycle
   */
  recordRenderCycle() {
    this.metrics.renderCycles++;
    
    const currentTime = Date.now();
    if (this.lastFrameTime > 0) {
      const frameTime = currentTime - this.lastFrameTime;
      this.frameCount++;
      
      // Calculate FPS every 60 frames
      if (this.frameCount >= 60) {
        this.metrics.frameRate = Math.round(1000 / (frameTime / this.frameCount));
        this.frameCount = 0;
      }
    }
    
    this.lastFrameTime = currentTime;
  }

  /**
   * Get current performance metrics
   * @returns {Object} Performance metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      latencyHistory: [...this.latencyHistory]
    };
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.metrics = {
      positionUpdates: 0,
      renderCycles: 0,
      averageLatency: 0,
      frameRate: 0,
      lastUpdateTime: 0
    };
    
    this.frameCount = 0;
    this.lastFrameTime = 0;
    this.latencyHistory = [];
  }

  /**
   * Get performance summary
   * @returns {Object} Performance summary
   */
  getSummary() {
    const metrics = this.getMetrics();
    const now = Date.now();
    const timeSinceLastUpdate = now - metrics.lastUpdateTime;
    
    return {
      totalPositionUpdates: metrics.positionUpdates,
      totalRenderCycles: metrics.renderCycles,
      averageLatency: Math.round(metrics.averageLatency * 100) / 100,
      currentFrameRate: metrics.frameRate,
      timeSinceLastUpdate,
      isPerformingWell: metrics.averageLatency < 50 && metrics.frameRate > 30
    };
  }
}

// Create global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Hook to monitor performance in React components
 * @returns {Object} Performance monitoring utilities
 */
export const usePerformanceMonitor = () => {
  const recordPositionUpdate = (latency) => {
    performanceMonitor.recordPositionUpdate(latency);
  };

  const recordRenderCycle = () => {
    performanceMonitor.recordRenderCycle();
  };

  const getMetrics = () => {
    return performanceMonitor.getMetrics();
  };

  const getSummary = () => {
    return performanceMonitor.getSummary();
  };

  const reset = () => {
    performanceMonitor.reset();
  };

  return {
    recordPositionUpdate,
    recordRenderCycle,
    getMetrics,
    getSummary,
    reset
  };
};

/**
 * Performance optimization utilities
 */
export const performanceUtils = {
  /**
   * Check if position update should be throttled
   * @param {number} lastUpdateTime - Last update timestamp
   * @param {number} throttleDelay - Throttle delay in milliseconds
   * @returns {boolean} True if update should be throttled
   */
  shouldThrottle: (lastUpdateTime, throttleDelay = 16) => {
    return Date.now() - lastUpdateTime < throttleDelay;
  },

  /**
   * Calculate optimal throttle delay based on performance
   * @param {number} frameRate - Current frame rate
   * @param {number} latency - Current latency
   * @returns {number} Optimal throttle delay
   */
  getOptimalThrottleDelay: (frameRate, latency) => {
    if (frameRate < 30) return 32; // Reduce updates if low FPS
    if (latency > 100) return 24; // Reduce updates if high latency
    return 16; // Default 60 FPS
  },

  /**
   * Check if interpolation should be used
   * @param {Object} oldPos - Old position
   * @param {Object} newPos - New position
   * @param {number} threshold - Distance threshold
   * @returns {boolean} True if interpolation should be used
   */
  shouldInterpolate: (oldPos, newPos, threshold = 5) => {
    if (!oldPos) return false;
    const distance = Math.sqrt(
      Math.pow(newPos.x - oldPos.x, 2) + Math.pow(newPos.y - oldPos.y, 2)
    );
    return distance > threshold;
  }
};
