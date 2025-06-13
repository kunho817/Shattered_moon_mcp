import { Response } from 'express';
import { EventEmitter } from 'events';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
export interface SSEClient {
    id: string;
    response: Response;
    lastSeen: Date;
    sessionId?: string;
    sessionData?: any;
}
export declare class StreamableHTTPTransport extends EventEmitter {
    private app;
    private server;
    private clients;
    private rateLimiter;
    private mcpServer;
    private isRunning;
    constructor(mcpServer: Server, port?: number);
    private setupMiddleware;
    private setupRoutes;
    private handleSSEConnection;
    private handleMCPMessage;
    private processMCPMessage;
    private sendSSEMessage;
    private generateClientId;
    private setupCleanup;
    start(port?: number): Promise<void>;
    stop(): Promise<void>;
    broadcast(message: any): void;
    sendToClient(clientId: string, message: any): boolean;
    getClientCount(): number;
    getClients(): SSEClient[];
    isRunningStatus(): boolean;
}
//# sourceMappingURL=http.d.ts.map