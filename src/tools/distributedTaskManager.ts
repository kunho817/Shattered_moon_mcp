import { DistributedTaskParams, VIRTUAL_TEAMS } from '../types/index.js';
import { getServices } from '../server/services.js';
import logger from '../utils/logger.js';

export async function distributedTaskManager(params: DistributedTaskParams) {
  logger.info('distributedTaskManager called', { params });
  
  let services;
  try {
    services = getServices();
    logger.info('Services retrieved successfully');
  } catch (error) {
    logger.error('Services not initialized', { error });
    return {
      content: [{
        type: "text" as const,
        text: "Error: MCP services not properly initialized. Please restart the server."
      }]
    };
  }
  
  const { stateManager, performanceMonitor, aiEngine } = services;
  logger.info('Services destructured successfully');
  
  return await performanceMonitor.measure(
    'distributed_task_manager',
    'execute',
    async () => {
      logger.info('Executing distributed task manager', { params });

      // Extract keywords from task description
      logger.info('Extracting keywords from task');
      const keywords = params.task.toLowerCase().split(/\s+/)
        .filter(word => word.length > 3);
      logger.info('Keywords extracted', { keywords });

      // AI-powered workload analysis
      logger.info('Starting AI workload analysis');
      const analysis = aiEngine.analyzeWorkload({
        description: params.task,
        keywords
      });
      logger.info('AI analysis completed', { analysis });

      // Override with user-specified complexity if provided
      const complexity = params.complexity || analysis.complexity;

      // Determine teams to involve
      logger.info('Determining teams', { paramsTeams: params.teams, suggestedTeams: analysis.suggestedTeams });
      let teams = params.teams || analysis.suggestedTeams || [];
      logger.info('Initial teams', { teams, type: typeof teams, isArray: Array.isArray(teams) });
      
      // Ensure teams is an array
      if (!Array.isArray(teams)) {
        logger.warn('Teams is not array, converting', { teams });
        teams = [];
      }
      
      // Validate teams
      logger.info('Validating teams against VIRTUAL_TEAMS', { teams, virtualTeamsKeys: Object.keys(VIRTUAL_TEAMS) });
      teams = teams.filter(team => team in VIRTUAL_TEAMS);
      logger.info('Teams after validation', { teams });
      
      if (teams.length === 0) {
        teams = analysis.suggestedTeams || Object.keys(VIRTUAL_TEAMS).slice(0, 2);
        logger.info('Using fallback teams', { teams });
      }

      // Create main task
      const taskId = stateManager.createTask({
        description: params.task,
        status: 'pending',
        assignedTeams: [],
        priority: params.priority,
        complexity,
        dependencies: []
      });

      // Predict outcome
      const prediction = aiEngine.predictTaskOutcome({
        ...params,
        complexity,
        teams
      });

      // Distribute to teams
      const assignments: any[] = [];
      const subtasks: string[] = [];

      logger.info('Starting team distribution', { teams, teamsLength: teams.length, teamsType: typeof teams });
      for (const teamName of teams) {
        logger.info('Processing team', { teamName });
        const team = stateManager.getTeamStatus(teamName);
        if (!team) continue;

        // Check team availability
        const utilization = stateManager.getState().metadata.teamUtilization.get(teamName) || 0;
        
        if (utilization < 0.8) {
          // Create subtask for this team
          const subtaskId = stateManager.createTask({
            description: `[${teamName}] ${params.task}`,
            status: 'pending',
            assignedTeams: [teamName],
            priority: params.priority,
            complexity,
            dependencies: []
          });
          
          subtasks.push(subtaskId);
          stateManager.assignTaskToTeam(subtaskId, teamName);
          
          assignments.push({
            team: teamName,
            taskId: subtaskId,
            status: 'assigned'
          });
        } else {
          assignments.push({
            team: teamName,
            taskId: null,
            status: 'team_busy',
            utilization
          });
        }
      }

      // Update main task with subtasks as dependencies
      stateManager.updateTask(taskId, {
        status: 'in_progress',
        dependencies: subtasks,
        startTime: new Date()
      });

      // Record pattern for learning
      aiEngine.recordTaskPattern({
        type: 'distributed',
        complexity,
        teams,
        duration: analysis.estimatedDuration,
        success: true // Will be updated later
      });

      const response = {
        content: [{
          type: "text" as const,
          text: `Task distributed successfully!

**Task ID**: ${taskId}
**Description**: ${params.task}
**Complexity**: ${complexity} (${Math.round(analysis.confidence * 100)}% confidence)
**Priority**: ${params.priority}/10
**Estimated Duration**: ${analysis.estimatedDuration} minutes

**AI Analysis**:
- Success Probability: ${Math.round(prediction.successProbability * 100)}%
- Potential Issues: ${prediction.potentialIssues.length > 0 ? prediction.potentialIssues.join(', ') : 'None identified'}

**Team Assignments**:
${assignments.map(a => 
  `- **${a.team}**: ${a.status === 'assigned' ? `Task ${a.taskId} assigned` : `Busy (${Math.round(a.utilization * 100)}% utilized)`}`
).join('\n')}

**Recommendations**:
${aiEngine.getRecommendations('task').slice(0, 3).map(r => `- ${r}`).join('\n') || '- No specific recommendations at this time'}

The task has been broken down into ${subtasks.length} subtasks and distributed across the assigned teams. Progress will be tracked automatically.`
        }]
      };

      return response;
    }
  );
}