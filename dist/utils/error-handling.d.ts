/**
 * Advanced Error Handling and Recovery System
 * Provides comprehensive error handling, recovery mechanisms, and monitoring
 */
import { EventEmitter } from 'events';
import type { MCPResult } from './advanced-types.js';
export declare enum ErrorSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare enum ErrorCategory {
    VALIDATION = "validation",
    NETWORK = "network",
    TIMEOUT = "timeout",
    AUTHENTICATION = "authentication",
    AUTHORIZATION = "authorization",
    RATE_LIMIT = "rate_limit",
    INTERNAL = "internal",
    EXTERNAL = "external",
    RESOURCE = "resource",
    CONFIGURATION = "configuration"
}
export interface EnhancedError extends Error {
    code: string;
    severity: ErrorSeverity;
    category: ErrorCategory;
    context: Record<string, any>;
    timestamp: Date;
    correlationId?: string;
    retryable: boolean;
    suggestions: string[];
    metadata: Record<string, any>;
}
export interface ErrorHandlerConfig {
    maxRetries: number;
    retryDelayMs: number;
    retryBackoffFactor: number;
    circuitBreakerThreshold: number;
    circuitBreakerResetMs: number;
    enableMetrics: boolean;
    enableAlerts: boolean;
    alertThresholds: {
        errorRate: number;
        criticalErrors: number;
    };
}
interface ErrorMetrics {
    totalErrors: number;
    errorsByCategory: Map<ErrorCategory, number>;
    errorsBySeverity: Map<ErrorSeverity, number>;
    errorRate: number;
    lastErrorTime: number;
    recoveryTime: number;
}
interface RecoveryStrategy {
    name: string;
    canRecover(error: EnhancedError): boolean;
    recover(error: EnhancedError, context: any): Promise<MCPResult<any>>;
    priority: number;
}
/**
 * Advanced Error Handler with recovery mechanisms
 */
export declare class AdvancedErrorHandler extends EventEmitter {
    private config;
    private circuitBreakers;
    private metrics;
    private recoveryStrategies;
    private errorHistory;
    private isMonitoring;
    private monitoringInterval?;
    constructor(config?: Partial<ErrorHandlerConfig>);
    /**
     * Handle an error with recovery attempts
     */
    handleError<T>(error: Error | EnhancedError, context?: any, operation?: () => Promise<T>): Promise<MCPResult<T>>;
    /**
     * Register a recovery strategy
     */
    registerRecoveryStrategy(strategy: RecoveryStrategy): void;
    /**
     * Get error metrics
     */
    getMetrics(): ErrorMetrics;
    /**
     * Get circuit breaker status
     */
    getCircuitBreakerStatus(): Record<string, any>;
    /**
     * Reset circuit breaker
     */
    resetCircuitBreaker(key: string): void;
    /**
     * Stop monitoring
     */
    stopMonitoring(): void;
    private enhanceError;
    private isEnhancedError;
    private generateErrorCode;
    private determineSeverity;
    private categorizeError;
    private isRetryable;
    private generateSuggestions;
    private generateCorrelationId;
    private recordError;
    private attemptRecovery;
    private attemptRetry;
    private getCircuitBreakerKey;
    private canExecute;
    private recordSuccess;
    private recordFailure;
    private setupDefaultRecoveryStrategies;
    private checkAlertThresholds;
    private startMonitoring;
    private updateErrorRate;
    private cleanupOldData;
    private sleep;
}
/**
 * Get or create the global error handler
 */
export declare function getGlobalErrorHandler(config?: Partial<ErrorHandlerConfig>): AdvancedErrorHandler;
/**
 * Destroy the global error handler
 */
export declare function destroyGlobalErrorHandler(): void;
export declare function HandleErrors(config?: {
    retries?: number;
    fallback?: any;
}): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export { ErrorSeverity, ErrorCategory, type EnhancedError, type ErrorHandlerConfig };
//# sourceMappingURL=error-handling.d.ts.map