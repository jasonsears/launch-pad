"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { apiMetricsCollector, type ApiMetric } from '@/lib/apiMetrics';

interface ApiStats {
  totalRequests: number;
  successRate: number;
  avgResponseTime: number;
  lastError?: ApiMetric;
  recentMetrics: ApiMetric[];
}

export const ApiMonitoringDashboard = () => {
  const [stats, setStats] = useState<ApiStats>({
    totalRequests: 0,
    successRate: 0,
    avgResponseTime: 0,
    recentMetrics: []
  });
  const [recentCalls, setRecentCalls] = useState<ApiMetric[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Load real metrics from the collector
  const updateStats = () => {
    const realStats = apiMetricsCollector.getStats();
    setStats(realStats);
    const allMetrics = apiMetricsCollector.getRecentMetrics(100);
    setRecentCalls(allMetrics.slice(-10).reverse()); // Show last 10 calls, newest first
  };

  // Auto-refresh stats every 5 seconds when monitoring is enabled
  useEffect(() => {
    updateStats(); // Initial load
    
    if (!isMonitoring) return;

    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, [isMonitoring]);

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const testApiCall = async () => {
    try {
      await fetch('/api/search/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'test engineer monitoring',
          filters: { location: 'San Francisco' }
        })
      });

      // The API call will automatically record metrics via the googleSearch.ts integration
      // Just refresh our stats to show the new data
      setTimeout(updateStats, 500); // Small delay to ensure metric is recorded
      
    } catch {
      // Error metrics will also be automatically recorded
      setTimeout(updateStats, 500);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Google Search API Monitoring</h2>
          <p className="text-gray-600">Real-time monitoring of job search API performance</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={testApiCall}
            variant="outline"
          >
            Test API Call
          </Button>
          <Button 
            onClick={() => setIsMonitoring(!isMonitoring)}
            variant={isMonitoring ? "destructive" : "default"}
          >
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSuccessRateColor(stats.successRate)}`}>
              {stats.successRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalRequests} total requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Status</CardTitle>
            {stats.successRate > 90 ? 
              <TrendingUp className="h-4 w-4 text-green-600" /> : 
              <TrendingDown className="h-4 w-4 text-red-600" />
            }
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.successRate > 90 ? 'Healthy' : 'Issues'}
            </div>
            <p className="text-xs text-muted-foreground">
              Current status
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Error</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {stats.lastError ? 
                <div>
                  <div className="font-medium text-red-600">{stats.lastError.errorType}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(stats.lastError.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                : 
                <div className="text-green-600">No recent errors</div>
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent API Calls */}
      <Card>
        <CardHeader>
          <CardTitle>Recent API Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentCalls.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No metrics available. Start monitoring or make a test API call.
              </p>
            ) : (
              recentCalls.map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={metric.status === 'success' ? 'default' : 'destructive'}
                      className={metric.status === 'success' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {metric.status}
                    </Badge>
                    <div>
                      <div className="font-medium">{metric.query}</div>
                      {metric.status === 'error' && (
                        <div className="text-sm text-red-600">{metric.errorMessage}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div>{metric.responseTime}ms</div>
                    <div className="text-gray-500">
                      {new Date(metric.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">If Success Rate is Below 90%:</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Check Google Cloud Console quota usage</li>
                <li>Verify API key and Custom Search Engine ID</li>
                <li>Look for rate limiting (429 errors)</li>
                <li>Check if billing is enabled on Google Cloud project</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">If Response Times are High (&gt;1000ms):</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Check network connectivity</li>
                <li>Consider implementing request caching</li>
                <li>Monitor Google API performance status</li>
                <li>Optimize search query complexity</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Enhanced Logging Features:</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>✅ Detailed request/response logging</li>
                <li>✅ Error categorization and diagnosis</li>
                <li>✅ Request deduplication and rate limiting</li>
                <li>✅ Quota monitoring (when available)</li>
                <li>✅ Performance metrics tracking</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
