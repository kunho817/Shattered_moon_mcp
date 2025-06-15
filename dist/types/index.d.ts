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
        readonly description: "HLSL shader optimization and effects specialist";
        readonly capabilities: readonly ["shader optimization", "HLSL programming", "graphics effects"];
        readonly skills: {
            readonly hlsl: 0.9;
            readonly graphics: 0.8;
            readonly optimization: 0.85;
        };
    };
    readonly 'dx12-specialist': {
        readonly expertise: "DirectX 12 pipeline and rendering";
        readonly description: "DirectX 12 pipeline and rendering specialist";
        readonly capabilities: readonly ["DirectX 12", "rendering pipeline", "graphics programming"];
        readonly skills: {
            readonly directx12: 0.9;
            readonly rendering: 0.85;
            readonly pipeline: 0.8;
        };
    };
    readonly 'memory-expert': {
        readonly expertise: "Memory management and optimization";
        readonly description: "Memory management and optimization specialist";
        readonly capabilities: readonly ["memory management", "performance optimization", "debugging"];
        readonly skills: {
            readonly memory: 0.9;
            readonly optimization: 0.85;
            readonly debugging: 0.8;
        };
    };
    readonly 'algorithm-specialist': {
        readonly expertise: "Data structures and algorithms";
        readonly description: "Data structures and algorithms specialist";
        readonly capabilities: readonly ["algorithm design", "data structures", "performance analysis"];
        readonly skills: {
            readonly algorithms: 0.9;
            readonly datastructures: 0.85;
            readonly analysis: 0.8;
        };
    };
    readonly 'concurrency-expert': {
        readonly expertise: "Multithreading and parallelization";
        readonly description: "Multithreading and parallelization specialist";
        readonly capabilities: readonly ["multithreading", "parallelization", "synchronization"];
        readonly skills: {
            readonly threading: 0.9;
            readonly parallel: 0.85;
            readonly sync: 0.8;
        };
    };
    readonly 'ecs-specialist': {
        readonly expertise: "Entity Component System architecture";
        readonly description: "Entity Component System architecture specialist";
        readonly capabilities: readonly ["ECS design", "component systems", "game architecture"];
        readonly skills: {
            readonly ecs: 0.9;
            readonly architecture: 0.85;
            readonly systems: 0.8;
        };
    };
    readonly 'physics-engineer': {
        readonly expertise: "Physics simulation and collision";
        readonly description: "Physics simulation and collision specialist";
        readonly capabilities: readonly ["physics simulation", "collision detection", "game physics"];
        readonly skills: {
            readonly physics: 0.9;
            readonly collision: 0.85;
            readonly simulation: 0.8;
        };
    };
    readonly 'ai-specialist': {
        readonly expertise: "Game AI and behavior trees";
        readonly description: "Game AI and behavior trees specialist";
        readonly capabilities: readonly ["AI programming", "behavior trees", "game logic"];
        readonly skills: {
            readonly ai: 0.9;
            readonly behavior: 0.85;
            readonly logic: 0.8;
        };
    };
    readonly 'networking-expert': {
        readonly expertise: "Network programming and multiplayer";
        readonly description: "Network programming and multiplayer specialist";
        readonly capabilities: readonly ["network programming", "multiplayer", "protocols"];
        readonly skills: {
            readonly networking: 0.9;
            readonly multiplayer: 0.85;
            readonly protocols: 0.8;
        };
    };
    readonly 'audio-engineer': {
        readonly expertise: "Audio systems and DSP";
        readonly description: "Audio systems and DSP specialist";
        readonly capabilities: readonly ["audio programming", "DSP", "sound systems"];
        readonly skills: {
            readonly audio: 0.9;
            readonly dsp: 0.85;
            readonly sound: 0.8;
        };
    };
    readonly 'ui-specialist': {
        readonly expertise: "User interface and HUD systems";
        readonly description: "User interface and HUD systems specialist";
        readonly capabilities: readonly ["UI design", "HUD systems", "user experience"];
        readonly skills: {
            readonly ui: 0.9;
            readonly hud: 0.85;
            readonly ux: 0.8;
        };
    };
    readonly 'tools-developer': {
        readonly expertise: "Editor and tooling development";
        readonly description: "Editor and tooling development specialist";
        readonly capabilities: readonly ["tool development", "editor scripting", "automation"];
        readonly skills: {
            readonly tools: 0.9;
            readonly editor: 0.85;
            readonly automation: 0.8;
        };
    };
    readonly 'build-engineer': {
        readonly expertise: "Build systems and pipelines";
        readonly description: "Build systems and pipelines specialist";
        readonly capabilities: readonly ["build systems", "CI/CD", "automation"];
        readonly skills: {
            readonly build: 0.9;
            readonly cicd: 0.85;
            readonly pipelines: 0.8;
        };
    };
    readonly 'security-specialist': {
        readonly expertise: "Security and anti-cheat systems";
        readonly description: "Security and anti-cheat systems specialist";
        readonly capabilities: readonly ["security", "anti-cheat", "encryption"];
        readonly skills: {
            readonly security: 0.9;
            readonly anticheat: 0.85;
            readonly encryption: 0.8;
        };
    };
    readonly 'database-expert': {
        readonly expertise: "Data persistence and saves";
        readonly description: "Data persistence and saves specialist";
        readonly capabilities: readonly ["database design", "save systems", "data management"];
        readonly skills: {
            readonly database: 0.9;
            readonly persistence: 0.85;
            readonly data: 0.8;
        };
    };
    readonly 'game-economist': {
        readonly expertise: "Game economy and balance";
        readonly description: "Game economy and balance specialist";
        readonly capabilities: readonly ["game balance", "economy design", "player psychology"];
        readonly skills: {
            readonly balance: 0.9;
            readonly economy: 0.85;
            readonly psychology: 0.8;
        };
    };
    readonly 'level-designer': {
        readonly expertise: "Level design and world building";
        readonly description: "Level design and world building specialist";
        readonly capabilities: readonly ["level design", "world building", "gameplay flow"];
        readonly skills: {
            readonly level: 0.9;
            readonly world: 0.85;
            readonly gameplay: 0.8;
        };
    };
    readonly 'vfx-artist': {
        readonly expertise: "Visual effects and particles";
        readonly description: "Visual effects and particles specialist";
        readonly capabilities: readonly ["VFX design", "particle systems", "visual polish"];
        readonly skills: {
            readonly vfx: 0.9;
            readonly particles: 0.85;
            readonly visual: 0.8;
        };
    };
    readonly 'animation-programmer': {
        readonly expertise: "Animation systems and blending";
        readonly description: "Animation systems and blending specialist";
        readonly capabilities: readonly ["animation programming", "blend trees", "skeletal animation"];
        readonly skills: {
            readonly animation: 0.9;
            readonly blending: 0.85;
            readonly skeletal: 0.8;
        };
    };
    readonly 'procedural-expert': {
        readonly expertise: "Procedural generation algorithms";
        readonly description: "Procedural generation algorithms specialist";
        readonly capabilities: readonly ["procedural generation", "algorithms", "noise functions"];
        readonly skills: {
            readonly procedural: 0.9;
            readonly algorithms: 0.85;
            readonly noise: 0.8;
        };
    };
    readonly 'platform-specialist': {
        readonly expertise: "Platform-specific optimizations";
        readonly description: "Platform-specific optimizations specialist";
        readonly capabilities: readonly ["platform optimization", "cross-platform", "hardware specifics"];
        readonly skills: {
            readonly platform: 0.9;
            readonly optimization: 0.85;
            readonly hardware: 0.8;
        };
    };
    readonly 'localization-expert': {
        readonly expertise: "Internationalization and localization";
        readonly description: "Internationalization and localization specialist";
        readonly capabilities: readonly ["i18n", "localization", "cultural adaptation"];
        readonly skills: {
            readonly i18n: 0.9;
            readonly localization: 0.85;
            readonly cultural: 0.8;
        };
    };
    readonly 'analytics-engineer': {
        readonly expertise: "Telemetry and player analytics";
        readonly description: "Telemetry and player analytics specialist";
        readonly capabilities: readonly ["analytics", "telemetry", "data analysis"];
        readonly skills: {
            readonly analytics: 0.9;
            readonly telemetry: 0.85;
            readonly data: 0.8;
        };
    };
    readonly 'cloud-architect': {
        readonly expertise: "Cloud services and backends";
        readonly description: "Cloud services and backends specialist";
        readonly capabilities: readonly ["cloud architecture", "backend services", "scalability"];
        readonly skills: {
            readonly cloud: 0.9;
            readonly backend: 0.85;
            readonly scalability: 0.8;
        };
    };
    readonly 'mod-support-dev': {
        readonly expertise: "Modding API and support";
        readonly description: "Modding API and support specialist";
        readonly capabilities: readonly ["API design", "modding support", "extensibility"];
        readonly skills: {
            readonly api: 0.9;
            readonly modding: 0.85;
            readonly extensibility: 0.8;
        };
    };
    readonly 'claude-code-specialist': {
        readonly expertise: "Claude Code integration and optimization";
        readonly description: "Claude Code integration and optimization specialist";
        readonly capabilities: readonly ["AI integration", "prompt engineering", "model selection"];
        readonly skills: {
            readonly ai: 0.95;
            readonly prompts: 0.9;
            readonly integration: 0.88;
        };
    };
    readonly 'real-time-analytics-expert': {
        readonly expertise: "Real-time performance analytics";
        readonly description: "Real-time performance analytics specialist";
        readonly capabilities: readonly ["analytics", "real-time monitoring", "data visualization"];
        readonly skills: {
            readonly analytics: 0.92;
            readonly monitoring: 0.9;
            readonly visualization: 0.85;
        };
    };
    readonly 'memory-optimization-specialist': {
        readonly expertise: "Advanced memory management and optimization";
        readonly description: "Advanced memory management and optimization specialist";
        readonly capabilities: readonly ["memory optimization", "garbage collection", "cache efficiency"];
        readonly skills: {
            readonly memory: 0.95;
            readonly optimization: 0.9;
            readonly cache: 0.88;
        };
    };
    readonly 'parallel-computing-expert': {
        readonly expertise: "Parallel computing and multithreading";
        readonly description: "Parallel computing and multithreading specialist";
        readonly capabilities: readonly ["parallel processing", "thread management", "concurrency"];
        readonly skills: {
            readonly parallel: 0.93;
            readonly threading: 0.9;
            readonly concurrency: 0.87;
        };
    };
    readonly 'distributed-systems-architect': {
        readonly expertise: "Distributed systems and microservices";
        readonly description: "Distributed systems and microservices specialist";
        readonly capabilities: readonly ["distributed architecture", "microservices", "scalability"];
        readonly skills: {
            readonly distributed: 0.92;
            readonly microservices: 0.88;
            readonly scalability: 0.85;
        };
    };
    readonly 'ai-behavior-specialist': {
        readonly expertise: "AI behavior and decision trees";
        readonly description: "AI behavior and decision trees specialist";
        readonly capabilities: readonly ["AI behavior", "decision trees", "state machines"];
        readonly skills: {
            readonly ai: 0.9;
            readonly behavior: 0.88;
            readonly decisions: 0.85;
        };
    };
    readonly 'procedural-generation-expert': {
        readonly expertise: "Procedural content generation";
        readonly description: "Procedural content generation specialist";
        readonly capabilities: readonly ["procedural generation", "noise algorithms", "random systems"];
        readonly skills: {
            readonly procedural: 0.92;
            readonly noise: 0.88;
            readonly randomization: 0.85;
        };
    };
    readonly 'cloud-infrastructure-specialist': {
        readonly expertise: "Cloud deployment and infrastructure";
        readonly description: "Cloud deployment and infrastructure specialist";
        readonly capabilities: readonly ["cloud deployment", "infrastructure", "DevOps"];
        readonly skills: {
            readonly cloud: 0.9;
            readonly infrastructure: 0.88;
            readonly devops: 0.85;
        };
    };
    readonly 'data-science-analyst': {
        readonly expertise: "Game data analysis and player insights";
        readonly description: "Game data analysis and player insights specialist";
        readonly capabilities: readonly ["data analysis", "player analytics", "machine learning"];
        readonly skills: {
            readonly data: 0.9;
            readonly analytics: 0.88;
            readonly ml: 0.82;
        };
    };
    readonly 'blockchain-integration-expert': {
        readonly expertise: "Blockchain and NFT integration";
        readonly description: "Blockchain and NFT integration specialist";
        readonly capabilities: readonly ["blockchain", "smart contracts", "crypto integration"];
        readonly skills: {
            readonly blockchain: 0.85;
            readonly contracts: 0.82;
            readonly crypto: 0.8;
        };
    };
    readonly 'mobile-optimization-specialist': {
        readonly expertise: "Mobile platform optimization";
        readonly description: "Mobile platform optimization specialist";
        readonly capabilities: readonly ["mobile optimization", "battery efficiency", "touch controls"];
        readonly skills: {
            readonly mobile: 0.9;
            readonly optimization: 0.88;
            readonly touch: 0.85;
        };
    };
    readonly 'web-technologies-expert': {
        readonly expertise: "Web and browser technologies";
        readonly description: "Web and browser technologies specialist";
        readonly capabilities: readonly ["web development", "WebGL", "browser optimization"];
        readonly skills: {
            readonly web: 0.88;
            readonly webgl: 0.85;
            readonly browser: 0.82;
        };
    };
    readonly 'ar-vr-specialist': {
        readonly expertise: "Augmented and Virtual Reality";
        readonly description: "Augmented and Virtual Reality specialist";
        readonly capabilities: readonly ["AR/VR development", "immersive experiences", "spatial computing"];
        readonly skills: {
            readonly ar: 0.85;
            readonly vr: 0.85;
            readonly spatial: 0.8;
        };
    };
    readonly 'quantum-computing-researcher': {
        readonly expertise: "Quantum computing applications";
        readonly description: "Quantum computing applications specialist";
        readonly capabilities: readonly ["quantum algorithms", "quantum simulation", "advanced mathematics"];
        readonly skills: {
            readonly quantum: 0.8;
            readonly algorithms: 0.85;
            readonly mathematics: 0.88;
        };
    };
    readonly 'edge-computing-specialist': {
        readonly expertise: "Edge computing and IoT integration";
        readonly description: "Edge computing and IoT integration specialist";
        readonly capabilities: readonly ["edge computing", "IoT", "distributed processing"];
        readonly skills: {
            readonly edge: 0.85;
            readonly iot: 0.82;
            readonly distributed: 0.8;
        };
    };
    readonly 'accessibility-expert': {
        readonly expertise: "Game accessibility and inclusive design";
        readonly description: "Game accessibility and inclusive design specialist";
        readonly capabilities: readonly ["accessibility", "inclusive design", "assistive technology"];
        readonly skills: {
            readonly accessibility: 0.9;
            readonly inclusive: 0.88;
            readonly assistive: 0.85;
        };
    };
    readonly 'streaming-technology-specialist': {
        readonly expertise: "Game streaming and cloud gaming";
        readonly description: "Game streaming and cloud gaming specialist";
        readonly capabilities: readonly ["streaming", "cloud gaming", "latency optimization"];
        readonly skills: {
            readonly streaming: 0.88;
            readonly cloud: 0.85;
            readonly latency: 0.82;
        };
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
interface BaseServerConfiguration {
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
}
export interface ServerConfigurationReadonly extends DeepReadonly<BaseServerConfiguration> {
}
export interface ServerConfiguration extends BaseServerConfiguration {
}
export interface MCPServerEvents {
    [key: string]: (...args: any[]) => void;
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