export declare const teamCoordinator: (params: {
    teams: string[];
    action: "share" | "sync" | "request" | "notify";
    data?: any;
}) => Promise<{
    content: Array<{
        type: "text";
        text: string;
    }>;
} | {
    content: {
        type: "text";
        text: string;
    }[];
}>;
//# sourceMappingURL=teamCoordinator.d.ts.map