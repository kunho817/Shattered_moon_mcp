export interface BatchRequest {
    id: string;
    prompt: string;
    context?: string;
    priority: 'high' | 'medium' | 'low';
    model?: 'opus' | 'sonnet';
    cacheKey?: string;
}
export interface EnhancedContext {
    taskId: string;
    teamStates: Map<string, any>;
    specialistStates: Map<string, any>;
    historicalPatterns: any[];
    currentMetrics: any;
}
export interface AIAnalysisResult {
    success: boolean;
    data: any;
    cacheHit: boolean;
    duration: number;
    modelUsed: 'opus' | 'sonnet';
}
export declare class EnhancedClaudeCodeManager {
    private static instance;
    private requestQueue;
    private contextCache;
    private analysisCache;
    private batchProcessor;
    private performanceThresholds;
    static getInstance(): EnhancedClaudeCodeManager;
    constructor();
    /**
     * Enhanced AI analysis with caching and context awareness
     */
    performEnhancedAnalysis(prompt: string, context: EnhancedContext, options?: {
        priority?: 'high' | 'medium' | 'low';
        forceRefresh?: boolean;
        timeout?: number;
    }): Promise<AIAnalysisResult>;
    /**
     * Batch processing for multiple AI requests
     */
    queueBatchRequest(request: BatchRequest): Promise<string>;
    /**
     * Get result of batch request
     */
    getBatchResult(requestId: string, timeout?: number): Promise<AIAnalysisResult | null>;
    /**
     * Context-aware analysis for distributed tasks
     */
    analyzeDistributedTask(taskDescription: string, teams: string[], complexity?: string, priority?: number): Promise<{
        complexity: string;
        suggestedTeams: string[];
        estimatedDuration: number;
        riskFactors: string[];
        successProbability: number;
        optimizations: string[];
    }>;
    private startBatchProcessor;
    private processBatch;
    private processSingleRequest;
    private processBatchedRequests;
    private startPerformanceMonitoring;
    private enhancePromptWithContext;
    private generateCacheKey;
    private parseAIResponse;
    private parseBatchResponse;
    private getTeamStates;
    private getHistoricalPatterns;
    private calculateHistoricalSuccessRate;
    private calculateSystemLoad;
    /**
     * Clear all caches and reset
     */
    reset(): void;
    /**
     * Get performance statistics
     */
    getStats(): {
        cacheSize: number;
        queueSize: number;
        cacheHitRate: number;
        thresholds: typeof this.performanceThresholds;
    };
}
export declare const enhancedClaudeCodeManager: EnhancedClaudeCodeManager;
//# sourceMappingURL=enhancedClaudeCodeManager.d.ts.map