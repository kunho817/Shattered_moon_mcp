"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.integratedContextManager = exports.IntegratedContextManager = void 0;
const logger_js_1 = __importDefault(require("./logger.js"));
const services_js_1 = require("../server/services.js");
class IntegratedContextManager {
    static instance;
    globalContext;
    contextHistory = [];
    MAX_HISTORY = 100;
    updateInterval = null;
    static getInstance() {
        if (!IntegratedContextManager.instance) {
            IntegratedContextManager.instance = new IntegratedContextManager();
        }
        return IntegratedContextManager.instance;
    }
    constructor() {
        this.globalContext = this.initializeContext();
        this.startPeriodicUpdates();
    }
    /**
     * Get current global context with real-time updates
     */
    async getCurrentContext() {
        await this.updateContext();
        return { ...this.globalContext };
    }
    /**
     * Get enhanced context for specific task
     */
    async getTaskContext(taskId) {
        const global = await this.getCurrentContext();
        const task = global.activeTasks.get(taskId);
        let relatedTeams = [];
        let relatedSpecialists = [];
        if (task) {
            relatedTeams = task.assignedTeams
                .map(teamId => global.activeTeams.get(teamId))
                .filter(Boolean);
            relatedSpecialists = task.assignedSpecialists
                .map(specId => global.activeSpecialists.get(specId))
                .filter(Boolean);
        }
        const relevantPatterns = this.findRelevantPatterns(task);
        return {
            global,
            task,
            relatedTeams,
            relatedSpecialists,
            relevantPatterns
        };
    }
    /**
     * Update team state
     */
    async updateTeamState(teamId, updates) {
        const currentTeam = this.globalContext.activeTeams.get(teamId);
        if (currentTeam) {
            const updatedTeam = {
                ...currentTeam,
                ...updates,
                lastUpdate: new Date()
            };
            this.globalContext.activeTeams.set(teamId, updatedTeam);
            logger_js_1.default.debug('Team state updated', { teamId, updates });
        }
        else {
            logger_js_1.default.warn('Attempted to update non-existent team', { teamId });
        }
    }
    /**
     * Update specialist state
     */
    async updateSpecialistState(specialistId, updates) {
        const currentSpecialist = this.globalContext.activeSpecialists.get(specialistId);
        if (currentSpecialist) {
            const updatedSpecialist = {
                ...currentSpecialist,
                ...updates,
                lastActive: new Date()
            };
            this.globalContext.activeSpecialists.set(specialistId, updatedSpecialist);
            logger_js_1.default.debug('Specialist state updated', { specialistId, updates });
        }
        else {
            logger_js_1.default.warn('Attempted to update non-existent specialist', { specialistId });
        }
    }
    /**
     * Create new task and update context
     */
    async createTask(taskData) {
        const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newTask = {
            id: taskId,
            status: 'pending',
            ...taskData
        };
        this.globalContext.activeTasks.set(taskId, newTask);
        // Update team assignments
        for (const teamId of taskData.assignedTeams) {
            const team = this.globalContext.activeTeams.get(teamId);
            if (team) {
                team.activeTasks.push(taskId);
                team.currentLoad = this.calculateTeamLoad(team);
                team.utilization = Math.min(team.currentLoad / team.capacity, 1.0);
                team.lastUpdate = new Date();
            }
        }
        // Update specialist assignments
        for (const specialistId of taskData.assignedSpecialists) {
            const specialist = this.globalContext.activeSpecialists.get(specialistId);
            if (specialist) {
                specialist.currentTasks.push(taskId);
                specialist.availability = Math.max(0, specialist.availability - 0.2);
                specialist.lastActive = new Date();
            }
        }
        logger_js_1.default.info('Task created and context updated', { taskId, taskData });
        return taskId;
    }
    /**
     * Complete task and update context
     */
    async completeTask(taskId, success) {
        const task = this.globalContext.activeTasks.get(taskId);
        if (!task) {
            logger_js_1.default.warn('Attempted to complete non-existent task', { taskId });
            return;
        }
        // Update task status
        task.status = success ? 'completed' : 'failed';
        task.actualDuration = task.startTime ? Date.now() - task.startTime.getTime() : 0;
        // Update team states
        for (const teamId of task.assignedTeams) {
            const team = this.globalContext.activeTeams.get(teamId);
            if (team) {
                team.activeTasks = team.activeTasks.filter(id => id !== taskId);
                team.currentLoad = this.calculateTeamLoad(team);
                team.utilization = Math.min(team.currentLoad / team.capacity, 1.0);
                team.performance = this.updatePerformanceScore(team.performance, success);
                team.lastUpdate = new Date();
            }
        }
        // Update specialist states
        for (const specialistId of task.assignedSpecialists) {
            const specialist = this.globalContext.activeSpecialists.get(specialistId);
            if (specialist) {
                specialist.currentTasks = specialist.currentTasks.filter(id => id !== taskId);
                specialist.availability = Math.min(1.0, specialist.availability + 0.2);
                specialist.performanceScore = this.updatePerformanceScore(specialist.performanceScore, success);
                specialist.lastActive = new Date();
            }
        }
        // Record learning pattern
        this.recordTaskPattern(task, success);
        logger_js_1.default.info('Task completed and context updated', { taskId, success });
    }
    /**
     * Get team utilization insights
     */
    getTeamUtilizationInsights() {
        const teams = Array.from(this.globalContext.activeTeams.values());
        const overutilized = teams.filter(t => t.utilization > 0.8);
        const underutilized = teams.filter(t => t.utilization < 0.3);
        const balanced = teams.filter(t => t.utilization >= 0.3 && t.utilization <= 0.8);
        const recommendations = [];
        if (overutilized.length > 0) {
            recommendations.push(`${overutilized.length} teams are overutilized - consider redistributing workload`);
        }
        if (underutilized.length > balanced.length) {
            recommendations.push(`${underutilized.length} teams are underutilized - consider assigning more tasks`);
        }
        if (overutilized.length > 0 && underutilized.length > 0) {
            recommendations.push('Consider task redistribution from overutilized to underutilized teams');
        }
        return {
            overutilized,
            underutilized,
            balanced,
            recommendations
        };
    }
    /**
     * Get specialist availability insights
     */
    getSpecialistAvailabilityInsights() {
        const specialists = Array.from(this.globalContext.activeSpecialists.values());
        const available = specialists.filter(s => s.availability > 0.7);
        const busy = specialists.filter(s => s.availability >= 0.3 && s.availability <= 0.7);
        const overloaded = specialists.filter(s => s.availability < 0.3);
        const recommendations = [];
        if (overloaded.length > 0) {
            recommendations.push(`${overloaded.length} specialists are overloaded - avoid additional assignments`);
        }
        if (available.length > 0) {
            recommendations.push(`${available.length} specialists are available for new tasks`);
        }
        return {
            available,
            busy,
            overloaded,
            recommendations
        };
    }
    /**
     * Get performance trends
     */
    getPerformanceTrends() {
        const teams = Array.from(this.globalContext.activeTeams.values());
        const specialists = Array.from(this.globalContext.activeSpecialists.values());
        const teamTrends = teams.map(team => ({
            team: team.name,
            trend: this.calculateTrend(team.performance),
            score: team.performance
        }));
        const specialistTrends = specialists.map(specialist => ({
            specialist: specialist.type,
            trend: this.calculateTrend(specialist.performanceScore),
            score: specialist.performanceScore
        }));
        const avgSystemPerformance = this.globalContext.systemMetrics.qualityScore;
        const systemTrend = this.calculateTrend(avgSystemPerformance);
        return {
            teamTrends,
            specialistTrends,
            systemTrend
        };
    }
    initializeContext() {
        return {
            sessionId: `session_${Date.now()}`,
            timestamp: new Date(),
            activeTeams: new Map(),
            activeSpecialists: new Map(),
            activeTasks: new Map(),
            systemMetrics: {
                totalRequests: 0,
                successRate: 0.8,
                averageResponseTime: 5000,
                cacheHitRate: 0,
                errorRate: 0.1,
                qualityScore: 0.85,
                lastUpdate: new Date()
            },
            learningPatterns: []
        };
    }
    async updateContext() {
        try {
            const services = (0, services_js_1.getServices)();
            // Update system metrics
            this.globalContext.systemMetrics.lastUpdate = new Date();
            this.globalContext.timestamp = new Date();
            // Save context snapshot
            this.saveContextSnapshot();
        }
        catch (error) {
            logger_js_1.default.error('Failed to update context', { error });
        }
    }
    saveContextSnapshot() {
        const snapshot = { ...this.globalContext };
        this.contextHistory.push(snapshot);
        if (this.contextHistory.length > this.MAX_HISTORY) {
            this.contextHistory = this.contextHistory.slice(-this.MAX_HISTORY);
        }
    }
    findRelevantPatterns(task) {
        if (!task)
            return [];
        return this.globalContext.learningPatterns.filter(pattern => {
            if (pattern.type === 'task' && pattern.pattern.complexity === task.complexity) {
                return true;
            }
            if (pattern.pattern.teams && task.assignedTeams.some(team => pattern.pattern.teams.includes(team))) {
                return true;
            }
            return false;
        }).slice(0, 5); // Top 5 relevant patterns
    }
    calculateTeamLoad(team) {
        // Simple load calculation based on active tasks
        return team.activeTasks.length;
    }
    updatePerformanceScore(currentScore, success) {
        const adjustment = success ? 0.05 : -0.03;
        return Math.max(0.1, Math.min(1.0, currentScore + adjustment));
    }
    recordTaskPattern(task, success) {
        const patternId = `${task.complexity}_${task.assignedTeams.sort().join('_')}`;
        const existingPattern = this.globalContext.learningPatterns.find(p => p.id === patternId);
        if (existingPattern) {
            existingPattern.frequency++;
            existingPattern.successRate = (existingPattern.successRate + (success ? 1 : 0)) / 2;
            existingPattern.lastSeen = new Date();
            existingPattern.confidence = Math.min(existingPattern.confidence * 1.1, 1.0);
        }
        else {
            this.globalContext.learningPatterns.push({
                id: patternId,
                type: 'task',
                pattern: {
                    complexity: task.complexity,
                    teams: task.assignedTeams,
                    specialists: task.assignedSpecialists,
                    duration: task.estimatedDuration
                },
                frequency: 1,
                successRate: success ? 1 : 0,
                lastSeen: new Date(),
                confidence: 0.5
            });
        }
    }
    calculateTrend(score) {
        // Simplified trend calculation
        if (score > 0.8)
            return 'improving';
        if (score > 0.6)
            return 'stable';
        return 'declining';
    }
    startPeriodicUpdates() {
        this.updateInterval = setInterval(async () => {
            await this.updateContext();
        }, 30000); // Update every 30 seconds
    }
    /**
     * Reset context manager
     */
    reset() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        this.globalContext = this.initializeContext();
        this.contextHistory = [];
        this.startPeriodicUpdates();
        logger_js_1.default.info('Integrated Context Manager reset');
    }
    /**
     * Get context statistics
     */
    getStats() {
        return {
            activeTeams: this.globalContext.activeTeams.size,
            activeSpecialists: this.globalContext.activeSpecialists.size,
            activeTasks: this.globalContext.activeTasks.size,
            learningPatterns: this.globalContext.learningPatterns.length,
            historySize: this.contextHistory.length,
            lastUpdate: this.globalContext.timestamp
        };
    }
}
exports.IntegratedContextManager = IntegratedContextManager;
// Export singleton instance
exports.integratedContextManager = IntegratedContextManager.getInstance();
//# sourceMappingURL=integratedContextManager.js.map