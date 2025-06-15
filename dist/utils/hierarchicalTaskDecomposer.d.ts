/**
 * 계층적 작업 분해 시스템
 * 4단계 계층으로 작업을 분해하여 유연성과 세분화 극대화
 */
export interface StrategicTask {
    id: string;
    title: string;
    description: string;
    duration: number;
    complexity: 'low' | 'medium' | 'high' | 'critical';
    requiredTeams: string[];
    prerequisites: string[];
    deliverables: string[];
    dependencies: string[];
}
export interface TacticalTask {
    id: string;
    parentStrategicId: string;
    title: string;
    description: string;
    duration: number;
    skillRequirements: string[];
    estimatedEffort: number;
    riskLevel: 'low' | 'medium' | 'high';
    testCriteria: string[];
}
export interface OperationalTask {
    id: string;
    parentTacticalId: string;
    title: string;
    description: string;
    duration: number;
    atomicActions: string[];
    verificationSteps: string[];
    rollbackPlan: string[];
}
export interface AtomicTask {
    id: string;
    parentOperationalId: string;
    action: string;
    parameters: Record<string, any>;
    duration: number;
    idempotent: boolean;
    retryable: boolean;
    validationFunction?: string;
}
export interface HierarchicalTaskDecomposition {
    id: string;
    originalTask: string;
    context: string;
    timestamp: number;
    level1: StrategicTask[];
    level2: TacticalTask[];
    level3: OperationalTask[];
    level4: AtomicTask[];
    metadata: {
        totalEstimatedDuration: number;
        parallelismOpportunities: string[];
        riskAssessment: string;
        successCriteria: string[];
        qualityGates: string[];
    };
}
export interface DecompositionStrategy {
    strategy: 'time_based' | 'complexity_based' | 'team_based' | 'hybrid' | 'adaptive';
    maxLevels: number;
    targetGranularity: number;
    parallelismPreference: number;
    riskTolerance: 'conservative' | 'balanced' | 'aggressive';
    qualityRequirement: number;
}
export interface DecompositionContext {
    projectType: string;
    teamCapabilities: string[];
    timeConstraints: number;
    resourceLimitations: string[];
    priorityLevel: number;
    complexityFactors: string[];
}
declare class HierarchicalTaskDecomposer {
    private performanceMetrics;
    /**
     * 메인 분해 함수 - 작업을 4단계 계층으로 분해
     */
    decomposeTask(task: string, context: string, strategy: DecompositionStrategy, decompositionContext: DecompositionContext): Promise<HierarchicalTaskDecomposition>;
    /**
     * Level 1: Strategic Tasks 생성 (1-4시간)
     */
    private createStrategicTasks;
    /**
     * Level 2: Tactical Tasks 생성 (15-60분)
     */
    private createTacticalTasks;
    /**
     * Level 3: Operational Tasks 생성 (5-15분)
     */
    private createOperationalTasks;
    /**
     * Level 4: Atomic Tasks 생성 (1-5분)
     */
    private createAtomicTasks;
    /**
     * 메타데이터 생성
     */
    private generateMetadata;
    /**
     * 병렬화 기회 분석
     */
    private analyzeParallelismOpportunities;
    /**
     * 리스크 평가
     */
    private assessRisks;
    /**
     * 폴백 메서드들
     */
    private createFallbackStrategicTasks;
    private createFallbackTacticalTasks;
    private createFallbackOperationalTasks;
    private createFallbackAtomicTasks;
    /**
     * 성능 메트릭 업데이트
     */
    private updatePerformanceMetrics;
    /**
     * 성능 메트릭 조회
     */
    getPerformanceMetrics(): {
        decompositionsPerformed: number;
        averageDecompositionTime: number;
        successRate: number;
        qualityScore: number;
    };
    /**
     * 적응형 전략 추천
     */
    recommendStrategy(task: string, context: string, constraints: {
        timeLimit?: number;
        teamSize?: number;
        complexity?: string;
    }): Promise<DecompositionStrategy>;
}
export declare const hierarchicalTaskDecomposer: HierarchicalTaskDecomposer;
export {};
//# sourceMappingURL=hierarchicalTaskDecomposer.d.ts.map