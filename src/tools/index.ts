import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { 
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError 
} from '@modelcontextprotocol/sdk/types.js';
import { 
  DistributedTaskSchema,
  CodeGenerateSchema,
  TeamCoordinatorSchema,
  DynamicTeamExpanderSchema,
  QueryProjectSchema,
  GitHubManagerSchema,
  ProjectMetadataSchema,
  ParallelOptimizerSchema,
  PerformanceMetricsSchema
} from '../types/index.js';
import { distributedTaskManager } from './distributedTaskManager.js';
import logger from '../utils/logger.js';

export async function setupTools(server: Server): Promise<any[]> {
  const tools = [
    {
      name: 'distributed_task_manager',
      description: 'Orchestrate complex tasks across multiple virtual teams with AI-powered workload analysis',
      inputSchema: {
        type: 'object',
        properties: {
          task: { type: 'string', description: 'Task description' },
          complexity: { 
            type: 'string', 
            enum: ['low', 'medium', 'high', 'critical'],
            description: 'Task complexity level' 
          },
          teams: { 
            type: 'array', 
            items: { type: 'string' },
            description: 'Specific teams to involve' 
          },
          priority: { 
            type: 'number', 
            minimum: 1, 
            maximum: 10,
            description: 'Task priority (1-10)' 
          }
        },
        required: ['task']
      }
    },
    {
      name: 'code_generate',
      description: 'Generate optimized DirectX 12 code including ECS components, HLSL shaders, and systems',
      inputSchema: {
        type: 'object',
        properties: {
          type: { 
            type: 'string',
            enum: ['component', 'system', 'shader', 'event', 'utility'],
            description: 'Type of code to generate'
          },
          name: { type: 'string', description: 'Name of the generated element' },
          config: {
            type: 'object',
            properties: {
              namespace: { type: 'string' },
              dependencies: { type: 'array', items: { type: 'string' } },
              optimize: { type: 'boolean' }
            }
          }
        },
        required: ['type', 'name']
      }
    },
    {
      name: 'team_coordinator',
      description: 'Coordinate communication and resource sharing between virtual teams',
      inputSchema: {
        type: 'object',
        properties: {
          action: { 
            type: 'string',
            enum: ['share', 'sync', 'request', 'notify'],
            description: 'Coordination action type'
          },
          teams: { 
            type: 'array', 
            items: { type: 'string' },
            description: 'Teams to coordinate'
          },
          data: { 
            type: 'object',
            description: 'Data to share or sync'
          }
        },
        required: ['action', 'teams', 'data']
      }
    },
    {
      name: 'dynamic_team_expander',
      description: 'Spawn specialized AI agents based on task requirements',
      inputSchema: {
        type: 'object',
        properties: {
          specialists: { 
            type: 'array', 
            items: { type: 'string' },
            description: 'Required specialist types'
          },
          context: { 
            type: 'string',
            description: 'Task context for specialists'
          },
          duration: {
            type: 'number',
            description: 'Expected task duration in minutes'
          }
        },
        required: ['specialists', 'context']
      }
    },
    {
      name: 'query_project',
      description: 'Semantic search across project codebase with AI-powered understanding',
      inputSchema: {
        type: 'object',
        properties: {
          query: { 
            type: 'string',
            description: 'Search query'
          },
          scope: { 
            type: 'string',
            enum: ['code', 'docs', 'all'],
            description: 'Search scope'
          },
          limit: {
            type: 'number',
            description: 'Maximum results to return'
          }
        },
        required: ['query']
      }
    },
    {
      name: 'github_manager',
      description: 'Manage GitHub operations including commits, PRs, and CI/CD workflows',
      inputSchema: {
        type: 'object',
        properties: {
          action: { 
            type: 'string',
            enum: ['commit', 'push', 'pull', 'pr', 'issue'],
            description: 'GitHub action to perform'
          },
          data: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              branch: { type: 'string' },
              title: { type: 'string' },
              body: { type: 'string' }
            }
          }
        },
        required: ['action', 'data']
      }
    },
    {
      name: 'project_metadata',
      description: 'Track and analyze project metadata in real-time',
      inputSchema: {
        type: 'object',
        properties: {
          action: { 
            type: 'string',
            enum: ['get', 'update', 'analyze'],
            description: 'Metadata action'
          },
          metric: {
            type: 'string',
            description: 'Specific metric to query'
          }
        },
        required: ['action']
      }
    },
    {
      name: 'parallel_optimizer',
      description: 'Optimize parallel task execution using Amdahl\'s law',
      inputSchema: {
        type: 'object',
        properties: {
          tasks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                complexity: { type: 'number' },
                dependencies: { 
                  type: 'array', 
                  items: { type: 'string' }
                }
              },
              required: ['id', 'complexity']
            }
          },
          threads: {
            type: 'number',
            description: 'Available threads'
          }
        },
        required: ['tasks']
      }
    },
    {
      name: 'performance_metrics',
      description: 'Get real-time performance metrics and AI-powered recommendations',
      inputSchema: {
        type: 'object',
        properties: {
          metric: { 
            type: 'string',
            enum: ['tool', 'overall', 'trends', 'recommendations'],
            description: 'Metric type to retrieve'
          },
          timeRange: {
            type: 'number',
            description: 'Time range in hours'
          }
        },
        required: ['metric']
      }
    }
  ];

  // Set up tool call handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    logger.info(`Calling tool: ${name}`);

    try {
      switch (name) {
        case 'distributed_task_manager':
          const distributedParams = DistributedTaskSchema.parse(args);
          return await distributedTaskManager(distributedParams);
        
        case 'code_generate':
          const codeParams = CodeGenerateSchema.parse(args);
          const { codeGenerator } = await import('./codeGenerator.js');
          return await codeGenerator(codeParams);
        
        case 'team_coordinator':
          const teamParams = TeamCoordinatorSchema.parse(args);
          const { teamCoordinator } = await import('./teamCoordinator.js');
          return await teamCoordinator(teamParams);
        
        case 'dynamic_team_expander':
          const expanderParams = DynamicTeamExpanderSchema.parse(args);
          const { dynamicTeamExpander } = await import('./dynamicTeamExpander.js');
          return await dynamicTeamExpander(expanderParams);
        
        case 'query_project':
          const queryParams = QueryProjectSchema.parse(args);
          const { queryProject } = await import('./queryProject.js');
          return await queryProject(queryParams);
        
        case 'github_manager':
          const githubParams = GitHubManagerSchema.parse(args);
          const { githubManager } = await import('./githubManager.js');
          return await githubManager(githubParams);
        
        case 'project_metadata':
          const metadataParams = ProjectMetadataSchema.parse(args);
          const { projectMetadata } = await import('./projectMetadata.js');
          return await projectMetadata(metadataParams);
        
        case 'parallel_optimizer':
          const parallelParams = ParallelOptimizerSchema.parse(args);
          const { parallelOptimizer } = await import('./parallelOptimizer.js');
          return await parallelOptimizer(parallelParams);
        
        case 'performance_metrics':
          const perfParams = PerformanceMetricsSchema.parse(args);
          const { performanceMetrics } = await import('./performanceMetrics.js');
          return await performanceMetrics(perfParams);
        
        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${name}`
          );
      }
    } catch (error) {
      logger.error('Tool execution error', { tool: name, error });
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(
        ErrorCode.InternalError,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  });

  return tools;
}