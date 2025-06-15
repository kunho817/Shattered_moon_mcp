export interface TaskBreakdown {
    originalTask: string;
    subtasks: SubTask[];
    dependencies: TaskDependency[];
    estimatedDuration: number;
    parallelizationScore: number;
    granularityLevel: 'coarse' | 'medium' | 'fine' | 'ultra-fine';
    criticalPath: string[];
}
export interface SubTask {
    id: string;
    description: string;
    complexity: 'low' | 'medium' | 'high' | 'critical';
    estimatedTime: number;
    requiredSkills: string[];
    suggestedTeam: string;
    prerequisites: string[];
    parallelizable: boolean;
    atomicity: number;
    priority: number;
    contextRequirement: string[];
}
export interface TaskDependency {
    fromTask: string;
    toTask: string;
    type: 'hard' | 'soft' | 'resource' | 'knowledge';
    weight: number;
    blocking: boolean;
}
export interface GranularityStrategy {
    strategy: 'time_based' | 'skill_based' | 'resource_based' | 'dependency_based' | 'hybrid';
    targetParallelism: number;
    maxSubtasks: number;
    minTaskDuration: number;
    maxTaskDuration: number;
    atomicityThreshold: number;
}
export declare class TaskGranularityEngine {
    private static instance;
    static getInstance(): TaskGranularityEngine;
    analyzeTaskGranularity(task: string, context?: string, strategy?: GranularityStrategy): Promise<TaskBreakdown>;
    private buildGranularityAnalysisPrompt;
    private parseAnalysisResults;
    private createHeuristicBreakdown;
    private generateHeuristicDependencies;
    private optimizeDependencyGraph;
    private calculateParallelizationScore;
    private identifyCriticalPath;
    private createFallbackBreakdown;
    private getDefaultStrategy;
    adjustGranularity(breakdown: TaskBreakdown, targetLevel: 'coarse' | 'medium' | 'fine' | 'ultra-fine'): Promise<TaskBreakdown>;
    private refineTasks;
    private coarsenTasks;
    private mergeComplexity;
}
export declare const taskGranularityEngine: TaskGranularityEngine;
//# sourceMappingURL=taskGranularityEngine.d.ts.map