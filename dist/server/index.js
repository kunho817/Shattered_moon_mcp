"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShatteredMoonMCPServer = void 0;
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const dotenv_1 = __importDefault(require("dotenv"));
const logger_js_1 = __importDefault(require("../utils/logger.js"));
const index_js_2 = require("../tools/index.js");
const index_js_3 = require("../resources/index.js");
const index_js_4 = require("../prompts/index.js");
const services_js_1 = require("./services.js");
const manager_js_1 = require("../transport/manager.js");
// Load environment variables
dotenv_1.default.config();
class ShatteredMoonMCPServer {
    server;
    transportManager;
    transportType;
    constructor(transportType, httpPort) {
        this.transportType = transportType || (0, manager_js_1.autoDetectTransport)();
        this.server = new index_js_1.Server({
            name: 'shattered-moon-mcp',
            version: '2.0.0',
            description: 'Advanced DirectX 12 game engine development assistant with TypeScript SDK'
        }, {
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
        });
        // Create transport manager
        this.transportManager = (0, manager_js_1.createTransportManager)(this.server, {
            mode: this.transportType,
            httpPort: httpPort || parseInt(process.env.HTTP_PORT || '3000'),
            enableCors: process.env.NODE_ENV === 'development',
            rateLimit: true
        });
    }
    async start() {
        try {
            logger_js_1.default.info('Starting Shattered Moon MCP Server v2.0');
            // Initialize services
            await (0, services_js_1.initializeServices)();
            // Setup list handlers
            this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
                logger_js_1.default.info('Listing available tools');
                const tools = await (0, index_js_2.setupTools)(this.server);
                return { tools };
            });
            this.server.setRequestHandler(types_js_1.ListResourcesRequestSchema, async () => {
                logger_js_1.default.info('Listing available resources');
                const resources = await (0, index_js_3.setupResources)(this.server);
                return { resources };
            });
            this.server.setRequestHandler(types_js_1.ListPromptsRequestSchema, async () => {
                logger_js_1.default.info('Listing available prompts');
                const prompts = await (0, index_js_4.setupPrompts)(this.server);
                return { prompts };
            });
            // Setup components
            await (0, index_js_2.setupTools)(this.server);
            await (0, index_js_3.setupResources)(this.server);
            await (0, index_js_4.setupPrompts)(this.server);
            // Start transport manager
            await this.transportManager.start();
            // Set up transport event listeners
            this.transportManager.on('clientConnected', (data) => {
                logger_js_1.default.info('Client connected', data);
            });
            this.transportManager.on('clientDisconnected', (data) => {
                logger_js_1.default.info('Client disconnected', data);
            });
            logger_js_1.default.info('Server started successfully', {
                transport: this.transportType,
                status: this.transportManager.getStatus()
            });
            // Handle shutdown
            process.on('SIGINT', async () => {
                logger_js_1.default.info('Shutting down server...');
                await this.shutdown();
            });
            process.on('SIGTERM', async () => {
                logger_js_1.default.info('Shutting down server...');
                await this.shutdown();
            });
        }
        catch (error) {
            logger_js_1.default.error('Failed to start server', {
                error: error instanceof Error ? error.message : error,
                stack: error instanceof Error ? error.stack : undefined
            });
            process.exit(1);
        }
    }
    async shutdown() {
        try {
            logger_js_1.default.info('Shutting down Transport Manager...');
            await this.transportManager.stop();
            logger_js_1.default.info('Shutting down MCP Server...');
            await this.server.close();
            logger_js_1.default.info('Server shutdown complete');
            process.exit(0);
        }
        catch (error) {
            logger_js_1.default.error('Error during shutdown', { error });
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
    broadcastMessage(message) {
        this.transportManager.broadcastToHTTPClients(message);
    }
    sendToClient(clientId, message) {
        return this.transportManager.sendToHTTPClient(clientId, message);
    }
}
exports.ShatteredMoonMCPServer = ShatteredMoonMCPServer;
//# sourceMappingURL=index.js.map