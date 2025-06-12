import { DistributedTaskParams, VIRTUAL_TEAMS } from '../types/index.js';
import { getServices } from '../server/services.js';
import logger from '../utils/logger.js';

export async function distributedTaskManager(params: DistributedTaskParams) {
  const { stateManager, performanceMonitor, aiEngine } = getServices();
  
  return await performanceMonitor.measure(
    'distributed_task_manager',
    'execute',
    async () => {
      logger.info('Executing distributed task manager', { params });

      // Extract keywords from task description
      const keywords = params.task.toLowerCase().split(/\s+/)
        .filter(word => word.length > 3);

      // AI-powered workload analysis
      const analysis = aiEngine.analyzeWorkload({
        description: params.task,
        keywords
      });

      // Override with user-specified complexity if provided
      const complexity = params.complexity || analysis.complexity;

      // Determine teams to involve
      let teams = params.teams || analysis.suggestedTeams;
      
      // Validate teams
      teams = teams.filter(team => team in VIRTUAL_TEAMS);
      if (teams.length === 0) {
        teams = analysis.suggestedTeams;
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

      for (const teamName of teams) {
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