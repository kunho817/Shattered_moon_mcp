/**
 * 고급 성능 최적화 시스템
 * Amdahl의 법칙 기반 병렬 처리 최적화, 적응형 스케줄링, 실시간 성능 튜닝
 */
export interface PerformanceProfile {
    id: string;
    name: string;
    systemSpecs: SystemSpecification;
    workloadCharacteristics: WorkloadCharacteristics;
    performanceBaseline: PerformanceBaseline;
    optimizationTargets: OptimizationTarget[];
    constraints: PerformanceConstraint[];
    currentMetrics: RealTimeMetrics;
    historicalData: PerformanceHistoryPoint[];
    lastOptimized: number;
}
export interface SystemSpecification {
    cpuCores: number;
    cpuThreads: number;
    memoryGB: number;
    gpuCores?: number;
    storageType: 'ssd' | 'nvme' | 'hdd';
    networkBandwidth: number;
    architecture: 'x64' | 'arm64';
    operatingSystem: string;
    virtualized: boolean;
    cloudProvider?: string;
}
export interface WorkloadCharacteristics {
    taskTypes: WorkloadTaskType[];
    parallelizability: number;
    serialPortion: number;
    memoryIntensity: 'low' | 'medium' | 'high' | 'extreme';
    cpuIntensity: 'low' | 'medium' | 'high' | 'extreme';
    ioPattern: 'sequential' | 'random' | 'mixed';
    dataLocality: number;
    branchPredictability: number;
    synchronizationOverhead: number;
}
export interface WorkloadTaskType {
    name: string;
    frequency: number;
    averageDuration: number;
    complexity: 'constant' | 'linear' | 'quadratic' | 'exponential';
    resourceUsage: {
        cpu: number;
        memory: number;
        io: number;
        network: number;
    };
    dependencies: string[];
    parallelizable: boolean;
    scalingFactor: number;
}
export interface PerformanceBaseline {
    throughput: number;
    latency: number;
    resourceUtilization: {
        cpu: number;
        memory: number;
        io: number;
        network: number;
    };
    errorRate: number;
    availability: number;
    measuredAt: number;
    conditions: string[];
}
export interface OptimizationTarget {
    metric: 'throughput' | 'latency' | 'resource_efficiency' | 'cost' | 'energy' | 'quality';
    targetValue: number;
    priority: number;
    tradeoffs: string[];
    constraints: string[];
    achievable: boolean;
    estimatedImprovement: number;
}
export interface PerformanceConstraint {
    type: 'resource_limit' | 'latency_sla' | 'cost_budget' | 'energy_limit' | 'quality_threshold';
    value: number;
    unit: string;
    hard: boolean;
    penalty: number;
}
export interface RealTimeMetrics {
    timestamp: number;
    throughput: number;
    latency: number;
    resourceUtilization: {
        cpu: number;
        memory: number;
        io: number;
        network: number;
    };
    queueDepth: number;
    activeConnections: number;
    errorRate: number;
    temperature?: number;
    powerConsumption?: number;
}
export interface PerformanceHistoryPoint {
    timestamp: number;
    metrics: RealTimeMetrics;
    configuration: OptimizationConfiguration;
    workload: number;
    events: string[];
}
export interface OptimizationConfiguration {
    parallelismLevel: number;
    batchSize: number;
    cacheSize: number;
    poolSize: number;
    timeout: number;
    priority: number;
    algorithm: string;
    parameters: Record<string, any>;
}
export interface OptimizationStrategy {
    name: string;
    description: string;
    applicableWorkloads: string[];
    algorithm: OptimizationAlgorithm;
    parameters: OptimizationParameter[];
    expectedImprovement: number;
    implementationCost: number;
    riskLevel: 'low' | 'medium' | 'high';
    dependencies: string[];
}
export interface OptimizationAlgorithm {
    type: 'amdahl_optimization' | 'adaptive_scheduling' | 'cache_optimization' | 'load_balancing' | 'resource_pooling' | 'hybrid';
    implementation: string;
    complexity: 'O(1)' | 'O(log n)' | 'O(n)' | 'O(n log n)' | 'O(n²)';
    stability: 'stable' | 'experimental' | 'beta';
    tunableParameters: string[];
}
export interface OptimizationParameter {
    name: string;
    type: 'number' | 'boolean' | 'string' | 'enum';
    defaultValue: any;
    range?: {
        min: number;
        max: number;
    };
    values?: any[];
    description: string;
    impact: 'low' | 'medium' | 'high';
    autoTunable: boolean;
}
export interface OptimizationResult {
    optimizationId: string;
    timestamp: number;
    strategy: OptimizationStrategy;
    configuration: OptimizationConfiguration;
    beforeMetrics: RealTimeMetrics;
    afterMetrics: RealTimeMetrics;
    improvement: {
        throughput: number;
        latency: number;
        resourceEfficiency: number;
        costEfficiency: number;
    };
    amdahlAnalysis: AmdahlAnalysis;
    recommendations: OptimizationRecommendation[];
    success: boolean;
    duration: number;
    notes: string[];
}
export interface AmdahlAnalysis {
    serialPortion: number;
    parallelPortion: number;
    optimalCores: number;
    theoreticalSpeedup: number;
    actualSpeedup: number;
    efficiency: number;
    bottlenecks: string[];
    scalingLimit: number;
    recommendations: string[];
}
export interface OptimizationRecommendation {
    type: 'immediate' | 'short_term' | 'long_term' | 'infrastructure';
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    expectedBenefit: number;
    implementationCost: number;
    timeToImplement: number;
    dependencies: string[];
    riskFactors: string[];
}
declare class AdvancedPerformanceOptimizer {
    private profiles;
    private optimizationStrategies;
    private optimizationHistory;
    private realtimeMonitoring;
    private monitoringInterval;
    constructor();
    /**
     * 메인 성능 최적화 함수
     */
    optimizePerformance(profileId: string, targetMetrics: Partial<OptimizationTarget>[], constraints?: PerformanceConstraint[]): Promise<OptimizationResult>;
    /**
     * Amdahl의 법칙 기반 성능 분석
     */
    private performAmdahlAnalysis;
    /**
     * 최적 코어 수 계산
     */
    private calculateOptimalCores;
    /**
     * 성능 병목 지점 식별
     */
    private identifyPerformanceBottlenecks;
    /**
     * AI 기반 Amdahl 추천 생성
     */
    private generateAmdahlRecommendations;
    /**
     * 최적화 전략 선택
     */
    private selectOptimizationStrategy;
    /**
     * 동적 구성 최적화
     */
    private optimizeConfiguration;
    /**
     * 적응형 스케줄링 적용
     */
    private applyAdaptiveScheduling;
    /**
     * 성능 측정
     */
    private measureCurrentPerformance;
    /**
     * 최적화된 성능 측정
     */
    private measureOptimizedPerformance;
    /**
     * 최적화 결과 분석
     */
    private analyzeOptimizationResult;
    /**
     * 유틸리티 메서드들
     */
    private calculateOptimalBatchSize;
    private calculateOptimalCacheSize;
    private calculateResourceEfficiencyImprovement;
    private calculateCostEfficiencyImprovement;
    private generateOptimizationRecommendations;
    private fineTuneConfiguration;
    private loadOrCreateProfile;
    private detectSystemSpecs;
    private analyzeWorkloadCharacteristics;
    private establishBaseline;
    private initializeStrategies;
    private getDefaultStrategy;
    private generateFallbackAmdahlRecommendations;
    private updateOptimizationHistory;
    /**
     * 실시간 모니터링 시작
     */
    startRealtimeMonitoring(profileId?: string): void;
    /**
     * 실시간 최적화 수행
     */
    private performRealtimeOptimization;
    private detectPerformanceDegradation;
    /**
     * 모니터링 중지
     */
    stopRealtimeMonitoring(): void;
    /**
     * 성능 메트릭 조회
     */
    getPerformanceMetrics(): {
        profileCount: number;
        optimizationHistory: number;
        realtimeMonitoring: boolean;
        strategyCount: number;
        averageImprovement: number;
        successRate: number;
    };
    private calculateAverageImprovement;
    private calculateSuccessRate;
    /**
     * 시스템 초기화
     */
    reset(): void;
}
export declare const advancedPerformanceOptimizer: AdvancedPerformanceOptimizer;
export {};
//# sourceMappingURL=advancedPerformanceOptimizer.d.ts.map