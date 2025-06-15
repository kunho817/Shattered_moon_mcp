"use strict";
/**
 * WebSocket Transport for Real-time MCP Communication
 * Provides real-time bidirectional communication for the MCP server
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketClient = exports.WebSocketTransport = void 0;
const ws_1 = require("ws");
const events_1 = require("events");
const crypto_1 = require("crypto");
const logger_js_1 = __importDefault(require("../utils/logger.js"));
const advanced_types_js_1 = require("../utils/advanced-types.js");
/**
 * Enhanced WebSocket Transport for MCP
 */
class WebSocketTransport extends events_1.EventEmitter {
    server;
    clients = new Map();
    requestHandlers = new Map();
    pingInterval;
    config;
    isRunning = false;
    constructor(config) {
        super();
        this.config = config || { enabled: true, port: 3001, pingInterval: 30000 };
    }
    /**
     * Start the WebSocket server
     */
    async start() {
        if (this.isRunning) {
            throw new Error('WebSocket server is already running');
        }
        try {
            this.server = new ws_1.WebSocketServer({
                port: this.config?.port || 3001,
                perMessageDeflate: {
                    threshold: 1024,
                    concurrencyLimit: 10
                },
                maxPayload: 10 * 1024 * 1024 // 10MB max payload
            });
            this.setupServerEventHandlers();
            this.startPingInterval();
            this.isRunning = true;
            this.emit('server:started', this.config?.port || 3001);
            logger_js_1.default.info(`WebSocket server started on port ${this.config?.port || 3001}`);
        }
        catch (error) {
            logger_js_1.default.error('Failed to start WebSocket server:', error);
            throw error;
        }
    }
    /**
     * Stop the WebSocket server
     */
    async stop() {
        if (!this.isRunning) {
            return;
        }
        try {
            // Stop ping interval
            if (this.pingInterval) {
                clearInterval(this.pingInterval);
            }
            // Close all client connections
            for (const client of this.clients.values()) {
                client.socket.close(1000, 'Server shutting down');
            }
            // Close server
            if (this.server) {
                await new Promise((resolve, reject) => {
                    this.server.close((error) => {
                        if (error) {
                            reject(error);
                        }
                        else {
                            resolve();
                        }
                    });
                });
            }
            this.clients.clear();
            this.isRunning = false;
            this.emit('server:stopped');
            logger_js_1.default.info('WebSocket server stopped');
        }
        catch (error) {
            logger_js_1.default.error('Failed to stop WebSocket server:', error);
            throw error;
        }
    }
    /**
     * Register a request handler
     */
    onRequest(method, handler) {
        this.requestHandlers.set(method, handler);
        logger_js_1.default.debug(`Registered WebSocket handler for method: ${method}`);
    }
    /**
     * Send a message to a specific client
     */
    async sendToClient(clientId, message) {
        const client = this.clients.get(clientId);
        if (!client) {
            throw new Error(`Client not found: ${clientId}`);
        }
        const fullMessage = {
            ...message,
            id: (0, crypto_1.randomUUID)(),
            timestamp: Date.now()
        };
        await this.sendMessage(client, fullMessage);
    }
    /**
     * Broadcast a message to all connected clients
     */
    async broadcast(message) {
        const fullMessage = {
            ...message,
            id: (0, crypto_1.randomUUID)(),
            timestamp: Date.now()
        };
        const promises = Array.from(this.clients.values()).map(client => this.sendMessage(client, fullMessage).catch(error => {
            logger_js_1.default.warn(`Failed to send broadcast to client ${client.id}:`, error);
        }));
        await Promise.allSettled(promises);
    }
    /**
     * Get connected client information
     */
    getClients() {
        return Array.from(this.clients.values());
    }
    /**
     * Get client by ID
     */
    getClient(clientId) {
        return this.clients.get(clientId);
    }
    /**
     * Disconnect a client
     */
    disconnectClient(clientId, reason = 'Disconnected by server') {
        const client = this.clients.get(clientId);
        if (client) {
            client.socket.close(1000, reason);
        }
    }
    // Private methods
    setupServerEventHandlers() {
        if (!this.server)
            return;
        this.server.on('connection', (socket, request) => {
            this.handleNewConnection(socket, request);
        });
        this.server.on('error', (error) => {
            logger_js_1.default.error('WebSocket server error:', error);
            this.emit('error', error);
        });
        this.server.on('listening', () => {
            logger_js_1.default.debug('WebSocket server listening');
        });
    }
    handleNewConnection(socket, request) {
        const clientId = (0, crypto_1.randomUUID)();
        const client = {
            id: clientId,
            socket,
            isAlive: true,
            lastPing: Date.now(),
            connectedAt: Date.now(),
            requestCount: 0,
            metadata: {
                userAgent: request.headers['user-agent'],
                origin: request.headers.origin,
                ip: request.socket.remoteAddress
            }
        };
        this.clients.set(clientId, client);
        this.setupClientEventHandlers(client);
        this.emit('client:connected', client);
        logger_js_1.default.info(`WebSocket client connected: ${clientId} from ${client.metadata.ip}`);
        // Send welcome message
        this.sendMessage(client, {
            id: (0, crypto_1.randomUUID)(),
            type: 'notification',
            method: 'welcome',
            params: {
                clientId,
                serverTime: Date.now(),
                capabilities: ['tools', 'prompts', 'resources']
            },
            timestamp: Date.now()
        }).catch(error => {
            logger_js_1.default.warn(`Failed to send welcome message to ${clientId}:`, error);
        });
    }
    setupClientEventHandlers(client) {
        client.socket.on('message', (data) => {
            this.handleClientMessage(client, data);
        });
        client.socket.on('close', (code, reason) => {
            this.handleClientDisconnect(client, code, reason.toString());
        });
        client.socket.on('error', (error) => {
            logger_js_1.default.error(`WebSocket client error for ${client.id}:`, error);
            this.emit('error', error, client);
        });
        client.socket.on('pong', () => {
            client.isAlive = true;
            client.lastPing = Date.now();
        });
    }
    async handleClientMessage(client, data) {
        try {
            const rawMessage = data.toString();
            const message = JSON.parse(rawMessage);
            // Validate message structure
            if (!this.isValidMessage(message)) {
                await this.sendErrorResponse(client, 'Invalid message format', -32600);
                return;
            }
            client.requestCount++;
            this.emit('message:received', client, message);
            switch (message.type) {
                case 'request':
                    await this.handleRequest(client, message);
                    break;
                case 'ping':
                    await this.handlePing(client, message);
                    break;
                case 'pong':
                    // Pong is handled by the socket event
                    break;
                default:
                    logger_js_1.default.warn(`Unknown message type: ${message.type} from client ${client.id}`);
            }
        }
        catch (error) {
            logger_js_1.default.error(`Failed to handle message from client ${client.id}:`, error);
            await this.sendErrorResponse(client, 'Internal server error', -32603);
        }
    }
    async handleRequest(client, message) {
        if (!message.method) {
            await this.sendErrorResponse(client, 'Method is required for requests', -32600, message.id);
            return;
        }
        const handler = this.requestHandlers.get(message.method);
        if (!handler) {
            await this.sendErrorResponse(client, `Method not found: ${message.method}`, -32601, message.id);
            return;
        }
        try {
            const result = await handler(message.params || {}, client);
            const response = {
                id: (0, crypto_1.randomUUID)(),
                type: 'response',
                result,
                timestamp: Date.now()
            };
            await this.sendMessage(client, response);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            await this.sendErrorResponse(client, errorMessage, -32603, message.id);
        }
    }
    async handlePing(client, message) {
        const pongMessage = {
            id: (0, crypto_1.randomUUID)(),
            type: 'pong',
            params: message.params,
            timestamp: Date.now()
        };
        await this.sendMessage(client, pongMessage);
    }
    async sendMessage(client, message) {
        if (client.socket.readyState !== ws_1.WebSocket.OPEN) {
            throw new Error(`Client ${client.id} is not connected`);
        }
        const serialized = JSON.stringify(message);
        return new Promise((resolve, reject) => {
            client.socket.send(serialized, (error) => {
                if (error) {
                    reject(error);
                }
                else {
                    this.emit('message:sent', client, message);
                    resolve();
                }
            });
        });
    }
    async sendErrorResponse(client, message, code, requestId) {
        const errorMessage = {
            id: requestId || (0, crypto_1.randomUUID)(),
            type: 'response',
            error: {
                code,
                message,
                data: { timestamp: Date.now() }
            },
            timestamp: Date.now()
        };
        await this.sendMessage(client, errorMessage).catch(error => {
            logger_js_1.default.error(`Failed to send error response to client ${client.id}:`, error);
        });
    }
    handleClientDisconnect(client, code, reason) {
        this.clients.delete(client.id);
        const disconnectReason = reason || `Connection closed with code ${code}`;
        this.emit('client:disconnected', client, disconnectReason);
        logger_js_1.default.info(`WebSocket client disconnected: ${client.id} (${disconnectReason})`);
    }
    startPingInterval() {
        this.pingInterval = setInterval(() => {
            const now = Date.now();
            for (const [clientId, client] of this.clients) {
                if (!client.isAlive) {
                    // Client failed to respond to ping, terminate connection
                    logger_js_1.default.warn(`Terminating unresponsive client: ${clientId}`);
                    client.socket.terminate();
                    this.clients.delete(clientId);
                    continue;
                }
                // Reset alive status and send ping
                client.isAlive = false;
                if (client.socket.readyState === ws_1.WebSocket.OPEN) {
                    client.socket.ping();
                }
            }
        }, this.config?.pingInterval || 30000);
    }
    isValidMessage(message) {
        return (message &&
            typeof message === 'object' &&
            typeof message.id === 'string' &&
            typeof message.type === 'string' &&
            typeof message.timestamp === 'number' &&
            ['request', 'response', 'notification', 'ping', 'pong'].includes(message.type));
    }
}
exports.WebSocketTransport = WebSocketTransport;
__decorate([
    (0, advanced_types_js_1.Performance)('websocket-start'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WebSocketTransport.prototype, "start", null);
__decorate([
    (0, advanced_types_js_1.Retry)(3, 1000),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WebSocketTransport.prototype, "sendToClient", null);
__decorate([
    (0, advanced_types_js_1.Performance)('websocket-message-handling'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WebSocketTransport.prototype, "handleClientMessage", null);
/**
 * WebSocket client for testing and client-side connections
 */
class WebSocketClient extends events_1.EventEmitter {
    socket;
    url;
    isConnected = false;
    pendingRequests = new Map();
    pingInterval;
    constructor(url) {
        super();
        this.url = url;
    }
    /**
     * Connect to the WebSocket server
     */
    async connect() {
        return new Promise((resolve, reject) => {
            try {
                this.socket = new ws_1.WebSocket(this.url);
                this.socket.on('open', () => {
                    this.isConnected = true;
                    this.startPingInterval();
                    this.emit('connected');
                    resolve();
                });
                this.socket.on('message', (data) => {
                    this.handleMessage(data);
                });
                this.socket.on('close', (code, reason) => {
                    this.handleDisconnect(code, reason.toString());
                });
                this.socket.on('error', (error) => {
                    this.emit('error', error);
                    if (!this.isConnected) {
                        reject(error);
                    }
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }
    /**
     * Disconnect from the WebSocket server
     */
    disconnect() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
        }
        if (this.socket) {
            this.socket.close(1000, 'Client disconnect');
        }
    }
    /**
     * Send a request and wait for response
     */
    async request(method, params = {}, timeoutMs = 30000) {
        if (!this.isConnected || !this.socket) {
            throw new Error('Not connected to WebSocket server');
        }
        const requestId = (0, crypto_1.randomUUID)();
        const message = {
            id: requestId,
            type: 'request',
            method,
            params,
            timestamp: Date.now()
        };
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.pendingRequests.delete(requestId);
                reject(new Error(`Request timeout after ${timeoutMs}ms`));
            }, timeoutMs);
            this.pendingRequests.set(requestId, { resolve, reject, timeout });
            this.socket.send(JSON.stringify(message), (error) => {
                if (error) {
                    this.pendingRequests.delete(requestId);
                    clearTimeout(timeout);
                    reject(error);
                }
            });
        });
    }
    // Private methods
    handleMessage(data) {
        try {
            const message = JSON.parse(data.toString());
            if (message.type === 'response') {
                const pending = this.pendingRequests.get(message.id);
                if (pending) {
                    clearTimeout(pending.timeout);
                    this.pendingRequests.delete(message.id);
                    if (message.error) {
                        pending.reject(new Error(message.error.message));
                    }
                    else {
                        pending.resolve(message.result);
                    }
                }
            }
            else if (message.type === 'notification') {
                this.emit('notification', message.method, message.params);
            }
            else if (message.type === 'ping') {
                // Respond to server ping
                const pong = {
                    id: (0, crypto_1.randomUUID)(),
                    type: 'pong',
                    timestamp: Date.now()
                };
                this.socket.send(JSON.stringify(pong));
            }
        }
        catch (error) {
            this.emit('error', new Error(`Failed to parse message: ${error}`));
        }
    }
    handleDisconnect(code, reason) {
        this.isConnected = false;
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
        }
        // Reject all pending requests
        for (const [id, pending] of this.pendingRequests) {
            clearTimeout(pending.timeout);
            pending.reject(new Error('Connection closed'));
        }
        this.pendingRequests.clear();
        this.emit('disconnected', code, reason);
    }
    startPingInterval() {
        this.pingInterval = setInterval(() => {
            if (this.isConnected && this.socket) {
                const ping = {
                    id: (0, crypto_1.randomUUID)(),
                    type: 'ping',
                    timestamp: Date.now()
                };
                this.socket.send(JSON.stringify(ping));
            }
        }, 30000); // Ping every 30 seconds
    }
}
exports.WebSocketClient = WebSocketClient;
//# sourceMappingURL=websocket.js.map