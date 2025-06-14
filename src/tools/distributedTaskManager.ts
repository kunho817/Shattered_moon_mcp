import { DistributedTaskParams, VIRTUAL_TEAMS } from '../types/index.js';
import { withServices, validateTeams, calculateTeamUtilization, formatError } from '../utils/common.js';
import { claudeCodeInvoker } from '../utils/claudeCodeInvoker.js';
import { claudeCodePerformanceMonitor } from '../utils/claudeCodePerformanceMonitor.js';
import { enhancedClaudeCodeManager } from '../utils/enhancedClaudeCodeManager.js';
import logger from '../utils/logger.js';

export const distributedTaskManager = withServices(
  'distributedTaskManager',
  async (services, params: DistributedTaskParams) => {
    const { stateManager, performanceMonitor } = services;
    
    return await performanceMonitor.measure(
      'distributed_task_manager',
      'execute',
      async () => {
        try {
          logger.info('Executing distributed task manager', { params });

          // Task tracking ID for reference
          const taskTrackingId = `dist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          // Enhanced Claude Code-powered workload analysis
          const analysis = await enhancedClaudeCodeManager.analyzeDistributedTask(
            params.task,
            params.teams || [],
            params.complexity,
            params.priority
          );
          
          logger.info('Enhanced analysis completed', { 
            analysis,
            cacheStats: enhancedClaudeCodeManager.getStats()
          });

          // Override with user-specified complexity if provided
          const complexity = (params.complexity || analysis.complexity) as 'low' | 'medium' | 'high' | 'critical';

          // Validate and determine teams to involve
          let teams = validateTeams(params.teams || analysis.suggestedTeams);
          
          if (teams.length === 0) {
            teams = validateTeams(analysis.suggestedTeams) || Object.keys(VIRTUAL_TEAMS).slice(0, 2);
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

          // Enhanced outcome prediction using optimized analysis
          const prediction = {
            successProbability: analysis.successProbability,
            potentialIssues: analysis.riskFactors,
            optimizations: analysis.optimizations,
            timelineConfidence: analysis.successProbability * 0.9 // Derived from success probability
          };
          
          logger.info('Enhanced prediction derived from analysis', { prediction });

          // Distribute to teams with improved utilization calculation
          const assignments: any[] = [];
          const subtasks: string[] = [];

          logger.info('Starting team distribution', { teams, teamsLength: teams.length });
          
          for (const teamName of teams) {
            logger.info('Processing team', { teamName });
            const team = stateManager.getTeamStatus(teamName);
            if (!team) {
              logger.warn('Team not found', { teamName });
              continue;
            }

            // Use improved utilization calculation
            const utilization = calculateTeamUtilization(services, teamName);
            logger.info('Team utilization calculated', { teamName, utilization });
            
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
                status: 'assigned',
                utilization: Math.round(utilization * 100)
              });
            } else {
              assignments.push({
                team: teamName,
                taskId: null,
                status: 'team_busy',
                utilization: Math.round(utilization * 100)
              });
            }
          }

          // Update main task with subtasks as dependencies
          stateManager.updateTask(taskId, {
            status: 'in_progress',
            dependencies: subtasks,
            startTime: new Date()
          });

          // Pattern recording replaced by Claude Code analytics

          // Generate enhanced response
          const successfulAssignments = assignments.filter(a => a.status === 'assigned');
          const busyTeams = assignments.filter(a => a.status === 'team_busy');

          const response = {
            content: [{
              type: "text" as const,
              text: `✅ **Task Distributed Successfully!**

**Task Details**:
- **ID**: \`${taskId}\`
- **Description**: ${params.task}
- **Complexity**: ${complexity} (High AI confidence)
- **Priority**: ${params.priority}/10
- **Estimated Duration**: ${analysis.estimatedDuration} minutes

**Enhanced AI Analysis**:
- Success Probability: ${Math.round(prediction.successProbability * 100)}%
- Timeline Confidence: ${Math.round(prediction.timelineConfidence * 100)}%
- Risk Factors: ${prediction.potentialIssues.length > 0 ? prediction.potentialIssues.join(', ') : 'None identified'}
- Optimizations: ${prediction.optimizations ? prediction.optimizations.join(', ') : 'Current approach is optimal'}
- Analysis Source: Enhanced Manager (Cache: ${enhancedClaudeCodeManager.getStats().cacheHitRate > 0 ? 'Hit' : 'Miss'})

**Team Assignment Results**:
${successfulAssignments.length > 0 ? `
**✅ Successfully Assigned (${successfulAssignments.length}):**
${successfulAssignments.map(a => 
  `- **${a.team}**: Task \`${a.taskId}\` assigned (${a.utilization}% current load)`
).join('\n')}` : ''}
${busyTeams.length > 0 ? `
**⚠️ Teams Currently Busy (${busyTeams.length}):**
${busyTeams.map(a => 
  `- **${a.team}**: ${a.utilization}% utilized - consider reassigning or waiting`
).join('\n')}` : ''}

**Enhanced AI Recommendations**:
${prediction.optimizations ? prediction.optimizations.map((r: string) => `- ${r}`).join('\n') : '- Current task distribution is optimal'}

**Risk Assessment**:
${analysis.riskFactors ? analysis.riskFactors.map((r: string) => `- ${r}`).join('\n') : '- No significant risks identified'}

**Performance Insights**:
- Cache Efficiency: ${Math.round(enhancedClaudeCodeManager.getStats().cacheHitRate * 100)}%
- Queue Status: ${enhancedClaudeCodeManager.getStats().queueSize} pending requests
- System Load: ${enhancedClaudeCodeManager.getStats().cacheSize < 50 ? 'Low' : 'Moderate'}

**Summary**: Task has been broken down into ${subtasks.length} subtasks and distributed across ${successfulAssignments.length} available teams. Progress will be tracked automatically.`
            }]
          };

          // Task completion tracking
          const success = successfulAssignments.length > 0;
          logger.info('Task completion tracked', {
            taskId: taskTrackingId,
            success,
            complexity,
            teams
          });

          return response;
        } catch (error) {
          // Track failed task
          const fallbackTaskId = `dist_${Date.now()}_error`;
          logger.error('Task execution failed', { taskId: fallbackTaskId, error });
          return formatError('distributedTaskManager', error, { params });
        }
      }
    );
  }
);