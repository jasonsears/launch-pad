// Real-time API metrics storage and collection
interface ApiMetric {
  timestamp: string;
  status: 'success' | 'error';
  responseTime: number;
  totalResults: string;
  query: string;
  errorType?: string;
  errorMessage?: string;
  statusCode?: number;
}

class ApiMetricsCollector {
  private metrics: ApiMetric[] = [];
  private maxMetrics = 1000; // Keep last 1000 metrics

  addMetric(metric: ApiMetric) {
    this.metrics.push(metric);
    
    // Keep only the last maxMetrics entries
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('apiMetrics', JSON.stringify(this.metrics.slice(-100))); // Store last 100
      } catch (error) {
        console.warn('Failed to store metrics in localStorage:', error);
      }
    }
  }

  getMetrics(): ApiMetric[] {
    return [...this.metrics];
  }

  getRecentMetrics(count: number = 10): ApiMetric[] {
    return this.metrics.slice(-count);
  }

  getStats() {
    if (this.metrics.length === 0) {
      return {
        totalRequests: 0,
        successRate: 0,
        avgResponseTime: 0,
        lastError: undefined,
        recentMetrics: []
      };
    }

    const recent24h = this.metrics.slice(-288); // Assuming 5-min intervals for 24h
    const successCount = recent24h.filter(m => m.status === 'success').length;
    const totalRequests = recent24h.length;
    const successRate = totalRequests > 0 ? (successCount / totalRequests) * 100 : 0;
    const avgResponseTime = recent24h.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests;
    const lastError = recent24h.filter(m => m.status === 'error').pop();

    return {
      totalRequests,
      successRate,
      avgResponseTime: Math.round(avgResponseTime),
      lastError,
      recentMetrics: recent24h.slice(-10)
    };
  }

  loadFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('apiMetrics');
        if (stored) {
          this.metrics = JSON.parse(stored);
        }
      } catch (error) {
        console.warn('Failed to load metrics from localStorage:', error);
      }
    }
  }

  clear() {
    this.metrics = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('apiMetrics');
    }
  }
}

// Global metrics collector instance
export const apiMetricsCollector = new ApiMetricsCollector();

// Initialize from storage when module loads
if (typeof window !== 'undefined') {
  apiMetricsCollector.loadFromStorage();
}

// Helper function to record API metrics
export const recordApiMetric = (
  status: 'success' | 'error',
  responseTime: number,
  query: string,
  totalResults?: string,
  error?: { type?: string; message?: string; statusCode?: number }
) => {
  const metric: ApiMetric = {
    timestamp: new Date().toISOString(),
    status,
    responseTime,
    totalResults: totalResults || '0',
    query,
    ...(error && {
      errorType: error.type,
      errorMessage: error.message,
      statusCode: error.statusCode
    })
  };

  apiMetricsCollector.addMetric(metric);
};

export type { ApiMetric };
