import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';
import { RateLimiter, SecurityValidator, CircuitBreaker } from '../utils/security.js';
import { setupTools } from '../tools/index.js';
import { setupResources } from '../resources/index.js';
import { setupPrompts } from '../prompts/index.js';
import { initializeServices } from './services.js';

// Load environment variables
dotenv.config();

// Initialize security components
const rateLimiter = new RateLimiter({
  windowMs: 60000,
  maxRequests: 60,
  burstLimit: 10,
  burstWindowMs: 10000
});

export class ShatteredMoonMCPServer {
  private server: Server;
  private transport: StdioServerTransport;
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();

  constructor() {
    this.server = new Server(
      {
        name: 'shattered-moon-mcp',
        version: '2.0.0',
        description: 'Advanced DirectX 12 game engine development assistant with TypeScript SDK'
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
          sampling: {} // New capability
        }
      }
    );

    this.transport = new StdioServerTransport();
    this.setupHandlers();
    this.initializeCircuitBreakers();
  }

  private initializeCircuitBreakers(): void {
    const tools = [
      'distributed_task_manager',
      'code_generate',
      'team_coordinator',
      'dynamic_team_expander',
      'query_project',
      'github_manager',
      'project_metadata',
      'parallel_optimizer',
      'performance_metrics'
    ];

    tools.forEach(tool => {
      this.circuitBreakers.set(tool, new CircuitBreaker());
    });
  }

  private setupHandlers(): void {
    // Error handling wrapper
    const wrapHandler = <T extends any[], R>(
      handler: (...args: T) => Promise<R>
    ): ((...args: T) => Promise<R>) => {
      return async (...args: T): Promise<R> => {
        try {
          // Rate limiting check
          const clientId = 'default'; // In production, extract from connection
          if (!rateLimiter.check(clientId)) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              'Rate limit exceeded'
            );
          }

          return await handler(...args);
        } catch (error) {
          logger.error('Handler error', { error });
          
          if (error instanceof McpError) {
            throw error;
          }
          
          throw new McpError(
            ErrorCode.InternalError,
            error instanceof Error ? error.message : 'Unknown error'
          );
        }
      };
    };

    // Tool handlers
    this.server.setRequestHandler(
      ListToolsRequestSchema,
      wrapHandler(async () => {
        logger.info('Listing available tools');
        const tools = await setupTools(this.server);
        return { tools };
      })
    );

    // Tool execution is handled by setupTools via request handlers
    // No additional handler needed here as setupTools sets up its own 'tools/call' handler

    // Resource handlers
    this.server.setRequestHandler(
      ListResourcesRequestSchema,
      wrapHandler(async () => {
        logger.info('Listing available resources');
        const resources = await setupResources(this.server);
        return { resources };
      })
    );

    // Prompt handlers
    this.server.setRequestHandler(
      ListPromptsRequestSchema,
      wrapHandler(async () => {
        logger.info('Listing available prompts');
        const prompts = await setupPrompts(this.server);
        return { prompts };
      })
    );

    // Prompt execution is handled by setupPrompts via request handlers
    // No additional handler needed here
  }

  async start(): Promise<void> {
    try {
      logger.info('Starting Shattered Moon MCP Server v2.0');
      
      // Initialize services
      await initializeServices();
      
      // Setup components
      await setupTools(this.server);
      await setupResources(this.server);
      await setupPrompts(this.server);
      
      // Connect transport
      await this.server.connect(this.transport);
      
      logger.info('Server started successfully');
      
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
      logger.error('Failed to start server', { error });
      process.exit(1);
    }
  }

  private async shutdown(): Promise<void> {
    try {
      await this.server.close();
      logger.info('Server shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', { error });
      process.exit(1);
    }
  }

  // Extension method for dynamic tool management
  getToolHandler(name: string): any {
    return this.server.getToolHandler?.(name);
  }
}

// Extension to Server class for missing methods
declare module '@modelcontextprotocol/sdk/server/index.js' {
  interface Server {
    getToolHandler?(name: string): any;
    getPromptHandler?(name: string): any;
  }
}