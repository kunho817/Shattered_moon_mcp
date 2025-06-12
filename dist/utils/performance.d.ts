import { EventEmitter } from 'events';
export interface PerformanceMetric {
    tool: string;
    operation: string;
    duration: number;
    success: boolean;
    timestamp: Date;
    metadata?: any;
}
export interface PerformanceStats {
    tool: string;
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    averageDuration: number;
    p95Duration: number;
    p99Duration: number;
    lastHourCalls: number;
    trend: 'improving' | 'stable' | 'degrading';
}
export declare class PerformanceMonitor extends EventEmitter {
    private metrics;
    private stats;
    private cleanupInterval;
    initialize(): Promise<void>;
    recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void;
    private updateStats;
    private calculateTrend;
    getStats(tool?: string): PerformanceStats | PerformanceStats[];
    getOverallStats(): {
        totalOperations: number;
        successRate: number;
        averageDuration: number;
        toolsMonitored: number;
    };
    getTrends(hours?: number): Map<string, number[]>;
    generateRecommendations(): string[];
    private cleanupOldMetrics;
    shutdown(): Promise<void>;
    measure<T>(tool: string, operation: string, fn: () => Promise<T>): Promise<T>;
}
//# sourceMappingURL=performance.d.ts.map