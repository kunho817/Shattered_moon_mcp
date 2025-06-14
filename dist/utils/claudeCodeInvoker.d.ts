export interface ClaudeCodeOptions {
    model?: 'opus' | 'sonnet';
    files?: string[];
    system?: string;
    timeout?: number;
}
export interface ClaudeCodeResponse {
    success: boolean;
    output: string;
    error?: string;
    duration: number;
}
export interface TaskClassification {
    isPlanningTask: boolean;
    complexity: 'low' | 'medium' | 'high' | 'critical';
    suggestedModel: 'opus' | 'sonnet';
    confidence: number;
}
export declare class ClaudeCodeInvoker {
    private static instance;
    private requestCount;
    private cache;
    private readonly CACHE_TTL;
    static getInstance(): ClaudeCodeInvoker;
    /**
     * Classifies a task to determine if it should use Opus (planning) or Sonnet (execution)
     */
    classifyTask(description: string, context?: string): TaskClassification;
    /**
     * Invokes Claude Code with the specified prompt and options
     */
    invoke(prompt: string, options?: ClaudeCodeOptions): Promise<ClaudeCodeResponse>;
    /**
     * Convenience method for planning tasks (uses Opus)
     */
    invokePlanning(prompt: string, options?: Omit<ClaudeCodeOptions, 'model'>): Promise<ClaudeCodeResponse>;
    /**
     * Convenience method for execution tasks (uses Sonnet)
     */
    invokeExecution(prompt: string, options?: Omit<ClaudeCodeOptions, 'model'>): Promise<ClaudeCodeResponse>;
    /**
     * Smart invoke that automatically selects the best model based on task classification
     */
    invokeAuto(prompt: string, context?: string, options?: Omit<ClaudeCodeOptions, 'model'>): Promise<ClaudeCodeResponse>;
    private buildClaudeArgs;
    private executeClaudeCommand;
    private generateCacheKey;
    /**
     * Clears the cache manually
     */
    clearCache(): void;
    /**
     * Returns cache statistics
     */
    getCacheStats(): {
        size: number;
        hitRate: number;
    };
}
export declare const claudeCodeInvoker: ClaudeCodeInvoker;
//# sourceMappingURL=claudeCodeInvoker.d.ts.map