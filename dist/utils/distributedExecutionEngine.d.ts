import { TaskBreakdown } from './taskGranularityEngine.js';
export interface ExecutionPlan {
    id: string;
    breakdown: TaskBreakdown;
    phases: ExecutionPhase[];
    totalDuration: number;
    parallelismUtilization: number;
    resourceAllocation: ResourceAllocation[];
    monitoringPlan: MonitoringConfig;
}
export interface ExecutionPhase {
    id: string;
    name: string;
    tasks: string[];
    startTime: Date;
    expectedDuration: number;
    parallelTasks: string[][];
    dependencies: string[];
    teamAssignments: Map<string, string[]>;
}
export interface ResourceAllocation {
    team: string;
    allocatedTasks: string[];
    utilization: number;
    estimatedLoad: number;
    peakTime: Date;
    bufferTime: number;
}
export interface MonitoringConfig {
    checkpoints: Checkpoint[];
    alertThresholds: AlertThreshold[];
    escalationRules: EscalationRule[];
    reportingInterval: number;
}
export interface Checkpoint {
    id: string;
    taskIds: string[];
    description: string;
    successCriteria: string[];
    timeLimit: number;
    automated: boolean;
}
export interface AlertThreshold {
    metric: 'duration' | 'quality' | 'resource_usage' | 'team_load';
    threshold: number;
    action: 'notify' | 'escalate' | 'rebalance' | 'pause';
}
export interface EscalationRule {
    trigger: string;
    condition: string;
    action: string;
    targetTeam?: string;
    priority: number;
}
export interface ExecutionStatus {
    planId: string;
    currentPhase: string;
    completedTasks: string[];
    activeTasks: string[];
    blockedTasks: string[];
    overallProgress: number;
    teamUtilization: Map<string, number>;
    estimatedCompletion: Date;
    alerts: Alert[];
    metrics: ExecutionMetrics;
}
export interface Alert {
    id: string;
    type: 'warning' | 'error' | 'info';
    message: string;
    taskId?: string;
    team?: string;
    timestamp: Date;
    resolved: boolean;
}
export interface ExecutionMetrics {
    tasksCompleted: number;
    tasksInProgress: number;
    tasksPending: number;
    averageTaskDuration: number;
    parallelismEfficiency: number;
    teamEfficiency: Map<string, number>;
    qualityScore: number;
    resourceUtilization: number;
}
export declare class DistributedExecutionEngine {
    private static instance;
    private activePlans;
    private executionStatus;
    private executionHistory;
    static getInstance(): DistributedExecutionEngine;
    createExecutionPlan(task: string, context?: string, options?: {
        targetParallelism?: number;
        maxDuration?: number;
        priorityTeams?: string[];
        qualityTarget?: number;
    }): Promise<ExecutionPlan>;
    private generateExecutionPhases;
    private calculateTaskLevels;
    private groupParallelTasks;
    private getPhaseName;
    private extractCommonKeywords;
    private getPhaseDependencies;
    private assignTasksToTeams;
    private optimizeResourceAllocation;
    private calculateTeamUtilization;
    private calculatePeakTime;
    private createMonitoringPlan;
    private calculateParallelismUtilization;
    executeTask(planId: string): Promise<ExecutionStatus>;
    private simulateExecution;
    getExecutionStatus(planId: string): ExecutionStatus | undefined;
    getAllActivePlans(): ExecutionPlan[];
    optimizeOngoingExecution(planId: string): Promise<void>;
    private identifyBottlenecks;
    private resolveBottlenecks;
    private replaceTask;
    private rebalanceResources;
    private redistributeTasks;
    private findBestAlternativeTeam;
}
export declare const distributedExecutionEngine: DistributedExecutionEngine;
//# sourceMappingURL=distributedExecutionEngine.d.ts.map