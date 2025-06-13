import { EventEmitter } from 'events';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
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
export declare class TransportManager extends EventEmitter {
    private mcpServer;
    private httpTransport?;
    private stdioTransport?;
    private config;
    private isRunning;
    constructor(mcpServer: Server, config: TransportConfig);
    start(): Promise<void>;
    private startStdio;
    private startHTTP;
    private startBoth;
    stop(): Promise<void>;
    getStatus(): {
        isRunning: boolean;
        transports: {
            stdio: boolean;
            http: boolean;
        };
        httpClients?: number;
        httpPort?: number;
    };
    broadcastToHTTPClients(message: any): void;
    sendToHTTPClient(clientId: string, message: any): boolean;
    getHTTPClients(): any[];
    updateConfig(newConfig: Partial<TransportConfig>): void;
    getConfig(): TransportConfig;
    healthCheck(): Promise<{
        healthy: boolean;
        transports: {
            stdio: {
                status: string;
            };
            http: {
                status: string;
                port?: number;
                clients?: number;
            };
        };
        uptime: number;
    }>;
    getEventStats(): {
        totalEvents: number;
        recentEvents: Array<{
            event: string;
            timestamp: Date;
            data?: any;
        }>;
    };
}
export declare function createTransportManager(mcpServer: Server, options?: {
    mode?: TransportType;
    httpPort?: number;
    enableCors?: boolean;
    rateLimit?: boolean;
}): TransportManager;
export declare function autoDetectTransport(): TransportType;
//# sourceMappingURL=manager.d.ts.map