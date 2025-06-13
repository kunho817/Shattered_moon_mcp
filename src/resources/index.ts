import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ReadResourceRequestSchema, ListResourcesRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { getServices } from '../server/services.js';
import logger from '../utils/logger.js';
import { VIRTUAL_TEAMS, SPECIALISTS } from '../types/index.js';

export async function setupResources(server: Server): Promise<any[]> {
  const resources = [];

  // 1. Teams Resource
  resources.push({
    uri: 'shattered://teams',
    name: 'Virtual Teams',
    description: 'Information about available virtual teams and their status'
  });

  // 2. Specialists Resource
  resources.push({
    uri: 'shattered://specialists',
    name: 'Available Specialists',
    description: 'List of all specialist types and their capabilities'
  });

  // 3. Project State Resource
  resources.push({
    uri: 'shattered://project/state',
    name: 'Project State',
    description: 'Current project state including tasks, teams, and metrics'
  });

  // 4. Performance Resource
  resources.push({
    uri: 'shattered://performance',
    name: 'Performance Metrics',
    description: 'Real-time performance metrics for all tools and operations'
  });

  // 5. Code Templates Resource
  resources.push({
    uri: 'shattered://templates/code',
    name: 'Code Templates',
    description: 'Available code generation templates for DirectX 12 engine'
  });

  // Set up resource handlers
  server.setRequestHandler(
    ReadResourceRequestSchema,
    async (request) => {
      const { uri } = request.params;
    const { stateManager, performanceMonitor } = getServices();

    logger.info(`Reading resource: ${uri}`);

    try {
      switch (uri) {
        case 'shattered://teams':
          const teamStates = Array.from(stateManager.getState().teams.values());
          return {
            contents: [{
              uri,
              text: JSON.stringify({
                teams: Object.keys(VIRTUAL_TEAMS).map(teamId => ({
                  id: teamId,
                  name: VIRTUAL_TEAMS[teamId as keyof typeof VIRTUAL_TEAMS].name,
                  specialists: VIRTUAL_TEAMS[teamId as keyof typeof VIRTUAL_TEAMS].specialists,
                  status: teamStates.find(t => t.id === teamId)?.status || 'idle',
                  currentTasks: teamStates.find(t => t.id === teamId)?.currentTasks || []
                }))
              }, null, 2)
            }]
          };

        case 'shattered://specialists':
          const availableSpecialists = stateManager.getAvailableSpecialists();
          return {
            contents: [{
              uri,
              text: JSON.stringify({
                totalSpecialists: Object.keys(SPECIALISTS).length,
                activeSpecialists: availableSpecialists.length,
                specialists: Object.entries(SPECIALISTS).map(([type, spec]) => ({
                  type,
                  expertise: spec.expertise,
                  status: availableSpecialists.find(s => s.type === type)?.status || 'available'
                }))
              }, null, 2)
            }]
          };

        case 'shattered://project/state':
          const state = stateManager.getState();
          return {
            contents: [{
              uri,
              text: JSON.stringify({
                metadata: {
                  totalTasks: state.metadata.totalTasks,
                  completedTasks: state.metadata.completedTasks,
                  failedTasks: state.metadata.failedTasks,
                  averageTaskTime: Math.round(state.metadata.averageTaskTime),
                  lastUpdated: state.metadata.lastUpdated
                },
                activeTasks: Array.from(state.tasks.values())
                  .filter(t => t.status === 'in_progress')
                  .map(t => ({
                    id: t.id,
                    description: t.description,
                    priority: t.priority,
                    assignedTeams: t.assignedTeams
                  })),
                teamUtilization: Object.fromEntries(state.metadata.teamUtilization)
              }, null, 2)
            }]
          };

        case 'shattered://performance':
          const stats = performanceMonitor.getStats() as any[];
          const overall = performanceMonitor.getOverallStats();
          return {
            contents: [{
              uri,
              text: JSON.stringify({
                overall,
                tools: stats.map(s => ({
                  tool: s.tool,
                  totalCalls: s.totalCalls,
                  successRate: Math.round((s.successfulCalls / s.totalCalls) * 100),
                  averageDuration: Math.round(s.averageDuration),
                  trend: s.trend
                }))
              }, null, 2)
            }]
          };

        case 'shattered://templates/code':
          return {
            contents: [{
              uri,
              text: JSON.stringify({
                templates: {
                  component: {
                    description: 'ECS Component template',
                    example: 'class TransformComponent { Vector3 position; Quaternion rotation; Vector3 scale; };'
                  },
                  system: {
                    description: 'ECS System template',
                    example: 'class RenderSystem : public ISystem { void Update(EntityManager& em, float deltaTime); };'
                  },
                  shader: {
                    description: 'HLSL Shader template',
                    example: 'cbuffer PerFrame : register(b0) { matrix ViewProjection; };'
                  },
                  event: {
                    description: 'Event System template',
                    example: 'struct EntityCreatedEvent { EntityID entityId; ComponentMask components; };'
                  },
                  utility: {
                    description: 'Utility class template',
                    example: 'template<typename T> class ObjectPool { T* Acquire(); void Release(T* obj); };'
                  }
                }
              }, null, 2)
            }]
          };

        default:
          throw new Error(`Unknown resource: ${uri}`);
      }
    } catch (error) {
      logger.error('Resource read error', { uri, error });
      throw error;
    }
  });

  return resources;
}