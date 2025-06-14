import { EventEmitter } from 'events';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { PerformanceMonitor } from '../monitoring/PerformanceMonitor.js';
interface LearningInsights {
    overall_performance: Record<string, any>;
    task_type_analysis: Record<string, any>;
    improvement_areas: string[];
    recommendations: string[];
}
export declare class LearningIntegration extends EventEmitter {
    private ws;
    private reconnectTimer;
    private taskTracking;
    private feedbackBuffer;
    private insights;
    private performanceMonitor;
    private dataDir;
    constructor(performanceMonitor: PerformanceMonitor);
    private ensureDataDirectories;
    connect(host?: string, port?: number): void;
    private scheduleReconnect;
    private send;
    private handleLearningMessage;
    private handlePredictionResponse;
    private handleLearningInsights;
    private handleModelUpdate;
    trackTaskStart(taskId: string, task: any, context?: any): void;
    trackTaskComplete(taskId: string, success: boolean, actualComplexity?: string, teamsUsed?: string[]): void;
    private calculatePerformanceScore;
    requestPrediction(task: any, context?: any): Promise<any>;
    getInsights(): LearningInsights | null;
    getTaskPredictions(taskId: string): any;
    enhanceToolWithLearning(tool: Tool, args: any): Promise<any>;
    recordToolResult(toolName: string, success: boolean, duration: number): void;
    getPerformanceReport(): any;
    disconnect(): void;
}
export declare function initializeLearningIntegration(performanceMonitor: PerformanceMonitor): LearningIntegration;
export declare function getLearningIntegration(): LearningIntegration | null;
export {};
//# sourceMappingURL=LearningIntegration.d.ts.map