/**
 * WebSocket Transport for Real-time MCP Communication
 * Provides real-time bidirectional communication for the MCP server
 */
import { WebSocket } from 'ws';
import { EventEmitter } from 'events';
import type { ServerConfiguration } from '../types/index.js';
export interface WSMessage {
    id: string;
    type: 'request' | 'response' | 'notification' | 'ping' | 'pong';
    method?: string;
    params?: any;
    result?: any;
    error?: {
        code: number;
        message: string;
        data?: any;
    };
    timestamp: number;
}
export interface WSClient {
    id: string;
    socket: WebSocket;
    isAlive: boolean;
    lastPing: number;
    connectedAt: number;
    requestCount: number;
    metadata: Record<string, any>;
}
export interface WSServerEvents {
    'client:connected': (client: WSClient) => void;
    'client:disconnected': (client: WSClient, reason: string) => void;
    'message:received': (client: WSClient, message: WSMessage) => void;
    'message:sent': (client: WSClient, message: WSMessage) => void;
    'error': (error: Error, client?: WSClient) => void;
    'server:started': (port: number) => void;
    'server:stopped': () => void;
}
/**
 * Enhanced WebSocket Transport for MCP
 */
export declare class WebSocketTransport extends EventEmitter {
    private server?;
    private clients;
    private requestHandlers;
    private pingInterval?;
    private config;
    private isRunning;
    constructor(config: ServerConfiguration['transport']['websocket']);
    /**
     * Start the WebSocket server
     */
    start(): Promise<void>;
    /**
     * Stop the WebSocket server
     */
    stop(): Promise<void>;
    /**
     * Register a request handler
     */
    onRequest(method: string, handler: (params: any, client: WSClient) => Promise<any>): void;
    /**
     * Send a message to a specific client
     */
    sendToClient(clientId: string, message: Omit<WSMessage, 'id' | 'timestamp'>): Promise<void>;
    /**
     * Broadcast a message to all connected clients
     */
    broadcast(message: Omit<WSMessage, 'id' | 'timestamp'>): Promise<void>;
    /**
     * Get connected client information
     */
    getClients(): WSClient[];
    /**
     * Get client by ID
     */
    getClient(clientId: string): WSClient | undefined;
    /**
     * Disconnect a client
     */
    disconnectClient(clientId: string, reason?: string): void;
    private setupServerEventHandlers;
    private handleNewConnection;
    private setupClientEventHandlers;
    private handleClientMessage;
    private handleRequest;
    private handlePing;
    private sendMessage;
    private sendErrorResponse;
    private handleClientDisconnect;
    private startPingInterval;
    private isValidMessage;
}
/**
 * WebSocket client for testing and client-side connections
 */
export declare class WebSocketClient extends EventEmitter {
    private socket?;
    private url;
    private isConnected;
    private pendingRequests;
    private pingInterval?;
    constructor(url: string);
    /**
     * Connect to the WebSocket server
     */
    connect(): Promise<void>;
    /**
     * Disconnect from the WebSocket server
     */
    disconnect(): void;
    /**
     * Send a request and wait for response
     */
    request(method: string, params?: any, timeoutMs?: number): Promise<any>;
    private handleMessage;
    private handleDisconnect;
    private startPingInterval;
}
//# sourceMappingURL=websocket.d.ts.map