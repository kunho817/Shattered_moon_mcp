export interface GlobalContext {
    sessionId: string;
    timestamp: Date;
    activeTeams: Map<string, TeamState>;
    activeSpecialists: Map<string, SpecialistState>;
    activeTasks: Map<string, TaskState>;
    systemMetrics: SystemMetrics;
    learningPatterns: LearningPattern[];
}
export interface TeamState {
    id: string;
    name: string;
    utilization: number;
    activeTasks: string[];
    performance: number;
    lastUpdate: Date;
    capacity: number;
    currentLoad: number;
}
export interface SpecialistState {
    id: string;
    type: string;
    expertise: string;
    availability: number;
    currentTasks: string[];
    performanceScore: number;
    contextMatch: number;
    lastActive: Date;
}
export interface TaskState {
    id: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    assignedTeams: string[];
    assignedSpecialists: string[];
    complexity: string;
    priority: number;
    startTime?: Date;
    estimatedDuration: number;
    actualDuration?: number;
    dependencies: string[];
}
export interface SystemMetrics {
    totalRequests: number;
    successRate: number;
    averageResponseTime: number;
    cacheHitRate: number;
    errorRate: number;
    qualityScore: number;
    lastUpdate: Date;
}
export interface LearningPattern {
    id: string;
    type: string;
    pattern: any;
    frequency: number;
    successRate: number;
    lastSeen: Date;
    confidence: number;
}
export declare class IntegratedContextManager {
    private static instance;
    private globalContext;
    private contextHistory;
    private readonly MAX_HISTORY;
    private updateInterval;
    static getInstance(): IntegratedContextManager;
    constructor();
    /**
     * Get current global context with real-time updates
     */
    getCurrentContext(): Promise<GlobalContext>;
    /**
     * Get enhanced context for specific task
     */
    getTaskContext(taskId: string): Promise<{
        global: GlobalContext;
        task?: TaskState;
        relatedTeams: TeamState[];
        relatedSpecialists: SpecialistState[];
        relevantPatterns: LearningPattern[];
    }>;
    /**
     * Update team state
     */
    updateTeamState(teamId: string, updates: Partial<TeamState>): Promise<void>;
    /**
     * Update specialist state
     */
    updateSpecialistState(specialistId: string, updates: Partial<SpecialistState>): Promise<void>;
    /**
     * Create new task and update context
     */
    createTask(taskData: Omit<TaskState, 'id' | 'status'>): Promise<string>;
    /**
     * Complete task and update context
     */
    completeTask(taskId: string, success: boolean): Promise<void>;
    /**
     * Get team utilization insights
     */
    getTeamUtilizationInsights(): {
        overutilized: TeamState[];
        underutilized: TeamState[];
        balanced: TeamState[];
        recommendations: string[];
    };
    /**
     * Get specialist availability insights
     */
    getSpecialistAvailabilityInsights(): {
        available: SpecialistState[];
        busy: SpecialistState[];
        overloaded: SpecialistState[];
        recommendations: string[];
    };
    /**
     * Get performance trends
     */
    getPerformanceTrends(): {
        teamTrends: Array<{
            team: string;
            trend: 'improving' | 'stable' | 'declining';
            score: number;
        }>;
        specialistTrends: Array<{
            specialist: string;
            trend: 'improving' | 'stable' | 'declining';
            score: number;
        }>;
        systemTrend: 'improving' | 'stable' | 'declining';
    };
    private initializeContext;
    private updateContext;
    private saveContextSnapshot;
    private findRelevantPatterns;
    private calculateTeamLoad;
    private updatePerformanceScore;
    private recordTaskPattern;
    private calculateTrend;
    private startPeriodicUpdates;
    /**
     * Reset context manager
     */
    reset(): void;
    /**
     * Get context statistics
     */
    getStats(): {
        activeTeams: number;
        activeSpecialists: number;
        activeTasks: number;
        learningPatterns: number;
        historySize: number;
        lastUpdate: Date;
    };
}
export declare const integratedContextManager: IntegratedContextManager;
//# sourceMappingURL=integratedContextManager.d.ts.map