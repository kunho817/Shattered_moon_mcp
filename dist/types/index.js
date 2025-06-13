"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SPECIALISTS = exports.VIRTUAL_TEAMS = exports.PromptArgumentsSchema = exports.ResourceListSchema = exports.PerformanceMetricsSchema = exports.ParallelOptimizerSchema = exports.ProjectMetadataSchema = exports.GitHubManagerSchema = exports.QueryProjectSchema = exports.DynamicTeamExpanderSchema = exports.TeamCoordinatorSchema = exports.CodeGenerateSchema = exports.DistributedTaskSchema = void 0;
const zod_1 = require("zod");
// Tool parameter schemas
exports.DistributedTaskSchema = zod_1.z.object({
    task: zod_1.z.string().describe('Task description'),
    complexity: zod_1.z.enum(['low', 'medium', 'high', 'critical']).optional(),
    teams: zod_1.z.array(zod_1.z.string()).optional(),
    priority: zod_1.z.number().min(1).max(10).default(5)
});
exports.CodeGenerateSchema = zod_1.z.object({
    type: zod_1.z.enum(['component', 'system', 'shader', 'event', 'utility']),
    name: zod_1.z.string(),
    config: zod_1.z.object({
        namespace: zod_1.z.string().optional(),
        dependencies: zod_1.z.array(zod_1.z.string()).optional(),
        optimize: zod_1.z.boolean().default(true)
    }).optional()
});
exports.TeamCoordinatorSchema = zod_1.z.object({
    action: zod_1.z.enum(['share', 'sync', 'request', 'notify']),
    teams: zod_1.z.array(zod_1.z.string()),
    data: zod_1.z.any()
});
exports.DynamicTeamExpanderSchema = zod_1.z.object({
    specialists: zod_1.z.array(zod_1.z.string()),
    context: zod_1.z.string(),
    duration: zod_1.z.number().optional()
});
exports.QueryProjectSchema = zod_1.z.object({
    query: zod_1.z.string(),
    scope: zod_1.z.enum(['code', 'docs', 'all']).default('all'),
    limit: zod_1.z.number().default(10)
});
exports.GitHubManagerSchema = zod_1.z.object({
    action: zod_1.z.enum(['commit', 'push', 'pull', 'pr', 'issue', 'status', 'branch', 'tag', 'release', 'workflow']),
    data: zod_1.z.object({
        message: zod_1.z.string().optional(),
        branch: zod_1.z.string().optional(),
        title: zod_1.z.string().optional(),
        body: zod_1.z.string().optional(),
        files: zod_1.z.string().optional(),
        force: zod_1.z.boolean().optional(),
        remote: zod_1.z.string().optional(),
        rebase: zod_1.z.boolean().optional(),
        baseBranch: zod_1.z.string().optional(),
        labels: zod_1.z.array(zod_1.z.string()).optional(),
        action: zod_1.z.string().optional(),
        name: zod_1.z.string().optional(),
        push: zod_1.z.boolean().optional(),
        tag: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional(),
        draft: zod_1.z.boolean().optional(),
        prerelease: zod_1.z.boolean().optional(),
        workflow: zod_1.z.string().optional()
    })
});
exports.ProjectMetadataSchema = zod_1.z.object({
    action: zod_1.z.enum(['get', 'update', 'analyze']),
    metric: zod_1.z.string().optional()
});
exports.ParallelOptimizerSchema = zod_1.z.object({
    tasks: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        complexity: zod_1.z.number(),
        dependencies: zod_1.z.array(zod_1.z.string()).optional()
    })),
    threads: zod_1.z.number().optional()
});
exports.PerformanceMetricsSchema = zod_1.z.object({
    metric: zod_1.z.enum(['tool', 'overall', 'trends', 'recommendations']),
    timeRange: zod_1.z.number().optional()
});
// Resource schemas
exports.ResourceListSchema = zod_1.z.object({
    type: zod_1.z.enum(['files', 'teams', 'specialists', 'metrics']).optional()
});
// Prompt schemas
exports.PromptArgumentsSchema = zod_1.z.object({
    task: zod_1.z.string().optional(),
    context: zod_1.z.string().optional(),
    style: zod_1.z.string().optional()
});
// Team definitions
exports.VIRTUAL_TEAMS = {
    planning: {
        name: 'Planning Team',
        specialists: ['game-designer', 'ux-researcher', 'product-manager']
    },
    backend: {
        name: 'Backend Team',
        specialists: ['ecs-specialist', 'memory-expert', 'algorithm-specialist']
    },
    frontend: {
        name: 'Frontend Team',
        specialists: ['dx12-specialist', 'shader-wizard', 'graphics-engineer']
    },
    testing: {
        name: 'Testing Team',
        specialists: ['qa-engineer', 'performance-tester', 'automation-specialist']
    },
    documentation: {
        name: 'Documentation Team',
        specialists: ['technical-writer', 'api-documenter', 'tutorial-creator']
    },
    performance: {
        name: 'Performance Team',
        specialists: ['profiler-expert', 'optimization-specialist', 'benchmark-analyst']
    },
    devops: {
        name: 'DevOps Team',
        specialists: ['ci-cd-engineer', 'deployment-specialist', 'release-manager']
    }
};
// Specialist definitions
exports.SPECIALISTS = {
    'shader-wizard': { expertise: 'HLSL shader optimization and effects' },
    'dx12-specialist': { expertise: 'DirectX 12 pipeline and rendering' },
    'memory-expert': { expertise: 'Memory management and optimization' },
    'algorithm-specialist': { expertise: 'Data structures and algorithms' },
    'concurrency-expert': { expertise: 'Multithreading and parallelization' },
    'ecs-specialist': { expertise: 'Entity Component System architecture' },
    'physics-engineer': { expertise: 'Physics simulation and collision' },
    'ai-specialist': { expertise: 'Game AI and behavior trees' },
    'networking-expert': { expertise: 'Network programming and multiplayer' },
    'audio-engineer': { expertise: 'Audio systems and DSP' },
    'ui-specialist': { expertise: 'User interface and HUD systems' },
    'tools-developer': { expertise: 'Editor and tooling development' },
    'build-engineer': { expertise: 'Build systems and pipelines' },
    'security-specialist': { expertise: 'Security and anti-cheat systems' },
    'database-expert': { expertise: 'Data persistence and saves' },
    'game-economist': { expertise: 'Game economy and balance' },
    'level-designer': { expertise: 'Level design and world building' },
    'vfx-artist': { expertise: 'Visual effects and particles' },
    'animation-programmer': { expertise: 'Animation systems and blending' },
    'procedural-expert': { expertise: 'Procedural generation algorithms' },
    'platform-specialist': { expertise: 'Platform-specific optimizations' },
    'localization-expert': { expertise: 'Internationalization and localization' },
    'analytics-engineer': { expertise: 'Telemetry and player analytics' },
    'cloud-architect': { expertise: 'Cloud services and backends' },
    'mod-support-dev': { expertise: 'Modding API and support' }
};
//# sourceMappingURL=index.js.map