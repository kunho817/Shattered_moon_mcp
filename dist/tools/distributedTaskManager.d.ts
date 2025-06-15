export declare const distributedTaskManager: (params: {
    task: string;
    priority: number;
    complexity?: "low" | "medium" | "high" | "critical" | undefined;
    teams?: string[] | undefined;
}) => Promise<{
    content: {
        type: string;
        text: string;
    }[];
} | {
    content: {
        type: "text";
        text: string;
    }[];
}>;
//# sourceMappingURL=distributedTaskManager.d.ts.map