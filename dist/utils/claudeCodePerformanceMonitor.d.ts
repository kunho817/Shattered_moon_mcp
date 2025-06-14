import { ClaudeCodeResponse } from './claudeCodeInvoker.js';
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
export declare class ClaudeCodePerformanceMonitor {
    private static instance;
    private requestHistory;
    private alerts;
    private readonly MAX_HISTORY;
    private readonly PERFORMANCE_THRESHOLDS;
    static getInstance(): ClaudeCodePerformanceMonitor;
    /**
     * Records a Claude Code request for performance tracking
     */
    recordRequest(model: 'opus' | 'sonnet', response: ClaudeCodeResponse, classification?: string, qualityScore?: number): void;
    /**
     * Gets comprehensive performance metrics
     */
    getPerformanceMetrics(timeRangeHours?: number): PerformanceMetrics;
    /**
     * Gets model-specific usage statistics
     */
    getModelUsageStats(timeRangeHours?: number): ModelUsageStats;
    /**
     * Gets performance recommendations based on current metrics
     */
    getPerformanceRecommendations(): Promise<string[]>;
    /**
     * Gets current performance alerts
     */
    getAlerts(severityFilter?: 'warning' | 'error' | 'info'): PerformanceAlert[];
    /**
     * Clears old alerts
     */
    clearOldAlerts(maxAgeHours?: number): void;
    /**
     * Gets performance trend analysis
     */
    getTrendAnalysis(timeRangeHours?: number): {
        trend: 'improving' | 'stable' | 'degrading';
        confidence: number;
        details: string;
    };
    private checkPerformanceAlerts;
    private addAlert;
    /**
     * Resets all performance data
     */
    reset(): void;
}
export declare const claudeCodePerformanceMonitor: ClaudeCodePerformanceMonitor;
//# sourceMappingURL=claudeCodePerformanceMonitor.d.ts.map