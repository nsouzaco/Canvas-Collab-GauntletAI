/**
 * Test Script for Performance Optimizations
 * 
 * This script tests the performance optimizations for real-time positioning
 * and provides benchmarks for comparison.
 */

import { 
  lerp, 
  smoothLerp, 
  getInterpolatedPosition, 
  throttle, 
  debounce,
  calculateDistance,
  hasSignificantChange
} from './positionInterpolation';
import { performanceMonitor } from './performanceMonitor';

/**
 * Test position interpolation performance
 */
export const testInterpolationPerformance = () => {
  console.log('🧪 Testing Position Interpolation Performance...');
  
  const startTime = performance.now();
  const iterations = 1000;
  
  // Test basic interpolation
  for (let i = 0; i < iterations; i++) {
    const result = lerp(0, 100, i / iterations);
    if (isNaN(result)) {
      console.error('❌ Interpolation failed at iteration', i);
      return false;
    }
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.log(`✅ Interpolation Performance: ${duration.toFixed(2)}ms for ${iterations} iterations`);
  console.log(`📊 Average per iteration: ${(duration / iterations).toFixed(4)}ms`);
  
  return duration < 10; // Should complete in under 10ms
};

/**
 * Test smooth interpolation performance
 */
export const testSmoothInterpolationPerformance = () => {
  console.log('🧪 Testing Smooth Interpolation Performance...');
  
  const startTime = performance.now();
  const iterations = 1000;
  
  // Test smooth interpolation
  for (let i = 0; i < iterations; i++) {
    const result = smoothLerp(0, 100, i / iterations);
    if (isNaN(result)) {
      console.error('❌ Smooth interpolation failed at iteration', i);
      return false;
    }
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.log(`✅ Smooth Interpolation Performance: ${duration.toFixed(2)}ms for ${iterations} iterations`);
  console.log(`📊 Average per iteration: ${(duration / iterations).toFixed(4)}ms`);
  
  return duration < 15; // Should complete in under 15ms
};

/**
 * Test throttling performance
 */
export const testThrottlingPerformance = () => {
  console.log('🧪 Testing Throttling Performance...');
  
  let callCount = 0;
  const throttledFunction = throttle(() => {
    callCount++;
  }, 16); // 60 FPS throttling
  
  const startTime = performance.now();
  
  // Simulate rapid calls
  for (let i = 0; i < 100; i++) {
    throttledFunction();
  }
  
  // Wait for throttling to complete
  setTimeout(() => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Throttling Performance: ${duration.toFixed(2)}ms for 100 calls`);
    console.log(`📊 Actual calls made: ${callCount} (should be much less than 100)`);
    console.log(`📊 Throttling efficiency: ${((100 - callCount) / 100 * 100).toFixed(1)}%`);
    
    return callCount < 20; // Should throttle most calls
  }, 100);
};

/**
 * Test debouncing performance
 */
export const testDebouncingPerformance = () => {
  console.log('🧪 Testing Debouncing Performance...');
  
  let callCount = 0;
  const debouncedFunction = debounce(() => {
    callCount++;
  }, 50);
  
  const startTime = performance.now();
  
  // Simulate rapid calls
  for (let i = 0; i < 50; i++) {
    debouncedFunction();
  }
  
  // Wait for debouncing to complete
  setTimeout(() => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Debouncing Performance: ${duration.toFixed(2)}ms for 50 calls`);
    console.log(`📊 Actual calls made: ${callCount} (should be 1)`);
    console.log(`📊 Debouncing efficiency: ${((50 - callCount) / 50 * 100).toFixed(1)}%`);
    
    return callCount === 1; // Should only call once
  }, 100);
};

/**
 * Test distance calculation performance
 */
export const testDistanceCalculationPerformance = () => {
  console.log('🧪 Testing Distance Calculation Performance...');
  
  const startTime = performance.now();
  const iterations = 10000;
  
  for (let i = 0; i < iterations; i++) {
    const distance = calculateDistance(
      { x: Math.random() * 1000, y: Math.random() * 1000 },
      { x: Math.random() * 1000, y: Math.random() * 1000 }
    );
    
    if (isNaN(distance) || distance < 0) {
      console.error('❌ Distance calculation failed at iteration', i);
      return false;
    }
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.log(`✅ Distance Calculation Performance: ${duration.toFixed(2)}ms for ${iterations} iterations`);
  console.log(`📊 Average per calculation: ${(duration / iterations).toFixed(4)}ms`);
  
  return duration < 50; // Should complete in under 50ms
};

/**
 * Test significant change detection
 */
export const testSignificantChangeDetection = () => {
  console.log('🧪 Testing Significant Change Detection...');
  
  const testCases = [
    { old: { x: 0, y: 0 }, new: { x: 1, y: 1 }, threshold: 2, expected: false },
    { old: { x: 0, y: 0 }, new: { x: 5, y: 5 }, threshold: 2, expected: true },
    { old: null, new: { x: 1, y: 1 }, threshold: 2, expected: true },
    { old: { x: 0, y: 0 }, new: { x: 0, y: 0 }, threshold: 2, expected: false }
  ];
  
  let passedTests = 0;
  
  testCases.forEach((testCase, index) => {
    const result = hasSignificantChange(testCase.old, testCase.new, testCase.threshold);
    if (result === testCase.expected) {
      passedTests++;
      console.log(`✅ Test case ${index + 1} passed`);
    } else {
      console.error(`❌ Test case ${index + 1} failed: expected ${testCase.expected}, got ${result}`);
    }
  });
  
  console.log(`📊 Significant Change Detection: ${passedTests}/${testCases.length} tests passed`);
  return passedTests === testCases.length;
};

/**
 * Test performance monitoring
 */
export const testPerformanceMonitoring = () => {
  console.log('🧪 Testing Performance Monitoring...');
  
  // Reset monitor
  performanceMonitor.reset();
  
  // Simulate some activity
  for (let i = 0; i < 10; i++) {
    performanceMonitor.recordPositionUpdate(Math.random() * 50);
    performanceMonitor.recordRenderCycle();
  }
  
  const metrics = performanceMonitor.getMetrics();
  const summary = performanceMonitor.getSummary();
  
  console.log('✅ Performance Monitoring Metrics:', metrics);
  console.log('✅ Performance Summary:', summary);
  
  return metrics.positionUpdates === 10 && metrics.renderCycles === 10;
};

/**
 * Run all performance tests
 */
export const runAllPerformanceTests = async () => {
  console.log('🚀 Starting Performance Optimization Tests...\n');
  
  const tests = [
    { name: 'Interpolation Performance', test: testInterpolationPerformance },
    { name: 'Smooth Interpolation Performance', test: testSmoothInterpolationPerformance },
    { name: 'Distance Calculation Performance', test: testDistanceCalculationPerformance },
    { name: 'Significant Change Detection', test: testSignificantChangeDetection },
    { name: 'Performance Monitoring', test: testPerformanceMonitoring }
  ];
  
  let passedTests = 0;
  
  for (const test of tests) {
    try {
      const result = await test.test();
      if (result) {
        passedTests++;
        console.log(`✅ ${test.name}: PASSED\n`);
      } else {
        console.log(`❌ ${test.name}: FAILED\n`);
      }
    } catch (error) {
      console.error(`❌ ${test.name}: ERROR - ${error.message}\n`);
    }
  }
  
  console.log(`🎯 Performance Tests Complete: ${passedTests}/${tests.length} tests passed`);
  
  if (passedTests === tests.length) {
    console.log('🎉 All performance optimizations are working correctly!');
  } else {
    console.log('⚠️ Some performance optimizations may need attention.');
  }
  
  return passedTests === tests.length;
};

// Export for use in development
export default {
  testInterpolationPerformance,
  testSmoothInterpolationPerformance,
  testThrottlingPerformance,
  testDebouncingPerformance,
  testDistanceCalculationPerformance,
  testSignificantChangeDetection,
  testPerformanceMonitoring,
  runAllPerformanceTests
};
