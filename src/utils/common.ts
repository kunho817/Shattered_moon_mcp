import { VIRTUAL_TEAMS } from '../types/index.js';
import { getServices } from '../server/services.js';
import logger from './logger.js';

/**
 * Higher-order function to wrap tool functions with services initialization
 */
export function withServices<T extends any[], R>(
  toolName: string,
  fn: (services: ReturnType<typeof getServices>, ...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | { content: Array<{ type: 'text', text: string }> }> => {
    logger.info(`${toolName} called`, { args });
    
    try {
      const services = getServices();
      logger.info(`${toolName}: Services retrieved successfully`);
      return await fn(services, ...args);
    } catch (error) {
      logger.error(`${toolName}: Services not initialized`, { error });
      return {
        content: [{
          type: "text" as const,
          text: `Error: MCP services not properly initialized. Please restart the server. (Tool: ${toolName})`
        }]
      };
    }
  };
}

/**
 * Validates and normalizes team names
 */
export function validateTeams(teams: string[] | string | undefined): string[] {
  if (!teams) {
    return [];
  }
  
  // Normalize to array
  const teamArray = Array.isArray(teams) ? teams : [teams];
  
  // Filter valid teams
  const validTeams = teamArray.filter(team => {
    if (typeof team !== 'string') {
      logger.warn('Invalid team type detected', { team, type: typeof team });
      return false;
    }
    if (!(team in VIRTUAL_TEAMS)) {
      logger.warn('Unknown team detected', { team });
      return false;
    }
    return true;
  });
  
  logger.info('Team validation completed', { 
    input: teamArray, 
    valid: validTeams,
    filtered: teamArray.length - validTeams.length 
  });
  
  return validTeams;
}

/**
 * Calculates actual team utilization based on current tasks
 */
export function calculateTeamUtilization(services: ReturnType<typeof getServices>, teamName: string): number {
  const { stateManager } = services;
  const team = stateManager.getTeamStatus(teamName);
  
  if (!team) {
    return 1.0; // Assume fully utilized if team not found
  }
  
  // Calculate based on current tasks and team capacity
  const currentTasks = team.currentTasks.length;
  const maxCapacity = 5; // Configurable team capacity
  
  return Math.min(currentTasks / maxCapacity, 1.0);
}

/**
 * Detects actual conflicts between teams based on shared resources and dependencies
 */
export function detectTeamConflicts(services: ReturnType<typeof getServices>, teams: string[]): Array<{
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  teams: string[];
}> {
  const { stateManager } = services;
  const conflicts: Array<{
    id: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    teams: string[];
  }> = [];
  
  // Check for resource conflicts
  const teamUtilizations = teams.map(team => ({
    team,
    utilization: calculateTeamUtilization(services, team)
  }));
  
  // High utilization conflict
  const overloadedTeams = teamUtilizations.filter(t => t.utilization > 0.9);
  if (overloadedTeams.length > 0) {
    conflicts.push({
      id: `overload_${Date.now()}`,
      description: `Teams overloaded: ${overloadedTeams.map(t => t.team).join(', ')}`,
      severity: 'high',
      teams: overloadedTeams.map(t => t.team)
    });
  }
  
  // Check for dependency conflicts (simplified)
  const state = stateManager.getState();
  const activeTasks = Array.from(state.tasks.values()).filter(task => 
    task.status === 'in_progress' && 
    task.assignedTeams.some(team => teams.includes(team))
  );
  
  // Find tasks with circular or blocking dependencies
  for (const task of activeTasks) {
    const dependentTasks = task.dependencies
      .map(depId => state.tasks.get(depId))
      .filter(Boolean);
    
    const blockingTasks = dependentTasks.filter(dep => 
      dep!.status === 'pending' && 
      dep!.assignedTeams.some(team => teams.includes(team))
    );
    
    if (blockingTasks.length > 0) {
      conflicts.push({
        id: `dependency_${task.id}`,
        description: `Task ${task.id} blocked by dependencies`,
        severity: 'medium',
        teams: task.assignedTeams
      });
    }
  }
  
  return conflicts;
}

/**
 * Calculates actual specialist load based on current assignments
 */
export function calculateSpecialistLoad(services: ReturnType<typeof getServices>, specialistType: string): number {
  const { stateManager } = services;
  const state = stateManager.getState();
  
  // Count specialists of this type currently busy
  const specialistsOfType = Array.from(state.specialists.values())
    .filter(s => s.type === specialistType);
  
  if (specialistsOfType.length === 0) {
    return 0; // No specialists of this type
  }
  
  const busyCount = specialistsOfType.filter(s => s.status === 'busy').length;
  return busyCount / specialistsOfType.length;
}

/**
 * Enhanced error formatter for consistent error responses
 */
export function formatError(toolName: string, error: any, context?: any): { content: Array<{ type: 'text', text: string }> } {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const contextStr = context ? `\nContext: ${JSON.stringify(context, null, 2)}` : '';
  
  logger.error(`${toolName} error`, { error: errorMessage, context });
  
  return {
    content: [{
      type: "text" as const,
      text: `❌ **${toolName} Error**

**Error**: ${errorMessage}${contextStr}

**Suggestions**:
- Verify that all required services are properly initialized
- Check that all input parameters are valid
- Review the tool logs for more detailed error information
- Try restarting the MCP server if the issue persists`
    }]
  };
}