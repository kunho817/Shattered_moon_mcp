/**
 * Enhanced MCP Protocol Implementation
 * Provides advanced MCP server capabilities with optimization and extended features
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import type { 
  MCPToolResult, 
  ToolDefinition, 
  ToolExecutionContext, 
  ToolMiddleware,
  ServerConfiguration,
  MCPServerEvents,
  EventEmitter
} from '../types/index.js';
import { Performance, Retry, Cache, createSuccess, createError } from '../utils/advanced-types.js';
import logger from '../utils/logger.js';

/**
 * Enhanced MCP Server with advanced features and optimization
 */
export class EnhancedMCPServer implements EventEmitter<MCPServerEvents> {
  private server: Server;
  private tools = new Map<string, ToolDefinition>();
  private middleware = new Map<string, ToolMiddleware[]>();
  private rateLimits = new Map<string, { requests: number; window: number; resetTime: number }>();
  private circuitBreakers = new Map<string, { failures: number; lastFailure: number; state: 'closed' | 'open' | 'half-open' }>();
  private executionMetrics = new Map<string, { count: number; totalTime: number; errors: number; lastExecuted: number }>();
  private eventListeners = new Map<keyof MCPServerEvents, Function[]>();
  private config: ServerConfiguration;

  constructor(config: ServerConfiguration) {
    this.config = config;
    this.server = new Server(
      {
        name: config.server.name,
        version: config.server.version,
        description: config.server.description,
      },
      {
        capabilities: {
          tools: {},
          prompts: {},
          resources: {},
          logging: {}
        }
      }
    );

    this.setupServer();
    this.setupMiddleware();
  }

  /**
   * Register a tool with the enhanced MCP server
   */
  @Performance('tool-registration')
  public registerTool<TParams, TResult>(definition: ToolDefinition<TParams, TResult>): void {
    try {
      // Validate tool definition
      if (!definition.name || !definition.handler) {
        throw new Error('Tool definition must have name and handler');
      }

      // Register with MCP server
      this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
        if (request.params.name !== definition.name) {
          return { content: [{ type: 'text', text: 'Tool not found' }] };
        }

        const context: ToolExecutionContext = {
          toolName: definition.name,
          requestId: this.generateRequestId(),
          startTime: new Date(),
          metadata: {}
        };

        try {
          // Apply rate limiting
          if (definition.rateLimit && !this.checkRateLimit(definition.name, definition.rateLimit)) {
            throw new Error(`Rate limit exceeded for tool ${definition.name}`);
          }

          // Check circuit breaker
          if (this.config.performance.circuitBreaker.enabled && !this.checkCircuitBreaker(definition.name)) {
            throw new Error(`Circuit breaker open for tool ${definition.name}`);
          }

          // Validate input
          const validationResult = definition.inputSchema.safeParse(request.params.arguments);
          if (!validationResult.success) {
            throw new Error(`Invalid parameters: ${validationResult.error.message}`);
          }

          // Apply middleware
          let params = validationResult.data;
          const middlewareList = definition.middleware || [];
          for (const middleware of middlewareList) {
            const result = await middleware(params, context);
            if (result) {
              params = result;
            }
          }

          // Execute tool with timeout
          const result = await this.executeWithTimeout(
            () => definition.handler(params),
            definition.timeout || 30000
          );

          // Record metrics
          this.recordExecution(definition.name, context.startTime, true);

          // Reset circuit breaker on success
          this.resetCircuitBreaker(definition.name);

          // Emit event
          this.emit('tool:executed', definition.name, params, result);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ]
          };
        } catch (error) {
          // Record failure
          this.recordExecution(definition.name, context.startTime, false);
          this.recordCircuitBreakerFailure(definition.name);

          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          this.emit('error:occurred', error as Error, `Tool execution: ${definition.name}`);

          logger.error(`Tool execution failed: ${definition.name}`, { error: errorMessage, context });

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(createError(errorMessage), null, 2)
              }
            ]
          };
        }
      });

      // Store tool definition
      this.tools.set(definition.name, definition);

      logger.info(`Tool registered: ${definition.name}`);
    } catch (error) {
      logger.error(`Failed to register tool: ${definition.name}`, error);
      throw error;
    }
  }

  /**
   * Add middleware to a tool
   */
  public addMiddleware(toolName: string, middleware: ToolMiddleware): void {
    const middlewareList = this.middleware.get(toolName) || [];
    middlewareList.push(middleware);
    this.middleware.set(toolName, middlewareList);
  }

  /**
   * Start the enhanced MCP server
   */
  @Performance('server-start')
  public async start(): Promise<void> {
    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      
      this.emit('server:started');
      logger.info('Enhanced MCP Server started successfully');
    } catch (error) {
      logger.error('Failed to start Enhanced MCP Server', error);
      throw error;
    }
  }

  /**
   * Stop the enhanced MCP server
   */
  public async stop(): Promise<void> {
    try {
      await this.server.close();
      this.emit('server:stopped');
      logger.info('Enhanced MCP Server stopped');
    } catch (error) {
      logger.error('Failed to stop Enhanced MCP Server', error);
      throw error;
    }
  }

  /**
   * Get tool execution metrics
   */
  public getToolMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {};
    
    for (const [toolName, metric] of this.executionMetrics) {
      metrics[toolName] = {
        executionCount: metric.count,
        averageExecutionTime: metric.count > 0 ? metric.totalTime / metric.count : 0,
        successRate: metric.count > 0 ? ((metric.count - metric.errors) / metric.count) * 100 : 0,
        lastExecuted: new Date(metric.lastExecuted),
        errorCount: metric.errors
      };
    }

    return metrics;
  }

  // Event emitter implementation
  public on<K extends keyof MCPServerEvents>(event: K, listener: MCPServerEvents[K]): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.push(listener);
    this.eventListeners.set(event, listeners);
  }

  public off<K extends keyof MCPServerEvents>(event: K, listener: MCPServerEvents[K]): void {
    const listeners = this.eventListeners.get(event) || [];
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
      this.eventListeners.set(event, listeners);
    }
  }

  public emit<K extends keyof MCPServerEvents>(event: K, ...args: Parameters<MCPServerEvents[K]>): void {
    const listeners = this.eventListeners.get(event) || [];
    for (const listener of listeners) {
      try {
        listener(...args);
      } catch (error) {
        logger.error(`Event listener error for ${String(event)}:`, error);
      }
    }
  }

  public removeAllListeners<K extends keyof MCPServerEvents>(event?: K): void {
    if (event) {
      this.eventListeners.delete(event);
    } else {
      this.eventListeners.clear();
    }
  }

  // Private methods
  private setupServer(): void {
    // List tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = Array.from(this.tools.values()).map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema._def
      }));

      return { tools };
    });

    // Error handling
    this.server.onerror = (error) => {
      logger.error('MCP Server Error:', error);
      this.emit('error:occurred', error, 'MCP Server');
    };
  }

  private setupMiddleware(): void {
    // Built-in security middleware
    const securityMiddleware: ToolMiddleware = async (params, context) => {
      if (this.config.security.validateInput) {
        // Sanitize input parameters
        params = this.sanitizeInput(params);
      }
      return params;
    };

    // Built-in logging middleware
    const loggingMiddleware: ToolMiddleware = async (params, context) => {
      if (this.config.logging.level === 'debug') {
        logger.debug(`Tool execution started: ${context.toolName}`, { params, context });
      }
      return params;
    };

    // Add built-in middleware to all tools
    for (const toolName of this.tools.keys()) {
      this.addMiddleware(toolName, securityMiddleware);
      this.addMiddleware(toolName, loggingMiddleware);
    }
  }

  private checkRateLimit(toolName: string, rateLimit: { maxRequests: number; windowMs: number }): boolean {
    const now = Date.now();
    const key = toolName;
    const limit = this.rateLimits.get(key);

    if (!limit || now > limit.resetTime) {
      this.rateLimits.set(key, {
        requests: 1,
        window: rateLimit.windowMs,
        resetTime: now + rateLimit.windowMs
      });
      return true;
    }

    if (limit.requests >= rateLimit.maxRequests) {
      return false;
    }

    limit.requests++;
    return true;
  }

  private checkCircuitBreaker(toolName: string): boolean {
    const breaker = this.circuitBreakers.get(toolName);
    if (!breaker) {
      return true;
    }

    const now = Date.now();
    const { failureThreshold, recoveryTimeMs } = this.config.performance.circuitBreaker;

    switch (breaker.state) {
      case 'closed':
        return true;
      case 'open':
        if (now - breaker.lastFailure > recoveryTimeMs) {
          breaker.state = 'half-open';
          return true;
        }
        return false;
      case 'half-open':
        return true;
      default:
        return true;
    }
  }

  private recordCircuitBreakerFailure(toolName: string): void {
    if (!this.config.performance.circuitBreaker.enabled) {
      return;
    }

    const breaker = this.circuitBreakers.get(toolName) || { failures: 0, lastFailure: 0, state: 'closed' as const };
    breaker.failures++;
    breaker.lastFailure = Date.now();

    if (breaker.failures >= this.config.performance.circuitBreaker.failureThreshold) {
      breaker.state = 'open';
    }

    this.circuitBreakers.set(toolName, breaker);
  }

  private resetCircuitBreaker(toolName: string): void {
    const breaker = this.circuitBreakers.get(toolName);
    if (breaker) {
      breaker.failures = 0;
      breaker.state = 'closed';
      this.circuitBreakers.set(toolName, breaker);
    }
  }

  private recordExecution(toolName: string, startTime: Date, success: boolean): void {
    const executionTime = Date.now() - startTime.getTime();
    const metric = this.executionMetrics.get(toolName) || { count: 0, totalTime: 0, errors: 0, lastExecuted: 0 };

    metric.count++;
    metric.totalTime += executionTime;
    metric.lastExecuted = Date.now();

    if (!success) {
      metric.errors++;
    }

    this.executionMetrics.set(toolName, metric);
  }

  private async executeWithTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Tool execution timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      fn()
        .then(result => {
          clearTimeout(timeout);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  private sanitizeInput(params: any): any {
    if (typeof params === 'string') {
      return params
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    }

    if (Array.isArray(params)) {
      return params.map(item => this.sanitizeInput(item));
    }

    if (params && typeof params === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(params)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }

    return params;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Enhanced MCP Server Builder for fluent configuration
 */
export class EnhancedMCPServerBuilder {
  private config: Partial<ServerConfiguration> = {};

  public withServerInfo(name: string, version: string, description: string): this {
    this.config.server = { name, version, description };
    return this;
  }

  public withStdioTransport(): this {
    this.config.transport = { stdio: true };
    return this;
  }

  public withHttpTransport(port: number, cors: boolean = true): this {
    this.config.transport = {
      stdio: false,
      http: {
        enabled: true,
        port,
        cors,
        rateLimit: {
          windowMs: 60000,
          maxRequests: 100
        }
      }
    };
    return this;
  }

  public withSecurity(options: Partial<ServerConfiguration['security']>): this {
    this.config.security = {
      validateInput: true,
      sanitizeOutput: true,
      maxPayloadSize: 1024 * 1024,
      allowedOrigins: ['http://localhost:3000'],
      ...options
    };
    return this;
  }

  public withPerformanceMonitoring(enabled: boolean = true): this {
    this.config.performance = {
      enableMonitoring: enabled,
      metricsRetentionHours: 24,
      circuitBreaker: {
        enabled: true,
        failureThreshold: 5,
        recoveryTimeMs: 60000
      }
    };
    return this;
  }

  public withLogging(level: 'debug' | 'info' | 'warn' | 'error' = 'info'): this {
    this.config.logging = {
      level,
      format: 'json',
      includeTimestamp: true,
      includeMetadata: true
    };
    return this;
  }

  public build(): EnhancedMCPServer {
    // Provide defaults for required fields
    const defaultConfig: ServerConfiguration = {
      server: {
        name: 'Enhanced MCP Server',
        version: '1.0.0',
        description: 'Advanced MCP server with enhanced capabilities'
      },
      transport: { stdio: true },
      security: {
        validateInput: true,
        sanitizeOutput: true,
        maxPayloadSize: 1024 * 1024,
        allowedOrigins: ['http://localhost:3000']
      },
      logging: {
        level: 'info',
        format: 'json',
        includeTimestamp: true,
        includeMetadata: true
      },
      performance: {
        enableMonitoring: true,
        metricsRetentionHours: 24,
        circuitBreaker: {
          enabled: true,
          failureThreshold: 5,
          recoveryTimeMs: 60000
        }
      },
      teams: {
        maxConcurrentTasks: 10,
        taskTimeoutMs: 300000,
        specialistRotation: true,
        loadBalancing: 'least_loaded'
      }
    };

    const finalConfig = { ...defaultConfig, ...this.config } as ServerConfiguration;
    return new EnhancedMCPServer(finalConfig);
  }
}

// Convenience function for creating a server
export function createEnhancedMCPServer(): EnhancedMCPServerBuilder {
  return new EnhancedMCPServerBuilder();
}