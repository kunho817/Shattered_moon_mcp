import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
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
import { codeGenerator } from './codeGenerator.js';
import { teamCoordinator } from './teamCoordinator.js';
import { dynamicTeamExpander } from './dynamicTeamExpander.js';
import { queryProject } from './queryProject.js';
import { githubManager } from './githubManager.js';
import { projectMetadata } from './projectMetadata.js';
import { parallelOptimizer } from './parallelOptimizer.js';
import { performanceMetrics } from './performanceMetrics.js';

export async function setupTools(server: Server): Promise<any[]> {
  const tools = [];

  // 1. Distributed Task Manager
  tools.push({
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
  });

  // 2. Code Generator
  tools.push({
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
  });

  // 3. Team Coordinator
  tools.push({
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
  });

  // 4. Dynamic Team Expander
  tools.push({
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
  });

  // 5. Query Project
  tools.push({
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
  });

  // 6. GitHub Manager
  tools.push({
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
  });

  // 7. Project Metadata
  tools.push({
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
  });

  // 8. Parallel Optimizer
  tools.push({
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
  });

  // 9. Performance Metrics
  tools.push({
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
  });

  // Consolidated request handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    switch (name) {
      case 'distributed_task_manager':
        const distributedParams = DistributedTaskSchema.parse(args);
        return await distributedTaskManager(distributedParams);
        
      case 'code_generate':
        const codeParams = CodeGenerateSchema.parse(args);
        return await codeGenerator(codeParams);
        
      case 'team_coordinator':
        const teamParams = TeamCoordinatorSchema.parse(args);
        return await teamCoordinator(teamParams);
        
      case 'dynamic_team_expander':
        const expanderParams = DynamicTeamExpanderSchema.parse(args);
        return await dynamicTeamExpander(expanderParams);
        
      case 'query_project':
        const queryParams = QueryProjectSchema.parse(args);
        return await queryProject(queryParams);
        
      case 'github_manager':
        const githubParams = GitHubManagerSchema.parse(args);
        return await githubManager(githubParams);
        
      case 'project_metadata':
        const metadataParams = ProjectMetadataSchema.parse(args);
        return await projectMetadata(metadataParams);
        
      case 'parallel_optimizer':
        const optimizerParams = ParallelOptimizerSchema.parse(args);
        return await parallelOptimizer(optimizerParams);
        
      case 'performance_metrics':
        const metricsParams = PerformanceMetricsSchema.parse(args);
        return await performanceMetrics(metricsParams);
        
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });

  return tools;
}