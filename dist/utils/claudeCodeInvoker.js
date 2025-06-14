"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.claudeCodeInvoker = exports.ClaudeCodeInvoker = void 0;
const child_process_1 = require("child_process");
const logger_js_1 = __importDefault(require("./logger.js"));
class ClaudeCodeInvoker {
    static instance;
    requestCount = 0;
    cache = new Map();
    CACHE_TTL = 300000; // 5 minutes
    static getInstance() {
        if (!ClaudeCodeInvoker.instance) {
            ClaudeCodeInvoker.instance = new ClaudeCodeInvoker();
        }
        return ClaudeCodeInvoker.instance;
    }
    /**
     * Classifies a task to determine if it should use Opus (planning) or Sonnet (execution)
     */
    classifyTask(description, context) {
        const text = `${description} ${context || ''}`.toLowerCase();
        // Planning keywords that require Opus
        const planningKeywords = [
            'design', 'architecture', 'strategy', 'planning', 'plan',
            'roadmap', 'approach', 'methodology', 'framework',
            'concept', 'vision', 'direction', 'blueprint',
            'structure', 'organize', 'coordinate', 'workflow',
            'process', 'scheme', 'layout', 'outline'
        ];
        // Execution keywords that can use Sonnet
        const executionKeywords = [
            'implement', 'code', 'build', 'create', 'develop',
            'fix', 'update', 'modify', 'test', 'debug',
            'optimize', 'refactor', 'deploy', 'install',
            'configure', 'setup', 'run', 'execute'
        ];
        // Complexity indicators
        const complexityKeywords = {
            critical: ['critical', 'urgent', 'emergency', 'blocker', 'major'],
            high: ['complex', 'advanced', 'sophisticated', 'comprehensive', 'extensive'],
            medium: ['moderate', 'standard', 'regular', 'typical'],
            low: ['simple', 'basic', 'minor', 'small', 'quick']
        };
        let planningScore = 0;
        let executionScore = 0;
        let complexity = 'medium';
        // Calculate planning vs execution scores
        planningKeywords.forEach(keyword => {
            if (text.includes(keyword))
                planningScore++;
        });
        executionKeywords.forEach(keyword => {
            if (text.includes(keyword))
                executionScore++;
        });
        // Determine complexity
        for (const [level, keywords] of Object.entries(complexityKeywords)) {
            if (keywords.some(keyword => text.includes(keyword))) {
                complexity = level;
                break;
            }
        }
        // Determine if it's a planning task
        const isPlanningTask = planningScore > executionScore ||
            planningScore > 0 && executionScore === 0 ||
            complexity === 'critical';
        // Suggest model based on classification
        const suggestedModel = isPlanningTask ? 'opus' : 'sonnet';
        // Calculate confidence based on keyword matches and clarity
        const totalKeywords = planningScore + executionScore;
        const confidence = totalKeywords > 0 ?
            Math.max(planningScore, executionScore) / totalKeywords : 0.5;
        return {
            isPlanningTask,
            complexity,
            suggestedModel,
            confidence: Math.min(1.0, Math.max(0.3, confidence + 0.2))
        };
    }
    /**
     * Invokes Claude Code with the specified prompt and options
     */
    async invoke(prompt, options = {}) {
        const startTime = Date.now();
        this.requestCount++;
        // Generate cache key
        const cacheKey = this.generateCacheKey(prompt, options);
        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            logger_js_1.default.info('Claude Code cache hit', {
                requestId: this.requestCount,
                cacheKey: cacheKey.substring(0, 20) + '...'
            });
            return cached;
        }
        try {
            logger_js_1.default.info('Invoking Claude Code', {
                requestId: this.requestCount,
                model: options.model || 'auto',
                prompt: prompt.substring(0, 100) + '...'
            });
            const args = this.buildClaudeArgs(prompt, options);
            const response = await this.executeClaudeCommand(args, options.timeout || 30000);
            const result = {
                success: response.success,
                output: response.output,
                error: response.error,
                duration: Date.now() - startTime
            };
            // Cache successful responses
            if (result.success) {
                this.cache.set(cacheKey, result);
                // Auto-cleanup cache after TTL
                setTimeout(() => this.cache.delete(cacheKey), this.CACHE_TTL);
            }
            logger_js_1.default.info('Claude Code response received', {
                requestId: this.requestCount,
                success: result.success,
                duration: result.duration,
                outputLength: result.output.length
            });
            return result;
        }
        catch (error) {
            const result = {
                success: false,
                output: '',
                error: error instanceof Error ? error.message : String(error),
                duration: Date.now() - startTime
            };
            logger_js_1.default.error('Claude Code invocation failed', {
                requestId: this.requestCount,
                error: result.error,
                duration: result.duration
            });
            return result;
        }
    }
    /**
     * Convenience method for planning tasks (uses Opus)
     */
    async invokePlanning(prompt, options = {}) {
        return this.invoke(prompt, { ...options, model: 'opus' });
    }
    /**
     * Convenience method for execution tasks (uses Sonnet)
     */
    async invokeExecution(prompt, options = {}) {
        return this.invoke(prompt, { ...options, model: 'sonnet' });
    }
    /**
     * Smart invoke that automatically selects the best model based on task classification
     */
    async invokeAuto(prompt, context, options = {}) {
        const classification = this.classifyTask(prompt, context);
        logger_js_1.default.info('Auto-classified task', {
            isPlanningTask: classification.isPlanningTask,
            complexity: classification.complexity,
            suggestedModel: classification.suggestedModel,
            confidence: Math.round(classification.confidence * 100)
        });
        return this.invoke(prompt, { ...options, model: classification.suggestedModel });
    }
    buildClaudeArgs(prompt, options) {
        const args = ['claude'];
        // Add model specification
        if (options.model) {
            const modelMap = {
                'opus': 'claude-3-opus-20240229',
                'sonnet': 'claude-3-5-sonnet-20241022'
            };
            args.push('--model', modelMap[options.model]);
        }
        // Add system prompt if provided
        if (options.system) {
            args.push('--system', options.system);
        }
        // Add files if provided
        if (options.files && options.files.length > 0) {
            args.push('--files', ...options.files);
        }
        // Add the main prompt
        args.push(prompt);
        return args;
    }
    executeClaudeCommand(args, timeout) {
        return new Promise((resolve) => {
            const child = (0, child_process_1.spawn)('bash', ['-c', args.join(' ')], {
                stdio: ['pipe', 'pipe', 'pipe'],
                timeout
            });
            let stdout = '';
            let stderr = '';
            child.stdout?.on('data', (data) => {
                stdout += data.toString();
            });
            child.stderr?.on('data', (data) => {
                stderr += data.toString();
            });
            child.on('close', (code) => {
                if (code === 0) {
                    resolve({ success: true, output: stdout.trim() });
                }
                else {
                    resolve({
                        success: false,
                        output: stdout.trim(),
                        error: stderr.trim() || `Process exited with code ${code}`
                    });
                }
            });
            child.on('error', (error) => {
                resolve({
                    success: false,
                    output: '',
                    error: `Failed to start process: ${error.message}`
                });
            });
            // Handle timeout
            setTimeout(() => {
                if (!child.killed) {
                    child.kill('SIGTERM');
                    resolve({
                        success: false,
                        output: stdout.trim(),
                        error: `Command timed out after ${timeout}ms`
                    });
                }
            }, timeout);
        });
    }
    generateCacheKey(prompt, options) {
        const optionsStr = JSON.stringify(options);
        return `${prompt.substring(0, 50)}_${optionsStr}`;
    }
    /**
     * Clears the cache manually
     */
    clearCache() {
        this.cache.clear();
        logger_js_1.default.info('Claude Code cache cleared');
    }
    /**
     * Returns cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            hitRate: this.requestCount > 0 ? this.cache.size / this.requestCount : 0
        };
    }
}
exports.ClaudeCodeInvoker = ClaudeCodeInvoker;
// Export singleton instance
exports.claudeCodeInvoker = ClaudeCodeInvoker.getInstance();
//# sourceMappingURL=claudeCodeInvoker.js.map