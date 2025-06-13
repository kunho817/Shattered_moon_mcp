"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransportManager = void 0;
exports.createTransportManager = createTransportManager;
exports.autoDetectTransport = autoDetectTransport;
const events_1 = require("events");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const http_js_1 = require("./http.js");
const logger_js_1 = __importDefault(require("../utils/logger.js"));
class TransportManager extends events_1.EventEmitter {
    mcpServer;
    httpTransport;
    stdioTransport;
    config;
    isRunning = false;
    constructor(mcpServer, config) {
        super();
        this.mcpServer = mcpServer;
        this.config = config;
    }
    async start() {
        try {
            logger_js_1.default.info('Starting Transport Manager', {
                type: this.config.type,
                httpPort: this.config.http?.port
            });
            switch (this.config.type) {
                case 'stdio':
                    await this.startStdio();
                    break;
                case 'http':
                    await this.startHTTP();
                    break;
                case 'both':
                    await this.startBoth();
                    break;
                default:
                    throw new Error(`Unknown transport type: ${this.config.type}`);
            }
            this.isRunning = true;
            this.emit('started');
            logger_js_1.default.info('Transport Manager started successfully');
        }
        catch (error) {
            logger_js_1.default.error('Failed to start Transport Manager', { error });
            throw error;
        }
    }
    async startStdio() {
        logger_js_1.default.info('Starting STDIO transport');
        this.stdioTransport = new stdio_js_1.StdioServerTransport();
        // Connect MCP server to stdio transport
        await this.mcpServer.connect(this.stdioTransport);
        logger_js_1.default.info('STDIO transport connected');
    }
    async startHTTP() {
        logger_js_1.default.info('Starting HTTP transport');
        const port = this.config.http?.port || 3000;
        this.httpTransport = new http_js_1.StreamableHTTPTransport(this.mcpServer, port);
        // Set up event listeners
        this.httpTransport.on('clientConnected', (client) => {
            logger_js_1.default.info(`HTTP client connected: ${client.id}`);
            this.emit('clientConnected', { transport: 'http', client });
        });
        this.httpTransport.on('clientDisconnected', (clientId) => {
            logger_js_1.default.info(`HTTP client disconnected: ${clientId}`);
            this.emit('clientDisconnected', { transport: 'http', clientId });
        });
        await this.httpTransport.start(port);
        logger_js_1.default.info(`HTTP transport started on port ${port}`);
    }
    async startBoth() {
        logger_js_1.default.info('Starting both STDIO and HTTP transports');
        // Start HTTP transport first
        await this.startHTTP();
        // Check if we're in a terminal environment for stdio
        if (process.stdin.isTTY) {
            logger_js_1.default.warn('STDIO transport disabled: running in TTY mode');
        }
        else {
            try {
                await this.startStdio();
            }
            catch (error) {
                logger_js_1.default.warn('Failed to start STDIO transport, continuing with HTTP only', { error });
            }
        }
    }
    async stop() {
        if (!this.isRunning) {
            return;
        }
        logger_js_1.default.info('Stopping Transport Manager');
        try {
            // Stop HTTP transport
            if (this.httpTransport) {
                await this.httpTransport.stop();
                this.httpTransport = undefined;
            }
            // Close stdio transport
            if (this.stdioTransport) {
                try {
                    await this.mcpServer.close();
                }
                catch (error) {
                    logger_js_1.default.error('Error closing MCP server', { error });
                }
                this.stdioTransport = undefined;
            }
            this.isRunning = false;
            this.emit('stopped');
            logger_js_1.default.info('Transport Manager stopped');
        }
        catch (error) {
            logger_js_1.default.error('Error stopping Transport Manager', { error });
            throw error;
        }
    }
    // Transport information
    getStatus() {
        return {
            isRunning: this.isRunning,
            transports: {
                stdio: !!this.stdioTransport,
                http: !!this.httpTransport
            },
            httpClients: this.httpTransport?.getClientCount(),
            httpPort: this.config.http?.port
        };
    }
    // HTTP-specific methods
    broadcastToHTTPClients(message) {
        if (this.httpTransport) {
            this.httpTransport.broadcast(message);
        }
    }
    sendToHTTPClient(clientId, message) {
        if (this.httpTransport) {
            return this.httpTransport.sendToClient(clientId, message);
        }
        return false;
    }
    getHTTPClients() {
        if (this.httpTransport) {
            return this.httpTransport.getClients();
        }
        return [];
    }
    // Configuration management
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        logger_js_1.default.info('Transport configuration updated', { config: this.config });
    }
    getConfig() {
        return { ...this.config };
    }
    // Health check
    async healthCheck() {
        const stdioStatus = this.stdioTransport ? 'connected' : 'disconnected';
        const httpStatus = this.httpTransport?.isRunningStatus() ? 'running' : 'stopped';
        return {
            healthy: this.isRunning,
            transports: {
                stdio: { status: stdioStatus },
                http: {
                    status: httpStatus,
                    port: this.config.http?.port,
                    clients: this.httpTransport?.getClientCount()
                }
            },
            uptime: process.uptime()
        };
    }
    // Event monitoring
    getEventStats() {
        // This would be implemented with proper event tracking
        return {
            totalEvents: this.listenerCount('started') + this.listenerCount('stopped'),
            recentEvents: []
        };
    }
}
exports.TransportManager = TransportManager;
// Factory function for easy transport creation
function createTransportManager(mcpServer, options = {}) {
    const config = {
        type: options.mode || 'stdio',
        http: {
            port: options.httpPort || 3000,
            cors: options.enableCors ? {
                origins: ['http://localhost:*', 'https://localhost:*']
            } : undefined,
            rateLimit: options.rateLimit ? {
                windowMs: 60000,
                maxRequests: 100
            } : undefined
        },
        stdio: {
            input: process.stdin,
            output: process.stdout
        }
    };
    return new TransportManager(mcpServer, config);
}
// Auto-detect best transport based on environment
function autoDetectTransport() {
    // If running in a terminal (TTY), prefer HTTP
    if (process.stdin.isTTY) {
        return 'http';
    }
    // If stdin is piped, prefer stdio
    if (!process.stdin.isTTY) {
        return 'stdio';
    }
    // Default to both for maximum compatibility
    return 'both';
}
//# sourceMappingURL=manager.js.map