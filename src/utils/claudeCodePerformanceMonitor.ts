import { claudeCodeInvoker, ClaudeCodeResponse } from './claudeCodeInvoker.js';
import logger from './logger.js';

export interface PerformanceMetrics {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  opusUsage: number;
  sonnetUsage: number;
  cacheHitRate: number;
  errorRate: number;
  qualityScore: number;
}

export interface ModelUsageStats {
  opus: {
    requests: number;
    averageTime: number;
    successRate: number;
    qualityScore: number;
  };
  sonnet: {
    requests: number;
    averageTime: number;
    successRate: number;
    qualityScore: number;
  };
}

export interface PerformanceAlert {
  type: 'warning' | 'error' | 'info';
  message: string;
  metric: string;
  threshold: number;
  current: number;
  timestamp: Date;
  suggestions: string[];
}

export class ClaudeCodePerformanceMonitor {
  private static instance: ClaudeCodePerformanceMonitor;
  private requestHistory: Array<{
    model: 'opus' | 'sonnet';
    duration: number;
    success: boolean;
    timestamp: Date;
    qualityScore?: number;
    classification?: string;
  }> = [];
  
  private alerts: PerformanceAlert[] = [];
  private readonly MAX_HISTORY = 1000;
  private readonly PERFORMANCE_THRESHOLDS = {
    successRate: 0.95,
    averageResponseTime: 30000, // 30 seconds
    errorRate: 0.05,
    qualityScore: 0.8
  };

  static getInstance(): ClaudeCodePerformanceMonitor {
    if (!ClaudeCodePerformanceMonitor.instance) {
      ClaudeCodePerformanceMonitor.instance = new ClaudeCodePerformanceMonitor();
    }
    return ClaudeCodePerformanceMonitor.instance;
  }

  /**
   * Records a Claude Code request for performance tracking
   */
  recordRequest(
    model: 'opus' | 'sonnet',
    response: ClaudeCodeResponse,
    classification?: string,
    qualityScore?: number
  ): void {
    const record = {
      model,
      duration: response.duration,
      success: response.success,
      timestamp: new Date(),
      qualityScore,
      classification
    };

    this.requestHistory.push(record);

    // Maintain history size limit
    if (this.requestHistory.length > this.MAX_HISTORY) {
      this.requestHistory = this.requestHistory.slice(-this.MAX_HISTORY);
    }

    // Check for performance alerts
    this.checkPerformanceAlerts();

    logger.info('Claude Code request recorded', {
      model,
      success: response.success,
      duration: response.duration,
      qualityScore,
      classification
    });
  }

  /**
   * Gets comprehensive performance metrics
   */
  getPerformanceMetrics(timeRangeHours: number = 24): PerformanceMetrics {
    const cutoffTime = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000);
    const recentRequests = this.requestHistory.filter(r => r.timestamp >= cutoffTime);

    if (recentRequests.length === 0) {
      return {
        totalRequests: 0,
        successRate: 0,
        averageResponseTime: 0,
        opusUsage: 0,
        sonnetUsage: 0,
        cacheHitRate: claudeCodeInvoker.getCacheStats().hitRate,
        errorRate: 0,
        qualityScore: 0
      };
    }

    const successful = recentRequests.filter(r => r.success);
    const opusRequests = recentRequests.filter(r => r.model === 'opus');
    const sonnetRequests = recentRequests.filter(r => r.model === 'sonnet');
    const withQualityScores = recentRequests.filter(r => r.qualityScore !== undefined);

    return {
      totalRequests: recentRequests.length,
      successRate: successful.length / recentRequests.length,
      averageResponseTime: recentRequests.reduce((sum, r) => sum + r.duration, 0) / recentRequests.length,
      opusUsage: opusRequests.length,
      sonnetUsage: sonnetRequests.length,
      cacheHitRate: claudeCodeInvoker.getCacheStats().hitRate,
      errorRate: (recentRequests.length - successful.length) / recentRequests.length,
      qualityScore: withQualityScores.length > 0 
        ? withQualityScores.reduce((sum, r) => sum + (r.qualityScore || 0), 0) / withQualityScores.length
        : 0
    };
  }

  /**
   * Gets model-specific usage statistics
   */
  getModelUsageStats(timeRangeHours: number = 24): ModelUsageStats {
    const cutoffTime = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000);
    const recentRequests = this.requestHistory.filter(r => r.timestamp >= cutoffTime);

    const opusRequests = recentRequests.filter(r => r.model === 'opus');
    const sonnetRequests = recentRequests.filter(r => r.model === 'sonnet');

    const calculateStats = (requests: typeof recentRequests) => {
      if (requests.length === 0) {
        return { requests: 0, averageTime: 0, successRate: 0, qualityScore: 0 };
      }

      const successful = requests.filter(r => r.success);
      const withQuality = requests.filter(r => r.qualityScore !== undefined);

      return {
        requests: requests.length,
        averageTime: requests.reduce((sum, r) => sum + r.duration, 0) / requests.length,
        successRate: successful.length / requests.length,
        qualityScore: withQuality.length > 0
          ? withQuality.reduce((sum, r) => sum + (r.qualityScore || 0), 0) / withQuality.length
          : 0
      };
    };

    return {
      opus: calculateStats(opusRequests),
      sonnet: calculateStats(sonnetRequests)
    };
  }

  /**
   * Gets performance recommendations based on current metrics
   */
  async getPerformanceRecommendations(): Promise<string[]> {
    const metrics = this.getPerformanceMetrics();
    const modelStats = this.getModelUsageStats();

    const recommendationPrompt = `Analyze Claude Code performance and provide optimization recommendations:

Current Metrics:
- Total Requests: ${metrics.totalRequests}
- Success Rate: ${Math.round(metrics.successRate * 100)}%
- Average Response Time: ${Math.round(metrics.averageResponseTime)}ms
- Error Rate: ${Math.round(metrics.errorRate * 100)}%
- Cache Hit Rate: ${Math.round(metrics.cacheHitRate * 100)}%
- Quality Score: ${Math.round(metrics.qualityScore * 100)}%

Model Usage:
- Opus: ${modelStats.opus.requests} requests, ${Math.round(modelStats.opus.averageTime)}ms avg
- Sonnet: ${modelStats.sonnet.requests} requests, ${Math.round(modelStats.sonnet.averageTime)}ms avg

Performance Thresholds:
- Success Rate: >${Math.round(this.PERFORMANCE_THRESHOLDS.successRate * 100)}%
- Response Time: <${this.PERFORMANCE_THRESHOLDS.averageResponseTime}ms
- Error Rate: <${Math.round(this.PERFORMANCE_THRESHOLDS.errorRate * 100)}%

Provide specific optimization recommendations (array of strings).

Respond in JSON format with key: recommendations`;

    try {
      const response = await claudeCodeInvoker.invokeExecution(recommendationPrompt, { timeout: 10000 });
      
      if (response.success) {
        const result = JSON.parse(response.output);
        return result.recommendations || [];
      }
    } catch (error) {
      logger.warn('Failed to get AI recommendations, using fallback', { error });
    }

    // Fallback recommendations based on simple rules
    const recommendations: string[] = [];

    if (metrics.successRate < this.PERFORMANCE_THRESHOLDS.successRate) {
      recommendations.push('Investigate and fix error causes to improve success rate');
    }

    if (metrics.averageResponseTime > this.PERFORMANCE_THRESHOLDS.averageResponseTime) {
      recommendations.push('Consider optimizing prompts or using more aggressive caching');
    }

    if (metrics.cacheHitRate < 0.3) {
      recommendations.push('Improve caching strategy - many requests are not being cached');
    }

    if (modelStats.opus.averageTime > modelStats.sonnet.averageTime * 2) {
      recommendations.push('Consider using Sonnet for more tasks to improve response times');
    }

    if (metrics.qualityScore < this.PERFORMANCE_THRESHOLDS.qualityScore) {
      recommendations.push('Review prompt quality and model selection for better results');
    }

    return recommendations.length > 0 ? recommendations : ['Performance is within acceptable ranges'];
  }

  /**
   * Gets current performance alerts
   */
  getAlerts(severityFilter?: 'warning' | 'error' | 'info'): PerformanceAlert[] {
    const alerts = severityFilter 
      ? this.alerts.filter(a => a.type === severityFilter)
      : this.alerts;
    
    return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Clears old alerts
   */
  clearOldAlerts(maxAgeHours: number = 24): void {
    const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    this.alerts = this.alerts.filter(a => a.timestamp >= cutoffTime);
  }

  /**
   * Gets performance trend analysis
   */
  getTrendAnalysis(timeRangeHours: number = 24): {
    trend: 'improving' | 'stable' | 'degrading';
    confidence: number;
    details: string;
  } {
    const cutoffTime = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000);
    const recentRequests = this.requestHistory.filter(r => r.timestamp >= cutoffTime);

    if (recentRequests.length < 10) {
      return {
        trend: 'stable',
        confidence: 0.3,
        details: 'Insufficient data for trend analysis'
      };
    }

    // Split into two halves for comparison
    const midPoint = Math.floor(recentRequests.length / 2);
    const firstHalf = recentRequests.slice(0, midPoint);
    const secondHalf = recentRequests.slice(midPoint);

    const firstHalfSuccessRate = firstHalf.filter(r => r.success).length / firstHalf.length;
    const secondHalfSuccessRate = secondHalf.filter(r => r.success).length / secondHalf.length;

    const firstHalfAvgTime = firstHalf.reduce((sum, r) => sum + r.duration, 0) / firstHalf.length;
    const secondHalfAvgTime = secondHalf.reduce((sum, r) => sum + r.duration, 0) / secondHalf.length;

    const successRateChange = secondHalfSuccessRate - firstHalfSuccessRate;
    const responseTimeChange = (firstHalfAvgTime - secondHalfAvgTime) / firstHalfAvgTime; // Positive means improvement

    let trend: 'improving' | 'stable' | 'degrading' = 'stable';
    let confidence = 0.5;

    if (successRateChange > 0.05 && responseTimeChange > 0.1) {
      trend = 'improving';
      confidence = 0.8;
    } else if (successRateChange < -0.05 || responseTimeChange < -0.2) {
      trend = 'degrading';
      confidence = 0.8;
    }

    return {
      trend,
      confidence,
      details: `Success rate change: ${Math.round(successRateChange * 100)}%, Response time change: ${Math.round(responseTimeChange * 100)}%`
    };
  }

  private checkPerformanceAlerts(): void {
    const metrics = this.getPerformanceMetrics(1); // Last hour

    // Success rate alert
    if (metrics.successRate < this.PERFORMANCE_THRESHOLDS.successRate && metrics.totalRequests >= 5) {
      this.addAlert({
        type: 'warning',
        message: 'Success rate below threshold',
        metric: 'successRate',
        threshold: this.PERFORMANCE_THRESHOLDS.successRate,
        current: metrics.successRate,
        suggestions: [
          'Check for system issues or API problems',
          'Review recent prompt changes',
          'Verify network connectivity'
        ]
      });
    }

    // Response time alert
    if (metrics.averageResponseTime > this.PERFORMANCE_THRESHOLDS.averageResponseTime && metrics.totalRequests >= 3) {
      this.addAlert({
        type: 'warning',
        message: 'Average response time exceeds threshold',
        metric: 'averageResponseTime',
        threshold: this.PERFORMANCE_THRESHOLDS.averageResponseTime,
        current: metrics.averageResponseTime,
        suggestions: [
          'Optimize prompt complexity',
          'Increase caching usage',
          'Consider using Sonnet for faster responses'
        ]
      });
    }

    // Error rate alert
    if (metrics.errorRate > this.PERFORMANCE_THRESHOLDS.errorRate && metrics.totalRequests >= 5) {
      this.addAlert({
        type: 'error',
        message: 'Error rate above acceptable threshold',
        metric: 'errorRate',
        threshold: this.PERFORMANCE_THRESHOLDS.errorRate,
        current: metrics.errorRate,
        suggestions: [
          'Investigate error causes immediately',
          'Check system logs for patterns',
          'Verify Claude Code installation'
        ]
      });
    }
  }

  private addAlert(alertData: Omit<PerformanceAlert, 'timestamp'>): void {
    // Avoid duplicate alerts for the same issue
    const existingAlert = this.alerts.find(
      a => a.metric === alertData.metric && 
           a.type === alertData.type && 
           Date.now() - a.timestamp.getTime() < 300000 // 5 minutes
    );

    if (!existingAlert) {
      this.alerts.push({
        ...alertData,
        timestamp: new Date()
      });

      logger.warn('Performance alert generated', alertData);
    }
  }

  /**
   * Resets all performance data
   */
  reset(): void {
    this.requestHistory = [];
    this.alerts = [];
    claudeCodeInvoker.clearCache();
    logger.info('Claude Code performance monitor reset');
  }
}

// Export singleton instance
export const claudeCodePerformanceMonitor = ClaudeCodePerformanceMonitor.getInstance();