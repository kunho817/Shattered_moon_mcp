/**
 * WebSocket Transport for Real-time MCP Communication
 * Provides real-time bidirectional communication for the MCP server
 */

import { WebSocketServer, WebSocket, RawData } from 'ws';
import { IncomingMessage } from 'http';
import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';
import logger from '../utils/logger.js';
import type { MCPToolResult, ServerConfiguration } from '../types/index.js';
import { Performance, Retry, createSuccess, createError } from '../utils/advanced-types.js';

// WebSocket message types
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

// Client connection interface
export interface WSClient {
  id: string;
  socket: WebSocket;
  isAlive: boolean;
  lastPing: number;
  connectedAt: number;
  requestCount: number;
  metadata: Record<string, any>;
}

// WebSocket server events
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
export class WebSocketTransport extends EventEmitter {
  private server?: WebSocketServer;
  private clients = new Map<string, WSClient>();
  private requestHandlers = new Map<string, (params: any, client: WSClient) => Promise<any>>();
  private pingInterval?: NodeJS.Timeout;
  private config: ServerConfiguration['transport']['websocket'];
  private isRunning = false;

  constructor(config: ServerConfiguration['transport']['websocket']) {
    super();
    this.config = config || { enabled: true, port: 3001, pingInterval: 30000 };
  }

  /**
   * Start the WebSocket server
   */
  @Performance('websocket-start')
  public async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('WebSocket server is already running');
    }

    try {
      this.server = new WebSocketServer({
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
      logger.info(`WebSocket server started on port ${this.config.port}`);
    } catch (error) {
      logger.error('Failed to start WebSocket server:', error);
      throw error;
    }
  }

  /**
   * Stop the WebSocket server
   */
  public async stop(): Promise<void> {
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
        await new Promise<void>((resolve, reject) => {
          this.server!.close((error) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          });
        });
      }

      this.clients.clear();
      this.isRunning = false;
      this.emit('server:stopped');
      logger.info('WebSocket server stopped');
    } catch (error) {
      logger.error('Failed to stop WebSocket server:', error);
      throw error;
    }
  }

  /**
   * Register a request handler
   */
  public onRequest(method: string, handler: (params: any, client: WSClient) => Promise<any>): void {
    this.requestHandlers.set(method, handler);
    logger.debug(`Registered WebSocket handler for method: ${method}`);
  }

  /**
   * Send a message to a specific client
   */
  @Retry(3, 1000)
  public async sendToClient(clientId: string, message: Omit<WSMessage, 'id' | 'timestamp'>): Promise<void> {
    const client = this.clients.get(clientId);
    if (!client) {
      throw new Error(`Client not found: ${clientId}`);
    }

    const fullMessage: WSMessage = {
      ...message,
      id: randomUUID(),
      timestamp: Date.now()
    };

    await this.sendMessage(client, fullMessage);
  }

  /**
   * Broadcast a message to all connected clients
   */
  public async broadcast(message: Omit<WSMessage, 'id' | 'timestamp'>): Promise<void> {
    const fullMessage: WSMessage = {
      ...message,
      id: randomUUID(),
      timestamp: Date.now()
    };

    const promises = Array.from(this.clients.values()).map(client => 
      this.sendMessage(client, fullMessage).catch(error => {
        logger.warn(`Failed to send broadcast to client ${client.id}:`, error);
      })
    );

    await Promise.allSettled(promises);
  }

  /**
   * Get connected client information
   */
  public getClients(): WSClient[] {
    return Array.from(this.clients.values());
  }

  /**
   * Get client by ID
   */
  public getClient(clientId: string): WSClient | undefined {
    return this.clients.get(clientId);
  }

  /**
   * Disconnect a client
   */
  public disconnectClient(clientId: string, reason: string = 'Disconnected by server'): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.socket.close(1000, reason);
    }
  }

  // Private methods
  private setupServerEventHandlers(): void {
    if (!this.server) return;

    this.server.on('connection', (socket: WebSocket, request: IncomingMessage) => {
      this.handleNewConnection(socket, request);
    });

    this.server.on('error', (error: Error) => {
      logger.error('WebSocket server error:', error);
      this.emit('error', error);
    });

    this.server.on('listening', () => {
      logger.debug('WebSocket server listening');
    });
  }

  private handleNewConnection(socket: WebSocket, request: IncomingMessage): void {
    const clientId = randomUUID();
    const client: WSClient = {
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
    logger.info(`WebSocket client connected: ${clientId} from ${client.metadata.ip}`);

    // Send welcome message
    this.sendMessage(client, {
      id: randomUUID(),
      type: 'notification',
      method: 'welcome',
      params: {
        clientId,
        serverTime: Date.now(),
        capabilities: ['tools', 'prompts', 'resources']
      },
      timestamp: Date.now()
    }).catch(error => {
      logger.warn(`Failed to send welcome message to ${clientId}:`, error);
    });
  }

  private setupClientEventHandlers(client: WSClient): void {
    client.socket.on('message', (data: RawData) => {
      this.handleClientMessage(client, data);
    });

    client.socket.on('close', (code: number, reason: Buffer) => {
      this.handleClientDisconnect(client, code, reason.toString());
    });

    client.socket.on('error', (error: Error) => {
      logger.error(`WebSocket client error for ${client.id}:`, error);
      this.emit('error', error, client);
    });

    client.socket.on('pong', () => {
      client.isAlive = true;
      client.lastPing = Date.now();
    });
  }

  @Performance('websocket-message-handling')
  private async handleClientMessage(client: WSClient, data: RawData): Promise<void> {
    try {
      const rawMessage = data.toString();
      const message: WSMessage = JSON.parse(rawMessage);

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
          logger.warn(`Unknown message type: ${message.type} from client ${client.id}`);
      }
    } catch (error) {
      logger.error(`Failed to handle message from client ${client.id}:`, error);
      await this.sendErrorResponse(client, 'Internal server error', -32603);
    }
  }

  private async handleRequest(client: WSClient, message: WSMessage): Promise<void> {
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
      
      const response: WSMessage = {
        id: randomUUID(),
        type: 'response',
        result,
        timestamp: Date.now()
      };

      await this.sendMessage(client, response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.sendErrorResponse(client, errorMessage, -32603, message.id);
    }
  }

  private async handlePing(client: WSClient, message: WSMessage): Promise<void> {
    const pongMessage: WSMessage = {
      id: randomUUID(),
      type: 'pong',
      params: message.params,
      timestamp: Date.now()
    };

    await this.sendMessage(client, pongMessage);
  }

  private async sendMessage(client: WSClient, message: WSMessage): Promise<void> {
    if (client.socket.readyState !== WebSocket.OPEN) {
      throw new Error(`Client ${client.id} is not connected`);
    }

    const serialized = JSON.stringify(message);
    
    return new Promise((resolve, reject) => {
      client.socket.send(serialized, (error) => {
        if (error) {
          reject(error);
        } else {
          this.emit('message:sent', client, message);
          resolve();
        }
      });
    });
  }

  private async sendErrorResponse(
    client: WSClient, 
    message: string, 
    code: number, 
    requestId?: string
  ): Promise<void> {
    const errorMessage: WSMessage = {
      id: requestId || randomUUID(),
      type: 'response',
      error: {
        code,
        message,
        data: { timestamp: Date.now() }
      },
      timestamp: Date.now()
    };

    await this.sendMessage(client, errorMessage).catch(error => {
      logger.error(`Failed to send error response to client ${client.id}:`, error);
    });
  }

  private handleClientDisconnect(client: WSClient, code: number, reason: string): void {
    this.clients.delete(client.id);
    
    const disconnectReason = reason || `Connection closed with code ${code}`;
    this.emit('client:disconnected', client, disconnectReason);
    
    logger.info(`WebSocket client disconnected: ${client.id} (${disconnectReason})`);
  }

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      const now = Date.now();
      
      for (const [clientId, client] of this.clients) {
        if (!client.isAlive) {
          // Client failed to respond to ping, terminate connection
          logger.warn(`Terminating unresponsive client: ${clientId}`);
          client.socket.terminate();
          this.clients.delete(clientId);
          continue;
        }

        // Reset alive status and send ping
        client.isAlive = false;
        
        if (client.socket.readyState === WebSocket.OPEN) {
          client.socket.ping();
        }
      }
    }, this.config.pingInterval);
  }

  private isValidMessage(message: any): message is WSMessage {
    return (
      message &&
      typeof message === 'object' &&
      typeof message.id === 'string' &&
      typeof message.type === 'string' &&
      typeof message.timestamp === 'number' &&
      ['request', 'response', 'notification', 'ping', 'pong'].includes(message.type)
    );
  }
}

/**
 * WebSocket client for testing and client-side connections
 */
export class WebSocketClient extends EventEmitter {
  private socket?: WebSocket;
  private url: string;
  private isConnected = false;
  private pendingRequests = new Map<string, { resolve: Function; reject: Function; timeout: NodeJS.Timeout }>();
  private pingInterval?: NodeJS.Timeout;

  constructor(url: string) {
    super();
    this.url = url;
  }

  /**
   * Connect to the WebSocket server
   */
  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.url);

        this.socket.on('open', () => {
          this.isConnected = true;
          this.startPingInterval();
          this.emit('connected');
          resolve();
        });

        this.socket.on('message', (data: RawData) => {
          this.handleMessage(data);
        });

        this.socket.on('close', (code: number, reason: Buffer) => {
          this.handleDisconnect(code, reason.toString());
        });

        this.socket.on('error', (error: Error) => {
          this.emit('error', error);
          if (!this.isConnected) {
            reject(error);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
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
  public async request(method: string, params: any = {}, timeoutMs: number = 30000): Promise<any> {
    if (!this.isConnected || !this.socket) {
      throw new Error('Not connected to WebSocket server');
    }

    const requestId = randomUUID();
    const message: WSMessage = {
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
      
      this.socket!.send(JSON.stringify(message), (error) => {
        if (error) {
          this.pendingRequests.delete(requestId);
          clearTimeout(timeout);
          reject(error);
        }
      });
    });
  }

  // Private methods
  private handleMessage(data: RawData): void {
    try {
      const message: WSMessage = JSON.parse(data.toString());
      
      if (message.type === 'response') {
        const pending = this.pendingRequests.get(message.id);
        if (pending) {
          clearTimeout(pending.timeout);
          this.pendingRequests.delete(message.id);
          
          if (message.error) {
            pending.reject(new Error(message.error.message));
          } else {
            pending.resolve(message.result);
          }
        }
      } else if (message.type === 'notification') {
        this.emit('notification', message.method, message.params);
      } else if (message.type === 'ping') {
        // Respond to server ping
        const pong: WSMessage = {
          id: randomUUID(),
          type: 'pong',
          timestamp: Date.now()
        };
        this.socket!.send(JSON.stringify(pong));
      }
    } catch (error) {
      this.emit('error', new Error(`Failed to parse message: ${error}`));
    }
  }

  private handleDisconnect(code: number, reason: string): void {
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

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      if (this.isConnected && this.socket) {
        const ping: WSMessage = {
          id: randomUUID(),
          type: 'ping',
          timestamp: Date.now()
        };
        this.socket.send(JSON.stringify(ping));
      }
    }, 30000); // Ping every 30 seconds
  }
}