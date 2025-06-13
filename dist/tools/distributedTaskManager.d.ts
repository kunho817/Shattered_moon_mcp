export declare const distributedTaskManager: (params: {
    task: string;
    priority: number;
    complexity?: "low" | "medium" | "high" | "critical" | undefined;
    teams?: string[] | undefined;
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
//# sourceMappingURL=distributedTaskManager.d.ts.map