"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.distributedTaskManager = void 0;
const index_js_1 = require("../types/index.js");
const common_js_1 = require("../utils/common.js");
const enhancedClaudeCodeManager_js_1 = require("../utils/enhancedClaudeCodeManager.js");
const logger_js_1 = __importDefault(require("../utils/logger.js"));
exports.distributedTaskManager = (0, common_js_1.withServices)('distributedTaskManager', async (services, params) => {
    const { stateManager, performanceMonitor } = services;
    return await performanceMonitor.measure('distributed_task_manager', 'execute', async () => {
        try {
            logger_js_1.default.info('Executing distributed task manager', { params });
            // Task tracking ID for reference
            const taskTrackingId = `dist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            // Enhanced Claude Code-powered workload analysis
            const analysis = await enhancedClaudeCodeManager_js_1.enhancedClaudeCodeManager.analyzeDistributedTask(params.task, params.teams || [], params.complexity, params.priority);
            logger_js_1.default.info('Enhanced analysis completed', {
                analysis,
                cacheStats: enhancedClaudeCodeManager_js_1.enhancedClaudeCodeManager.getStats()
            });
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
            // Enhanced outcome prediction using optimized analysis
            const prediction = {
                successProbability: analysis.successProbability,
                potentialIssues: analysis.riskFactors,
                optimizations: analysis.optimizations,
                timelineConfidence: analysis.successProbability * 0.9 // Derived from success probability
            };
            logger_js_1.default.info('Enhanced prediction derived from analysis', { prediction });
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
            // Pattern recording replaced by Claude Code analytics
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

**Enhanced AI Analysis**:
- Success Probability: ${Math.round(prediction.successProbability * 100)}%
- Timeline Confidence: ${Math.round(prediction.timelineConfidence * 100)}%
- Risk Factors: ${prediction.potentialIssues.length > 0 ? prediction.potentialIssues.join(', ') : 'None identified'}
- Optimizations: ${prediction.optimizations ? prediction.optimizations.join(', ') : 'Current approach is optimal'}
- Analysis Source: Enhanced Manager (Cache: ${enhancedClaudeCodeManager_js_1.enhancedClaudeCodeManager.getStats().cacheHitRate > 0 ? 'Hit' : 'Miss'})

**Team Assignment Results**:
${successfulAssignments.length > 0 ? `
**✅ Successfully Assigned (${successfulAssignments.length}):**
${successfulAssignments.map(a => `- **${a.team}**: Task \`${a.taskId}\` assigned (${a.utilization}% current load)`).join('\n')}` : ''}
${busyTeams.length > 0 ? `
**⚠️ Teams Currently Busy (${busyTeams.length}):**
${busyTeams.map(a => `- **${a.team}**: ${a.utilization}% utilized - consider reassigning or waiting`).join('\n')}` : ''}

**Enhanced AI Recommendations**:
${prediction.optimizations ? prediction.optimizations.map((r) => `- ${r}`).join('\n') : '- Current task distribution is optimal'}

**Risk Assessment**:
${analysis.riskFactors ? analysis.riskFactors.map((r) => `- ${r}`).join('\n') : '- No significant risks identified'}

**Performance Insights**:
- Cache Efficiency: ${Math.round(enhancedClaudeCodeManager_js_1.enhancedClaudeCodeManager.getStats().cacheHitRate * 100)}%
- Queue Status: ${enhancedClaudeCodeManager_js_1.enhancedClaudeCodeManager.getStats().queueSize} pending requests
- System Load: ${enhancedClaudeCodeManager_js_1.enhancedClaudeCodeManager.getStats().cacheSize < 50 ? 'Low' : 'Moderate'}

**Summary**: Task has been broken down into ${subtasks.length} subtasks and distributed across ${successfulAssignments.length} available teams. Progress will be tracked automatically.`
                    }]
            };
            // Task completion tracking
            const success = successfulAssignments.length > 0;
            logger_js_1.default.info('Task completion tracked', {
                taskId: taskTrackingId,
                success,
                complexity,
                teams
            });
            return response;
        }
        catch (error) {
            // Track failed task
            const fallbackTaskId = `dist_${Date.now()}_error`;
            logger_js_1.default.error('Task execution failed', { taskId: fallbackTaskId, error });
            return (0, common_js_1.formatError)('distributedTaskManager', error, { params });
        }
    });
});
//# sourceMappingURL=distributedTaskManager.js.map