"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.distributedTaskManager = void 0;
const index_js_1 = require("../types/index.js");
const common_js_1 = require("../utils/common.js");
const claudeCodeInvoker_js_1 = require("../utils/claudeCodeInvoker.js");
const claudeCodePerformanceMonitor_js_1 = require("../utils/claudeCodePerformanceMonitor.js");
const logger_js_1 = __importDefault(require("../utils/logger.js"));
exports.distributedTaskManager = (0, common_js_1.withServices)('distributedTaskManager', async (services, params) => {
    const { stateManager, performanceMonitor, aiEngine, learningIntegration } = services;
    return await performanceMonitor.measure('distributed_task_manager', 'execute', async () => {
        try {
            logger_js_1.default.info('Executing distributed task manager', { params });
            // Track task start for learning
            const taskTrackingId = `dist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            learningIntegration.trackTaskStart(taskTrackingId, {
                description: params.task,
                type: 'distributed_task',
                complexity: params.complexity,
                priority: params.priority
            }, {
                teams: params.teams,
                urgency: params.priority ? params.priority / 10 : 0.5
            });
            // Claude Code-powered workload analysis
            const analysisPrompt = `Analyze this task for distributed team management:

Task: "${params.task}"
Priority: ${params.priority}/10
Complexity: ${params.complexity || 'auto'}

Please provide:
1. Recommended complexity level (low/medium/high/critical)
2. Suggested teams from: ${Object.keys(index_js_1.VIRTUAL_TEAMS).join(', ')}
3. Estimated duration in minutes
4. Risk factors
5. Success probability (0-1)

Respond in JSON format with keys: complexity, suggestedTeams, estimatedDuration, riskFactors, successProbability`;
            const claudeResponse = await claudeCodeInvoker_js_1.claudeCodeInvoker.invokeAuto(analysisPrompt, `Task distribution and team coordination for: ${params.task}`, { timeout: 15000 });
            // Record performance metrics
            claudeCodePerformanceMonitor_js_1.claudeCodePerformanceMonitor.recordRequest(claudeCodeInvoker_js_1.claudeCodeInvoker.classifyTask(analysisPrompt, `Task distribution and team coordination for: ${params.task}`).suggestedModel, claudeResponse, 'task_analysis', claudeResponse.success ? 0.9 : 0.3);
            let analysis;
            if (claudeResponse.success) {
                try {
                    analysis = JSON.parse(claudeResponse.output);
                    logger_js_1.default.info('Claude Code analysis completed', { analysis });
                }
                catch (parseError) {
                    logger_js_1.default.warn('Failed to parse Claude response, using fallback', { output: claudeResponse.output });
                    analysis = {
                        complexity: params.complexity || 'medium',
                        suggestedTeams: ['Planning', 'Backend'],
                        estimatedDuration: 60,
                        riskFactors: ['Unknown task complexity'],
                        successProbability: 0.7
                    };
                }
            }
            else {
                logger_js_1.default.error('Claude Code analysis failed, using fallback', { error: claudeResponse.error });
                analysis = {
                    complexity: params.complexity || 'medium',
                    suggestedTeams: ['Planning', 'Backend'],
                    estimatedDuration: 60,
                    riskFactors: ['AI analysis unavailable'],
                    successProbability: 0.6
                };
            }
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
            // Claude Code-powered outcome prediction
            const predictionPrompt = `Predict the outcome for this distributed task:

Task: "${params.task}"
Complexity: ${complexity}
Assigned Teams: ${teams.join(', ')}
Team Count: ${teams.length}

Analyze and predict:
1. Success probability (0-1)
2. Potential issues (array of strings)
3. Recommended optimizations
4. Timeline confidence (0-1)

Respond in JSON format with keys: successProbability, potentialIssues, optimizations, timelineConfidence`;
            const predictionResponse = await claudeCodeInvoker_js_1.claudeCodeInvoker.invokeExecution(predictionPrompt, { timeout: 10000 });
            // Record performance metrics
            claudeCodePerformanceMonitor_js_1.claudeCodePerformanceMonitor.recordRequest('sonnet', predictionResponse, 'outcome_prediction', predictionResponse.success ? 0.85 : 0.2);
            let prediction;
            if (predictionResponse.success) {
                try {
                    prediction = JSON.parse(predictionResponse.output);
                    logger_js_1.default.info('Claude Code prediction completed', { prediction });
                }
                catch (parseError) {
                    logger_js_1.default.warn('Failed to parse prediction response, using fallback');
                    prediction = {
                        successProbability: 0.7,
                        potentialIssues: ['Prediction analysis unavailable'],
                        optimizations: ['Monitor team progress closely'],
                        timelineConfidence: 0.6
                    };
                }
            }
            else {
                logger_js_1.default.error('Claude Code prediction failed, using fallback', { error: predictionResponse.error });
                prediction = {
                    successProbability: 0.6,
                    potentialIssues: ['Prediction system unavailable'],
                    optimizations: ['Manual monitoring required'],
                    timelineConfidence: 0.5
                };
            }
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

**Claude Code Prediction Analysis**:
- Success Probability: ${Math.round(prediction.successProbability * 100)}%
- Timeline Confidence: ${Math.round(prediction.timelineConfidence * 100)}%
- Potential Issues: ${prediction.potentialIssues.length > 0 ? prediction.potentialIssues.join(', ') : 'None identified'}
- Optimizations: ${prediction.optimizations ? prediction.optimizations.join(', ') : 'Current approach is optimal'}

**Team Assignment Results**:
${successfulAssignments.length > 0 ? `
**✅ Successfully Assigned (${successfulAssignments.length}):**
${successfulAssignments.map(a => `- **${a.team}**: Task \`${a.taskId}\` assigned (${a.utilization}% current load)`).join('\n')}` : ''}
${busyTeams.length > 0 ? `
**⚠️ Teams Currently Busy (${busyTeams.length}):**
${busyTeams.map(a => `- **${a.team}**: ${a.utilization}% utilized - consider reassigning or waiting`).join('\n')}` : ''}

**Claude Code Recommendations**:
${prediction.optimizations ? prediction.optimizations.map((r) => `- ${r}`).join('\n') : '- Current task distribution is optimal'}

**Risk Assessment**:
${analysis.riskFactors ? analysis.riskFactors.map((r) => `- ${r}`).join('\n') : '- No significant risks identified'}

**Summary**: Task has been broken down into ${subtasks.length} subtasks and distributed across ${successfulAssignments.length} available teams. Progress will be tracked automatically.`
                    }]
            };
            // Track task completion for learning
            const success = successfulAssignments.length > 0;
            learningIntegration.trackTaskComplete(taskTrackingId, success, complexity, teams);
            return response;
        }
        catch (error) {
            // Track failed task for learning
            if (taskTrackingId) {
                learningIntegration.trackTaskComplete(taskTrackingId, false);
            }
            return (0, common_js_1.formatError)('distributedTaskManager', error, { params });
        }
    });
});
//# sourceMappingURL=distributedTaskManager.js.map