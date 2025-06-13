"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.distributedTaskManager = void 0;
const index_js_1 = require("../types/index.js");
const common_js_1 = require("../utils/common.js");
const logger_js_1 = __importDefault(require("../utils/logger.js"));
exports.distributedTaskManager = (0, common_js_1.withServices)('distributedTaskManager', async (services, params) => {
    const { stateManager, performanceMonitor, aiEngine } = services;
    return await performanceMonitor.measure('distributed_task_manager', 'execute', async () => {
        try {
            logger_js_1.default.info('Executing distributed task manager', { params });
            // Extract keywords from task description
            const keywords = params.task.toLowerCase().split(/\s+/)
                .filter(word => word.length > 3);
            logger_js_1.default.info('Keywords extracted', { keywords });
            // AI-powered workload analysis
            const analysis = aiEngine.analyzeWorkload({
                description: params.task,
                keywords
            });
            logger_js_1.default.info('AI analysis completed', { analysis });
            // Override with user-specified complexity if provided
            const complexity = params.complexity || analysis.complexity;
            // Validate and determine teams to involve
            let teams = (0, common_js_1.validateTeams)(params.teams || analysis.suggestedTeams);
            if (teams.length === 0) {
                teams = (0, common_js_1.validateTeams)(analysis.suggestedTeams) || Object.keys(index_js_1.VIRTUAL_TEAMS).slice(0, 2);
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
            // Predict outcome using enhanced AI analysis
            const prediction = aiEngine.predictTaskOutcome({
                ...params,
                complexity,
                teams
            });
            // Distribute to teams with improved utilization calculation
            const assignments = [];
            const subtasks = [];
            logger_js_1.default.info('Starting team distribution', { teams, teamsLength: teams.length });
            for (const teamName of teams) {
                logger_js_1.default.info('Processing team', { teamName });
                const team = stateManager.getTeamStatus(teamName);
                if (!team) {
                    logger_js_1.default.warn('Team not found', { teamName });
                    continue;
                }
                // Use improved utilization calculation
                const utilization = (0, common_js_1.calculateTeamUtilization)(services, teamName);
                logger_js_1.default.info('Team utilization calculated', { teamName, utilization });
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
                }
                else {
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
            // Record pattern for learning with enhanced data
            aiEngine.recordTaskPattern({
                type: 'distributed',
                complexity,
                teams,
                duration: analysis.estimatedDuration,
                success: assignments.filter(a => a.status === 'assigned').length > 0
            });
            // Generate enhanced response
            const successfulAssignments = assignments.filter(a => a.status === 'assigned');
            const busyTeams = assignments.filter(a => a.status === 'team_busy');
            const response = {
                content: [{
                        type: "text",
                        text: `✅ **Task Distributed Successfully!**

**Task Details**:
- **ID**: \`${taskId}\`
- **Description**: ${params.task}
- **Complexity**: ${complexity} (${Math.round(analysis.confidence * 100)}% AI confidence)
- **Priority**: ${params.priority}/10
- **Estimated Duration**: ${analysis.estimatedDuration} minutes

**AI Prediction Analysis**:
- Success Probability: ${Math.round(prediction.successProbability * 100)}%
- Potential Issues: ${prediction.potentialIssues.length > 0 ? prediction.potentialIssues.join(', ') : 'None identified'}

**Team Assignment Results**:
${successfulAssignments.length > 0 ? `
**✅ Successfully Assigned (${successfulAssignments.length}):**
${successfulAssignments.map(a => `- **${a.team}**: Task \`${a.taskId}\` assigned (${a.utilization}% current load)`).join('\n')}` : ''}
${busyTeams.length > 0 ? `
**⚠️ Teams Currently Busy (${busyTeams.length}):**
${busyTeams.map(a => `- **${a.team}**: ${a.utilization}% utilized - consider reassigning or waiting`).join('\n')}` : ''}

**AI Recommendations**:
${aiEngine.getRecommendations('task').slice(0, 3).map(r => `- ${r}`).join('\n') || '- Current task distribution is optimal'}

**Summary**: Task has been broken down into ${subtasks.length} subtasks and distributed across ${successfulAssignments.length} available teams. Progress will be tracked automatically.`
                    }]
            };
            return response;
        }
        catch (error) {
            return (0, common_js_1.formatError)('distributedTaskManager', error, { params });
        }
    });
});
//# sourceMappingURL=distributedTaskManager.js.map