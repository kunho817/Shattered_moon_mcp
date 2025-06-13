import { z } from 'zod';
import type { MCPResult, AsyncMCPResult, DeepReadonly, NonEmptyArray } from '../utils/advanced-types.js';

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

// Enhanced MCP Types with Advanced TypeScript Features
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

// Virtual Team Management Types
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

// Task Management with Generics
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

// Tool Parameter Type Mapping
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

// Advanced Schema Validation Results
export type ValidationResult<T> = {
  success: true;
  data: T;
  warnings?: string[];
} | {
  success: false;
  errors: string[];
  partial?: Partial<T>;
};

// Performance Monitoring Types
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

// Server Configuration with Deep Types
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
}> {}

// Event System Types
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

// Resource Types
export interface ResourceInfo {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
  size?: number;
  lastModified?: Date;
}

// Prompt Types
export interface PromptInfo {
  name: string;
  description?: string;
  arguments?: Array<{
    name: string;
    description?: string;
    required?: boolean;
  }>;
}

// State Management Types
export interface StateSnapshot<T = any> {
  namespace: string;
  key: string;
  value: T;
  ttl?: number;
  createdAt: Date;
  lastAccessed: Date;
  accessCount: number;
}

// Advanced Tool Types
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

export type ToolMiddleware<TParams = any> = (
  params: TParams,
  context: ToolExecutionContext
) => Promise<TParams | void>;

export interface ToolExecutionContext {
  toolName: string;
  clientId?: string;
  requestId: string;
  startTime: Date;
  metadata: Record<string, any>;
}

// Export all advanced types
export type * from '../utils/advanced-types.js';