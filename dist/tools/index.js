"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupTools = setupTools;
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const index_js_1 = require("../types/index.js");
const distributedTaskManager_js_1 = require("./distributedTaskManager.js");
const logger_js_1 = __importDefault(require("../utils/logger.js"));
async function setupTools(server) {
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
    server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        logger_js_1.default.info(`Calling tool: ${name}`);
        try {
            switch (name) {
                case 'distributed_task_manager':
                    const distributedParams = index_js_1.DistributedTaskSchema.parse(args);
                    return await (0, distributedTaskManager_js_1.distributedTaskManager)(distributedParams);
                case 'code_generate':
                    const codeParams = index_js_1.CodeGenerateSchema.parse(args);
                    const { codeGenerator } = await Promise.resolve().then(() => __importStar(require('./codeGenerator.js')));
                    return await codeGenerator(codeParams);
                case 'team_coordinator':
                    const teamParams = index_js_1.TeamCoordinatorSchema.parse(args);
                    const { teamCoordinator } = await Promise.resolve().then(() => __importStar(require('./teamCoordinator.js')));
                    return await teamCoordinator(teamParams);
                case 'dynamic_team_expander':
                    const expanderParams = index_js_1.DynamicTeamExpanderSchema.parse(args);
                    const { dynamicTeamExpander } = await Promise.resolve().then(() => __importStar(require('./dynamicTeamExpander.js')));
                    return await dynamicTeamExpander(expanderParams);
                case 'query_project':
                    const queryParams = index_js_1.QueryProjectSchema.parse(args);
                    const { queryProject } = await Promise.resolve().then(() => __importStar(require('./queryProject.js')));
                    return await queryProject(queryParams);
                case 'github_manager':
                    const githubParams = index_js_1.GitHubManagerSchema.parse(args);
                    const { githubManager } = await Promise.resolve().then(() => __importStar(require('./githubManager.js')));
                    return await githubManager(githubParams);
                case 'project_metadata':
                    const metadataParams = index_js_1.ProjectMetadataSchema.parse(args);
                    const { projectMetadata } = await Promise.resolve().then(() => __importStar(require('./projectMetadata.js')));
                    return await projectMetadata(metadataParams);
                case 'parallel_optimizer':
                    const parallelParams = index_js_1.ParallelOptimizerSchema.parse(args);
                    const { parallelOptimizer } = await Promise.resolve().then(() => __importStar(require('./parallelOptimizer.js')));
                    return await parallelOptimizer(parallelParams);
                case 'performance_metrics':
                    const perfParams = index_js_1.PerformanceMetricsSchema.parse(args);
                    const { performanceMetrics } = await Promise.resolve().then(() => __importStar(require('./performanceMetrics.js')));
                    return await performanceMetrics(perfParams);
                default:
                    throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
            }
        }
        catch (error) {
            logger_js_1.default.error('Tool execution error', { tool: name, error });
            if (error instanceof types_js_1.McpError) {
                throw error;
            }
            throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, error instanceof Error ? error.message : 'Unknown error');
        }
    });
    return tools;
}
//# sourceMappingURL=index.js.map