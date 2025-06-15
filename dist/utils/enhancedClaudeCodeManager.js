"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enhancedClaudeCodeManager = exports.EnhancedClaudeCodeManager = void 0;
const claudeCodeInvoker_js_1 = require("./claudeCodeInvoker.js");
const claudeCodePerformanceMonitor_js_1 = require("./claudeCodePerformanceMonitor.js");
const logger_js_1 = __importDefault(require("./logger.js"));
class EnhancedClaudeCodeManager {
    static instance;
    requestQueue = [];
    contextCache = new Map();
    analysisCache = new Map();
    batchProcessor = null;
    // Performance thresholds (dynamically adjusted)
    performanceThresholds = {
        successRate: 0.90,
        responseTime: 15000, // 15 seconds
        cacheHitTarget: 0.30, // 30% cache hit rate
        batchSize: 5,
        batchInterval: 2000 // 2 seconds
    };
    static getInstance() {
        if (!EnhancedClaudeCodeManager.instance) {
            EnhancedClaudeCodeManager.instance = new EnhancedClaudeCodeManager();
        }
        return EnhancedClaudeCodeManager.instance;
    }
    constructor() {
        this.startBatchProcessor();
        this.startPerformanceMonitoring();
    }
    /**
     * Simple AI analysis with model preference (backward compatibility)
     */
    async analyzeWithModel(prompt, model = 'opus') {
        return this.performEnhancedAnalysis(prompt, {}, {
            priority: 'medium',
            useCache: true
        });
    }
    /**
     * Enhanced AI analysis with caching and context awareness
     */
    async performEnhancedAnalysis(prompt, context, options = {}) {
        const startTime = Date.now();
        // Generate cache key based on prompt and context
        const cacheKey = this.generateCacheKey(prompt, context);
        // Check cache first (unless force refresh)
        if (!options.forceRefresh && this.analysisCache.has(cacheKey)) {
            const cached = this.analysisCache.get(cacheKey);
            logger_js_1.default.info('Enhanced analysis cache hit', { cacheKey: cacheKey.substring(0, 20) });
            claudeCodePerformanceMonitor_js_1.claudeCodePerformanceMonitor.recordRequest(cached.modelUsed, { success: true, duration: Date.now() - startTime, output: 'cached' }, 'enhanced_analysis', 0.95 // High quality score for cache hits
            );
            return {
                ...cached,
                cacheHit: true,
                duration: Date.now() - startTime
            };
        }
        try {
            // Enhanced context-aware prompt
            const enhancedPrompt = this.enhancePromptWithContext(prompt, context);
            // Classify and route to appropriate model
            const classification = claudeCodeInvoker_js_1.claudeCodeInvoker.classifyTask(enhancedPrompt, context.taskId);
            // Implement retry mechanism with exponential backoff
            const maxRetries = options.retryAttempts || 3;
            let lastError = null;
            let result = null;
            for (let attempt = 0; attempt < maxRetries; attempt++) {
                try {
                    logger_js_1.default.info(`Enhanced analysis attempt ${attempt + 1}/${maxRetries}`, {
                        model: classification.suggestedModel,
                        timeout: options.timeout || 30000
                    });
                    // Increased timeout with retry attempts
                    const timeoutMs = (options.timeout || 30000) + (attempt * 10000);
                    const response = await Promise.race([
                        claudeCodeInvoker_js_1.claudeCodeInvoker.invoke(enhancedPrompt, {
                            model: classification.suggestedModel,
                            timeout: timeoutMs
                        }),
                        new Promise((_, reject) => setTimeout(() => reject(new Error(`Analysis timeout after ${timeoutMs}ms`)), timeoutMs))
                    ]);
                    // Validate response completeness
                    if (!response.success || !response.output || response.output.trim().length < 10) {
                        throw new Error(`Incomplete response: ${response.output?.substring(0, 100)}...`);
                    }
                    result = {
                        success: response.success,
                        data: response.success ? this.parseAIResponse(response.output) : null,
                        analysis: response.output,
                        response: response.output,
                        cacheHit: false,
                        duration: Date.now() - startTime,
                        modelUsed: classification.suggestedModel
                    };
                    // Success - exit retry loop
                    logger_js_1.default.info('Enhanced analysis completed successfully', {
                        attempt: attempt + 1,
                        duration: result.duration
                    });
                    break;
                }
                catch (error) {
                    lastError = error;
                    logger_js_1.default.warn(`Analysis attempt ${attempt + 1} failed`, {
                        error: lastError.message,
                        willRetry: attempt < maxRetries - 1
                    });
                    if (attempt < maxRetries - 1) {
                        // Wait before retry with exponential backoff
                        const waitTime = Math.pow(2, attempt) * 1000;
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                    }
                }
            }
            // If no successful result, create failure result
            if (!result) {
                result = {
                    success: false,
                    data: null,
                    analysis: `Analysis failed after ${maxRetries} attempts: ${lastError?.message}`,
                    response: `Analysis failed after ${maxRetries} attempts: ${lastError?.message}`,
                    cacheHit: false,
                    duration: Date.now() - startTime,
                    modelUsed: classification.suggestedModel
                };
            }
            // Cache successful results
            if (result.success) {
                this.analysisCache.set(cacheKey, {
                    ...result,
                    cacheHit: false
                });
                // Auto-cleanup cache after 10 minutes
                setTimeout(() => this.analysisCache.delete(cacheKey), 600000);
            }
            // Record performance
            claudeCodePerformanceMonitor_js_1.claudeCodePerformanceMonitor.recordRequest(classification.suggestedModel, { response: result.response || 'No response', status: 'success' }, 'enhanced_analysis', result.success ? 0.9 : 0.3);
            return result;
        }
        catch (error) {
            logger_js_1.default.error('Enhanced analysis failed', { error, cacheKey });
            return {
                success: false,
                data: null,
                cacheHit: false,
                duration: Date.now() - startTime,
                modelUsed: 'sonnet'
            };
        }
    }
    /**
     * Batch processing for multiple AI requests
     */
    async queueBatchRequest(request) {
        const requestId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.requestQueue.push({
            ...request,
            id: requestId
        });
        logger_js_1.default.info('AI request queued for batch processing', {
            requestId,
            queueSize: this.requestQueue.length,
            priority: request.priority
        });
        return requestId;
    }
    /**
     * Get result of batch request
     */
    async getBatchResult(requestId, timeout = 30000) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            const cached = Array.from(this.analysisCache.entries())
                .find(([key, _]) => key.includes(requestId));
            if (cached) {
                return cached[1];
            }
            // Wait before checking again
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        return null; // Timeout
    }
    /**
     * Context-aware analysis for distributed tasks
     */
    async analyzeDistributedTask(taskDescription, teams, complexity, priority) {
        const context = {
            taskId: `dist_${Date.now()}`,
            teamStates: await this.getTeamStates(teams),
            specialistStates: new Map(),
            historicalPatterns: await this.getHistoricalPatterns('distributed_task'),
            currentMetrics: claudeCodePerformanceMonitor_js_1.claudeCodePerformanceMonitor.getPerformanceMetrics(1)
        };
        const prompt = `Analyze this distributed task with enhanced context:

Task: "${taskDescription}"
Requested Teams: ${teams.join(', ')}
Suggested Complexity: ${complexity || 'auto'}
Priority: ${priority || 5}/10

Historical Patterns:
${context.historicalPatterns?.slice(0, 3).map(p => `- ${p.description}: ${p.successRate}% success`).join('\n') || 'No historical patterns available'}

Current Team States:
${context.teamStates ? Array.from(context.teamStates.entries()).map(([team, state]) => `- ${team}: ${state.utilization}% utilized, ${state.activeTasks} active tasks`).join('\n') : 'No team states available'}

Current System Performance:
- Success Rate: ${Math.round(context.currentMetrics.successRate * 100)}%
- Average Response Time: ${Math.round(context.currentMetrics.averageResponseTime)}ms
- Recent Quality Score: ${Math.round(context.currentMetrics.qualityScore * 100)}%

Provide comprehensive analysis in JSON format with keys:
complexity, suggestedTeams, estimatedDuration, riskFactors, successProbability, optimizations`;
        const result = await this.performEnhancedAnalysis(prompt, context, {
            priority: 'high',
            timeout: 25000
        });
        if (result.success && result.data) {
            return result.data;
        }
        // Fallback analysis
        return {
            complexity: complexity || 'medium',
            suggestedTeams: teams.length > 0 ? teams : ['Planning'],
            estimatedDuration: 60,
            riskFactors: ['Analysis system unavailable'],
            successProbability: 0.7,
            optimizations: ['Manual review recommended']
        };
    }
    startBatchProcessor() {
        this.batchProcessor = setInterval(async () => {
            if (this.requestQueue.length === 0)
                return;
            // Sort by priority and take batch
            this.requestQueue.sort((a, b) => {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            });
            const batch = this.requestQueue.splice(0, this.performanceThresholds.batchSize);
            if (batch.length > 0) {
                await this.processBatch(batch);
            }
        }, this.performanceThresholds.batchInterval);
    }
    async processBatch(batch) {
        logger_js_1.default.info('Processing AI request batch', { batchSize: batch.length });
        // Process high priority requests individually
        const highPriority = batch.filter(r => r.priority === 'high');
        const others = batch.filter(r => r.priority !== 'high');
        // Process high priority immediately
        for (const request of highPriority) {
            await this.processSingleRequest(request);
        }
        // Batch process others if possible
        if (others.length > 1) {
            await this.processBatchedRequests(others);
        }
        else {
            for (const request of others) {
                await this.processSingleRequest(request);
            }
        }
    }
    async processSingleRequest(request) {
        try {
            const response = await claudeCodeInvoker_js_1.claudeCodeInvoker.invoke(request.prompt, {
                model: request.model,
                timeout: 20000
            });
            const result = {
                success: response.success,
                data: response.success ? this.parseAIResponse(response.output) : null,
                cacheHit: false,
                duration: response.duration,
                modelUsed: request.model || 'sonnet'
            };
            // Cache with request ID
            this.analysisCache.set(request.id, result);
        }
        catch (error) {
            logger_js_1.default.error('Batch request processing failed', { requestId: request.id, error });
        }
    }
    async processBatchedRequests(requests) {
        // Combine prompts for batch processing
        const combinedPrompt = `Process multiple AI requests:

${requests.map((req, index) => `
Request ${index + 1} (ID: ${req.id}):
${req.prompt}
---`).join('\n')}

Respond with JSON array containing results for each request.`;
        try {
            const response = await claudeCodeInvoker_js_1.claudeCodeInvoker.invokeExecution(combinedPrompt, {
                timeout: 30000
            });
            if (response.success) {
                const results = this.parseBatchResponse(response.output, requests);
                results.forEach((result, index) => {
                    this.analysisCache.set(requests[index].id, result);
                });
            }
        }
        catch (error) {
            logger_js_1.default.error('Batch processing failed, falling back to individual requests', { error });
            // Fallback to individual processing
            for (const request of requests) {
                await this.processSingleRequest(request);
            }
        }
    }
    startPerformanceMonitoring() {
        setInterval(async () => {
            const metrics = claudeCodePerformanceMonitor_js_1.claudeCodePerformanceMonitor.getPerformanceMetrics(0.5); // Last 30 minutes
            // Adjust thresholds based on performance
            if (metrics.successRate < this.performanceThresholds.successRate) {
                this.performanceThresholds.batchSize = Math.max(1, this.performanceThresholds.batchSize - 1);
                this.performanceThresholds.batchInterval += 500;
            }
            else if (metrics.successRate > 0.95) {
                this.performanceThresholds.batchSize = Math.min(10, this.performanceThresholds.batchSize + 1);
                this.performanceThresholds.batchInterval = Math.max(1000, this.performanceThresholds.batchInterval - 200);
            }
            // Cache cleanup if hit rate is too low
            if (metrics.cacheHitRate < 0.1 && this.analysisCache.size > 100) {
                const entriesToRemove = Array.from(this.analysisCache.keys()).slice(0, 50);
                entriesToRemove.forEach(key => this.analysisCache.delete(key));
                logger_js_1.default.info('Cache cleanup performed', { removedEntries: entriesToRemove.length });
            }
            logger_js_1.default.debug('Performance thresholds adjusted', this.performanceThresholds);
        }, 300000); // Every 5 minutes
    }
    enhancePromptWithContext(prompt, context) {
        return `${prompt}

ENHANCED CONTEXT:
- Task ID: ${context.taskId}
- Active Teams: ${context.teamStates?.size || 0}
- Historical Success Rate: ${this.calculateHistoricalSuccessRate(context.historicalPatterns || [])}%
- Current System Load: ${this.calculateSystemLoad(context.currentMetrics)}

Consider this context when providing analysis.`;
    }
    generateCacheKey(prompt, context) {
        const promptHash = prompt.substring(0, 50);
        const contextHash = `${context.teamStates?.size || 0}_${context.specialistStates?.size || 0}`;
        return `${promptHash}_${contextHash}`;
    }
    parseAIResponse(output) {
        try {
            return JSON.parse(output);
        }
        catch {
            // Fallback parsing for non-JSON responses
            return { content: output, parsed: false };
        }
    }
    parseBatchResponse(output, requests) {
        try {
            const parsed = JSON.parse(output);
            if (Array.isArray(parsed)) {
                return parsed.map((result, index) => ({
                    success: true,
                    data: result,
                    cacheHit: false,
                    duration: 0,
                    modelUsed: requests[index].model || 'sonnet'
                }));
            }
        }
        catch {
            // Fallback
        }
        return requests.map(() => ({
            success: false,
            data: null,
            cacheHit: false,
            duration: 0,
            modelUsed: 'sonnet'
        }));
    }
    async getTeamStates(teams) {
        // This would integrate with actual team state management
        const states = new Map();
        teams.forEach(team => {
            states.set(team, {
                utilization: Math.random() * 0.8, // Placeholder
                activeTasks: Math.floor(Math.random() * 5),
                performance: 0.8 + Math.random() * 0.2
            });
        });
        return states;
    }
    async getHistoricalPatterns(type) {
        // This would integrate with historical data storage
        return [
            { description: `${type}_high_complexity`, successRate: 85 },
            { description: `${type}_multi_team`, successRate: 78 },
            { description: `${type}_standard`, successRate: 92 }
        ];
    }
    calculateHistoricalSuccessRate(patterns) {
        if (patterns.length === 0)
            return 80;
        return patterns.reduce((sum, p) => sum + p.successRate, 0) / patterns.length;
    }
    calculateSystemLoad(metrics) {
        const load = (metrics.totalRequests || 0) / 100; // Normalize
        if (load < 0.3)
            return 'low';
        if (load < 0.7)
            return 'medium';
        return 'high';
    }
    /**
     * Clear all caches and reset
     */
    reset() {
        this.analysisCache.clear();
        this.contextCache.clear();
        this.requestQueue = [];
        logger_js_1.default.info('Enhanced Claude Code Manager reset');
    }
    /**
     * Get performance statistics
     */
    getStats() {
        const totalRequests = this.analysisCache.size;
        const cacheHits = Array.from(this.analysisCache.values()).filter(r => r.cacheHit).length;
        return {
            cacheSize: this.analysisCache.size,
            queueSize: this.requestQueue.length,
            cacheHitRate: totalRequests > 0 ? cacheHits / totalRequests : 0,
            thresholds: {
                responseTime: this.performanceThresholds.responseTime,
                cacheHitRate: this.performanceThresholds.cacheHitTarget,
                errorRate: 0.1 // 10% error rate threshold
            }
        };
    }
}
exports.EnhancedClaudeCodeManager = EnhancedClaudeCodeManager;
// Export singleton instance
exports.enhancedClaudeCodeManager = EnhancedClaudeCodeManager.getInstance();
//# sourceMappingURL=enhancedClaudeCodeManager.js.map