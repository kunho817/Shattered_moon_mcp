import { TransportType } from '../transport/manager.js';
export declare class ShatteredMoonMCPServer {
    private server;
    private transportManager;
    private transportType;
    constructor(transportType?: TransportType, httpPort?: number);
    start(): Promise<void>;
    private shutdown;
    getTransportStatus(): {
        isRunning: boolean;
        transports: {
            stdio: boolean;
            http: boolean;
        };
        httpClients?: number;
        httpPort?: number;
    };
    getHealthCheck(): Promise<{
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
    broadcastMessage(message: any): void;
    sendToClient(clientId: string, message: any): boolean;
}
//# sourceMappingURL=index.d.ts.map