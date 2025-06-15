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
    'shader-wizard': {
        expertise: 'HLSL shader optimization and effects',
        description: 'HLSL shader optimization and effects specialist',
        capabilities: ['shader optimization', 'HLSL programming', 'graphics effects'],
        skills: { 'hlsl': 0.9, 'graphics': 0.8, 'optimization': 0.85 }
    },
    'dx12-specialist': {
        expertise: 'DirectX 12 pipeline and rendering',
        description: 'DirectX 12 pipeline and rendering specialist',
        capabilities: ['DirectX 12', 'rendering pipeline', 'graphics programming'],
        skills: { 'directx12': 0.9, 'rendering': 0.85, 'pipeline': 0.8 }
    },
    'memory-expert': {
        expertise: 'Memory management and optimization',
        description: 'Memory management and optimization specialist',
        capabilities: ['memory management', 'performance optimization', 'debugging'],
        skills: { 'memory': 0.9, 'optimization': 0.85, 'debugging': 0.8 }
    },
    'algorithm-specialist': {
        expertise: 'Data structures and algorithms',
        description: 'Data structures and algorithms specialist',
        capabilities: ['algorithm design', 'data structures', 'performance analysis'],
        skills: { 'algorithms': 0.9, 'datastructures': 0.85, 'analysis': 0.8 }
    },
    'concurrency-expert': {
        expertise: 'Multithreading and parallelization',
        description: 'Multithreading and parallelization specialist',
        capabilities: ['multithreading', 'parallelization', 'synchronization'],
        skills: { 'threading': 0.9, 'parallel': 0.85, 'sync': 0.8 }
    },
    'ecs-specialist': {
        expertise: 'Entity Component System architecture',
        description: 'Entity Component System architecture specialist',
        capabilities: ['ECS design', 'component systems', 'game architecture'],
        skills: { 'ecs': 0.9, 'architecture': 0.85, 'systems': 0.8 }
    },
    'physics-engineer': {
        expertise: 'Physics simulation and collision',
        description: 'Physics simulation and collision specialist',
        capabilities: ['physics simulation', 'collision detection', 'game physics'],
        skills: { 'physics': 0.9, 'collision': 0.85, 'simulation': 0.8 }
    },
    'ai-specialist': {
        expertise: 'Game AI and behavior trees',
        description: 'Game AI and behavior trees specialist',
        capabilities: ['AI programming', 'behavior trees', 'game logic'],
        skills: { 'ai': 0.9, 'behavior': 0.85, 'logic': 0.8 }
    },
    'networking-expert': {
        expertise: 'Network programming and multiplayer',
        description: 'Network programming and multiplayer specialist',
        capabilities: ['network programming', 'multiplayer', 'protocols'],
        skills: { 'networking': 0.9, 'multiplayer': 0.85, 'protocols': 0.8 }
    },
    'audio-engineer': {
        expertise: 'Audio systems and DSP',
        description: 'Audio systems and DSP specialist',
        capabilities: ['audio programming', 'DSP', 'sound systems'],
        skills: { 'audio': 0.9, 'dsp': 0.85, 'sound': 0.8 }
    },
    'ui-specialist': {
        expertise: 'User interface and HUD systems',
        description: 'User interface and HUD systems specialist',
        capabilities: ['UI design', 'HUD systems', 'user experience'],
        skills: { 'ui': 0.9, 'hud': 0.85, 'ux': 0.8 }
    },
    'tools-developer': {
        expertise: 'Editor and tooling development',
        description: 'Editor and tooling development specialist',
        capabilities: ['tool development', 'editor scripting', 'automation'],
        skills: { 'tools': 0.9, 'editor': 0.85, 'automation': 0.8 }
    },
    'build-engineer': {
        expertise: 'Build systems and pipelines',
        description: 'Build systems and pipelines specialist',
        capabilities: ['build systems', 'CI/CD', 'automation'],
        skills: { 'build': 0.9, 'cicd': 0.85, 'pipelines': 0.8 }
    },
    'security-specialist': {
        expertise: 'Security and anti-cheat systems',
        description: 'Security and anti-cheat systems specialist',
        capabilities: ['security', 'anti-cheat', 'encryption'],
        skills: { 'security': 0.9, 'anticheat': 0.85, 'encryption': 0.8 }
    },
    'database-expert': {
        expertise: 'Data persistence and saves',
        description: 'Data persistence and saves specialist',
        capabilities: ['database design', 'save systems', 'data management'],
        skills: { 'database': 0.9, 'persistence': 0.85, 'data': 0.8 }
    },
    'game-economist': {
        expertise: 'Game economy and balance',
        description: 'Game economy and balance specialist',
        capabilities: ['game balance', 'economy design', 'player psychology'],
        skills: { 'balance': 0.9, 'economy': 0.85, 'psychology': 0.8 }
    },
    'level-designer': {
        expertise: 'Level design and world building',
        description: 'Level design and world building specialist',
        capabilities: ['level design', 'world building', 'gameplay flow'],
        skills: { 'level': 0.9, 'world': 0.85, 'gameplay': 0.8 }
    },
    'vfx-artist': {
        expertise: 'Visual effects and particles',
        description: 'Visual effects and particles specialist',
        capabilities: ['VFX design', 'particle systems', 'visual polish'],
        skills: { 'vfx': 0.9, 'particles': 0.85, 'visual': 0.8 }
    },
    'animation-programmer': {
        expertise: 'Animation systems and blending',
        description: 'Animation systems and blending specialist',
        capabilities: ['animation programming', 'blend trees', 'skeletal animation'],
        skills: { 'animation': 0.9, 'blending': 0.85, 'skeletal': 0.8 }
    },
    'procedural-expert': {
        expertise: 'Procedural generation algorithms',
        description: 'Procedural generation algorithms specialist',
        capabilities: ['procedural generation', 'algorithms', 'noise functions'],
        skills: { 'procedural': 0.9, 'algorithms': 0.85, 'noise': 0.8 }
    },
    'platform-specialist': {
        expertise: 'Platform-specific optimizations',
        description: 'Platform-specific optimizations specialist',
        capabilities: ['platform optimization', 'cross-platform', 'hardware specifics'],
        skills: { 'platform': 0.9, 'optimization': 0.85, 'hardware': 0.8 }
    },
    'localization-expert': {
        expertise: 'Internationalization and localization',
        description: 'Internationalization and localization specialist',
        capabilities: ['i18n', 'localization', 'cultural adaptation'],
        skills: { 'i18n': 0.9, 'localization': 0.85, 'cultural': 0.8 }
    },
    'analytics-engineer': {
        expertise: 'Telemetry and player analytics',
        description: 'Telemetry and player analytics specialist',
        capabilities: ['analytics', 'telemetry', 'data analysis'],
        skills: { 'analytics': 0.9, 'telemetry': 0.85, 'data': 0.8 }
    },
    'cloud-architect': {
        expertise: 'Cloud services and backends',
        description: 'Cloud services and backends specialist',
        capabilities: ['cloud architecture', 'backend services', 'scalability'],
        skills: { 'cloud': 0.9, 'backend': 0.85, 'scalability': 0.8 }
    },
    'mod-support-dev': {
        expertise: 'Modding API and support',
        description: 'Modding API and support specialist',
        capabilities: ['API design', 'modding support', 'extensibility'],
        skills: { 'api': 0.9, 'modding': 0.85, 'extensibility': 0.8 }
    },
    // Phase II Expanded Specialists (25 → 40+)
    'claude-code-specialist': {
        expertise: 'Claude Code integration and optimization',
        description: 'Claude Code integration and optimization specialist',
        capabilities: ['AI integration', 'prompt engineering', 'model selection'],
        skills: { 'ai': 0.95, 'prompts': 0.9, 'integration': 0.88 }
    },
    'real-time-analytics-expert': {
        expertise: 'Real-time performance analytics',
        description: 'Real-time performance analytics specialist',
        capabilities: ['analytics', 'real-time monitoring', 'data visualization'],
        skills: { 'analytics': 0.92, 'monitoring': 0.9, 'visualization': 0.85 }
    },
    'memory-optimization-specialist': {
        expertise: 'Advanced memory management and optimization',
        description: 'Advanced memory management and optimization specialist',
        capabilities: ['memory optimization', 'garbage collection', 'cache efficiency'],
        skills: { 'memory': 0.95, 'optimization': 0.9, 'cache': 0.88 }
    },
    'parallel-computing-expert': {
        expertise: 'Parallel computing and multithreading',
        description: 'Parallel computing and multithreading specialist',
        capabilities: ['parallel processing', 'thread management', 'concurrency'],
        skills: { 'parallel': 0.93, 'threading': 0.9, 'concurrency': 0.87 }
    },
    'distributed-systems-architect': {
        expertise: 'Distributed systems and microservices',
        description: 'Distributed systems and microservices specialist',
        capabilities: ['distributed architecture', 'microservices', 'scalability'],
        skills: { 'distributed': 0.92, 'microservices': 0.88, 'scalability': 0.85 }
    },
    'ai-behavior-specialist': {
        expertise: 'AI behavior and decision trees',
        description: 'AI behavior and decision trees specialist',
        capabilities: ['AI behavior', 'decision trees', 'state machines'],
        skills: { 'ai': 0.9, 'behavior': 0.88, 'decisions': 0.85 }
    },
    'procedural-generation-expert': {
        expertise: 'Procedural content generation',
        description: 'Procedural content generation specialist',
        capabilities: ['procedural generation', 'noise algorithms', 'random systems'],
        skills: { 'procedural': 0.92, 'noise': 0.88, 'randomization': 0.85 }
    },
    'cloud-infrastructure-specialist': {
        expertise: 'Cloud deployment and infrastructure',
        description: 'Cloud deployment and infrastructure specialist',
        capabilities: ['cloud deployment', 'infrastructure', 'DevOps'],
        skills: { 'cloud': 0.9, 'infrastructure': 0.88, 'devops': 0.85 }
    },
    'data-science-analyst': {
        expertise: 'Game data analysis and player insights',
        description: 'Game data analysis and player insights specialist',
        capabilities: ['data analysis', 'player analytics', 'machine learning'],
        skills: { 'data': 0.9, 'analytics': 0.88, 'ml': 0.82 }
    },
    'blockchain-integration-expert': {
        expertise: 'Blockchain and NFT integration',
        description: 'Blockchain and NFT integration specialist',
        capabilities: ['blockchain', 'smart contracts', 'crypto integration'],
        skills: { 'blockchain': 0.85, 'contracts': 0.82, 'crypto': 0.8 }
    },
    'mobile-optimization-specialist': {
        expertise: 'Mobile platform optimization',
        description: 'Mobile platform optimization specialist',
        capabilities: ['mobile optimization', 'battery efficiency', 'touch controls'],
        skills: { 'mobile': 0.9, 'optimization': 0.88, 'touch': 0.85 }
    },
    'web-technologies-expert': {
        expertise: 'Web and browser technologies',
        description: 'Web and browser technologies specialist',
        capabilities: ['web development', 'WebGL', 'browser optimization'],
        skills: { 'web': 0.88, 'webgl': 0.85, 'browser': 0.82 }
    },
    'ar-vr-specialist': {
        expertise: 'Augmented and Virtual Reality',
        description: 'Augmented and Virtual Reality specialist',
        capabilities: ['AR/VR development', 'immersive experiences', 'spatial computing'],
        skills: { 'ar': 0.85, 'vr': 0.85, 'spatial': 0.8 }
    },
    'quantum-computing-researcher': {
        expertise: 'Quantum computing applications',
        description: 'Quantum computing applications specialist',
        capabilities: ['quantum algorithms', 'quantum simulation', 'advanced mathematics'],
        skills: { 'quantum': 0.8, 'algorithms': 0.85, 'mathematics': 0.88 }
    },
    'edge-computing-specialist': {
        expertise: 'Edge computing and IoT integration',
        description: 'Edge computing and IoT integration specialist',
        capabilities: ['edge computing', 'IoT', 'distributed processing'],
        skills: { 'edge': 0.85, 'iot': 0.82, 'distributed': 0.8 }
    },
    'accessibility-expert': {
        expertise: 'Game accessibility and inclusive design',
        description: 'Game accessibility and inclusive design specialist',
        capabilities: ['accessibility', 'inclusive design', 'assistive technology'],
        skills: { 'accessibility': 0.9, 'inclusive': 0.88, 'assistive': 0.85 }
    },
    'streaming-technology-specialist': {
        expertise: 'Game streaming and cloud gaming',
        description: 'Game streaming and cloud gaming specialist',
        capabilities: ['streaming', 'cloud gaming', 'latency optimization'],
        skills: { 'streaming': 0.88, 'cloud': 0.85, 'latency': 0.82 }
    }
};
//# sourceMappingURL=index.js.map