"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectStateManager = void 0;
const events_1 = require("events");
const logger_js_1 = __importDefault(require("./logger.js"));
class ProjectStateManager extends events_1.EventEmitter {
    state;
    persistInterval = null;
    constructor() {
        super();
        this.state = {
            teams: new Map(),
            tasks: new Map(),
            specialists: new Map(),
            metadata: {
                totalTasks: 0,
                completedTasks: 0,
                failedTasks: 0,
                averageTaskTime: 0,
                teamUtilization: new Map(),
                lastUpdated: new Date()
            }
        };
    }
    async initialize() {
        logger_js_1.default.info('Initializing project state manager');
        // Initialize default teams
        const defaultTeams = [
            'planning', 'backend', 'frontend', 'testing',
            'documentation', 'performance', 'devops'
        ];
        defaultTeams.forEach(teamName => {
            this.state.teams.set(teamName, {
                id: teamName,
                name: `${teamName.charAt(0).toUpperCase() + teamName.slice(1)} Team`,
                status: 'idle',
                currentTasks: [],
                completedTasks: 0,
                members: []
            });
        });
        // Start persistence
        this.persistInterval = setInterval(() => {
            this.persist();
        }, 30000); // Every 30 seconds
    }
    createTask(task) {
        const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newTask = {
            ...task,
            id,
            status: task.status || 'pending',
            dependencies: task.dependencies || [],
            assignedTeams: task.assignedTeams || []
        };
        this.state.tasks.set(id, newTask);
        this.state.metadata.totalTasks++;
        this.updateMetadata();
        this.emit('taskCreated', newTask);
        return id;
    }
    updateTask(taskId, updates) {
        const task = this.state.tasks.get(taskId);
        if (!task) {
            throw new Error(`Task not found: ${taskId}`);
        }
        const updatedTask = { ...task, ...updates };
        this.state.tasks.set(taskId, updatedTask);
        // Update metadata
        if (updates.status === 'completed' && task.status !== 'completed') {
            this.state.metadata.completedTasks++;
            if (task.startTime) {
                const duration = Date.now() - task.startTime.getTime();
                this.updateAverageTaskTime(duration);
            }
        }
        else if (updates.status === 'failed' && task.status !== 'failed') {
            this.state.metadata.failedTasks++;
        }
        this.updateMetadata();
        this.emit('taskUpdated', updatedTask);
    }
    assignTaskToTeam(taskId, teamId) {
        const task = this.state.tasks.get(taskId);
        const team = this.state.teams.get(teamId);
        if (!task || !team) {
            throw new Error('Task or team not found');
        }
        // Update task
        if (!task.assignedTeams.includes(teamId)) {
            task.assignedTeams.push(teamId);
        }
        // Update team
        if (!team.currentTasks.includes(taskId)) {
            team.currentTasks.push(taskId);
            team.status = 'busy';
        }
        this.updateTeamUtilization();
        this.emit('taskAssigned', { taskId, teamId });
    }
    completeTask(taskId) {
        const task = this.state.tasks.get(taskId);
        if (!task) {
            throw new Error(`Task not found: ${taskId}`);
        }
        // Remove from assigned teams
        const assignedTeams = task.assignedTeams || [];
        assignedTeams.forEach(teamId => {
            const team = this.state.teams.get(teamId);
            if (team) {
                team.currentTasks = team.currentTasks.filter(id => id !== taskId);
                team.completedTasks++;
                if (team.currentTasks.length === 0) {
                    team.status = 'idle';
                }
            }
        });
        // Update task
        this.updateTask(taskId, {
            status: 'completed',
            endTime: new Date()
        });
    }
    addSpecialist(specialist) {
        const id = `spec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newSpecialist = {
            ...specialist,
            id,
            status: specialist.status || 'available',
            performance: specialist.performance || 1.0
        };
        this.state.specialists.set(id, newSpecialist);
        this.emit('specialistAdded', newSpecialist);
        return id;
    }
    updateSpecialist(specialistId, updates) {
        const specialist = this.state.specialists.get(specialistId);
        if (!specialist) {
            throw new Error(`Specialist not found: ${specialistId}`);
        }
        const updatedSpecialist = { ...specialist, ...updates };
        this.state.specialists.set(specialistId, updatedSpecialist);
        this.emit('specialistUpdated', updatedSpecialist);
    }
    getState() {
        return this.state;
    }
    getTeamStatus(teamId) {
        return this.state.teams.get(teamId);
    }
    getTaskStatus(taskId) {
        return this.state.tasks.get(taskId);
    }
    getAvailableSpecialists(type) {
        const specialists = Array.from(this.state.specialists.values());
        const available = specialists.filter(s => s.status === 'available');
        if (type) {
            return available.filter(s => s.type === type);
        }
        return available;
    }
    updateAverageTaskTime(duration) {
        const completed = this.state.metadata.completedTasks;
        const currentAvg = this.state.metadata.averageTaskTime;
        this.state.metadata.averageTaskTime =
            (currentAvg * (completed - 1) + duration) / completed;
    }
    updateTeamUtilization() {
        this.state.teams.forEach((team, teamId) => {
            const utilization = team.currentTasks.length / 5; // Assume max 5 tasks per team
            this.state.metadata.teamUtilization.set(teamId, Math.min(utilization, 1));
        });
    }
    updateMetadata() {
        this.state.metadata.lastUpdated = new Date();
    }
    async persist() {
        // In production, this would save to a database
        logger_js_1.default.debug('Persisting project state');
    }
    async shutdown() {
        if (this.persistInterval) {
            clearInterval(this.persistInterval);
        }
        await this.persist();
    }
}
exports.ProjectStateManager = ProjectStateManager;
//# sourceMappingURL=state.js.map