import { z } from 'zod';
import type { AsyncMCPResult, DeepReadonly, NonEmptyArray } from '../utils/advanced-types.js';
export declare const DistributedTaskSchema: z.ZodObject<{
    task: z.ZodString;
    complexity: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "critical"]>>;
    teams: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    priority: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    task: string;
    priority: number;
    complexity?: "low" | "medium" | "high" | "critical" | undefined;
    teams?: string[] | undefined;
}, {
    task: string;
    complexity?: "low" | "medium" | "high" | "critical" | undefined;
    teams?: string[] | undefined;
    priority?: number | undefined;
}>;
export declare const CodeGenerateSchema: z.ZodObject<{
    type: z.ZodEnum<["component", "system", "shader", "event", "utility"]>;
    name: z.ZodString;
    config: z.ZodOptional<z.ZodObject<{
        namespace: z.ZodOptional<z.ZodString>;
        dependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        optimize: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        optimize: boolean;
        namespace?: string | undefined;
        dependencies?: string[] | undefined;
    }, {
        namespace?: string | undefined;
        dependencies?: string[] | undefined;
        optimize?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "component" | "system" | "shader" | "event" | "utility";
    name: string;
    config?: {
        optimize: boolean;
        namespace?: string | undefined;
        dependencies?: string[] | undefined;
    } | undefined;
}, {
    type: "component" | "system" | "shader" | "event" | "utility";
    name: string;
    config?: {
        namespace?: string | undefined;
        dependencies?: string[] | undefined;
        optimize?: boolean | undefined;
    } | undefined;
}>;
export declare const TeamCoordinatorSchema: z.ZodObject<{
    action: z.ZodEnum<["share", "sync", "request", "notify"]>;
    teams: z.ZodArray<z.ZodString, "many">;
    data: z.ZodAny;
}, "strip", z.ZodTypeAny, {
    teams: string[];
    action: "share" | "sync" | "request" | "notify";
    data?: any;
}, {
    teams: string[];
    action: "share" | "sync" | "request" | "notify";
    data?: any;
}>;
export declare const DynamicTeamExpanderSchema: z.ZodObject<{
    specialists: z.ZodArray<z.ZodString, "many">;
    context: z.ZodString;
    duration: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    specialists: string[];
    context: string;
    duration?: number | undefined;
}, {
    specialists: string[];
    context: string;
    duration?: number | undefined;
}>;
export declare const QueryProjectSchema: z.ZodObject<{
    query: z.ZodString;
    scope: z.ZodDefault<z.ZodEnum<["code", "docs", "all"]>>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    query: string;
    scope: "code" | "docs" | "all";
    limit: number;
}, {
    query: string;
    scope?: "code" | "docs" | "all" | undefined;
    limit?: number | undefined;
}>;
export declare const GitHubManagerSchema: z.ZodObject<{
    action: z.ZodEnum<["commit", "push", "pull", "pr", "issue", "status", "branch", "tag", "release", "workflow"]>;
    data: z.ZodObject<{
        message: z.ZodOptional<z.ZodString>;
        branch: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        body: z.ZodOptional<z.ZodString>;
        files: z.ZodOptional<z.ZodString>;
        force: z.ZodOptional<z.ZodBoolean>;
        remote: z.ZodOptional<z.ZodString>;
        rebase: z.ZodOptional<z.ZodBoolean>;
        baseBranch: z.ZodOptional<z.ZodString>;
        labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        action: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
        push: z.ZodOptional<z.ZodBoolean>;
        tag: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
        draft: z.ZodOptional<z.ZodBoolean>;
        prerelease: z.ZodOptional<z.ZodBoolean>;
        workflow: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message?: string | undefined;
        push?: boolean | undefined;
        name?: string | undefined;
        action?: string | undefined;
        branch?: string | undefined;
        tag?: string | undefined;
        workflow?: string | undefined;
        title?: string | undefined;
        body?: string | undefined;
        files?: string | undefined;
        force?: boolean | undefined;
        remote?: string | undefined;
        rebase?: boolean | undefined;
        baseBranch?: string | undefined;
        labels?: string[] | undefined;
        notes?: string | undefined;
        draft?: boolean | undefined;
        prerelease?: boolean | undefined;
    }, {
        message?: string | undefined;
        push?: boolean | undefined;
        name?: string | undefined;
        action?: string | undefined;
        branch?: string | undefined;
        tag?: string | undefined;
        workflow?: string | undefined;
        title?: string | undefined;
        body?: string | undefined;
        files?: string | undefined;
        force?: boolean | undefined;
        remote?: string | undefined;
        rebase?: boolean | undefined;
        baseBranch?: string | undefined;
        labels?: string[] | undefined;
        notes?: string | undefined;
        draft?: boolean | undefined;
        prerelease?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    data: {
        message?: string | undefined;
        push?: boolean | undefined;
        name?: string | undefined;
        action?: string | undefined;
        branch?: string | undefined;
        tag?: string | undefined;
        workflow?: string | undefined;
        title?: string | undefined;
        body?: string | undefined;
        files?: string | undefined;
        force?: boolean | undefined;
        remote?: string | undefined;
        rebase?: boolean | undefined;
        baseBranch?: string | undefined;
        labels?: string[] | undefined;
        notes?: string | undefined;
        draft?: boolean | undefined;
        prerelease?: boolean | undefined;
    };
    action: "push" | "status" | "commit" | "pull" | "pr" | "issue" | "branch" | "tag" | "release" | "workflow";
}, {
    data: {
        message?: string | undefined;
        push?: boolean | undefined;
        name?: string | undefined;
        action?: string | undefined;
        branch?: string | undefined;
        tag?: string | undefined;
        workflow?: string | undefined;
        title?: string | undefined;
        body?: string | undefined;
        files?: string | undefined;
        force?: boolean | undefined;
        remote?: string | undefined;
        rebase?: boolean | undefined;
        baseBranch?: string | undefined;
        labels?: string[] | undefined;
        notes?: string | undefined;
        draft?: boolean | undefined;
        prerelease?: boolean | undefined;
    };
    action: "push" | "status" | "commit" | "pull" | "pr" | "issue" | "branch" | "tag" | "release" | "workflow";
}>;
export declare const ProjectMetadataSchema: z.ZodObject<{
    action: z.ZodEnum<["get", "update", "analyze"]>;
    metric: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    action: "get" | "update" | "analyze";
    metric?: string | undefined;
}, {
    action: "get" | "update" | "analyze";
    metric?: string | undefined;
}>;
export declare const ParallelOptimizerSchema: z.ZodObject<{
    tasks: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        complexity: z.ZodNumber;
        dependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        complexity: number;
        id: string;
        dependencies?: string[] | undefined;
    }, {
        complexity: number;
        id: string;
        dependencies?: string[] | undefined;
    }>, "many">;
    threads: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    tasks: {
        complexity: number;
        id: string;
        dependencies?: string[] | undefined;
    }[];
    threads?: number | undefined;
}, {
    tasks: {
        complexity: number;
        id: string;
        dependencies?: string[] | undefined;
    }[];
    threads?: number | undefined;
}>;
export declare const PerformanceMetricsSchema: z.ZodObject<{
    metric: z.ZodEnum<["tool", "overall", "trends", "recommendations"]>;
    timeRange: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    metric: "tool" | "overall" | "trends" | "recommendations";
    timeRange?: number | undefined;
}, {
    metric: "tool" | "overall" | "trends" | "recommendations";
    timeRange?: number | undefined;
}>;
export declare const ResourceListSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<["files", "teams", "specialists", "metrics"]>>;
}, "strip", z.ZodTypeAny, {
    type?: "teams" | "specialists" | "files" | "metrics" | undefined;
}, {
    type?: "teams" | "specialists" | "files" | "metrics" | undefined;
}>;
export declare const PromptArgumentsSchema: z.ZodObject<{
    task: z.ZodOptional<z.ZodString>;
    context: z.ZodOptional<z.ZodString>;
    style: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    task?: string | undefined;
    context?: string | undefined;
    style?: string | undefined;
}, {
    task?: string | undefined;
    context?: string | undefined;
    style?: string | undefined;
}>;
export type DistributedTaskParams = z.infer<typeof DistributedTaskSchema>;
export type CodeGenerateParams = z.infer<typeof CodeGenerateSchema>;
export type TeamCoordinatorParams = z.infer<typeof TeamCoordinatorSchema>;
export type DynamicTeamExpanderParams = z.infer<typeof DynamicTeamExpanderSchema>;
export type QueryProjectParams = z.infer<typeof QueryProjectSchema>;
export type GitHubManagerParams = z.infer<typeof GitHubManagerSchema>;
export type ProjectMetadataParams = z.infer<typeof ProjectMetadataSchema>;
export type ParallelOptimizerParams = z.infer<typeof ParallelOptimizerSchema>;
export type PerformanceMetricsParams = z.infer<typeof PerformanceMetricsSchema>;
export declare const VIRTUAL_TEAMS: {
    readonly planning: {
        readonly name: "Planning Team";
        readonly specialists: readonly ["game-designer", "ux-researcher", "product-manager"];
    };
    readonly backend: {
        readonly name: "Backend Team";
        readonly specialists: readonly ["ecs-specialist", "memory-expert", "algorithm-specialist"];
    };
    readonly frontend: {
        readonly name: "Frontend Team";
        readonly specialists: readonly ["dx12-specialist", "shader-wizard", "graphics-engineer"];
    };
    readonly testing: {
        readonly name: "Testing Team";
        readonly specialists: readonly ["qa-engineer", "performance-tester", "automation-specialist"];
    };
    readonly documentation: {
        readonly name: "Documentation Team";
        readonly specialists: readonly ["technical-writer", "api-documenter", "tutorial-creator"];
    };
    readonly performance: {
        readonly name: "Performance Team";
        readonly specialists: readonly ["profiler-expert", "optimization-specialist", "benchmark-analyst"];
    };
    readonly devops: {
        readonly name: "DevOps Team";
        readonly specialists: readonly ["ci-cd-engineer", "deployment-specialist", "release-manager"];
    };
};
export declare const SPECIALISTS: {
    readonly 'shader-wizard': {
        readonly expertise: "HLSL shader optimization and effects";
    };
    readonly 'dx12-specialist': {
        readonly expertise: "DirectX 12 pipeline and rendering";
    };
    readonly 'memory-expert': {
        readonly expertise: "Memory management and optimization";
    };
    readonly 'algorithm-specialist': {
        readonly expertise: "Data structures and algorithms";
    };
    readonly 'concurrency-expert': {
        readonly expertise: "Multithreading and parallelization";
    };
    readonly 'ecs-specialist': {
        readonly expertise: "Entity Component System architecture";
    };
    readonly 'physics-engineer': {
        readonly expertise: "Physics simulation and collision";
    };
    readonly 'ai-specialist': {
        readonly expertise: "Game AI and behavior trees";
    };
    readonly 'networking-expert': {
        readonly expertise: "Network programming and multiplayer";
    };
    readonly 'audio-engineer': {
        readonly expertise: "Audio systems and DSP";
    };
    readonly 'ui-specialist': {
        readonly expertise: "User interface and HUD systems";
    };
    readonly 'tools-developer': {
        readonly expertise: "Editor and tooling development";
    };
    readonly 'build-engineer': {
        readonly expertise: "Build systems and pipelines";
    };
    readonly 'security-specialist': {
        readonly expertise: "Security and anti-cheat systems";
    };
    readonly 'database-expert': {
        readonly expertise: "Data persistence and saves";
    };
    readonly 'game-economist': {
        readonly expertise: "Game economy and balance";
    };
    readonly 'level-designer': {
        readonly expertise: "Level design and world building";
    };
    readonly 'vfx-artist': {
        readonly expertise: "Visual effects and particles";
    };
    readonly 'animation-programmer': {
        readonly expertise: "Animation systems and blending";
    };
    readonly 'procedural-expert': {
        readonly expertise: "Procedural generation algorithms";
    };
    readonly 'platform-specialist': {
        readonly expertise: "Platform-specific optimizations";
    };
    readonly 'localization-expert': {
        readonly expertise: "Internationalization and localization";
    };
    readonly 'analytics-engineer': {
        readonly expertise: "Telemetry and player analytics";
    };
    readonly 'cloud-architect': {
        readonly expertise: "Cloud services and backends";
    };
    readonly 'mod-support-dev': {
        readonly expertise: "Modding API and support";
    };
};
export type TeamName = keyof typeof VIRTUAL_TEAMS;
export type SpecialistType = keyof typeof SPECIALISTS;
export interface MCPToolResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    code?: string;
    suggestions?: string[];
    metadata?: Record<string, unknown>;
    tool: string;
    executionTime?: number;
    resourceUsage?: {
        memory: number;
        cpu: number;
    };
}
export type AsyncMCPToolResult<T = any> = AsyncMCPResult<T>;
export interface TeamStatus {
    readonly name: string;
    readonly specialists: ReadonlyArray<SpecialistType>;
    active: boolean;
    currentTasks: number;
    completed: number;
    performance: number;
    lastActive: Date;
}
export interface SpecialistStatus {
    readonly type: SpecialistType;
    readonly expertise: string;
    active: boolean;
    currentTask?: string;
    performance: number;
    totalTasks: number;
}
export interface Task<TParams = unknown> {
    readonly id: string;
    readonly description: string;
    readonly complexity: 'low' | 'medium' | 'high' | 'critical';
    readonly priority: number;
    readonly assignedTeam?: TeamName;
    readonly assignedSpecialist?: SpecialistType;
    parameters?: TParams;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    estimatedDuration?: number;
    actualDuration?: number;
}
export type TaskWithGenericParams<T extends keyof ToolParamTypes> = Task<ToolParamTypes[T]>;
export interface ToolParamTypes {
    distributedTask: DistributedTaskParams;
    codeGenerate: CodeGenerateParams;
    teamCoordinator: TeamCoordinatorParams;
    dynamicTeamExpander: DynamicTeamExpanderParams;
    queryProject: QueryProjectParams;
    githubManager: GitHubManagerParams;
    projectMetadata: ProjectMetadataParams;
    parallelOptimizer: ParallelOptimizerParams;
    performanceMetrics: PerformanceMetricsParams;
}
export type ValidationResult<T> = {
    success: true;
    data: T;
    warnings?: string[];
} | {
    success: false;
    errors: string[];
    partial?: Partial<T>;
};
export interface PerformanceSnapshot {
    timestamp: Date;
    cpu: number;
    memory: number;
    activeConnections: number;
    requestsPerSecond: number;
    averageResponseTime: number;
    errorRate: number;
}
export interface ToolExecutionMetrics {
    toolName: string;
    executionCount: number;
    averageExecutionTime: number;
    successRate: number;
    lastExecuted: Date;
    errorMessages: string[];
}
export interface ServerConfiguration extends DeepReadonly<{
    server: {
        name: string;
        version: string;
        description: string;
    };
    transport: {
        stdio: boolean;
        http?: {
            enabled: boolean;
            port: number;
            cors: boolean;
            rateLimit: {
                windowMs: number;
                maxRequests: number;
            };
        };
        websocket?: {
            enabled: boolean;
            port: number;
            pingInterval: number;
        };
    };
    security: {
        validateInput: boolean;
        sanitizeOutput: boolean;
        maxPayloadSize: number;
        allowedOrigins: NonEmptyArray<string>;
    };
    logging: {
        level: 'debug' | 'info' | 'warn' | 'error';
        format: 'json' | 'simple' | 'detailed';
        includeTimestamp: boolean;
        includeMetadata: boolean;
    };
    performance: {
        enableMonitoring: boolean;
        metricsRetentionHours: number;
        circuitBreaker: {
            enabled: boolean;
            failureThreshold: number;
            recoveryTimeMs: number;
        };
    };
    teams: {
        maxConcurrentTasks: number;
        taskTimeoutMs: number;
        specialistRotation: boolean;
        loadBalancing: 'round_robin' | 'least_loaded' | 'priority_based';
    };
}> {
}
export interface MCPServerEvents {
    'tool:executed': (toolName: string, params: any, result: MCPToolResult) => void;
    'team:assigned': (teamName: TeamName, taskId: string) => void;
    'specialist:activated': (specialistType: SpecialistType, context: string) => void;
    'performance:threshold': (metric: string, value: number, threshold: number) => void;
    'error:occurred': (error: Error, context: string) => void;
    'server:started': () => void;
    'server:stopped': () => void;
    'client:connected': (clientId: string) => void;
    'client:disconnected': (clientId: string) => void;
}
export interface ResourceInfo {
    uri: string;
    name: string;
    description?: string;
    mimeType?: string;
    size?: number;
    lastModified?: Date;
}
export interface PromptInfo {
    name: string;
    description?: string;
    arguments?: Array<{
        name: string;
        description?: string;
        required?: boolean;
    }>;
}
export interface StateSnapshot<T = any> {
    namespace: string;
    key: string;
    value: T;
    ttl?: number;
    createdAt: Date;
    lastAccessed: Date;
    accessCount: number;
}
export interface ToolDefinition<TParams = any, TResult = any> {
    readonly name: string;
    readonly description: string;
    readonly inputSchema: z.ZodSchema<TParams>;
    handler: (params: TParams) => Promise<MCPToolResult<TResult>>;
    middleware?: Array<ToolMiddleware<TParams>>;
    rateLimit?: {
        maxRequests: number;
        windowMs: number;
    };
    timeout?: number;
}
export type ToolMiddleware<TParams = any> = (params: TParams, context: ToolExecutionContext) => Promise<TParams | void>;
export interface ToolExecutionContext {
    toolName: string;
    clientId?: string;
    requestId: string;
    startTime: Date;
    metadata: Record<string, any>;
}
export type * from '../utils/advanced-types.js';
//# sourceMappingURL=index.d.ts.map