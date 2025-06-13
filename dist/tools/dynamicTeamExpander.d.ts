export declare const dynamicTeamExpander: (params: {
    specialists: string[];
    context: string;
    duration?: number | undefined;
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
//# sourceMappingURL=dynamicTeamExpander.d.ts.map