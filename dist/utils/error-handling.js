"use strict";
/**
 * Advanced Error Handling and Recovery System
 * Provides comprehensive error handling, recovery mechanisms, and monitoring
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedErrorHandler = exports.ErrorCategory = exports.ErrorSeverity = void 0;
exports.getGlobalErrorHandler = getGlobalErrorHandler;
exports.destroyGlobalErrorHandler = destroyGlobalErrorHandler;
exports.HandleErrors = HandleErrors;
const logger_js_1 = __importDefault(require("./logger.js"));
const events_1 = require("events");
// Error severity levels
var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["LOW"] = "low";
    ErrorSeverity["MEDIUM"] = "medium";
    ErrorSeverity["HIGH"] = "high";
    ErrorSeverity["CRITICAL"] = "critical";
})(ErrorSeverity || (exports.ErrorSeverity = ErrorSeverity = {}));
// Error categories
var ErrorCategory;
(function (ErrorCategory) {
    ErrorCategory["VALIDATION"] = "validation";
    ErrorCategory["NETWORK"] = "network";
    ErrorCategory["TIMEOUT"] = "timeout";
    ErrorCategory["AUTHENTICATION"] = "authentication";
    ErrorCategory["AUTHORIZATION"] = "authorization";
    ErrorCategory["RATE_LIMIT"] = "rate_limit";
    ErrorCategory["INTERNAL"] = "internal";
    ErrorCategory["EXTERNAL"] = "external";
    ErrorCategory["RESOURCE"] = "resource";
    ErrorCategory["CONFIGURATION"] = "configuration";
})(ErrorCategory || (exports.ErrorCategory = ErrorCategory = {}));
// Circuit breaker states
var CircuitBreakerState;
(function (CircuitBreakerState) {
    CircuitBreakerState["CLOSED"] = "closed";
    CircuitBreakerState["OPEN"] = "open";
    CircuitBreakerState["HALF_OPEN"] = "half_open";
})(CircuitBreakerState || (CircuitBreakerState = {}));
/**
 * Advanced Error Handler with recovery mechanisms
 */
class AdvancedErrorHandler extends events_1.EventEmitter {
    config;
    circuitBreakers = new Map();
    metrics;
    recoveryStrategies = [];
    errorHistory = [];
    isMonitoring = false;
    monitoringInterval;
    constructor(config = {}) {
        super();
        this.config = {
            maxRetries: 3,
            retryDelayMs: 1000,
            retryBackoffFactor: 2,
            circuitBreakerThreshold: 5,
            circuitBreakerResetMs: 60000,
            enableMetrics: true,
            enableAlerts: true,
            alertThresholds: {
                errorRate: 0.1, // 10%
                criticalErrors: 5
            },
            ...config
        };
        this.metrics = {
            totalErrors: 0,
            errorsByCategory: new Map(),
            errorsBySeverity: new Map(),
            errorRate: 0,
            lastErrorTime: 0,
            recoveryTime: 0
        };
        this.setupDefaultRecoveryStrategies();
        this.startMonitoring();
    }
    /**
     * Handle an error with recovery attempts
     */
    async handleError(error, context = {}, operation) {
        const enhancedError = this.enhanceError(error, context);
        this.recordError(enhancedError);
        logger_js_1.default.error(`Error occurred: ${enhancedError.message}`, {
            code: enhancedError.code,
            severity: enhancedError.severity,
            category: enhancedError.category,
            context: enhancedError.context,
            correlationId: enhancedError.correlationId
        });
        // Check circuit breaker
        const circuitBreakerKey = this.getCircuitBreakerKey(enhancedError);
        if (!this.canExecute(circuitBreakerKey)) {
            return {
                success: false,
                error: 'Circuit breaker is open',
                code: 'CIRCUIT_BREAKER_OPEN',
                suggestions: ['Wait for circuit breaker to reset', 'Check system health']
            };
        }
        // Attempt recovery
        const recoveryResult = await this.attemptRecovery(enhancedError, context);
        if (recoveryResult.success) {
            this.recordSuccess(circuitBreakerKey);
            return recoveryResult;
        }
        // If recovery failed and operation provided, attempt retry
        if (operation && enhancedError.retryable) {
            const retryResult = await this.attemptRetry(operation, enhancedError, circuitBreakerKey);
            if (retryResult.success) {
                this.recordSuccess(circuitBreakerKey);
                return retryResult;
            }
        }
        // Record circuit breaker failure
        this.recordFailure(circuitBreakerKey);
        // Emit error event for monitoring
        this.emit('error', enhancedError);
        return {
            success: false,
            error: enhancedError.message,
            code: enhancedError.code,
            suggestions: enhancedError.suggestions
        };
    }
    /**
     * Register a recovery strategy
     */
    registerRecoveryStrategy(strategy) {
        this.recoveryStrategies.push(strategy);
        this.recoveryStrategies.sort((a, b) => b.priority - a.priority);
        logger_js_1.default.debug(`Registered recovery strategy: ${strategy.name}`);
    }
    /**
     * Get error metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Get circuit breaker status
     */
    getCircuitBreakerStatus() {
        const status = {};
        for (const [key, breaker] of this.circuitBreakers) {
            status[key] = {
                state: breaker.state,
                failureCount: breaker.failureCount,
                successCount: breaker.successCount,
                lastFailureTime: new Date(breaker.lastFailureTime),
                nextAttemptTime: new Date(breaker.nextAttemptTime)
            };
        }
        return status;
    }
    /**
     * Reset circuit breaker
     */
    resetCircuitBreaker(key) {
        const breaker = this.circuitBreakers.get(key);
        if (breaker) {
            breaker.state = CircuitBreakerState.CLOSED;
            breaker.failureCount = 0;
            breaker.successCount = 0;
            logger_js_1.default.info(`Circuit breaker reset: ${key}`);
        }
    }
    /**
     * Stop monitoring
     */
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.isMonitoring = false;
        }
    }
    // Private methods
    enhanceError(error, context = {}) {
        if (this.isEnhancedError(error)) {
            return error;
        }
        const enhancedError = error;
        enhancedError.code = this.generateErrorCode(error);
        enhancedError.severity = this.determineSeverity(error);
        enhancedError.category = this.categorizeError(error);
        enhancedError.context = { ...context };
        enhancedError.timestamp = new Date();
        enhancedError.correlationId = this.generateCorrelationId();
        enhancedError.retryable = this.isRetryable(error);
        enhancedError.suggestions = this.generateSuggestions(error);
        enhancedError.metadata = {};
        return enhancedError;
    }
    isEnhancedError(error) {
        return 'code' in error && 'severity' in error && 'category' in error;
    }
    generateErrorCode(error) {
        if (error.name) {
            return error.name.toUpperCase().replace(/ERROR$/i, '');
        }
        return 'UNKNOWN_ERROR';
    }
    determineSeverity(error) {
        const message = error.message.toLowerCase();
        if (message.includes('critical') || message.includes('fatal')) {
            return ErrorSeverity.CRITICAL;
        }
        if (message.includes('timeout') || message.includes('connection')) {
            return ErrorSeverity.HIGH;
        }
        if (message.includes('validation') || message.includes('invalid')) {
            return ErrorSeverity.MEDIUM;
        }
        return ErrorSeverity.LOW;
    }
    categorizeError(error) {
        const message = error.message.toLowerCase();
        if (message.includes('validation') || message.includes('invalid')) {
            return ErrorCategory.VALIDATION;
        }
        if (message.includes('network') || message.includes('connection')) {
            return ErrorCategory.NETWORK;
        }
        if (message.includes('timeout')) {
            return ErrorCategory.TIMEOUT;
        }
        if (message.includes('auth')) {
            return ErrorCategory.AUTHENTICATION;
        }
        if (message.includes('rate') || message.includes('limit')) {
            return ErrorCategory.RATE_LIMIT;
        }
        if (message.includes('config')) {
            return ErrorCategory.CONFIGURATION;
        }
        return ErrorCategory.INTERNAL;
    }
    isRetryable(error) {
        const nonRetryablePatterns = [
            /validation/i,
            /authentication/i,
            /authorization/i,
            /syntax/i,
            /parse/i
        ];
        return !nonRetryablePatterns.some(pattern => pattern.test(error.message));
    }
    generateSuggestions(error) {
        const suggestions = [];
        const message = error.message.toLowerCase();
        if (message.includes('timeout')) {
            suggestions.push('Increase timeout value', 'Check network connectivity', 'Retry the operation');
        }
        if (message.includes('validation')) {
            suggestions.push('Check input parameters', 'Validate data format', 'Review API documentation');
        }
        if (message.includes('connection')) {
            suggestions.push('Check network connectivity', 'Verify service availability', 'Review firewall settings');
        }
        if (message.includes('auth')) {
            suggestions.push('Check authentication credentials', 'Verify API keys', 'Review permissions');
        }
        if (suggestions.length === 0) {
            suggestions.push('Check logs for more details', 'Contact support if issue persists');
        }
        return suggestions;
    }
    generateCorrelationId() {
        return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    recordError(error) {
        this.metrics.totalErrors++;
        this.metrics.lastErrorTime = Date.now();
        // Update category metrics
        const categoryCount = this.metrics.errorsByCategory.get(error.category) || 0;
        this.metrics.errorsByCategory.set(error.category, categoryCount + 1);
        // Update severity metrics
        const severityCount = this.metrics.errorsBySeverity.get(error.severity) || 0;
        this.metrics.errorsBySeverity.set(error.severity, severityCount + 1);
        // Add to history (keep last 100 errors)
        this.errorHistory.push(error);
        if (this.errorHistory.length > 100) {
            this.errorHistory.shift();
        }
        // Check alert thresholds
        this.checkAlertThresholds();
    }
    async attemptRecovery(error, context) {
        for (const strategy of this.recoveryStrategies) {
            if (strategy.canRecover(error)) {
                try {
                    logger_js_1.default.info(`Attempting recovery with strategy: ${strategy.name}`);
                    const recoveryStart = Date.now();
                    const result = await strategy.recover(error, context);
                    if (result.success) {
                        this.metrics.recoveryTime = Date.now() - recoveryStart;
                        logger_js_1.default.info(`Recovery successful with strategy: ${strategy.name}`);
                        return result;
                    }
                }
                catch (recoveryError) {
                    logger_js_1.default.warn(`Recovery strategy ${strategy.name} failed:`, recoveryError);
                }
            }
        }
        return {
            success: false,
            error: 'No recovery strategy available',
            code: 'NO_RECOVERY'
        };
    }
    async attemptRetry(operation, error, circuitBreakerKey) {
        let lastError = error;
        for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
            const delay = this.config.retryDelayMs * Math.pow(this.config.retryBackoffFactor, attempt - 1);
            logger_js_1.default.info(`Retry attempt ${attempt}/${this.config.maxRetries} in ${delay}ms`);
            await this.sleep(delay);
            try {
                const result = await operation();
                logger_js_1.default.info(`Retry attempt ${attempt} succeeded`);
                return { success: true, data: result };
            }
            catch (retryError) {
                lastError = this.enhanceError(retryError);
                logger_js_1.default.warn(`Retry attempt ${attempt} failed:`, lastError.message);
                if (!lastError.retryable) {
                    break;
                }
            }
        }
        return {
            success: false,
            error: lastError.message,
            code: lastError.code,
            suggestions: lastError.suggestions
        };
    }
    getCircuitBreakerKey(error) {
        return `${error.category}_${error.code}`;
    }
    canExecute(key) {
        const breaker = this.circuitBreakers.get(key);
        if (!breaker) {
            return true;
        }
        const now = Date.now();
        switch (breaker.state) {
            case CircuitBreakerState.CLOSED:
                return true;
            case CircuitBreakerState.OPEN:
                if (now >= breaker.nextAttemptTime) {
                    breaker.state = CircuitBreakerState.HALF_OPEN;
                    return true;
                }
                return false;
            case CircuitBreakerState.HALF_OPEN:
                return true;
            default:
                return true;
        }
    }
    recordSuccess(key) {
        const breaker = this.circuitBreakers.get(key);
        if (breaker) {
            breaker.successCount++;
            if (breaker.state === CircuitBreakerState.HALF_OPEN && breaker.successCount >= 3) {
                breaker.state = CircuitBreakerState.CLOSED;
                breaker.failureCount = 0;
                logger_js_1.default.info(`Circuit breaker closed: ${key}`);
            }
        }
    }
    recordFailure(key) {
        let breaker = this.circuitBreakers.get(key);
        if (!breaker) {
            breaker = {
                state: CircuitBreakerState.CLOSED,
                failureCount: 0,
                lastFailureTime: 0,
                successCount: 0,
                nextAttemptTime: 0
            };
            this.circuitBreakers.set(key, breaker);
        }
        breaker.failureCount++;
        breaker.lastFailureTime = Date.now();
        if (breaker.failureCount >= this.config.circuitBreakerThreshold) {
            breaker.state = CircuitBreakerState.OPEN;
            breaker.nextAttemptTime = Date.now() + this.config.circuitBreakerResetMs;
            logger_js_1.default.warn(`Circuit breaker opened: ${key}`);
        }
    }
    setupDefaultRecoveryStrategies() {
        // Network retry strategy
        this.registerRecoveryStrategy({
            name: 'NetworkRetry',
            canRecover: (error) => error.category === ErrorCategory.NETWORK,
            recover: async (error, context) => {
                await this.sleep(1000);
                return { success: false, error: 'Network recovery not implemented' };
            },
            priority: 1
        });
        // Cache fallback strategy
        this.registerRecoveryStrategy({
            name: 'CacheFallback',
            canRecover: (error) => error.category === ErrorCategory.TIMEOUT,
            recover: async (error, context) => {
                // Implementation would check cache for fallback data
                return { success: false, error: 'Cache fallback not implemented' };
            },
            priority: 2
        });
    }
    checkAlertThresholds() {
        if (!this.config.enableAlerts) {
            return;
        }
        const criticalErrors = this.metrics.errorsBySeverity.get(ErrorSeverity.CRITICAL) || 0;
        if (criticalErrors >= this.config.alertThresholds.criticalErrors) {
            this.emit('alert', {
                type: 'critical_errors',
                count: criticalErrors,
                threshold: this.config.alertThresholds.criticalErrors
            });
        }
    }
    startMonitoring() {
        if (!this.config.enableMetrics || this.isMonitoring) {
            return;
        }
        this.isMonitoring = true;
        this.monitoringInterval = setInterval(() => {
            this.updateErrorRate();
            this.cleanupOldData();
        }, 60000); // Every minute
    }
    updateErrorRate() {
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        const recentErrors = this.errorHistory.filter(error => error.timestamp.getTime() > oneHourAgo);
        // Calculate error rate (errors per minute)
        this.metrics.errorRate = recentErrors.length / 60;
    }
    cleanupOldData() {
        // Remove circuit breakers that haven't failed recently
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        for (const [key, breaker] of this.circuitBreakers) {
            if (breaker.lastFailureTime < oneDayAgo && breaker.state === CircuitBreakerState.CLOSED) {
                this.circuitBreakers.delete(key);
            }
        }
        // Keep only last 24 hours of error history
        const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
        this.errorHistory = this.errorHistory.filter(error => error.timestamp.getTime() > twentyFourHoursAgo);
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.AdvancedErrorHandler = AdvancedErrorHandler;
// Global error handler instance
let globalErrorHandler = null;
/**
 * Get or create the global error handler
 */
function getGlobalErrorHandler(config) {
    if (!globalErrorHandler) {
        globalErrorHandler = new AdvancedErrorHandler(config);
    }
    return globalErrorHandler;
}
/**
 * Destroy the global error handler
 */
function destroyGlobalErrorHandler() {
    if (globalErrorHandler) {
        globalErrorHandler.stopMonitoring();
        globalErrorHandler.removeAllListeners();
        globalErrorHandler = null;
    }
}
// Error handling decorator
function HandleErrors(config = {}) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        const errorHandler = getGlobalErrorHandler();
        descriptor.value = async function (...args) {
            try {
                return await originalMethod.apply(this, args);
            }
            catch (error) {
                const result = await errorHandler.handleError(error, { method: propertyKey, class: target.constructor.name, args }, () => originalMethod.apply(this, args));
                if (!result.success && config.fallback !== undefined) {
                    return config.fallback;
                }
                if (!result.success) {
                    throw new Error(result.error);
                }
                return result.data;
            }
        };
        return descriptor;
    };
}
// Types already exported above
//# sourceMappingURL=error-handling.js.map