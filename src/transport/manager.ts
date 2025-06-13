import { EventEmitter } from 'events';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPTransport } from './http.js';
import logger from '../utils/logger.js';

export type TransportType = 'stdio' | 'http' | 'both';

export interface TransportConfig {
  type: TransportType;
  http?: {
    port: number;
    host?: string;
    cors?: {
      origins: string[];
    };
    rateLimit?: {
      windowMs: number;
      maxRequests: number;
    };
  };
  stdio?: {
    input?: NodeJS.ReadableStream;
    output?: NodeJS.WritableStream;
  };
}

export class TransportManager extends EventEmitter {
  private mcpServer: Server;
  private httpTransport?: StreamableHTTPTransport;
  private stdioTransport?: StdioServerTransport;
  private config: TransportConfig;
  private isRunning: boolean = false;

  constructor(mcpServer: Server, config: TransportConfig) {
    super();
    this.mcpServer = mcpServer;
    this.config = config;
  }

  async start(): Promise<void> {
    try {
      logger.info('Starting Transport Manager', {
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
      logger.info('Transport Manager started successfully');

    } catch (error) {
      logger.error('Failed to start Transport Manager', { error });
      throw error;
    }
  }

  private async startStdio(): Promise<void> {
    logger.info('Starting STDIO transport');
    
    this.stdioTransport = new StdioServerTransport();
    
    // Connect MCP server to stdio transport
    await this.mcpServer.connect(this.stdioTransport);
    
    logger.info('STDIO transport connected');
  }

  private async startHTTP(): Promise<void> {
    logger.info('Starting HTTP transport');
    
    const port = this.config.http?.port || 3000;
    this.httpTransport = new StreamableHTTPTransport(this.mcpServer, port);
    
    // Set up event listeners
    this.httpTransport.on('clientConnected', (client) => {
      logger.info(`HTTP client connected: ${client.id}`);
      this.emit('clientConnected', { transport: 'http', client });
    });

    this.httpTransport.on('clientDisconnected', (clientId) => {
      logger.info(`HTTP client disconnected: ${clientId}`);
      this.emit('clientDisconnected', { transport: 'http', clientId });
    });

    await this.httpTransport.start(port);
    logger.info(`HTTP transport started on port ${port}`);
  }

  private async startBoth(): Promise<void> {
    logger.info('Starting both STDIO and HTTP transports');
    
    // Start HTTP transport first
    await this.startHTTP();
    
    // Check if we're in a terminal environment for stdio
    if (process.stdin.isTTY) {
      logger.warn('STDIO transport disabled: running in TTY mode');
    } else {
      try {
        await this.startStdio();
      } catch (error) {
        logger.warn('Failed to start STDIO transport, continuing with HTTP only', { error });
      }
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    logger.info('Stopping Transport Manager');

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
        } catch (error) {
          logger.error('Error closing MCP server', { error });
        }
        this.stdioTransport = undefined;
      }

      this.isRunning = false;
      this.emit('stopped');
      logger.info('Transport Manager stopped');

    } catch (error) {
      logger.error('Error stopping Transport Manager', { error });
      throw error;
    }
  }

  // Transport information
  getStatus(): {
    isRunning: boolean;
    transports: {
      stdio: boolean;
      http: boolean;
    };
    httpClients?: number;
    httpPort?: number;
  } {
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
  broadcastToHTTPClients(message: any): void {
    if (this.httpTransport) {
      this.httpTransport.broadcast(message);
    }
  }

  sendToHTTPClient(clientId: string, message: any): boolean {
    if (this.httpTransport) {
      return this.httpTransport.sendToClient(clientId, message);
    }
    return false;
  }

  getHTTPClients(): any[] {
    if (this.httpTransport) {
      return this.httpTransport.getClients();
    }
    return [];
  }

  // Configuration management
  updateConfig(newConfig: Partial<TransportConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Transport configuration updated', { config: this.config });
  }

  getConfig(): TransportConfig {
    return { ...this.config };
  }

  // Health check
  async healthCheck(): Promise<{
    healthy: boolean;
    transports: {
      stdio: { status: string };
      http: { status: string; port?: number; clients?: number };
    };
    uptime: number;
  }> {
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
  getEventStats(): {
    totalEvents: number;
    recentEvents: Array<{ event: string; timestamp: Date; data?: any }>;
  } {
    // This would be implemented with proper event tracking
    return {
      totalEvents: this.listenerCount('started') + this.listenerCount('stopped'),
      recentEvents: []
    };
  }
}

// Factory function for easy transport creation
export function createTransportManager(
  mcpServer: Server,
  options: {
    mode?: TransportType;
    httpPort?: number;
    enableCors?: boolean;
    rateLimit?: boolean;
  } = {}
): TransportManager {
  const config: TransportConfig = {
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
export function autoDetectTransport(): TransportType {
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