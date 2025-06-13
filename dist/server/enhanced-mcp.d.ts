/**
 * Enhanced MCP Protocol Implementation
 * Provides advanced MCP server capabilities with optimization and extended features
 */
import type { ToolDefinition, ToolMiddleware, ServerConfiguration, MCPServerEvents, EventEmitter } from '../types/index.js';
/**
 * Enhanced MCP Server with advanced features and optimization
 */
export declare class EnhancedMCPServer implements EventEmitter<MCPServerEvents> {
    private server;
    private tools;
    private middleware;
    private rateLimits;
    private circuitBreakers;
    private executionMetrics;
    private eventListeners;
    private config;
    constructor(config: ServerConfiguration);
    /**
     * Register a tool with the enhanced MCP server
     */
    registerTool<TParams, TResult>(definition: ToolDefinition<TParams, TResult>): void;
    /**
     * Add middleware to a tool
     */
    addMiddleware(toolName: string, middleware: ToolMiddleware): void;
    /**
     * Start the enhanced MCP server
     */
    start(): Promise<void>;
    /**
     * Stop the enhanced MCP server
     */
    stop(): Promise<void>;
    /**
     * Get tool execution metrics
     */
    getToolMetrics(): Record<string, any>;
    on<K extends keyof MCPServerEvents>(event: K, listener: MCPServerEvents[K]): void;
    off<K extends keyof MCPServerEvents>(event: K, listener: MCPServerEvents[K]): void;
    emit<K extends keyof MCPServerEvents>(event: K, ...args: Parameters<MCPServerEvents[K]>): void;
    removeAllListeners<K extends keyof MCPServerEvents>(event?: K): void;
    private setupServer;
    private setupMiddleware;
    private checkRateLimit;
    private checkCircuitBreaker;
    private recordCircuitBreakerFailure;
    private resetCircuitBreaker;
    private recordExecution;
    private executeWithTimeout;
    private sanitizeInput;
    private generateRequestId;
}
/**
 * Enhanced MCP Server Builder for fluent configuration
 */
export declare class EnhancedMCPServerBuilder {
    private config;
    withServerInfo(name: string, version: string, description: string): this;
    withStdioTransport(): this;
    withHttpTransport(port: number, cors?: boolean): this;
    withSecurity(options: Partial<ServerConfiguration['security']>): this;
    withPerformanceMonitoring(enabled?: boolean): this;
    withLogging(level?: 'debug' | 'info' | 'warn' | 'error'): this;
    build(): EnhancedMCPServer;
}
export declare function createEnhancedMCPServer(): EnhancedMCPServerBuilder;
//# sourceMappingURL=enhanced-mcp.d.ts.map