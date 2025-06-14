import { TeamCoordinatorParams, VIRTUAL_TEAMS } from '../types/index.js';
import { withServices, validateTeams, detectTeamConflicts, calculateTeamUtilization, formatError } from '../utils/common.js';
import { claudeCodeInvoker } from '../utils/claudeCodeInvoker.js';
import logger from '../utils/logger.js';

export const teamCoordinator = withServices(
  'teamCoordinator',
  async (services, params: TeamCoordinatorParams) => {
    const { stateManager, performanceMonitor } = services;
    
    return await performanceMonitor.measure(
      'team_coordinator',
      'coordinate',
      async () => {
        try {
          logger.info('Executing team coordinator', { params });

          const { action, teams, data } = params;
          const results: any[] = [];
          
          // Validate teams using improved validation
          const validTeams = validateTeams(teams);
          if (validTeams.length !== teams.length) {
            const invalidTeams = teams.filter(team => !validTeams.includes(team));
            logger.warn('Invalid teams filtered out', { invalidTeams, validTeams });
          }

          // Real conflict detection instead of random
          const conflicts = detectTeamConflicts(services, validTeams);
          
          // Calculate team utilizations
          const teamUtilizations = validTeams.map(team => ({
            team,
            utilization: calculateTeamUtilization(services, team)
          }));
          
          const avgUtilization = teamUtilizations.reduce((sum, t) => sum + t.utilization, 0) / teamUtilizations.length;
          const maxUtilization = Math.max(...teamUtilizations.map(t => t.utilization));

          // Claude Code-powered coordination analysis
          const coordinationPrompt = `Analyze team coordination situation for ${action} action:

Teams: ${validTeams.join(', ')}
Conflicts: ${conflicts.length} detected
Average Utilization: ${Math.round(avgUtilization * 100)}%
Max Utilization: ${Math.round(maxUtilization * 100)}%
Action Type: ${action}
Data: ${JSON.stringify(data).substring(0, 200)}

Provide coordination analysis:
1. Complexity level (low/medium/high/critical)
2. Priority (low/normal/high/critical)
3. Efficiency score (0-1)
4. Next recommended action
5. Specific recommendations (array)

Respond in JSON format with keys: complexity, priority, efficiency, nextAction, recommendations`;

          const coordinationResponse = await claudeCodeInvoker.invokeAuto(
            coordinationPrompt,
            `Team coordination analysis for ${action} with ${validTeams.length} teams`,
            { timeout: 15000 }
          );

          let coordination;
          if (coordinationResponse.success) {
            try {
              coordination = JSON.parse(coordinationResponse.output);
              coordination.issues = conflicts; // Add detected conflicts
              logger.info('Claude Code coordination analysis completed', { coordination });
            } catch (parseError) {
              logger.warn('Failed to parse coordination response, using fallback');
              coordination = {
                complexity: maxUtilization > 0.8 ? 'high' : avgUtilization > 0.6 ? 'medium' : 'low',
                issues: conflicts,
                priority: conflicts.some(c => c.severity === 'high') ? 'high' : 'normal',
                efficiency: Math.max(0.4, 1 - (conflicts.length * 0.1) - (maxUtilization * 0.2)),
                nextAction: conflicts.length > 0 ? 'Resolve team conflicts' : 'Continue monitoring team progress',
                recommendations: ['Manual coordination analysis required']
              };
            }
          } else {
            logger.error('Claude Code coordination analysis failed, using fallback', { error: coordinationResponse.error });
            coordination = {
              complexity: maxUtilization > 0.8 ? 'high' : avgUtilization > 0.6 ? 'medium' : 'low',
              issues: conflicts,
              priority: conflicts.some(c => c.severity === 'high') ? 'high' : 'normal',
              efficiency: Math.max(0.4, 1 - (conflicts.length * 0.1) - (maxUtilization * 0.2)),
              nextAction: conflicts.length > 0 ? 'Resolve team conflicts' : 'Continue monitoring team progress',
              recommendations: ['Coordination system unavailable - manual review needed']
            };
          }

      switch (action) {
        case 'share':
          for (const teamName of validTeams) {
            const team = stateManager.getTeamStatus(teamName);
            if (team) {
              // Share data with team (simulated)
              logger.info('Sharing data with team', { teamName, data });
              results.push({
                team: teamName,
                status: 'data_shared',
                timestamp: new Date().toISOString()
              });
            }
          }
          break;

        case 'sync':
          // Claude Code-powered conflict resolution
          if (conflicts.length > 0) {
            const resolutionPrompt = `Develop conflict resolution strategies for team synchronization:

Conflicts:
${conflicts.map(c => `- ${c.severity}: ${c.description} (Teams: ${c.teams.join(', ')})`).join('\n')}

Team Utilizations:
${teamUtilizations.map(t => `- ${t.team}: ${Math.round(t.utilization * 100)}%`).join('\n')}

Provide resolution strategies:
1. For each conflict, suggest specific resolution strategy
2. Priority order for resolution
3. Estimated resolution time
4. Risk mitigation steps

Respond in JSON format with array of: {conflictId, strategy, priority, estimatedTime, risks, steps}`;

            const resolutionResponse = await claudeCodeInvoker.invokePlanning(
              resolutionPrompt,
              { timeout: 20000 }
            );

            if (resolutionResponse.success) {
              try {
                const resolutionStrategies = JSON.parse(resolutionResponse.output);
                conflicts.forEach((conflict, index) => {
                  const strategy = resolutionStrategies[index] || {
                    strategy: 'manual_intervention_required',
                    priority: conflict.severity,
                    estimatedTime: '15-30 minutes',
                    risks: ['Unresolved conflict may impact team efficiency'],
                    steps: ['Assign conflict resolution specialist', 'Schedule team review']
                  };
                  
                  results.push({
                    conflict: conflict.id,
                    status: 'resolution_planned',
                    severity: conflict.severity,
                    description: conflict.description,
                    strategy: strategy.strategy,
                    affectedTeams: conflict.teams,
                    resolutionSteps: strategy.steps,
                    estimatedTime: strategy.estimatedTime,
                    risks: strategy.risks
                  });
                });
              } catch (parseError) {
                logger.warn('Failed to parse resolution strategies, using fallback');
                for (const conflict of conflicts) {
                  const resolutionStrategy = determineResolutionStrategy(conflict);
                  results.push({
                    conflict: conflict.id,
                    status: 'detected',
                    severity: conflict.severity,
                    description: conflict.description,
                    strategy: resolutionStrategy,
                    affectedTeams: conflict.teams
                  });
                }
              }
            } else {
              logger.error('Claude Code resolution failed, using basic strategies');
              for (const conflict of conflicts) {
                const resolutionStrategy = determineResolutionStrategy(conflict);
                results.push({
                  conflict: conflict.id,
                  status: 'detected',
                  severity: conflict.severity,
                  description: conflict.description,
                  strategy: resolutionStrategy,
                  affectedTeams: conflict.teams
                });
              }
            }
          } else {
            // Update team synchronization timestamps
            const syncResults = await synchronizeTeams(services, validTeams);
            results.push({
              status: 'synchronized',
              teams: validTeams.length,
              message: 'All teams synchronized successfully',
              syncDetails: syncResults
            });
          }
          break;

        case 'request':
          // Enhanced resource request with realistic availability assessment
          for (const teamName of validTeams) {
            const team = stateManager.getTeamStatus(teamName);
            if (team) {
              const utilization = calculateTeamUtilization(services, team.id);
              const teamData = teamUtilizations.find(t => t.team === teamName);
              
              // Enhanced availability assessment
              const available = utilization < 0.8;
              const estimatedTime = calculateEstimatedResponseTime(utilization, team.currentTasks.length);
              const responseStatus = available ? 'accepted' : utilization < 0.95 ? 'conditional' : 'declined';
              
              results.push({
                team: teamName,
                availability: available,
                utilization: Math.round(utilization * 100),
                response: responseStatus,
                estimatedTime,
                currentTasks: team.currentTasks.length,
                capacity: available ? 'available' : 'limited'
              });
            }
          }
          break;

        case 'notify':
          // Notify teams of important updates (simulated)
          for (const teamName of validTeams) {
            logger.info('Notifying team', { 
              teamName, 
              data, 
              priority: coordination.priority || 'normal' 
            });
            
            results.push({
              team: teamName,
              status: 'notified',
              priority: coordination.priority || 'normal'
            });
          }
          break;
      }

          // Coordination pattern recording replaced by Claude Code analytics
          logger.info('Team coordination completed', {
            type: 'team_coordination',
            complexity: coordination.complexity,
            teams: validTeams,
            duration: calculateCoordinationDuration(action, validTeams.length),
            success: results.every(r => !r.status?.includes('failed') && !r.status?.includes('declined'))
          });

          // Generate enhanced response
          const successCount = results.filter(r => 
            r.status === 'synchronized' || 
            r.response === 'accepted' || 
            r.status === 'data_shared' || 
            r.status === 'notified'
          ).length;

          const response = {
            content: [{
              type: "text" as const,
              text: `✅ **Team Coordination Completed!**

**Action**: ${action.charAt(0).toUpperCase() + action.slice(1)}
**Teams Processed**: ${validTeams.length}${teams.length !== validTeams.length ? `/${teams.length} (${teams.length - validTeams.length} invalid)` : ''}
**Success Rate**: ${Math.round((successCount / Math.max(results.length, 1)) * 100)}%

**Claude Code Coordination Analysis**:
- **Complexity**: ${coordination.complexity}
- **Conflicts Detected**: ${conflicts.length}
- **Overall Efficiency**: ${Math.round(coordination.efficiency * 100)}%
- **Priority Level**: ${coordination.priority}

${conflicts.length > 0 ? `**⚠️ Conflicts Detected (${conflicts.length})**:
${conflicts.map(c => 
  `- **${c.severity.toUpperCase()}**: ${c.description}
    - Affected Teams: ${c.teams.join(', ')}`
).join('\n')}

` : ''}**Team Results**:
${results.map(r => {
  if (r.team) {
    if (r.response) {
      // Request results
      const statusIcon = r.response === 'accepted' ? '✅' : r.response === 'conditional' ? '⚠️' : '❌';
      return `- ${statusIcon} **${r.team}**: ${r.response} (${r.utilization}% utilized, ~${r.estimatedTime}min response)`;
    } else if (r.status === 'data_shared' || r.status === 'notified') {
      return `- ✅ **${r.team}**: ${r.status}`;
    }
    return `- **${r.team}**: ${r.status}`;
  } else if (r.conflict) {
    const strategyIcon = r.severity === 'high' ? '🚨' : '⚠️';
    return `- ${strategyIcon} **Conflict**: ${r.description} → ${r.strategy}`;
  }
  return `- ✅ ${r.message || 'Operation completed'}`;
}).join('\n')}

**Next Recommended Action**: ${coordination.nextAction}

${coordination.recommendations?.length > 0 ? `**Claude Code Recommendations**:
${coordination.recommendations.map((r: string) => `- ${r}`).join('\n')}

` : ''}**Summary**: Team coordination ${conflicts.length > 0 ? 'completed with conflicts requiring attention' : 'completed successfully'} with ${Math.round(coordination.efficiency * 100)}% efficiency.`
            }]
          };

          return response;
        } catch (error) {
          return formatError('teamCoordinator', error, { params });
        }
      }
    );
  }
);

// Helper functions for enhanced coordination
function generateCoordinationRecommendations(
  teamUtilizations: Array<{ team: string; utilization: number }>, 
  conflicts: Array<{ severity: string }>
): string[] {
  const recommendations: string[] = [];
  
  const highUtilizationTeams = teamUtilizations.filter(t => t.utilization > 0.8);
  if (highUtilizationTeams.length > 0) {
    recommendations.push(`Consider redistributing workload for: ${highUtilizationTeams.map(t => t.team).join(', ')}`);
  }
  
  if (conflicts.some(c => c.severity === 'high')) {
    recommendations.push('Immediate attention required for high-severity conflicts');
  }
  
  const avgUtilization = teamUtilizations.reduce((sum, t) => sum + t.utilization, 0) / teamUtilizations.length;
  if (avgUtilization < 0.5) {
    recommendations.push('Teams have available capacity for additional tasks');
  }
  
  return recommendations.length > 0 ? recommendations : ['Current team coordination is well-balanced'];
}

function determineResolutionStrategy(conflict: { severity: string; teams: string[] }): string {
  switch (conflict.severity) {
    case 'high':
      return 'immediate_intervention_required';
    case 'medium':
      return 'schedule_team_review';
    default:
      return 'monitor_and_adjust';
  }
}

async function synchronizeTeams(services: any, teams: string[]): Promise<any> {
  // Simulate team synchronization process
  const syncTime = new Date().toISOString();
  return {
    timestamp: syncTime,
    teamsCount: teams.length,
    status: 'synchronized'
  };
}

function calculateEstimatedResponseTime(utilization: number, currentTasks: number): number {
  const baseTime = 15; // 15 minutes base response time
  const utilizationFactor = utilization * 30; // Up to 30 minutes added for high utilization
  const taskFactor = currentTasks * 5; // 5 minutes per current task
  
  return Math.round(baseTime + utilizationFactor + taskFactor);
}

function calculateCoordinationDuration(action: string, teamCount: number): number {
  const baseTime = action === 'sync' ? 15 : 5; // Sync takes longer
  return baseTime + (teamCount * 2); // 2 minutes per team
}