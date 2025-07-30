// Performance monitoring and optimization utilities

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.thresholds = {
      renderTime: 16, // 60fps target
      memoryUsage: 50 * 1024 * 1024, // 50MB
      apiResponseTime: 1000 // 1 second
    };
  }

  // Start timing an operation
  startTimer(operation) {
    const startTime = performance.now();
    return {
      end: () => {
        const duration = performance.now() - startTime;
        this.recordMetric(operation, duration);
        return duration;
      }
    };
  }

  // Record a performance metric
  recordMetric(name, value) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name).push({
      value,
      timestamp: Date.now()
    });

    // Keep only last 100 measurements
    const measurements = this.metrics.get(name);
    if (measurements.length > 100) {
      measurements.splice(0, measurements.length - 100);
    }

    // Check thresholds and notify observers
    this.checkThresholds(name, value);
  }

  // Get average metric
  getAverageMetric(name) {
    const measurements = this.metrics.get(name);
    if (!measurements || measurements.length === 0) return 0;
    
    const sum = measurements.reduce((acc, m) => acc + m.value, 0);
    return sum / measurements.length;
  }

  // Get latest metric
  getLatestMetric(name) {
    const measurements = this.metrics.get(name);
    if (!measurements || measurements.length === 0) return null;
    return measurements[measurements.length - 1];
  }

  // Check if metric exceeds threshold
  checkThresholds(name, value) {
    const threshold = this.thresholds[name];
    if (threshold && value > threshold) {
      this.notifyObservers(name, value, threshold);
    }
  }

  // Subscribe to performance events
  subscribe(event, callback) {
    if (!this.observers.has(event)) {
      this.observers.set(event, []);
    }
    this.observers.get(event).push(callback);
  }

  // Notify observers
  notifyObservers(event, value, threshold) {
    const callbacks = this.observers.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback({ value, threshold }));
    }
  }

  // Get performance report
  getReport() {
    const report = {};
    for (const [name, measurements] of this.metrics) {
      const values = measurements.map(m => m.value);
      report[name] = {
        average: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length,
        latest: measurements[measurements.length - 1]?.value
      };
    }
    return report;
  }

  // Clear metrics
  clear() {
    this.metrics.clear();
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

import { useState, useEffect, useCallback, useRef } from 'react';

// React performance hooks
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(performanceMonitor.getReport());
    };

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);
    updateMetrics(); // Initial update

    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    startTimer: performanceMonitor.startTimer.bind(performanceMonitor),
    recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor),
    getReport: performanceMonitor.getReport.bind(performanceMonitor)
  };
};

// Component render time monitoring
export const useRenderTime = (componentName) => {
  useEffect(() => {
    const timer = performanceMonitor.startTimer(`render_${componentName}`);
    return () => {
      timer.end();
    };
  });
};

// API response time monitoring
export const monitorApiCall = async (apiCall, name) => {
  const timer = performanceMonitor.startTimer(`api_${name}`);
  try {
    const result = await apiCall();
    timer.end();
    return result;
  } catch (error) {
    timer.end();
    throw error;
  }
};

// Memory usage monitoring
export const useMemoryMonitor = () => {
  const [memoryInfo, setMemoryInfo] = useState(null);

  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = performance.memory;
        setMemoryInfo({
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
          percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
        });

        // Record memory usage
        performanceMonitor.recordMetric('memory_usage', memory.usedJSHeapSize);
      }
    };

    const interval = setInterval(checkMemory, 10000); // Check every 10 seconds
    checkMemory(); // Initial check

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
};

// Debounce utility for performance optimization
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle utility for performance optimization
export const useThrottle = (callback, delay) => {
  const lastRun = useRef(Date.now());

  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]);
};

// Lazy loading utility
export const useLazyLoad = (items, itemsPerPage = 10) => {
  const [visibleItems, setVisibleItems] = useState(itemsPerPage);
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setVisibleItems(prev => Math.min(prev + itemsPerPage, items.length));
      setLoading(false);
    }, 100);
  }, [items.length, itemsPerPage]);

  const hasMore = visibleItems < items.length;

  return {
    items: items.slice(0, visibleItems),
    loading,
    hasMore,
    loadMore
  };
};

// Image optimization utility
export const useImageOptimization = (src, options = {}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const img = new Image();
    
    img.onload = () => {
      setLoaded(true);
      setError(false);
    };
    
    img.onerror = () => {
      setError(true);
      setLoaded(false);
    };

    img.src = src;
  }, [src]);

  return { loaded, error };
};

// Export the performance monitor instance
export default performanceMonitor; 