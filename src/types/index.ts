import { z } from 'zod';

// Tool parameter schemas
export const DistributedTaskSchema = z.object({
  task: z.string().describe('Task description'),
  complexity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  teams: z.array(z.string()).optional(),
  priority: z.number().min(1).max(10).default(5)
});

export const CodeGenerateSchema = z.object({
  type: z.enum(['component', 'system', 'shader', 'event', 'utility']),
  name: z.string(),
  config: z.object({
    namespace: z.string().optional(),
    dependencies: z.array(z.string()).optional(),
    optimize: z.boolean().default(true)
  }).optional()
});

export const TeamCoordinatorSchema = z.object({
  action: z.enum(['share', 'sync', 'request', 'notify']),
  teams: z.array(z.string()),
  data: z.any()
});

export const DynamicTeamExpanderSchema = z.object({
  specialists: z.array(z.string()),
  context: z.string(),
  duration: z.number().optional()
});

export const QueryProjectSchema = z.object({
  query: z.string(),
  scope: z.enum(['code', 'docs', 'all']).default('all'),
  limit: z.number().default(10)
});

export const GitHubManagerSchema = z.object({
  action: z.enum(['commit', 'push', 'pull', 'pr', 'issue', 'status', 'branch', 'tag', 'release', 'workflow']),
  data: z.object({
    message: z.string().optional(),
    branch: z.string().optional(),
    title: z.string().optional(),
    body: z.string().optional(),
    files: z.string().optional(),
    force: z.boolean().optional(),
    remote: z.string().optional(),
    rebase: z.boolean().optional(),
    baseBranch: z.string().optional(),
    labels: z.array(z.string()).optional(),
    action: z.string().optional(),
    name: z.string().optional(),
    push: z.boolean().optional(),
    tag: z.string().optional(),
    notes: z.string().optional(),
    draft: z.boolean().optional(),
    prerelease: z.boolean().optional(),
    workflow: z.string().optional()
  })
});

export const ProjectMetadataSchema = z.object({
  action: z.enum(['get', 'update', 'analyze']),
  metric: z.string().optional()
});

export const ParallelOptimizerSchema = z.object({
  tasks: z.array(z.object({
    id: z.string(),
    complexity: z.number(),
    dependencies: z.array(z.string()).optional()
  })),
  threads: z.number().optional()
});

export const PerformanceMetricsSchema = z.object({
  metric: z.enum(['tool', 'overall', 'trends', 'recommendations']),
  timeRange: z.number().optional()
});

// Resource schemas
export const ResourceListSchema = z.object({
  type: z.enum(['files', 'teams', 'specialists', 'metrics']).optional()
});

// Prompt schemas
export const PromptArgumentsSchema = z.object({
  task: z.string().optional(),
  context: z.string().optional(),
  style: z.string().optional()
});

// Types
export type DistributedTaskParams = z.infer<typeof DistributedTaskSchema>;
export type CodeGenerateParams = z.infer<typeof CodeGenerateSchema>;
export type TeamCoordinatorParams = z.infer<typeof TeamCoordinatorSchema>;
export type DynamicTeamExpanderParams = z.infer<typeof DynamicTeamExpanderSchema>;
export type QueryProjectParams = z.infer<typeof QueryProjectSchema>;
export type GitHubManagerParams = z.infer<typeof GitHubManagerSchema>;
export type ProjectMetadataParams = z.infer<typeof ProjectMetadataSchema>;
export type ParallelOptimizerParams = z.infer<typeof ParallelOptimizerSchema>;
export type PerformanceMetricsParams = z.infer<typeof PerformanceMetricsSchema>;

// Team definitions
export const VIRTUAL_TEAMS = {
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
} as const;

// Specialist definitions
export const SPECIALISTS = {
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
} as const;

export type TeamName = keyof typeof VIRTUAL_TEAMS;
export type SpecialistType = keyof typeof SPECIALISTS;