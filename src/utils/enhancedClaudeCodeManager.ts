import { claudeCodeInvoker, ClaudeCodeResponse } from './claudeCodeInvoker.js';
import { claudeCodePerformanceMonitor } from './claudeCodePerformanceMonitor.js';
import logger from './logger.js';

export interface BatchRequest {
  id: string;
  prompt: string;
  context?: string;
  priority: 'high' | 'medium' | 'low';
  model?: 'opus' | 'sonnet';
  cacheKey?: string;
}

export interface EnhancedContext {
  taskId?: string;
  teamStates?: Map<string, any>;
  specialistStates?: Map<string, any>;
  historicalPatterns?: any[];
  currentMetrics?: any;
  timestamp?: Date;
  sessionId?: string;
}

export interface AIAnalysisResult {
  success: boolean;
  data: any;
  analysis?: string;
  response?: string;
  cacheHit: boolean;
  duration: number;
  modelUsed: 'opus' | 'sonnet';
}

export class EnhancedClaudeCodeManager {
  private static instance: EnhancedClaudeCodeManager;
  private requestQueue: BatchRequest[] = [];
  private contextCache = new Map<string, any>();
  private analysisCache = new Map<string, AIAnalysisResult>();
  private batchProcessor: NodeJS.Timeout | null = null;
  
  // Performance thresholds (dynamically adjusted)
  private performanceThresholds = {
    successRate: 0.90,
    responseTime: 15000, // 15 seconds
    cacheHitTarget: 0.30, // 30% cache hit rate
    batchSize: 5,
    batchInterval: 2000 // 2 seconds
  };

  static getInstance(): EnhancedClaudeCodeManager {
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
   * Enhanced AI analysis with caching and context awareness
   */
  async performEnhancedAnalysis(
    prompt: string,
    context: EnhancedContext,
    options: {
      priority?: 'high' | 'medium' | 'low';
      forceRefresh?: boolean;
      timeout?: number;
    } = {}
  ): Promise<AIAnalysisResult> {
    const startTime = Date.now();

    // Generate cache key based on prompt and context
    const cacheKey = this.generateCacheKey(prompt, context);
    
    // Check cache first (unless force refresh)
    if (!options.forceRefresh && this.analysisCache.has(cacheKey)) {
      const cached = this.analysisCache.get(cacheKey)!;
      logger.info('Enhanced analysis cache hit', { cacheKey: cacheKey.substring(0, 20) });
      
      claudeCodePerformanceMonitor.recordRequest(
        cached.modelUsed,
        { success: true, duration: Date.now() - startTime, output: 'cached' },
        'enhanced_analysis',
        0.95 // High quality score for cache hits
      );

      return {
        ...cached,
        cacheHit: true,
        duration: Date.now() - startTime
      };
    }

    try {
      // Enhance prompt with context
      const enhancedPrompt = this.enhancePromptWithContext(prompt, context);
      
      // Classify and route to appropriate model
      const classification = claudeCodeInvoker.classifyTask(enhancedPrompt, context.taskId);
      const response = await claudeCodeInvoker.invoke(enhancedPrompt, {
        model: classification.suggestedModel,
        timeout: options.timeout || 20000
      });

      const result: AIAnalysisResult = {
        success: response.success,
        data: response.success ? this.parseAIResponse(response.output) : null,
        analysis: response.output,
        response: response.output,
        cacheHit: false,
        duration: Date.now() - startTime,
        modelUsed: classification.suggestedModel
      };

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
      claudeCodePerformanceMonitor.recordRequest(
        classification.suggestedModel,
        response,
        'enhanced_analysis',
        result.success ? 0.9 : 0.3
      );

      return result;

    } catch (error) {
      logger.error('Enhanced analysis failed', { error, cacheKey });
      
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
  async queueBatchRequest(request: BatchRequest): Promise<string> {
    const requestId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.requestQueue.push({
      ...request,
      id: requestId
    });

    logger.info('AI request queued for batch processing', { 
      requestId, 
      queueSize: this.requestQueue.length,
      priority: request.priority 
    });

    return requestId;
  }

  /**
   * Get result of batch request
   */
  async getBatchResult(requestId: string, timeout: number = 30000): Promise<AIAnalysisResult | null> {
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
  async analyzeDistributedTask(
    taskDescription: string,
    teams: string[],
    complexity?: string,
    priority?: number
  ): Promise<{
    complexity: string;
    suggestedTeams: string[];
    estimatedDuration: number;
    riskFactors: string[];
    successProbability: number;
    optimizations: string[];
  }> {
    const context: EnhancedContext = {
      taskId: `dist_${Date.now()}`,
      teamStates: await this.getTeamStates(teams),
      specialistStates: new Map(),
      historicalPatterns: await this.getHistoricalPatterns('distributed_task'),
      currentMetrics: claudeCodePerformanceMonitor.getPerformanceMetrics(1)
    };

    const prompt = `Analyze this distributed task with enhanced context:

Task: "${taskDescription}"
Requested Teams: ${teams.join(', ')}
Suggested Complexity: ${complexity || 'auto'}
Priority: ${priority || 5}/10

Historical Patterns:
${context.historicalPatterns.slice(0, 3).map(p => `- ${p.description}: ${p.successRate}% success`).join('\n')}

Current Team States:
${Array.from(context.teamStates.entries()).map(([team, state]) => 
  `- ${team}: ${state.utilization}% utilized, ${state.activeTasks} active tasks`
).join('\n')}

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

  private startBatchProcessor(): void {
    this.batchProcessor = setInterval(async () => {
      if (this.requestQueue.length === 0) return;

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

  private async processBatch(batch: BatchRequest[]): Promise<void> {
    logger.info('Processing AI request batch', { batchSize: batch.length });

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
    } else {
      for (const request of others) {
        await this.processSingleRequest(request);
      }
    }
  }

  private async processSingleRequest(request: BatchRequest): Promise<void> {
    try {
      const response = await claudeCodeInvoker.invoke(request.prompt, {
        model: request.model,
        timeout: 20000
      });

      const result: AIAnalysisResult = {
        success: response.success,
        data: response.success ? this.parseAIResponse(response.output) : null,
        cacheHit: false,
        duration: response.duration,
        modelUsed: request.model || 'sonnet'
      };

      // Cache with request ID
      this.analysisCache.set(request.id, result);

    } catch (error) {
      logger.error('Batch request processing failed', { requestId: request.id, error });
    }
  }

  private async processBatchedRequests(requests: BatchRequest[]): Promise<void> {
    // Combine prompts for batch processing
    const combinedPrompt = `Process multiple AI requests:

${requests.map((req, index) => `
Request ${index + 1} (ID: ${req.id}):
${req.prompt}
---`).join('\n')}

Respond with JSON array containing results for each request.`;

    try {
      const response = await claudeCodeInvoker.invokeExecution(combinedPrompt, {
        timeout: 30000
      });

      if (response.success) {
        const results = this.parseBatchResponse(response.output, requests);
        results.forEach((result, index) => {
          this.analysisCache.set(requests[index].id, result);
        });
      }

    } catch (error) {
      logger.error('Batch processing failed, falling back to individual requests', { error });
      
      // Fallback to individual processing
      for (const request of requests) {
        await this.processSingleRequest(request);
      }
    }
  }

  private startPerformanceMonitoring(): void {
    setInterval(async () => {
      const metrics = claudeCodePerformanceMonitor.getPerformanceMetrics(0.5); // Last 30 minutes
      
      // Adjust thresholds based on performance
      if (metrics.successRate < this.performanceThresholds.successRate) {
        this.performanceThresholds.batchSize = Math.max(1, this.performanceThresholds.batchSize - 1);
        this.performanceThresholds.batchInterval += 500;
      } else if (metrics.successRate > 0.95) {
        this.performanceThresholds.batchSize = Math.min(10, this.performanceThresholds.batchSize + 1);
        this.performanceThresholds.batchInterval = Math.max(1000, this.performanceThresholds.batchInterval - 200);
      }

      // Cache cleanup if hit rate is too low
      if (metrics.cacheHitRate < 0.1 && this.analysisCache.size > 100) {
        const entriesToRemove = Array.from(this.analysisCache.keys()).slice(0, 50);
        entriesToRemove.forEach(key => this.analysisCache.delete(key));
        logger.info('Cache cleanup performed', { removedEntries: entriesToRemove.length });
      }

      logger.debug('Performance thresholds adjusted', this.performanceThresholds);
    }, 300000); // Every 5 minutes
  }

  private enhancePromptWithContext(prompt: string, context: EnhancedContext): string {
    return `${prompt}

ENHANCED CONTEXT:
- Task ID: ${context.taskId}
- Active Teams: ${context.teamStates.size}
- Historical Success Rate: ${this.calculateHistoricalSuccessRate(context.historicalPatterns)}%
- Current System Load: ${this.calculateSystemLoad(context.currentMetrics)}

Consider this context when providing analysis.`;
  }

  private generateCacheKey(prompt: string, context: EnhancedContext): string {
    const promptHash = prompt.substring(0, 50);
    const contextHash = `${context.teamStates.size}_${context.specialistStates.size}`;
    return `${promptHash}_${contextHash}`;
  }

  private parseAIResponse(output: string): any {
    try {
      return JSON.parse(output);
    } catch {
      // Fallback parsing for non-JSON responses
      return { content: output, parsed: false };
    }
  }

  private parseBatchResponse(output: string, requests: BatchRequest[]): AIAnalysisResult[] {
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
    } catch {
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

  private async getTeamStates(teams: string[]): Promise<Map<string, any>> {
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

  private async getHistoricalPatterns(type: string): Promise<any[]> {
    // This would integrate with historical data storage
    return [
      { description: `${type}_high_complexity`, successRate: 85 },
      { description: `${type}_multi_team`, successRate: 78 },
      { description: `${type}_standard`, successRate: 92 }
    ];
  }

  private calculateHistoricalSuccessRate(patterns: any[]): number {
    if (patterns.length === 0) return 80;
    return patterns.reduce((sum, p) => sum + p.successRate, 0) / patterns.length;
  }

  private calculateSystemLoad(metrics: any): string {
    const load = (metrics.totalRequests || 0) / 100; // Normalize
    if (load < 0.3) return 'low';
    if (load < 0.7) return 'medium';
    return 'high';
  }

  /**
   * Clear all caches and reset
   */
  public reset(): void {
    this.analysisCache.clear();
    this.contextCache.clear();
    this.requestQueue = [];
    logger.info('Enhanced Claude Code Manager reset');
  }

  /**
   * Get performance statistics
   */
  public getStats(): {
    cacheSize: number;
    queueSize: number;
    cacheHitRate: number;
    thresholds: typeof this.performanceThresholds;
  } {
    const totalRequests = this.analysisCache.size;
    const cacheHits = Array.from(this.analysisCache.values()).filter(r => r.cacheHit).length;
    
    return {
      cacheSize: this.analysisCache.size,
      queueSize: this.requestQueue.length,
      cacheHitRate: totalRequests > 0 ? cacheHits / totalRequests : 0,
      thresholds: { ...this.performanceThresholds }
    };
  }
}

// Export singleton instance
export const enhancedClaudeCodeManager = EnhancedClaudeCodeManager.getInstance();