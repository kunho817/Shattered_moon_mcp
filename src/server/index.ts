import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { 
  ListToolsRequestSchema, 
  ListResourcesRequestSchema, 
  ListPromptsRequestSchema 
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';
import { RateLimiter, SecurityValidator, CircuitBreaker } from '../utils/security.js';
import { setupTools } from '../tools/index.js';
import { setupResources } from '../resources/index.js';
import { setupPrompts } from '../prompts/index.js';
import { initializeServices } from './services.js';
import { TransportManager, createTransportManager, autoDetectTransport, TransportType } from '../transport/manager.js';

// Load environment variables
dotenv.config();

export class ShatteredMoonMCPServer {
  private server: Server;
  private transportManager: TransportManager;
  private transportType: TransportType;

  constructor(transportType?: TransportType, httpPort?: number) {
    this.transportType = transportType || autoDetectTransport();
    this.server = new Server(
      {
        name: 'shattered-moon-mcp',
        version: '2.0.0',
        description: 'Advanced DirectX 12 game engine development assistant with TypeScript SDK'
      },
      {
        capabilities: {
          tools: {
            listChanged: true
          },
          resources: {
            subscribe: true,
            listChanged: true
          },
          prompts: {
            listChanged: true
          },
          logging: {}
        }
      }
    );

    // Create transport manager
    this.transportManager = createTransportManager(this.server, {
      mode: this.transportType,
      httpPort: httpPort || parseInt(process.env.HTTP_PORT || '3000'),
      enableCors: process.env.NODE_ENV === 'development',
      rateLimit: true
    });
  }

  async start(): Promise<void> {
    try {
      logger.info('Starting Shattered Moon MCP Server v2.0');
      
      // Initialize services
      await initializeServices();
      
      // Setup list handlers
      this.server.setRequestHandler(ListToolsRequestSchema, async () => {
        logger.info('Listing available tools');
        const tools = await setupTools(this.server);
        return { tools };
      });
      
      this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
        logger.info('Listing available resources');
        const resources = await setupResources(this.server);
        return { resources };
      });
      
      this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
        logger.info('Listing available prompts');
        const prompts = await setupPrompts(this.server);
        return { prompts };
      });
      
      // Setup components
      await setupTools(this.server);
      await setupResources(this.server);
      await setupPrompts(this.server);
      
      // Start transport manager
      await this.transportManager.start();
      
      // Set up transport event listeners
      this.transportManager.on('clientConnected', (data) => {
        logger.info('Client connected', data);
      });
      
      this.transportManager.on('clientDisconnected', (data) => {
        logger.info('Client disconnected', data);
      });
      
      logger.info('Server started successfully', {
        transport: this.transportType,
        status: this.transportManager.getStatus()
      });
      
      // Handle shutdown
      process.on('SIGINT', async () => {
        logger.info('Shutting down server...');
        await this.shutdown();
      });
      
      process.on('SIGTERM', async () => {
        logger.info('Shutting down server...');
        await this.shutdown();
      });
      
    } catch (error) {
      logger.error('Failed to start server', { 
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      });
      process.exit(1);
    }
  }

  private async shutdown(): Promise<void> {
    try {
      logger.info('Shutting down Transport Manager...');
      await this.transportManager.stop();
      
      logger.info('Shutting down MCP Server...');
      await this.server.close();
      
      logger.info('Server shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', { error });
      process.exit(1);
    }
  }

  // Additional methods for transport management
  getTransportStatus() {
    return this.transportManager.getStatus();
  }

  async getHealthCheck() {
    return await this.transportManager.healthCheck();
  }

  broadcastMessage(message: any): void {
    this.transportManager.broadcastToHTTPClients(message);
  }

  sendToClient(clientId: string, message: any): boolean {
    return this.transportManager.sendToHTTPClient(clientId, message);
  }
}