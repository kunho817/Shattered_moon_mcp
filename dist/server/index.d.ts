export declare class ShatteredMoonMCPServer {
    private server;
    private transport;
    private circuitBreakers;
    constructor();
    private initializeCircuitBreakers;
    private setupHandlers;
    start(): Promise<void>;
    private shutdown;
    getToolHandler(name: string): any;
}
declare module '@modelcontextprotocol/sdk/server/index.js' {
    interface Server {
        getToolHandler?(name: string): any;
        getPromptHandler?(name: string): any;
    }
}
//# sourceMappingURL=index.d.ts.map