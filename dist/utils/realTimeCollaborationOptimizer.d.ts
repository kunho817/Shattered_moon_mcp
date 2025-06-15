/**
 * 실시간 협업 최적화 시스템
 * 진행 중인 팀 간 상호작용을 실시간으로 모니터링하고 최적화
 */
import { TeamComposition, ComplexTask } from './intelligentTeamMatcher.js';
export interface ActiveTeam {
    id: string;
    composition: TeamComposition;
    currentTasks: string[];
    startTime: number;
    status: 'forming' | 'norming' | 'performing' | 'adjourning' | 'blocked' | 'conflict';
    phase: 'planning' | 'execution' | 'review' | 'delivery';
    progress: number;
    velocity: number;
    blockers: string[];
    dependencies: string[];
    communicationMetrics: CommunicationMetrics;
    performanceMetrics: RealTimePerformanceMetrics;
    collaborationHealth: CollaborationHealth;
    lastActivity: number;
}
export interface CommunicationMetrics {
    messageCount: number;
    responseTime: number;
    meetingFrequency: number;
    informalInteractions: number;
    documentationQuality: number;
    knowledgeTransferRate: number;
    conflictIncidents: number;
    resolutionTime: number;
    crossTeamInteractions: number;
    stakeholderEngagement: number;
}
export interface RealTimePerformanceMetrics {
    tasksCompleted: number;
    tasksInProgress: number;
    tasksPending: number;
    averageTaskDuration: number;
    qualityScore: number;
    defectRate: number;
    reworkRate: number;
    innovationIndex: number;
    resourceUtilization: number;
    burndownVelocity: number;
}
export interface CollaborationHealth {
    teamMorale: number;
    trustLevel: number;
    psychologicalSafety: number;
    inclusiveness: number;
    autonomy: number;
    mastery: number;
    purpose: number;
    stressLevel: number;
    burnoutRisk: number;
    satisfactionScore: number;
}
export interface CommunicationData {
    teamId: string;
    timestamp: number;
    type: 'message' | 'meeting' | 'document' | 'code_review' | 'decision' | 'conflict';
    participants: string[];
    content?: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    effectiveness: number;
    outcome: 'resolved' | 'pending' | 'escalated' | 'blocked';
    topics: string[];
    sentimentScore: number;
}
export interface OptimizationRecommendations {
    immediate: ImmediateAction[];
    shortTerm: ShortTermStrategy[];
    longTerm: LongTermStrategy[];
    preventive: PreventiveAction[];
    emergency: EmergencyAction[];
}
export interface ImmediateAction {
    type: 'communication' | 'workflow' | 'resource' | 'conflict_resolution' | 'process';
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    targetTeams: string[];
    estimatedImpact: number;
    implementationTime: number;
    resources: string[];
    successMetrics: string[];
    rollbackPlan: string[];
}
export interface ShortTermStrategy {
    goal: string;
    timeframe: number;
    actions: string[];
    milestones: string[];
    successCriteria: string[];
    riskMitigation: string[];
}
export interface LongTermStrategy {
    vision: string;
    timeframe: number;
    phases: Array<{
        name: string;
        duration: number;
        objectives: string[];
        deliverables: string[];
    }>;
    resourcePlanning: string[];
    skillDevelopment: string[];
}
export interface PreventiveAction {
    riskType: 'communication' | 'performance' | 'collaboration' | 'technical' | 'process';
    likelihood: number;
    impact: number;
    preventionStrategy: string;
    earlyWarningSignals: string[];
    responseProtocol: string[];
}
export interface EmergencyAction {
    trigger: string;
    severity: 'medium' | 'high' | 'critical';
    immediateResponse: string[];
    escalationPath: string[];
    communicationPlan: string[];
    recoveryStrategy: string[];
}
declare class RealTimeCollaborationOptimizer {
    private activeTeams;
    private communicationLog;
    private optimizationHistory;
    private monitoringInterval;
    private isMonitoring;
    /**
     * 실시간 팀 협업 최적화 메인 함수
     */
    optimizeTeamInteractions(teams: ActiveTeam[], currentTasks: ComplexTask[], communicationPatterns: CommunicationData[]): Promise<OptimizationRecommendations>;
    /**
     * 팀 상태 업데이트
     */
    private updateTeamStates;
    /**
     * 협업 패턴 분석
     */
    private analyzeCollaborationPatterns;
    /**
     * 협업 건강성 평가
     */
    private assessCollaborationHealth;
    /**
     * 협업 병목 지점 식별
     */
    private identifyCollaborationBottlenecks;
    /**
     * 최적화 추천 생성
     */
    private generateOptimizationRecommendations;
    /**
     * 실시간 피드백 루프 구축
     */
    private establishFeedbackLoop;
    /**
     * 예측 모델 업데이트
     */
    private updatePredictiveModels;
    /**
     * 실시간 모니터링 시작
     */
    private startRealtimeMonitoring;
    /**
     * 실시간 체크 수행
     */
    private performRealtimeCheck;
    /**
     * 유틸리티 메서드들
     */
    private calculateTeamVelocity;
    private calculateTeamProgress;
    private calculateCollaborationHealth;
    private calculateAverage;
    private calculateHealthGrade;
    private identifyHealthRiskFactors;
    private identifyImprovementAreas;
    private identifyCommunicationBottlenecks;
    private identifyDecisionBottlenecks;
    private identifyKnowledgeBottlenecks;
    private identifyProcessBottlenecks;
    private identifyTechnicalBottlenecks;
    private validateAndEnhanceRecommendations;
    private generateFallbackRecommendations;
    private generateFallbackPatternAnalysis;
    private countRecommendations;
    private implementImmediateAction;
    private setupFeedbackCollection;
    private aggregateCommunicationMetrics;
    private calculateRecommendationEffectiveness;
    private handleEmergencyTeams;
    private handleUnderperformingTeams;
    private captureBestPractices;
    private initiateConflictResolution;
    private initiateBurnoutPrevention;
    /**
     * 모니터링 중지
     */
    stopRealtimeMonitoring(): void;
    /**
     * 성능 메트릭 조회
     */
    getPerformanceMetrics(): {
        activeTeams: number;
        optimizationHistory: number;
        isMonitoring: boolean;
        averageOptimizationTime: number;
        successRate: number;
    };
    private calculateAverageOptimizationTime;
    private calculateOptimizationSuccessRate;
    /**
     * 데이터 초기화
     */
    reset(): void;
}
export declare const realTimeCollaborationOptimizer: RealTimeCollaborationOptimizer;
export {};
//# sourceMappingURL=realTimeCollaborationOptimizer.d.ts.map