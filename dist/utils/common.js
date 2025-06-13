"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withServices = withServices;
exports.validateTeams = validateTeams;
exports.calculateTeamUtilization = calculateTeamUtilization;
exports.detectTeamConflicts = detectTeamConflicts;
exports.calculateSpecialistLoad = calculateSpecialistLoad;
exports.formatError = formatError;
const index_js_1 = require("../types/index.js");
const services_js_1 = require("../server/services.js");
const logger_js_1 = __importDefault(require("./logger.js"));
/**
 * Higher-order function to wrap tool functions with services initialization
 */
function withServices(toolName, fn) {
    return async (...args) => {
        logger_js_1.default.info(`${toolName} called`, { args });
        try {
            const services = (0, services_js_1.getServices)();
            logger_js_1.default.info(`${toolName}: Services retrieved successfully`);
            return await fn(services, ...args);
        }
        catch (error) {
            logger_js_1.default.error(`${toolName}: Services not initialized`, { error });
            return {
                content: [{
                        type: "text",
                        text: `Error: MCP services not properly initialized. Please restart the server. (Tool: ${toolName})`
                    }]
            };
        }
    };
}
/**
 * Validates and normalizes team names
 */
function validateTeams(teams) {
    if (!teams) {
        return [];
    }
    // Normalize to array
    const teamArray = Array.isArray(teams) ? teams : [teams];
    // Filter valid teams
    const validTeams = teamArray.filter(team => {
        if (typeof team !== 'string') {
            logger_js_1.default.warn('Invalid team type detected', { team, type: typeof team });
            return false;
        }
        if (!(team in index_js_1.VIRTUAL_TEAMS)) {
            logger_js_1.default.warn('Unknown team detected', { team });
            return false;
        }
        return true;
    });
    logger_js_1.default.info('Team validation completed', {
        input: teamArray,
        valid: validTeams,
        filtered: teamArray.length - validTeams.length
    });
    return validTeams;
}
/**
 * Calculates actual team utilization based on current tasks
 */
function calculateTeamUtilization(services, teamName) {
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
function detectTeamConflicts(services, teams) {
    const { stateManager } = services;
    const conflicts = [];
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
    const activeTasks = Array.from(state.tasks.values()).filter(task => task.status === 'in_progress' &&
        task.assignedTeams.some(team => teams.includes(team)));
    // Find tasks with circular or blocking dependencies
    for (const task of activeTasks) {
        const dependentTasks = task.dependencies
            .map(depId => state.tasks.get(depId))
            .filter(Boolean);
        const blockingTasks = dependentTasks.filter(dep => dep.status === 'pending' &&
            dep.assignedTeams.some(team => teams.includes(team)));
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
function calculateSpecialistLoad(services, specialistType) {
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
function formatError(toolName, error, context) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const contextStr = context ? `\nContext: ${JSON.stringify(context, null, 2)}` : '';
    logger_js_1.default.error(`${toolName} error`, { error: errorMessage, context });
    return {
        content: [{
                type: "text",
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
//# sourceMappingURL=common.js.map