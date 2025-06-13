"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamableHTTPTransport = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const events_1 = require("events");
const logger_js_1 = __importDefault(require("../utils/logger.js"));
const security_js_1 = require("../utils/security.js");
const services_js_1 = require("../server/services.js");
class StreamableHTTPTransport extends events_1.EventEmitter {
    app;
    server;
    clients = new Map();
    rateLimiter;
    mcpServer;
    isRunning = false;
    constructor(mcpServer, port = 3000) {
        super();
        this.mcpServer = mcpServer;
        this.rateLimiter = new security_js_1.RateLimiter({
            windowMs: 60000,
            maxRequests: 100,
            burstLimit: 20,
            burstWindowMs: 10000
        });
        this.app = (0, express_1.default)();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupCleanup();
    }
    setupMiddleware() {
        // Security middleware
        this.app.use((0, helmet_1.default)({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    connectSrc: ["'self'"],
                    scriptSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                },
            },
            crossOriginEmbedderPolicy: false
        }));
        // CORS configuration
        this.app.use((0, cors_1.default)({
            origin: (origin, callback) => {
                // Allow localhost and any origin for development
                // In production, restrict to specific domains
                if (!origin ||
                    origin.includes('localhost') ||
                    origin.includes('127.0.0.1') ||
                    process.env.NODE_ENV === 'development') {
                    callback(null, true);
                }
                else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true
        }));
        // Parse JSON bodies
        this.app.use(express_1.default.json({ limit: '10mb' }));
        // Request logging
        this.app.use((req, res, next) => {
            logger_js_1.default.info(`HTTP ${req.method} ${req.path}`, {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                headers: security_js_1.SecurityValidator.maskSensitiveData(req.headers)
            });
            next();
        });
        // Rate limiting
        this.app.use((req, res, next) => {
            const clientId = req.ip || 'unknown';
            if (!this.rateLimiter.check(clientId)) {
                res.status(429).json({
                    error: 'Rate limit exceeded',
                    retryAfter: 60
                });
                return;
            }
            next();
        });
    }
    setupRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                version: '2.0.0',
                clients: this.clients.size,
                uptime: process.uptime()
            });
        });
        // Server capabilities
        this.app.get('/capabilities', (req, res) => {
            res.json({
                protocolVersion: '2024-11-05',
                capabilities: {
                    tools: {},
                    resources: {},
                    prompts: {},
                    sampling: {},
                    streaming: true
                },
                serverInfo: {
                    name: 'shattered-moon-mcp',
                    version: '2.0.0'
                }
            });
        });
        // SSE connection endpoint
        this.app.get('/sse', (req, res) => {
            this.handleSSEConnection(req, res);
        });
        // MCP message endpoint
        this.app.post('/message', async (req, res) => {
            await this.handleMCPMessage(req, res);
        });
        // Client management
        this.app.get('/clients', (req, res) => {
            const clientList = Array.from(this.clients.values()).map(client => ({
                id: client.id,
                lastSeen: client.lastSeen,
                sessionId: client.sessionId,
                hasSession: !!client.sessionId
            }));
            res.json({
                total: this.clients.size,
                clients: clientList
            });
        });
        // Session management endpoints
        this.app.get('/sessions', (req, res) => {
            const { sessionManager } = (0, services_js_1.getServices)();
            const sessions = sessionManager.getActiveSessions();
            const metrics = sessionManager.getMetrics();
            res.json({
                sessions: sessions.map(s => ({
                    sessionId: s.sessionId,
                    expiresAt: s.expiresAt,
                    clientInfo: s.clientInfo,
                    projectContext: s.data.projectContext
                })),
                metrics
            });
        });
        this.app.get('/sessions/:sessionId', (req, res) => {
            const { sessionManager } = (0, services_js_1.getServices)();
            const session = sessionManager.getSession(req.params.sessionId);
            if (!session) {
                res.status(404).json({ error: 'Session not found' });
                return;
            }
            res.json(sessionManager.exportSessionData(session.sessionId));
        });
        this.app.put('/sessions/:sessionId', (req, res) => {
            const { sessionManager } = (0, services_js_1.getServices)();
            const success = sessionManager.updateSession(req.params.sessionId, req.body);
            if (!success) {
                res.status(404).json({ error: 'Session not found' });
                return;
            }
            res.json({ success: true });
        });
        this.app.delete('/sessions/:sessionId', (req, res) => {
            const { sessionManager } = (0, services_js_1.getServices)();
            const success = sessionManager.destroySession(req.params.sessionId);
            if (!success) {
                res.status(404).json({ error: 'Session not found' });
                return;
            }
            res.json({ success: true });
        });
        // State management endpoints
        this.app.get('/state/:namespace', (req, res) => {
            const { globalStateManager } = (0, services_js_1.getServices)();
            const { namespace } = req.params;
            const keys = globalStateManager.keys(namespace);
            const entries = globalStateManager.entries(namespace);
            const metrics = globalStateManager.getMetrics(namespace);
            res.json({
                namespace,
                keys,
                entries: Object.fromEntries(entries),
                metrics
            });
        });
        this.app.get('/state/:namespace/:key', (req, res) => {
            const { globalStateManager } = (0, services_js_1.getServices)();
            const { namespace, key } = req.params;
            const value = globalStateManager.get(namespace, key);
            const entry = globalStateManager.getEntry(namespace, key);
            if (value === undefined) {
                res.status(404).json({ error: 'Key not found' });
                return;
            }
            res.json({ key, value, entry });
        });
        this.app.put('/state/:namespace/:key', (req, res) => {
            const { globalStateManager } = (0, services_js_1.getServices)();
            const { namespace, key } = req.params;
            const { value, ttl, tags, metadata } = req.body;
            const success = globalStateManager.set(namespace, key, value, {
                ttl,
                tags,
                metadata
            });
            res.json({ success, key, value });
        });
        this.app.delete('/state/:namespace/:key', (req, res) => {
            const { globalStateManager } = (0, services_js_1.getServices)();
            const { namespace, key } = req.params;
            const success = globalStateManager.delete(namespace, key);
            if (!success) {
                res.status(404).json({ error: 'Key not found' });
                return;
            }
            res.json({ success: true });
        });
        // Error handling
        this.app.use((error, req, res, next) => {
            logger_js_1.default.error('HTTP Transport Error', {
                error: error.message,
                stack: error.stack,
                url: req.url,
                method: req.method
            });
            res.status(500).json({
                error: 'Internal server error',
                timestamp: new Date().toISOString()
            });
        });
        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({
                error: 'Endpoint not found',
                path: req.path,
                method: req.method
            });
        });
    }
    handleSSEConnection(req, res) {
        const clientId = this.generateClientId();
        // Set SSE headers
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': req.get('Origin') || '*',
            'Access-Control-Allow-Credentials': 'true'
        });
        // Create session
        const { sessionManager } = (0, services_js_1.getServices)();
        const sessionId = sessionManager.createSession(clientId, {
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip
        });
        // Create client object
        const client = {
            id: clientId,
            response: res,
            lastSeen: new Date(),
            sessionId
        };
        this.clients.set(clientId, client);
        logger_js_1.default.info(`SSE client connected: ${clientId} with session: ${sessionId}`);
        // Send initial connection message
        this.sendSSEMessage(client, {
            type: 'connection',
            data: {
                clientId,
                sessionId,
                timestamp: new Date().toISOString(),
                capabilities: ['tools', 'resources', 'prompts', 'sampling']
            }
        });
        // Handle client disconnect
        req.on('close', () => {
            // Clean up session
            if (client.sessionId) {
                const { sessionManager } = (0, services_js_1.getServices)();
                sessionManager.destroySession(client.sessionId);
            }
            this.clients.delete(clientId);
            logger_js_1.default.info(`SSE client disconnected: ${clientId}`);
            this.emit('clientDisconnected', clientId);
        });
        req.on('error', (error) => {
            logger_js_1.default.error(`SSE client error: ${clientId}`, { error });
            this.clients.delete(clientId);
        });
        this.emit('clientConnected', client);
    }
    async handleMCPMessage(req, res) {
        try {
            const message = req.body;
            const clientId = req.headers['x-client-id'];
            // Validate message
            if (!message || typeof message !== 'object') {
                res.status(400).json({
                    error: 'Invalid message format'
                });
                return;
            }
            // Input validation
            const sanitizedMessage = security_js_1.SecurityValidator.maskSensitiveData(message);
            logger_js_1.default.info('Received MCP message', {
                clientId,
                method: message.method,
                id: message.id
            });
            // Check for injection attempts
            const messageStr = JSON.stringify(message);
            if (security_js_1.SecurityValidator.detectInjection(messageStr)) {
                logger_js_1.default.warn('Potential injection detected in MCP message', {
                    clientId,
                    message: sanitizedMessage
                });
                res.status(400).json({
                    error: 'Invalid message content'
                });
                return;
            }
            // Process message through MCP server
            const result = await this.processMCPMessage(message, clientId);
            // Send response
            res.json(result);
            // Notify SSE clients if needed
            if (clientId && this.clients.has(clientId)) {
                const client = this.clients.get(clientId);
                client.lastSeen = new Date();
                this.sendSSEMessage(client, {
                    type: 'response',
                    data: {
                        id: message.id,
                        timestamp: new Date().toISOString()
                    }
                });
            }
        }
        catch (error) {
            logger_js_1.default.error('Error handling MCP message', { error });
            res.status(500).json({
                error: 'Failed to process message',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async processMCPMessage(message, clientId) {
        // This would integrate with the MCP server
        // For now, return a basic response structure
        try {
            // Simulate MCP server processing
            // In a real implementation, this would call this.mcpServer methods
            const response = {
                jsonrpc: '2.0',
                id: message.id,
                result: {
                    processed: true,
                    timestamp: new Date().toISOString(),
                    clientId
                }
            };
            return response;
        }
        catch (error) {
            return {
                jsonrpc: '2.0',
                id: message.id,
                error: {
                    code: -32603,
                    message: 'Internal error',
                    data: error instanceof Error ? error.message : 'Unknown error'
                }
            };
        }
    }
    sendSSEMessage(client, message) {
        try {
            const data = JSON.stringify(message);
            client.response.write(`data: ${data}\n\n`);
        }
        catch (error) {
            logger_js_1.default.error(`Failed to send SSE message to ${client.id}`, { error });
            this.clients.delete(client.id);
        }
    }
    generateClientId() {
        return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    setupCleanup() {
        // Clean up inactive clients every 30 seconds
        setInterval(() => {
            const now = Date.now();
            const timeout = 5 * 60 * 1000; // 5 minutes
            for (const [clientId, client] of this.clients.entries()) {
                if (now - client.lastSeen.getTime() > timeout) {
                    logger_js_1.default.info(`Cleaning up inactive client: ${clientId}`);
                    try {
                        client.response.end();
                    }
                    catch (error) {
                        // Client already disconnected
                    }
                    this.clients.delete(clientId);
                }
            }
        }, 30000);
        // Graceful shutdown
        process.on('SIGTERM', () => {
            this.stop();
        });
        process.on('SIGINT', () => {
            this.stop();
        });
    }
    async start(port = 3000) {
        return new Promise((resolve, reject) => {
            try {
                this.server = this.app.listen(port, () => {
                    this.isRunning = true;
                    logger_js_1.default.info(`HTTP Transport started on port ${port}`);
                    logger_js_1.default.info(`SSE endpoint: http://localhost:${port}/sse`);
                    logger_js_1.default.info(`Health check: http://localhost:${port}/health`);
                    resolve();
                });
                this.server.on('error', (error) => {
                    logger_js_1.default.error('HTTP Transport start error', { error });
                    reject(error);
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }
    async stop() {
        return new Promise((resolve) => {
            if (!this.isRunning || !this.server) {
                resolve();
                return;
            }
            logger_js_1.default.info('Stopping HTTP Transport...');
            // Close all SSE connections
            for (const client of this.clients.values()) {
                try {
                    client.response.end();
                }
                catch (error) {
                    // Client already disconnected
                }
            }
            this.clients.clear();
            // Close server
            this.server.close(() => {
                this.isRunning = false;
                logger_js_1.default.info('HTTP Transport stopped');
                resolve();
            });
        });
    }
    // Broadcast to all connected clients
    broadcast(message) {
        for (const client of this.clients.values()) {
            this.sendSSEMessage(client, message);
        }
    }
    // Send message to specific client
    sendToClient(clientId, message) {
        const client = this.clients.get(clientId);
        if (client) {
            this.sendSSEMessage(client, message);
            return true;
        }
        return false;
    }
    // Get client count
    getClientCount() {
        return this.clients.size;
    }
    // Get client list
    getClients() {
        return Array.from(this.clients.values());
    }
    isRunningStatus() {
        return this.isRunning;
    }
}
exports.StreamableHTTPTransport = StreamableHTTPTransport;
//# sourceMappingURL=http.js.map