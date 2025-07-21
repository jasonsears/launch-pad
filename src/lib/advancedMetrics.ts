/**
 * Advanced API metrics and monitoring utilities
 * Provides detailed tracking, alerting, and performance analysis
 */

export interface DetailedApiMetric {
  id: string;
  timestamp: string;
  provider: 'google' | 'other';
  endpoint: string;
  
  // Request details
  query: string;
  filters?: Record<string, unknown>;
  userTier?: string;
  
  // Response details
  status: 'success' | 'error' | 'timeout' | 'rate_limited';
  responseTime: number;
  statusCode?: number;
  
  // Results
  resultCount?: number;
  filteredCount?: number;
  
  // Quota and rate limiting
  quotaUsed?: number;
  rateLimitRemaining?: number;
  
  // Error details (if applicable)
  errorType?: string;
  errorMessage?: string;
  retryable?: boolean;
  retryAfter?: number;
  
  // Performance metrics
  queryComplexity?: number;
  cacheHit?: boolean;
  
  // Business metrics
  userSatisfaction?: 'satisfied' | 'unsatisfied' | 'unknown';
  conversionEvent?: boolean;
}

export interface MetricsAlert {
  id: string;
  type: 'error_rate' | 'response_time' | 'quota_usage' | 'rate_limit';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  metrics: DetailedApiMetric[];
  threshold: number;
  currentValue: number;
  recommendations: string[];
}

export interface PerformanceInsights {
  averageResponseTime: number;
  medianResponseTime: number;
  p95ResponseTime: number;
  errorRate: number;
  successRate: number;
  quotaUtilization: number;
  topErrors: Array<{ error: string; count: number; percentage: number }>;
  timeSeriesData: Array<{ timestamp: string; responseTime: number; errorRate: number }>;
  recommendations: string[];
}

class AdvancedMetricsCollector {
  private metrics: DetailedApiMetric[] = [];
  private alerts: MetricsAlert[] = [];
  private maxMetrics = 2000; // Keep more metrics for analysis
  private alertThresholds = {
    errorRate: 0.1, // 10% error rate
    responseTime: 5000, // 5 seconds
    quotaUsage: 0.9, // 90% quota usage
  };

  /**
   * Records a detailed API metric
   */
  recordMetric(metric: Omit<DetailedApiMetric, 'id' | 'timestamp'>): void {
    const detailedMetric: DetailedApiMetric = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      ...metric
    };

    this.metrics.push(detailedMetric);
    
    // Maintain size limit
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Check for alerts
    this.checkAlerts(detailedMetric);
    
    // Persist to storage
    this.saveToStorage();
  }

  /**
   * Generates performance insights from collected metrics
   */
  generateInsights(timeRangeHours: number = 24): PerformanceInsights {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - timeRangeHours);
    
    const recentMetrics = this.metrics.filter(
      m => new Date(m.timestamp) >= cutoffTime
    );

    if (recentMetrics.length === 0) {
      return this.getEmptyInsights();
    }

    const responseTimes = recentMetrics
      .filter(m => m.status === 'success')
      .map(m => m.responseTime);
    
    const errorCount = recentMetrics.filter(m => m.status === 'error').length;
    
    const errorRate = recentMetrics.length > 0 ? errorCount / recentMetrics.length : 0;
    const successRate = 1 - errorRate;

    // Calculate percentiles
    const sortedTimes = responseTimes.sort((a, b) => a - b);
    const p95Index = Math.floor(sortedTimes.length * 0.95);
    
    // Error analysis
    const errorCounts = new Map<string, number>();
    recentMetrics
      .filter(m => m.status === 'error' && m.errorType)
      .forEach(m => {
        const count = errorCounts.get(m.errorType!) || 0;
        errorCounts.set(m.errorType!, count + 1);
      });

    const topErrors = Array.from(errorCounts.entries())
      .map(([error, count]) => ({
        error,
        count,
        percentage: (count / errorCount) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Time series data (hourly buckets)
    const timeSeriesData = this.generateTimeSeriesData(recentMetrics, timeRangeHours);

    // Quota utilization
    const latestQuotaMetric = recentMetrics
      .filter(m => m.quotaUsed !== undefined)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    
    const quotaUtilization = latestQuotaMetric?.quotaUsed || 0;

    return {
      averageResponseTime: responseTimes.length > 0 ? 
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0,
      medianResponseTime: sortedTimes.length > 0 ? 
        sortedTimes[Math.floor(sortedTimes.length / 2)] : 0,
      p95ResponseTime: sortedTimes.length > 0 ? sortedTimes[p95Index] || 0 : 0,
      errorRate,
      successRate,
      quotaUtilization: quotaUtilization / 100, // Convert to percentage
      topErrors,
      timeSeriesData,
      recommendations: this.generateRecommendations(recentMetrics, errorRate, responseTimes)
    };
  }

  /**
   * Gets active alerts
   */
  getActiveAlerts(): MetricsAlert[] {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    return this.alerts.filter(alert => 
      new Date(alert.timestamp) >= oneHourAgo
    );
  }

  /**
   * Clears old alerts
   */
  clearOldAlerts(): void {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    this.alerts = this.alerts.filter(alert => 
      new Date(alert.timestamp) >= oneDayAgo
    );
  }

  /**
   * Gets metrics for export/analysis
   */
  exportMetrics(timeRangeHours: number = 24): DetailedApiMetric[] {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - timeRangeHours);
    
    return this.metrics.filter(
      m => new Date(m.timestamp) >= cutoffTime
    );
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private checkAlerts(metric: DetailedApiMetric): void {
    // Check error rate
    const recentMetrics = this.getRecentMetrics(1); // Last hour
    if (recentMetrics.length >= 10) { // Only check if we have enough data
      const errorRate = recentMetrics.filter(m => m.status === 'error').length / recentMetrics.length;
      
      if (errorRate > this.alertThresholds.errorRate) {
        this.createAlert({
          type: 'error_rate',
          severity: errorRate > 0.3 ? 'critical' : 'high',
          message: `High error rate detected: ${(errorRate * 100).toFixed(1)}%`,
          metrics: recentMetrics.filter(m => m.status === 'error'),
          threshold: this.alertThresholds.errorRate * 100,
          currentValue: errorRate * 100,
          recommendations: [
            'Check API key and permissions',
            'Verify Custom Search Engine configuration',
            'Monitor quota usage',
            'Review recent query patterns'
          ]
        });
      }
    }

    // Check response time
    if (metric.status === 'success' && metric.responseTime > this.alertThresholds.responseTime) {
      this.createAlert({
        type: 'response_time',
        severity: metric.responseTime > 10000 ? 'critical' : 'medium',
        message: `Slow response time: ${metric.responseTime}ms`,
        metrics: [metric],
        threshold: this.alertThresholds.responseTime,
        currentValue: metric.responseTime,
        recommendations: [
          'Check network connectivity',
          'Consider reducing query complexity',
          'Monitor Google API status',
          'Implement request caching'
        ]
      });
    }

    // Check quota usage
    if (metric.quotaUsed && metric.quotaUsed > this.alertThresholds.quotaUsage * 100) {
      this.createAlert({
        type: 'quota_usage',
        severity: metric.quotaUsed > 95 ? 'critical' : 'high',
        message: `High quota usage: ${metric.quotaUsed}%`,
        metrics: [metric],
        threshold: this.alertThresholds.quotaUsage * 100,
        currentValue: metric.quotaUsed,
        recommendations: [
          'Upgrade API plan if needed',
          'Implement query optimization',
          'Add request caching',
          'Monitor usage patterns'
        ]
      });
    }
  }

  private createAlert(alertData: Omit<MetricsAlert, 'id' | 'timestamp'>): void {
    const alert: MetricsAlert = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      ...alertData
    };

    this.alerts.push(alert);
    
    // Log critical alerts
    if (alert.severity === 'critical') {
      console.error('🚨 Critical API Alert:', alert);
    } else if (alert.severity === 'high') {
      console.warn('⚠️ High Priority API Alert:', alert);
    }
  }

  private getRecentMetrics(hours: number): DetailedApiMetric[] {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);
    
    return this.metrics.filter(
      m => new Date(m.timestamp) >= cutoffTime
    );
  }

  private generateTimeSeriesData(
    metrics: DetailedApiMetric[], 
    timeRangeHours: number
  ): Array<{ timestamp: string; responseTime: number; errorRate: number }> {
    const buckets = Math.min(timeRangeHours, 24); // Max 24 data points
    const bucketSizeMs = (timeRangeHours * 60 * 60 * 1000) / buckets;
    
    const now = new Date();
    const bucketData: Array<{ timestamp: string; responseTime: number; errorRate: number }> = [];
    
    for (let i = 0; i < buckets; i++) {
      const bucketStart = new Date(now.getTime() - (buckets - i) * bucketSizeMs);
      const bucketEnd = new Date(bucketStart.getTime() + bucketSizeMs);
      
      const bucketMetrics = metrics.filter(m => {
        const timestamp = new Date(m.timestamp);
        return timestamp >= bucketStart && timestamp < bucketEnd;
      });

      if (bucketMetrics.length > 0) {
        const successMetrics = bucketMetrics.filter(m => m.status === 'success');
        const avgResponseTime = successMetrics.length > 0 ? 
          successMetrics.reduce((sum, m) => sum + m.responseTime, 0) / successMetrics.length : 0;
        
        const errorRate = bucketMetrics.filter(m => m.status === 'error').length / bucketMetrics.length;
        
        bucketData.push({
          timestamp: bucketStart.toISOString(),
          responseTime: Math.round(avgResponseTime),
          errorRate: Math.round(errorRate * 100) / 100
        });
      }
    }
    
    return bucketData;
  }

  private generateRecommendations(
    metrics: DetailedApiMetric[], 
    errorRate: number, 
    responseTimes: number[]
  ): string[] {
    const recommendations: string[] = [];
    
    if (errorRate > 0.05) {
      recommendations.push('Error rate is elevated - review API configuration and quota usage');
    }
    
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    if (avgResponseTime > 2000) {
      recommendations.push('Response times are slow - consider query optimization and caching');
    }
    
    const quotaMetrics = metrics.filter(m => m.quotaUsed && m.quotaUsed > 80);
    if (quotaMetrics.length > 0) {
      recommendations.push('Quota usage is high - monitor daily limits and consider upgrading');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('API performance is healthy - continue monitoring');
    }
    
    return recommendations;
  }

  private getEmptyInsights(): PerformanceInsights {
    return {
      averageResponseTime: 0,
      medianResponseTime: 0,
      p95ResponseTime: 0,
      errorRate: 0,
      successRate: 0,
      quotaUtilization: 0,
      topErrors: [],
      timeSeriesData: [],
      recommendations: ['No recent data available']
    };
  }

  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('api_metrics_detailed', JSON.stringify({
          metrics: this.metrics.slice(-100), // Save last 100 metrics
          alerts: this.alerts.slice(-20) // Save last 20 alerts
        }));
      } catch (error) {
        console.warn('Failed to save detailed metrics to localStorage:', error);
      }
    }
  }

  loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('api_metrics_detailed');
        if (stored) {
          const data = JSON.parse(stored);
          this.metrics = data.metrics || [];
          this.alerts = data.alerts || [];
        }
      } catch (error) {
        console.warn('Failed to load detailed metrics from localStorage:', error);
      }
    }
  }
}

// Global instance
const advancedMetricsCollector = new AdvancedMetricsCollector();

// Load existing data on initialization (browser only)
if (typeof window !== 'undefined') {
  advancedMetricsCollector.loadFromStorage();
}

/**
 * Records a detailed API metric
 */
export const recordDetailedMetric = (metric: Omit<DetailedApiMetric, 'id' | 'timestamp'>): void => {
  advancedMetricsCollector.recordMetric(metric);
};

/**
 * Gets performance insights
 */
export const getPerformanceInsights = (timeRangeHours: number = 24): PerformanceInsights => {
  return advancedMetricsCollector.generateInsights(timeRangeHours);
};

/**
 * Gets active alerts
 */
export const getActiveAlerts = (): MetricsAlert[] => {
  return advancedMetricsCollector.getActiveAlerts();
};

/**
 * Clears old alerts
 */
export const clearOldAlerts = (): void => {
  advancedMetricsCollector.clearOldAlerts();
};

/**
 * Exports metrics for analysis
 */
export const exportMetrics = (timeRangeHours: number = 24): DetailedApiMetric[] => {
  return advancedMetricsCollector.exportMetrics(timeRangeHours);
};
