import { EventEmitter } from 'events';
import logger from './logger.js';
export class PerformanceMonitor extends EventEmitter {
    metrics = [];
    stats = new Map();
    cleanupInterval = null;
    async initialize() {
        logger.info('Initializing performance monitor');
        // Start cleanup of old metrics
        this.cleanupInterval = setInterval(() => {
            this.cleanupOldMetrics();
        }, 3600000); // Every hour
    }
    recordMetric(metric) {
        const fullMetric = {
            ...metric,
            timestamp: new Date()
        };
        this.metrics.push(fullMetric);
        this.updateStats(fullMetric);
        this.emit('metricRecorded', fullMetric);
        // Log slow operations
        if (metric.duration > 5000) {
            logger.warn('Slow operation detected', {
                tool: metric.tool,
                operation: metric.operation,
                duration: metric.duration
            });
        }
    }
    updateStats(metric) {
        const stats = this.stats.get(metric.tool) || {
            tool: metric.tool,
            totalCalls: 0,
            successfulCalls: 0,
            failedCalls: 0,
            averageDuration: 0,
            p95Duration: 0,
            p99Duration: 0,
            lastHourCalls: 0,
            trend: 'stable'
        };
        stats.totalCalls++;
        if (metric.success) {
            stats.successfulCalls++;
        }
        else {
            stats.failedCalls++;
        }
        // Update average duration
        stats.averageDuration =
            (stats.averageDuration * (stats.totalCalls - 1) + metric.duration) / stats.totalCalls;
        // Update percentiles (simplified - in production use proper algorithm)
        const toolMetrics = this.metrics
            .filter(m => m.tool === metric.tool)
            .sort((a, b) => a.duration - b.duration);
        if (toolMetrics.length > 0) {
            const p95Index = Math.floor(toolMetrics.length * 0.95);
            const p99Index = Math.floor(toolMetrics.length * 0.99);
            stats.p95Duration = toolMetrics[p95Index]?.duration || 0;
            stats.p99Duration = toolMetrics[p99Index]?.duration || 0;
        }
        // Update last hour calls
        const oneHourAgo = new Date(Date.now() - 3600000);
        stats.lastHourCalls = this.metrics.filter(m => m.tool === metric.tool && m.timestamp > oneHourAgo).length;
        // Determine trend
        stats.trend = this.calculateTrend(metric.tool);
        this.stats.set(metric.tool, stats);
    }
    calculateTrend(tool) {
        const recentMetrics = this.metrics
            .filter(m => m.tool === tool)
            .slice(-100); // Last 100 calls
        if (recentMetrics.length < 20) {
            return 'stable';
        }
        const firstHalf = recentMetrics.slice(0, 50);
        const secondHalf = recentMetrics.slice(50);
        const firstHalfAvg = firstHalf.reduce((sum, m) => sum + m.duration, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((sum, m) => sum + m.duration, 0) / secondHalf.length;
        const percentChange = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
        if (percentChange < -10) {
            return 'improving';
        }
        else if (percentChange > 10) {
            return 'degrading';
        }
        else {
            return 'stable';
        }
    }
    getStats(tool) {
        if (tool) {
            const stats = this.stats.get(tool);
            if (!stats) {
                throw new Error(`No stats available for tool: ${tool}`);
            }
            return stats;
        }
        return Array.from(this.stats.values());
    }
    getOverallStats() {
        let totalOperations = 0;
        let totalSuccessful = 0;
        let totalDuration = 0;
        this.stats.forEach(stats => {
            totalOperations += stats.totalCalls;
            totalSuccessful += stats.successfulCalls;
            totalDuration += stats.averageDuration * stats.totalCalls;
        });
        return {
            totalOperations,
            successRate: totalOperations > 0 ? (totalSuccessful / totalOperations) * 100 : 0,
            averageDuration: totalOperations > 0 ? totalDuration / totalOperations : 0,
            toolsMonitored: this.stats.size
        };
    }
    getTrends(hours = 24) {
        const trends = new Map();
        const cutoffTime = new Date(Date.now() - hours * 3600000);
        // Group metrics by hour
        const hourlyMetrics = new Map();
        this.metrics
            .filter(m => m.timestamp > cutoffTime)
            .forEach(metric => {
            const hour = Math.floor(metric.timestamp.getTime() / 3600000);
            if (!hourlyMetrics.has(metric.tool)) {
                hourlyMetrics.set(metric.tool, new Map());
            }
            const toolHourly = hourlyMetrics.get(metric.tool);
            if (!toolHourly.has(hour)) {
                toolHourly.set(hour, []);
            }
            toolHourly.get(hour).push(metric);
        });
        // Calculate hourly averages
        hourlyMetrics.forEach((hourly, tool) => {
            const hourlyAverages = [];
            hourly.forEach(metrics => {
                const avg = metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
                hourlyAverages.push(avg);
            });
            trends.set(tool, hourlyAverages);
        });
        return trends;
    }
    generateRecommendations() {
        const recommendations = [];
        this.stats.forEach((stats, tool) => {
            // Check for high failure rate
            const failureRate = (stats.failedCalls / stats.totalCalls) * 100;
            if (failureRate > 10) {
                recommendations.push(`Tool '${tool}' has a high failure rate (${failureRate.toFixed(1)}%). Consider investigating error patterns.`);
            }
            // Check for performance degradation
            if (stats.trend === 'degrading') {
                recommendations.push(`Tool '${tool}' performance is degrading. Average duration has increased.`);
            }
            // Check for slow operations
            if (stats.p95Duration > 10000) {
                recommendations.push(`Tool '${tool}' has slow operations. P95 duration is ${(stats.p95Duration / 1000).toFixed(1)}s.`);
            }
            // Check for underutilization
            if (stats.lastHourCalls < 5 && stats.totalCalls > 100) {
                recommendations.push(`Tool '${tool}' usage has dropped significantly. Consider if it's still needed.`);
            }
        });
        // Overall recommendations
        const overall = this.getOverallStats();
        if (overall.successRate < 90) {
            recommendations.push(`Overall success rate is low (${overall.successRate.toFixed(1)}%). System reliability needs attention.`);
        }
        return recommendations;
    }
    cleanupOldMetrics() {
        const cutoffTime = new Date(Date.now() - 7 * 24 * 3600000); // 7 days
        const beforeCount = this.metrics.length;
        this.metrics = this.metrics.filter(m => m.timestamp > cutoffTime);
        const removed = beforeCount - this.metrics.length;
        if (removed > 0) {
            logger.info(`Cleaned up ${removed} old metrics`);
        }
    }
    async shutdown() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
    }
    // Utility method for measuring async operations
    async measure(tool, operation, fn) {
        const startTime = Date.now();
        let success = true;
        try {
            const result = await fn();
            return result;
        }
        catch (error) {
            success = false;
            throw error;
        }
        finally {
            this.recordMetric({
                tool,
                operation,
                duration: Date.now() - startTime,
                success
            });
        }
    }
}
//# sourceMappingURL=performance.js.map