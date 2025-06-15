/**
 * 적응형 워크로드 밸런싱 시스템
 * 실시간으로 팀 간 워크로드를 분석하고 최적화하여 분산 처리 효율성 극대화
 */
export interface TeamLoad {
    teamName: string;
    currentTasks: number;
    capacity: number;
    utilization: number;
    avgTaskDuration: number;
    skillEfficiency: Record<string, number>;
    responseTime: number;
    errorRate: number;
    lastActivity: number;
    burnoutRisk: number;
    collaborationScore: number;
}
export interface TaskWorkload {
    taskId: string;
    estimatedDuration: number;
    requiredSkills: string[];
    priority: number;
    complexity: 'low' | 'medium' | 'high' | 'critical';
    dependencies: string[];
    deadline?: number;
    assignedTeam?: string;
    actualDuration?: number;
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'blocked';
}
export interface BottleneckAnalysis {
    type: 'capacity' | 'skill' | 'dependency' | 'collaboration' | 'performance';
    severity: 'low' | 'medium' | 'high' | 'critical';
    affectedTeams: string[];
    affectedTasks: string[];
    description: string;
    estimatedImpact: number;
    recommendedActions: string[];
    rootCause: string;
}
export interface RebalanceAction {
    type: 'redistribute' | 'delegate' | 'parallelize' | 'defer' | 'escalate';
    sourceTeam: string;
    targetTeam?: string;
    taskIds: string[];
    reasoning: string;
    expectedImprovement: number;
    riskLevel: 'low' | 'medium' | 'high';
    executionTime: number;
}
export interface RebalanceResult {
    rebalanceId: string;
    timestamp: number;
    actions: RebalanceAction[];
    beforeState: TeamLoad[];
    afterState: TeamLoad[];
    improvementMetrics: {
        utilizationImprovement: number;
        responseTimeImprovement: number;
        throughputImprovement: number;
        burnoutReduction: number;
    };
    success: boolean;
    executionTime: number;
    feedback: string[];
}
export interface LoadBalancingStrategy {
    algorithm: 'round_robin' | 'least_loaded' | 'skill_based' | 'adaptive' | 'ml_optimized';
    rebalanceThreshold: number;
    maxUtilization: number;
    burnoutThreshold: number;
    responseTimeThreshold: number;
    priorityWeighting: number;
    skillMatchWeighting: number;
    collaborationWeighting: number;
}
declare class AdaptiveLoadBalancer {
    private performanceHistory;
    private currentStrategy;
    /**
     * 실시간 워크로드 리밸런싱 메인 함수
     */
    rebalanceInRealTime(currentLoad: TeamLoad[], pendingTasks: TaskWorkload[], strategy?: Partial<LoadBalancingStrategy>): Promise<RebalanceResult>;
    /**
     * 보틀넥 식별 및 분석
     */
    identifyBottlenecks(currentLoad: TeamLoad[], pendingTasks: TaskWorkload[]): Promise<BottleneckAnalysis[]>;
    /**
     * 용량 보틀넥 분석
     */
    private analyzeCapacityBottlenecks;
    /**
     * 스킬 보틀넥 분석
     */
    private analyzeSkillBottlenecks;
    /**
     * 의존성 보틀넥 분석
     */
    private analyzeDependencyBottlenecks;
    /**
     * 협업 보틀넥 분석
     */
    private analyzeCollaborationBottlenecks;
    /**
     * AI 기반 고급 보틀넥 분석
     */
    private performAIBottleneckAnalysis;
    /**
     * 재분배 계획 생성
     */
    createRedistributionPlan(bottlenecks: BottleneckAnalysis[], currentLoad: TeamLoad[], pendingTasks: TaskWorkload[]): Promise<RebalanceAction[]>;
    /**
     * 용량 기반 리밸런스 액션 생성
     */
    private createCapacityRebalanceActions;
    /**
     * 스킬 기반 리밸런스 액션 생성
     */
    private createSkillRebalanceActions;
    /**
     * 의존성 기반 리밸런스 액션 생성
     */
    private createDependencyRebalanceActions;
    /**
     * 협업 기반 리밸런스 액션 생성
     */
    private createCollaborationRebalanceActions;
    /**
     * 성능 기반 리밸런스 액션 생성
     */
    private createPerformanceRebalanceActions;
    /**
     * 액션 계획 최적화
     */
    private optimizeActionPlan;
    /**
     * 리밸런싱 실행
     */
    executeRebalancing(rebalanceId: string, actions: RebalanceAction[], beforeState: TeamLoad[], pendingTasks: TaskWorkload[]): Promise<RebalanceResult>;
    /**
     * 액션 실행 시뮬레이션
     */
    private simulateActionExecution;
    /**
     * 팀 적합성 점수 계산
     */
    private calculateTeamSuitability;
    /**
     * 개선 메트릭 계산
     */
    private calculateImprovementMetrics;
    /**
     * 전체 개선도 계산
     */
    private calculateOverallImprovement;
    /**
     * 성능 히스토리 업데이트
     */
    private updatePerformanceHistory;
    /**
     * 전략 최적화 (학습 기반)
     */
    private optimizeStrategy;
    /**
     * 현재 전략 조회
     */
    getStrategy(): LoadBalancingStrategy;
    /**
     * 성능 히스토리 조회
     */
    getPerformanceHistory(): typeof this.performanceHistory;
    /**
     * 실시간 추천 시스템
     */
    getRealtimeRecommendations(currentLoad: TeamLoad[]): Promise<string[]>;
}
export declare const adaptiveLoadBalancer: AdaptiveLoadBalancer;
export {};
//# sourceMappingURL=adaptiveLoadBalancer.d.ts.map