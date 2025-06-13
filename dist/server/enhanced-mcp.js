"use strict";
/**
 * Enhanced MCP Protocol Implementation
 * Provides advanced MCP server capabilities with optimization and extended features
 */
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedMCPServerBuilder = exports.EnhancedMCPServer = void 0;
exports.createEnhancedMCPServer = createEnhancedMCPServer;
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const advanced_types_js_1 = require("../utils/advanced-types.js");
const logger_js_1 = __importDefault(require("../utils/logger.js"));
/**
 * Enhanced MCP Server with advanced features and optimization
 */
let EnhancedMCPServer = (() => {
    let _instanceExtraInitializers = [];
    let _registerTool_decorators;
    let _start_decorators;
    return class EnhancedMCPServer {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _registerTool_decorators = [(0, advanced_types_js_1.Performance)('tool-registration')];
            _start_decorators = [(0, advanced_types_js_1.Performance)('server-start')];
            __esDecorate(this, null, _registerTool_decorators, { kind: "method", name: "registerTool", static: false, private: false, access: { has: obj => "registerTool" in obj, get: obj => obj.registerTool }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _start_decorators, { kind: "method", name: "start", static: false, private: false, access: { has: obj => "start" in obj, get: obj => obj.start }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        server = __runInitializers(this, _instanceExtraInitializers);
        tools = new Map();
        middleware = new Map();
        rateLimits = new Map();
        circuitBreakers = new Map();
        executionMetrics = new Map();
        eventListeners = new Map();
        config;
        constructor(config) {
            this.config = config;
            this.server = new index_js_1.Server({
                name: config.server.name,
                version: config.server.version,
                description: config.server.description,
            }, {
                capabilities: {
                    tools: {},
                    prompts: {},
                    resources: {},
                    logging: {}
                }
            });
            this.setupServer();
            this.setupMiddleware();
        }
        /**
         * Register a tool with the enhanced MCP server
         */
        registerTool(definition) {
            try {
                // Validate tool definition
                if (!definition.name || !definition.handler) {
                    throw new Error('Tool definition must have name and handler');
                }
                // Register with MCP server
                this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
                    if (request.params.name !== definition.name) {
                        return { content: [{ type: 'text', text: 'Tool not found' }] };
                    }
                    const context = {
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
                        const result = await this.executeWithTimeout(() => definition.handler(params), definition.timeout || 30000);
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
                    }
                    catch (error) {
                        // Record failure
                        this.recordExecution(definition.name, context.startTime, false);
                        this.recordCircuitBreakerFailure(definition.name);
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                        this.emit('error:occurred', error, `Tool execution: ${definition.name}`);
                        logger_js_1.default.error(`Tool execution failed: ${definition.name}`, { error: errorMessage, context });
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify((0, advanced_types_js_1.createError)(errorMessage), null, 2)
                                }
                            ]
                        };
                    }
                });
                // Store tool definition
                this.tools.set(definition.name, definition);
                logger_js_1.default.info(`Tool registered: ${definition.name}`);
            }
            catch (error) {
                logger_js_1.default.error(`Failed to register tool: ${definition.name}`, error);
                throw error;
            }
        }
        /**
         * Add middleware to a tool
         */
        addMiddleware(toolName, middleware) {
            const middlewareList = this.middleware.get(toolName) || [];
            middlewareList.push(middleware);
            this.middleware.set(toolName, middlewareList);
        }
        /**
         * Start the enhanced MCP server
         */
        async start() {
            try {
                const transport = new stdio_js_1.StdioServerTransport();
                await this.server.connect(transport);
                this.emit('server:started');
                logger_js_1.default.info('Enhanced MCP Server started successfully');
            }
            catch (error) {
                logger_js_1.default.error('Failed to start Enhanced MCP Server', error);
                throw error;
            }
        }
        /**
         * Stop the enhanced MCP server
         */
        async stop() {
            try {
                await this.server.close();
                this.emit('server:stopped');
                logger_js_1.default.info('Enhanced MCP Server stopped');
            }
            catch (error) {
                logger_js_1.default.error('Failed to stop Enhanced MCP Server', error);
                throw error;
            }
        }
        /**
         * Get tool execution metrics
         */
        getToolMetrics() {
            const metrics = {};
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
        on(event, listener) {
            const listeners = this.eventListeners.get(event) || [];
            listeners.push(listener);
            this.eventListeners.set(event, listeners);
        }
        off(event, listener) {
            const listeners = this.eventListeners.get(event) || [];
            const index = listeners.indexOf(listener);
            if (index !== -1) {
                listeners.splice(index, 1);
                this.eventListeners.set(event, listeners);
            }
        }
        emit(event, ...args) {
            const listeners = this.eventListeners.get(event) || [];
            for (const listener of listeners) {
                try {
                    listener(...args);
                }
                catch (error) {
                    logger_js_1.default.error(`Event listener error for ${String(event)}:`, error);
                }
            }
        }
        removeAllListeners(event) {
            if (event) {
                this.eventListeners.delete(event);
            }
            else {
                this.eventListeners.clear();
            }
        }
        // Private methods
        setupServer() {
            // List tools handler
            this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
                const tools = Array.from(this.tools.values()).map(tool => ({
                    name: tool.name,
                    description: tool.description,
                    inputSchema: tool.inputSchema._def
                }));
                return { tools };
            });
            // Error handling
            this.server.onerror = (error) => {
                logger_js_1.default.error('MCP Server Error:', error);
                this.emit('error:occurred', error, 'MCP Server');
            };
        }
        setupMiddleware() {
            // Built-in security middleware
            const securityMiddleware = async (params, context) => {
                if (this.config.security.validateInput) {
                    // Sanitize input parameters
                    params = this.sanitizeInput(params);
                }
                return params;
            };
            // Built-in logging middleware
            const loggingMiddleware = async (params, context) => {
                if (this.config.logging.level === 'debug') {
                    logger_js_1.default.debug(`Tool execution started: ${context.toolName}`, { params, context });
                }
                return params;
            };
            // Add built-in middleware to all tools
            for (const toolName of this.tools.keys()) {
                this.addMiddleware(toolName, securityMiddleware);
                this.addMiddleware(toolName, loggingMiddleware);
            }
        }
        checkRateLimit(toolName, rateLimit) {
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
        checkCircuitBreaker(toolName) {
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
        recordCircuitBreakerFailure(toolName) {
            if (!this.config.performance.circuitBreaker.enabled) {
                return;
            }
            const breaker = this.circuitBreakers.get(toolName) || { failures: 0, lastFailure: 0, state: 'closed' };
            breaker.failures++;
            breaker.lastFailure = Date.now();
            if (breaker.failures >= this.config.performance.circuitBreaker.failureThreshold) {
                breaker.state = 'open';
            }
            this.circuitBreakers.set(toolName, breaker);
        }
        resetCircuitBreaker(toolName) {
            const breaker = this.circuitBreakers.get(toolName);
            if (breaker) {
                breaker.failures = 0;
                breaker.state = 'closed';
                this.circuitBreakers.set(toolName, breaker);
            }
        }
        recordExecution(toolName, startTime, success) {
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
        async executeWithTimeout(fn, timeoutMs) {
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
        sanitizeInput(params) {
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
                const sanitized = {};
                for (const [key, value] of Object.entries(params)) {
                    sanitized[key] = this.sanitizeInput(value);
                }
                return sanitized;
            }
            return params;
        }
        generateRequestId() {
            return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
    };
})();
exports.EnhancedMCPServer = EnhancedMCPServer;
/**
 * Enhanced MCP Server Builder for fluent configuration
 */
class EnhancedMCPServerBuilder {
    config = {};
    withServerInfo(name, version, description) {
        this.config.server = { name, version, description };
        return this;
    }
    withStdioTransport() {
        this.config.transport = { stdio: true };
        return this;
    }
    withHttpTransport(port, cors = true) {
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
    withSecurity(options) {
        this.config.security = {
            validateInput: true,
            sanitizeOutput: true,
            maxPayloadSize: 1024 * 1024,
            allowedOrigins: ['http://localhost:3000'],
            ...options
        };
        return this;
    }
    withPerformanceMonitoring(enabled = true) {
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
    withLogging(level = 'info') {
        this.config.logging = {
            level,
            format: 'json',
            includeTimestamp: true,
            includeMetadata: true
        };
        return this;
    }
    build() {
        // Provide defaults for required fields
        const defaultConfig = {
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
        const finalConfig = { ...defaultConfig, ...this.config };
        return new EnhancedMCPServer(finalConfig);
    }
}
exports.EnhancedMCPServerBuilder = EnhancedMCPServerBuilder;
// Convenience function for creating a server
function createEnhancedMCPServer() {
    return new EnhancedMCPServerBuilder();
}
//# sourceMappingURL=enhanced-mcp.js.map