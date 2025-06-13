"use strict";
/**
 * WebSocket Transport for Real-time MCP Communication
 * Provides real-time bidirectional communication for the MCP server
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
exports.WebSocketClient = exports.WebSocketTransport = void 0;
const ws_1 = require("ws");
const events_1 = require("events");
const crypto_1 = require("crypto");
const logger_js_1 = __importDefault(require("../utils/logger.js"));
const advanced_types_js_1 = require("../utils/advanced-types.js");
/**
 * Enhanced WebSocket Transport for MCP
 */
let WebSocketTransport = (() => {
    let _classSuper = events_1.EventEmitter;
    let _instanceExtraInitializers = [];
    let _start_decorators;
    let _sendToClient_decorators;
    let _handleClientMessage_decorators;
    return class WebSocketTransport extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _start_decorators = [(0, advanced_types_js_1.Performance)('websocket-start')];
            _sendToClient_decorators = [(0, advanced_types_js_1.Retry)(3, 1000)];
            _handleClientMessage_decorators = [(0, advanced_types_js_1.Performance)('websocket-message-handling')];
            __esDecorate(this, null, _start_decorators, { kind: "method", name: "start", static: false, private: false, access: { has: obj => "start" in obj, get: obj => obj.start }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _sendToClient_decorators, { kind: "method", name: "sendToClient", static: false, private: false, access: { has: obj => "sendToClient" in obj, get: obj => obj.sendToClient }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _handleClientMessage_decorators, { kind: "method", name: "handleClientMessage", static: false, private: false, access: { has: obj => "handleClientMessage" in obj, get: obj => obj.handleClientMessage }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        server = __runInitializers(this, _instanceExtraInitializers);
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
                    port: this.config.port,
                    perMessageDeflate: {
                        threshold: 1024,
                        concurrencyLimit: 10
                    },
                    maxPayload: 10 * 1024 * 1024 // 10MB max payload
                });
                this.setupServerEventHandlers();
                this.startPingInterval();
                this.isRunning = true;
                this.emit('server:started', this.config.port);
                logger_js_1.default.info(`WebSocket server started on port ${this.config.port}`);
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
            }, this.config.pingInterval);
        }
        isValidMessage(message) {
            return (message &&
                typeof message === 'object' &&
                typeof message.id === 'string' &&
                typeof message.type === 'string' &&
                typeof message.timestamp === 'number' &&
                ['request', 'response', 'notification', 'ping', 'pong'].includes(message.type));
        }
    };
})();
exports.WebSocketTransport = WebSocketTransport;
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