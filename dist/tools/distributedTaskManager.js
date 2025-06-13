"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.distributedTaskManager = distributedTaskManager;
const index_js_1 = require("../types/index.js");
const services_js_1 = require("../server/services.js");
const logger_js_1 = __importDefault(require("../utils/logger.js"));
async function distributedTaskManager(params) {
    logger_js_1.default.info('distributedTaskManager called', { params });
    let services;
    try {
        services = (0, services_js_1.getServices)();
        logger_js_1.default.info('Services retrieved successfully');
    }
    catch (error) {
        logger_js_1.default.error('Services not initialized', { error });
        return {
            content: [{
                    type: "text",
                    text: "Error: MCP services not properly initialized. Please restart the server."
                }]
        };
    }
    const { stateManager, performanceMonitor, aiEngine } = services;
    logger_js_1.default.info('Services destructured successfully');
    return await performanceMonitor.measure('distributed_task_manager', 'execute', async () => {
        logger_js_1.default.info('Executing distributed task manager', { params });
        // Extract keywords from task description
        logger_js_1.default.info('Extracting keywords from task');
        const keywords = params.task.toLowerCase().split(/\s+/)
            .filter(word => word.length > 3);
        logger_js_1.default.info('Keywords extracted', { keywords });
        // AI-powered workload analysis
        logger_js_1.default.info('Starting AI workload analysis');
        const analysis = aiEngine.analyzeWorkload({
            description: params.task,
            keywords
        });
        logger_js_1.default.info('AI analysis completed', { analysis });
        // Override with user-specified complexity if provided
        const complexity = params.complexity || analysis.complexity;
        // Determine teams to involve
        logger_js_1.default.info('Determining teams', { paramsTeams: params.teams, suggestedTeams: analysis.suggestedTeams });
        let teams = params.teams || analysis.suggestedTeams || [];
        logger_js_1.default.info('Initial teams', { teams, type: typeof teams, isArray: Array.isArray(teams) });
        // Ensure teams is an array
        if (!Array.isArray(teams)) {
            logger_js_1.default.warn('Teams is not array, converting', { teams });
            teams = [];
        }
        // Validate teams
        logger_js_1.default.info('Validating teams against VIRTUAL_TEAMS', { teams, virtualTeamsKeys: Object.keys(index_js_1.VIRTUAL_TEAMS) });
        teams = teams.filter(team => team in index_js_1.VIRTUAL_TEAMS);
        logger_js_1.default.info('Teams after validation', { teams });
        if (teams.length === 0) {
            teams = analysis.suggestedTeams || Object.keys(index_js_1.VIRTUAL_TEAMS).slice(0, 2);
            logger_js_1.default.info('Using fallback teams', { teams });
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
        const assignments = [];
        const subtasks = [];
        logger_js_1.default.info('Starting team distribution', { teams, teamsLength: teams.length, teamsType: typeof teams });
        for (const teamName of teams) {
            logger_js_1.default.info('Processing team', { teamName });
            const team = stateManager.getTeamStatus(teamName);
            if (!team)
                continue;
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
            }
            else {
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
                    type: "text",
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
${assignments.map(a => `- **${a.team}**: ${a.status === 'assigned' ? `Task ${a.taskId} assigned` : `Busy (${Math.round(a.utilization * 100)}% utilized)`}`).join('\n')}

**Recommendations**:
${aiEngine.getRecommendations('task').slice(0, 3).map(r => `- ${r}`).join('\n') || '- No specific recommendations at this time'}

The task has been broken down into ${subtasks.length} subtasks and distributed across the assigned teams. Progress will be tracked automatically.`
                }]
        };
        return response;
    });
}
//# sourceMappingURL=distributedTaskManager.js.map