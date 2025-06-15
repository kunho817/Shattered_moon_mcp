export interface DependencyNode {
    id: string;
    type: 'task' | 'resource' | 'team' | 'knowledge';
    name: string;
    dependencies: string[];
    dependents: string[];
    status: 'available' | 'busy' | 'blocked' | 'failed';
    priority: number;
    estimatedResolutionTime?: number;
}
export interface DependencyGraph {
    nodes: Map<string, DependencyNode>;
    edges: DependencyEdge[];
    criticalPath: string[];
    cycles: string[][];
    resolutionOrder: string[];
}
export interface DependencyEdge {
    from: string;
    to: string;
    type: 'hard' | 'soft' | 'resource' | 'knowledge' | 'temporal';
    weight: number;
    blocking: boolean;
    condition?: string;
}
export interface DependencyConflict {
    id: string;
    type: 'circular' | 'resource_contention' | 'temporal' | 'knowledge_gap';
    affectedNodes: string[];
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    suggestedResolution: string[];
    autoResolvable: boolean;
}
export interface ResolutionStrategy {
    conflictId: string;
    strategy: 'break_cycle' | 'resource_allocation' | 'temporal_adjustment' | 'knowledge_transfer' | 'parallel_execution';
    steps: ResolutionStep[];
    estimatedTime: number;
    riskLevel: 'low' | 'medium' | 'high';
    successProbability: number;
}
export interface ResolutionStep {
    id: string;
    action: string;
    targetNodes: string[];
    expectedOutcome: string;
    rollbackPlan?: string;
}
export declare class DependencyManager {
    private static instance;
    private dependencyGraphs;
    private activeConflicts;
    private resolutionHistory;
    static getInstance(): DependencyManager;
    createDependencyGraph(planId: string, nodes: DependencyNode[], edges: DependencyEdge[]): Promise<DependencyGraph>;
    private detectCycles;
    private calculateCriticalPath;
    private calculateResolutionOrder;
    private analyzeConflicts;
    resolveConflicts(planId: string): Promise<ResolutionStrategy[]>;
    private generateResolutionStrategy;
    private generateHeuristicStrategy;
    private executeResolutionStrategy;
    private breakCycleDependency;
    private scheduleResourceUsage;
    private facilitateKnowledgeTransfer;
    getDependencyGraph(planId: string): DependencyGraph | undefined;
    getActiveConflicts(planId?: string): DependencyConflict[];
    getResolutionHistory(): ResolutionStrategy[];
    optimizeDependencyGraph(planId: string): Promise<void>;
    private findRedundantDependencies;
    private hasIndirectPath;
    private identifyParallelizableNodes;
    private calculateNodeLevels;
}
export declare const dependencyManager: DependencyManager;
//# sourceMappingURL=dependencyManager.d.ts.map