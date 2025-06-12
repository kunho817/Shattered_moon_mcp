import { EventEmitter } from 'events';
export interface ProjectState {
    teams: Map<string, TeamState>;
    tasks: Map<string, TaskState>;
    specialists: Map<string, SpecialistState>;
    metadata: ProjectMetadata;
}
export interface TeamState {
    id: string;
    name: string;
    status: 'idle' | 'busy' | 'blocked';
    currentTasks: string[];
    completedTasks: number;
    members: string[];
}
export interface TaskState {
    id: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    assignedTeams: string[];
    priority: number;
    complexity: 'low' | 'medium' | 'high' | 'critical';
    startTime?: Date;
    endTime?: Date;
    dependencies: string[];
    results?: any;
}
export interface SpecialistState {
    id: string;
    type: string;
    status: 'available' | 'busy' | 'offline';
    currentTask?: string;
    expertise: string;
    performance: number;
}
export interface ProjectMetadata {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    averageTaskTime: number;
    teamUtilization: Map<string, number>;
    lastUpdated: Date;
}
export declare class ProjectStateManager extends EventEmitter {
    private state;
    private persistInterval;
    constructor();
    initialize(): Promise<void>;
    createTask(task: Omit<TaskState, 'id'>): string;
    updateTask(taskId: string, updates: Partial<TaskState>): void;
    assignTaskToTeam(taskId: string, teamId: string): void;
    completeTask(taskId: string): void;
    addSpecialist(specialist: Omit<SpecialistState, 'id'>): string;
    updateSpecialist(specialistId: string, updates: Partial<SpecialistState>): void;
    getState(): ProjectState;
    getTeamStatus(teamId: string): TeamState | undefined;
    getTaskStatus(taskId: string): TaskState | undefined;
    getAvailableSpecialists(type?: string): SpecialistState[];
    private updateAverageTaskTime;
    private updateTeamUtilization;
    private updateMetadata;
    private persist;
    shutdown(): Promise<void>;
}
//# sourceMappingURL=state.d.ts.map