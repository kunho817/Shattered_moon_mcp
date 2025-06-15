"use strict";
/**
 * 고급 성능 최적화 시스템
 * Amdahl의 법칙 기반 병렬 처리 최적화, 적응형 스케줄링, 실시간 성능 튜닝
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.advancedPerformanceOptimizer = void 0;
const enhancedClaudeCodeManager_js_1 = require("./enhancedClaudeCodeManager.js");
const logger_js_1 = __importDefault(require("./logger.js"));
class AdvancedPerformanceOptimizer {
    profiles = new Map();
    optimizationStrategies = new Map();
    optimizationHistory = [];
    realtimeMonitoring = false;
    monitoringInterval = null;
    constructor() {
        this.initializeStrategies();
    }
    /**
     * 메인 성능 최적화 함수
     */
    async optimizePerformance(profileId, targetMetrics, constraints = []) {
        const optimizationId = `perf_opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const startTime = Date.now();
        logger_js_1.default.info('Starting advanced performance optimization', {
            optimizationId,
            profileId,
            targetCount: targetMetrics.length,
            constraintCount: constraints.length
        });
        try {
            // 1. 성능 프로파일 검증 및 로드
            const profile = await this.loadOrCreateProfile(profileId);
            // 2. 현재 성능 베이스라인 측정
            const baselineMetrics = await this.measureCurrentPerformance(profile);
            // 3. Amdahl의 법칙 기반 분석
            const amdahlAnalysis = await this.performAmdahlAnalysis(profile, baselineMetrics);
            // 4. 최적 전략 선택
            const strategy = await this.selectOptimizationStrategy(profile, targetMetrics, constraints, amdahlAnalysis);
            // 5. 동적 구성 최적화
            const configuration = await this.optimizeConfiguration(profile, strategy, amdahlAnalysis);
            // 6. 적응형 스케줄링 적용
            await this.applyAdaptiveScheduling(profile, configuration);
            // 7. 성능 측정 및 검증
            const afterMetrics = await this.measureOptimizedPerformance(profile, configuration);
            // 8. 결과 분석 및 추천 생성
            const result = await this.analyzeOptimizationResult(optimizationId, strategy, configuration, baselineMetrics, afterMetrics, amdahlAnalysis);
            // 9. 이력 업데이트 및 학습
            await this.updateOptimizationHistory(result, profile);
            logger_js_1.default.info('Performance optimization completed', {
                optimizationId,
                success: result.success,
                throughputImprovement: result.improvement.throughput,
                latencyImprovement: result.improvement.latency,
                executionTime: Date.now() - startTime
            });
            return result;
        }
        catch (error) {
            logger_js_1.default.error('Performance optimization failed', {
                optimizationId,
                error: error instanceof Error ? error.message : 'Unknown error',
                executionTime: Date.now() - startTime
            });
            throw error;
        }
    }
    /**
     * Amdahl의 법칙 기반 성능 분석
     */
    async performAmdahlAnalysis(profile, metrics) {
        const workload = profile.workloadCharacteristics;
        // 직렬 부분과 병렬 부분 식별
        const serialPortion = workload.serialPortion;
        const parallelPortion = 1 - serialPortion;
        // 시스템 스펙 기반 최적 코어 수 계산
        const availableCores = profile.systemSpecs.cpuThreads;
        // 이론적 최대 속도 향상 (Amdahl's law)
        const theoreticalSpeedup = 1 / (serialPortion + (parallelPortion / availableCores));
        // 현재 실제 활용도 기반 실제 속도 향상
        const currentUtilization = metrics.resourceUtilization.cpu;
        const actualSpeedup = currentUtilization * theoreticalSpeedup;
        // 효율성 계산
        const efficiency = actualSpeedup / theoreticalSpeedup;
        // 최적 코어 수 계산 (수익 감소점)
        const optimalCores = await this.calculateOptimalCores(serialPortion, parallelPortion, workload);
        // 확장성 한계 계산
        const scalingLimit = Math.ceil(1 / serialPortion);
        // 병목 지점 식별
        const bottlenecks = await this.identifyPerformanceBottlenecks(profile, metrics, serialPortion);
        // AI 기반 추천 생성
        const recommendations = await this.generateAmdahlRecommendations(serialPortion, parallelPortion, optimalCores, bottlenecks);
        return {
            serialPortion,
            parallelPortion,
            optimalCores,
            theoreticalSpeedup,
            actualSpeedup,
            efficiency,
            bottlenecks,
            scalingLimit,
            recommendations
        };
    }
    /**
     * 최적 코어 수 계산
     */
    async calculateOptimalCores(serialPortion, parallelPortion, workload) {
        // 비용-효과 분석을 통한 최적 코어 수
        let maxEfficiency = 0;
        let optimalCores = 1;
        for (let cores = 1; cores <= 64; cores++) {
            const speedup = 1 / (serialPortion + (parallelPortion / cores));
            const efficiency = speedup / cores;
            // 동기화 오버헤드 고려
            const syncOverhead = workload.synchronizationOverhead * (cores - 1);
            const adjustedEfficiency = efficiency * (1 - syncOverhead);
            if (adjustedEfficiency > maxEfficiency) {
                maxEfficiency = adjustedEfficiency;
                optimalCores = cores;
            }
        }
        return optimalCores;
    }
    /**
     * 성능 병목 지점 식별
     */
    async identifyPerformanceBottlenecks(profile, metrics, serialPortion) {
        const bottlenecks = [];
        // CPU 병목
        if (metrics.resourceUtilization.cpu > 0.9) {
            bottlenecks.push('CPU utilization near maximum');
        }
        // 메모리 병목
        if (metrics.resourceUtilization.memory > 0.85) {
            bottlenecks.push('Memory pressure detected');
        }
        // I/O 병목
        if (metrics.resourceUtilization.io > 0.8) {
            bottlenecks.push('I/O subsystem saturated');
        }
        // 직렬 부분이 큰 경우
        if (serialPortion > 0.2) {
            bottlenecks.push(`High serial portion (${Math.round(serialPortion * 100)}%) limits parallelization`);
        }
        // 큐 깊이가 깊은 경우
        if (metrics.queueDepth > 100) {
            bottlenecks.push('Deep task queue indicates processing bottleneck');
        }
        // 높은 지연시간
        if (metrics.latency > profile.performanceBaseline.latency * 2) {
            bottlenecks.push('Latency significantly above baseline');
        }
        return bottlenecks;
    }
    /**
     * AI 기반 Amdahl 추천 생성
     */
    async generateAmdahlRecommendations(serialPortion, parallelPortion, optimalCores, bottlenecks) {
        const prompt = `
Generate performance optimization recommendations based on Amdahl's law analysis:

**Amdahl Analysis**:
- Serial Portion: ${Math.round(serialPortion * 100)}%
- Parallel Portion: ${Math.round(parallelPortion * 100)}%
- Optimal Cores: ${optimalCores}
- Identified Bottlenecks: ${bottlenecks.join(', ')}

Provide specific, actionable recommendations to:
1. Reduce the serial portion
2. Improve parallel efficiency
3. Address identified bottlenecks
4. Optimize resource utilization
5. Enhance scalability

Focus on practical optimizations that can be implemented immediately.

Return as JSON array of strings:
["recommendation1", "recommendation2", "recommendation3"]
`;
        try {
            const result = await enhancedClaudeCodeManager_js_1.enhancedClaudeCodeManager.performEnhancedAnalysis(prompt, { taskId: 'task', timestamp: new Date() }, { timeout: 30000, priority: 'medium' });
            return JSON.parse(result.response);
        }
        catch (error) {
            logger_js_1.default.warn('AI Amdahl recommendations failed, using fallback', { error });
            return this.generateFallbackAmdahlRecommendations(serialPortion, optimalCores, bottlenecks);
        }
    }
    /**
     * 최적화 전략 선택
     */
    async selectOptimizationStrategy(profile, targetMetrics, constraints, amdahlAnalysis) {
        const prompt = `
Select the optimal performance optimization strategy:

**System Profile**:
- CPU Cores: ${profile.systemSpecs.cpuCores} cores, ${profile.systemSpecs.cpuThreads} threads
- Memory: ${profile.systemSpecs.memoryGB} GB
- Workload Parallelizability: ${Math.round(amdahlAnalysis.parallelPortion * 100)}%
- Current Efficiency: ${Math.round(amdahlAnalysis.efficiency * 100)}%

**Target Metrics**:
${targetMetrics.map(target => `- ${target.metric}: ${target.targetValue} (priority: ${target.priority})`).join('\n')}

**Constraints**:
${constraints.map(constraint => `- ${constraint.type}: ${constraint.value} ${constraint.unit} (${constraint.hard ? 'hard' : 'soft'})`).join('\n')}

**Bottlenecks**:
${amdahlAnalysis.bottlenecks.map(b => `- ${b}`).join('\n')}

Available strategies:
1. amdahl_optimization - Focus on reducing serial portions
2. adaptive_scheduling - Dynamic task scheduling
3. cache_optimization - Memory access optimization
4. load_balancing - Distribute workload evenly
5. resource_pooling - Efficient resource management
6. hybrid - Combine multiple approaches

Recommend the best strategy considering the specific bottlenecks and constraints.

Return as JSON:
{
  "strategy": "amdahl_optimization",
  "reasoning": "Why this strategy is optimal",
  "expectedImprovement": 0.35,
  "riskLevel": "medium",
  "implementationComplexity": "high"
}
`;
        try {
            const result = await enhancedClaudeCodeManager_js_1.enhancedClaudeCodeManager.performEnhancedAnalysis(prompt, { taskId: 'task', timestamp: new Date() }, { timeout: 45000, priority: 'high' });
            const recommendation = JSON.parse(result.response);
            const strategy = this.optimizationStrategies.get(recommendation.strategy);
            if (strategy) {
                return strategy;
            }
        }
        catch (error) {
            logger_js_1.default.warn('AI strategy selection failed, using default', { error });
        }
        // 폴백: Amdahl 기반 전략
        return this.optimizationStrategies.get('amdahl_optimization') || this.getDefaultStrategy();
    }
    /**
     * 동적 구성 최적화
     */
    async optimizeConfiguration(profile, strategy, amdahlAnalysis) {
        const baseConfig = {
            parallelismLevel: Math.min(amdahlAnalysis.optimalCores, profile.systemSpecs.cpuThreads),
            batchSize: this.calculateOptimalBatchSize(profile.workloadCharacteristics),
            cacheSize: this.calculateOptimalCacheSize(profile.systemSpecs.memoryGB),
            poolSize: Math.ceil(amdahlAnalysis.optimalCores * 1.5),
            timeout: 30000,
            priority: 5,
            algorithm: strategy.algorithm.type,
            parameters: {}
        };
        // 전략별 파라미터 조정
        switch (strategy.algorithm.type) {
            case 'amdahl_optimization':
                baseConfig.parallelismLevel = amdahlAnalysis.optimalCores;
                baseConfig.parameters = {
                    serialOptimization: true,
                    parallelEfficiency: amdahlAnalysis.efficiency,
                    bottleneckMitigation: amdahlAnalysis.bottlenecks.length > 0
                };
                break;
            case 'adaptive_scheduling':
                baseConfig.parameters = {
                    adaptationInterval: 5000,
                    loadThreshold: 0.8,
                    responseTimeTarget: profile.performanceBaseline.latency * 0.8
                };
                break;
            case 'cache_optimization':
                baseConfig.cacheSize = Math.floor(profile.systemSpecs.memoryGB * 1024 * 0.3); // 30% of memory
                baseConfig.parameters = {
                    cacheStrategy: profile.workloadCharacteristics.dataLocality > 0.7 ? 'lru' : 'lfu',
                    prefetchEnabled: true,
                    compressionEnabled: profile.workloadCharacteristics.memoryIntensity === 'high'
                };
                break;
        }
        // AI 기반 미세 조정
        return await this.fineTuneConfiguration(baseConfig, profile, amdahlAnalysis);
    }
    /**
     * 적응형 스케줄링 적용
     */
    async applyAdaptiveScheduling(profile, configuration) {
        logger_js_1.default.info('Applying adaptive scheduling', {
            profileId: profile.id,
            parallelismLevel: configuration.parallelismLevel,
            algorithm: configuration.algorithm
        });
        // 실제 구현에서는 여기서 시스템 설정을 적용
        // 예: 스레드 풀 크기 조정, 스케줄러 파라미터 변경 등
        // 시뮬레이션을 위한 설정 적용
        profile.currentMetrics = {
            ...profile.currentMetrics,
            timestamp: Date.now()
        };
    }
    /**
     * 성능 측정
     */
    async measureCurrentPerformance(profile) {
        // 실제 구현에서는 시스템 메트릭을 실제로 측정
        // 여기서는 시뮬레이션 데이터 반환
        return {
            timestamp: Date.now(),
            throughput: profile.performanceBaseline.throughput * (0.8 + Math.random() * 0.4),
            latency: profile.performanceBaseline.latency * (0.9 + Math.random() * 0.2),
            resourceUtilization: {
                cpu: 0.6 + Math.random() * 0.3,
                memory: 0.5 + Math.random() * 0.3,
                io: 0.4 + Math.random() * 0.3,
                network: 0.3 + Math.random() * 0.2
            },
            queueDepth: Math.floor(Math.random() * 50),
            activeConnections: Math.floor(Math.random() * 100),
            errorRate: Math.random() * 0.01
        };
    }
    /**
     * 최적화된 성능 측정
     */
    async measureOptimizedPerformance(profile, configuration) {
        // 최적화 효과를 시뮬레이션
        const baseMetrics = await this.measureCurrentPerformance(profile);
        // 병렬화 효과 적용
        const parallelEfficiency = Math.min(1.0, configuration.parallelismLevel / profile.systemSpecs.cpuThreads);
        const throughputImprovement = 1 + (parallelEfficiency * 0.3);
        const latencyImprovement = 1 - (parallelEfficiency * 0.2);
        return {
            ...baseMetrics,
            timestamp: Date.now(),
            throughput: baseMetrics.throughput * throughputImprovement,
            latency: baseMetrics.latency * latencyImprovement,
            resourceUtilization: {
                cpu: Math.min(0.95, baseMetrics.resourceUtilization.cpu * 1.1),
                memory: Math.max(0.3, baseMetrics.resourceUtilization.memory * 0.9),
                io: Math.max(0.2, baseMetrics.resourceUtilization.io * 0.85),
                network: baseMetrics.resourceUtilization.network
            }
        };
    }
    /**
     * 최적화 결과 분석
     */
    async analyzeOptimizationResult(optimizationId, strategy, configuration, beforeMetrics, afterMetrics, amdahlAnalysis) {
        const improvement = {
            throughput: ((afterMetrics.throughput - beforeMetrics.throughput) / beforeMetrics.throughput) * 100,
            latency: ((beforeMetrics.latency - afterMetrics.latency) / beforeMetrics.latency) * 100,
            resourceEfficiency: this.calculateResourceEfficiencyImprovement(beforeMetrics, afterMetrics),
            costEfficiency: this.calculateCostEfficiencyImprovement(beforeMetrics, afterMetrics)
        };
        const success = improvement.throughput > 0 || improvement.latency > 0;
        const recommendations = await this.generateOptimizationRecommendations(improvement, amdahlAnalysis, strategy);
        return {
            optimizationId,
            timestamp: Date.now(),
            strategy,
            configuration,
            beforeMetrics,
            afterMetrics,
            improvement,
            amdahlAnalysis,
            recommendations,
            success,
            duration: afterMetrics.timestamp - beforeMetrics.timestamp,
            notes: [
                success ? 'Optimization successful' : 'Optimization had limited impact',
                `Throughput improved by ${improvement.throughput.toFixed(2)}%`,
                `Latency improved by ${improvement.latency.toFixed(2)}%`
            ]
        };
    }
    /**
     * 유틸리티 메서드들
     */
    calculateOptimalBatchSize(workload) {
        // 작업 특성에 따른 최적 배치 크기 계산
        const baseSize = 32;
        const complexityMultiplier = workload.taskTypes.length > 5 ? 0.8 : 1.0;
        const memoryMultiplier = workload.memoryIntensity === 'high' ? 0.6 : 1.0;
        return Math.max(8, Math.floor(baseSize * complexityMultiplier * memoryMultiplier));
    }
    calculateOptimalCacheSize(memoryGB) {
        // 메모리 크기에 따른 최적 캐시 크기 (MB)
        return Math.floor(memoryGB * 1024 * 0.25); // 25% of total memory
    }
    calculateResourceEfficiencyImprovement(before, after) {
        const beforeEfficiency = (before.throughput / 100) /
            (before.resourceUtilization.cpu + before.resourceUtilization.memory);
        const afterEfficiency = (after.throughput / 100) /
            (after.resourceUtilization.cpu + after.resourceUtilization.memory);
        return ((afterEfficiency - beforeEfficiency) / beforeEfficiency) * 100;
    }
    calculateCostEfficiencyImprovement(before, after) {
        // 비용 효율성 = 처리량 / 리소스 사용량
        const beforeCost = before.resourceUtilization.cpu * 0.5 + before.resourceUtilization.memory * 0.3;
        const afterCost = after.resourceUtilization.cpu * 0.5 + after.resourceUtilization.memory * 0.3;
        const beforeCostEfficiency = before.throughput / beforeCost;
        const afterCostEfficiency = after.throughput / afterCost;
        return ((afterCostEfficiency - beforeCostEfficiency) / beforeCostEfficiency) * 100;
    }
    async generateOptimizationRecommendations(improvement, amdahlAnalysis, strategy) {
        const recommendations = [];
        // 즉시 실행 가능한 추천
        if (improvement.throughput < 10) {
            recommendations.push({
                type: 'immediate',
                priority: 'high',
                description: 'Consider increasing parallelism level or optimizing serial portions',
                expectedBenefit: 0.2,
                implementationCost: 0.3,
                timeToImplement: 2,
                dependencies: [],
                riskFactors: ['May increase resource usage']
            });
        }
        // 장기 추천
        if (amdahlAnalysis.serialPortion > 0.3) {
            recommendations.push({
                type: 'long_term',
                priority: 'medium',
                description: 'Refactor code to reduce serial dependencies',
                expectedBenefit: 0.4,
                implementationCost: 0.7,
                timeToImplement: 40,
                dependencies: ['Code analysis', 'Architecture review'],
                riskFactors: ['Requires significant code changes']
            });
        }
        return recommendations;
    }
    async fineTuneConfiguration(baseConfig, profile, amdahlAnalysis) {
        // AI 기반 미세 조정 로직
        const prompt = `
Fine-tune this performance configuration:

**Base Configuration**:
- Parallelism Level: ${baseConfig.parallelismLevel}
- Batch Size: ${baseConfig.batchSize}
- Cache Size: ${baseConfig.cacheSize} MB
- Pool Size: ${baseConfig.poolSize}

**System Context**:
- CPU Threads: ${profile.systemSpecs.cpuThreads}
- Memory: ${profile.systemSpecs.memoryGB} GB
- Serial Portion: ${Math.round(amdahlAnalysis.serialPortion * 100)}%
- Efficiency: ${Math.round(amdahlAnalysis.efficiency * 100)}%

Suggest adjustments to optimize for the specific workload characteristics.

Return as JSON:
{
  "parallelismLevel": 8,
  "batchSize": 32,
  "cacheSize": 1024,
  "poolSize": 12,
  "reasoning": "Why these adjustments improve performance"
}
`;
        try {
            const result = await enhancedClaudeCodeManager_js_1.enhancedClaudeCodeManager.performEnhancedAnalysis(prompt, 'sonnet', { timeout: 20000, priority: 'low' });
            const tuning = JSON.parse(result.response);
            return {
                ...baseConfig,
                parallelismLevel: tuning.parallelismLevel || baseConfig.parallelismLevel,
                batchSize: tuning.batchSize || baseConfig.batchSize,
                cacheSize: tuning.cacheSize || baseConfig.cacheSize,
                poolSize: tuning.poolSize || baseConfig.poolSize,
                parameters: {
                    ...baseConfig.parameters,
                    tuningReasoning: tuning.reasoning
                }
            };
        }
        catch (error) {
            logger_js_1.default.warn('Configuration fine-tuning failed, using base config', { error });
            return baseConfig;
        }
    }
    async loadOrCreateProfile(profileId) {
        if (this.profiles.has(profileId)) {
            return this.profiles.get(profileId);
        }
        // 새 프로파일 생성
        const profile = {
            id: profileId,
            name: `Performance Profile ${profileId}`,
            systemSpecs: this.detectSystemSpecs(),
            workloadCharacteristics: this.analyzeWorkloadCharacteristics(),
            performanceBaseline: await this.establishBaseline(),
            optimizationTargets: [],
            constraints: [],
            currentMetrics: await this.measureCurrentPerformance({}),
            historicalData: [],
            lastOptimized: 0
        };
        this.profiles.set(profileId, profile);
        return profile;
    }
    detectSystemSpecs() {
        // 실제 구현에서는 시스템 정보를 실제로 감지
        return {
            cpuCores: 8,
            cpuThreads: 16,
            memoryGB: 32,
            storageType: 'nvme',
            networkBandwidth: 1000,
            architecture: 'x64',
            operatingSystem: 'Linux',
            virtualized: false
        };
    }
    analyzeWorkloadCharacteristics() {
        // 워크로드 특성 분석 (실제로는 런타임 분석)
        return {
            taskTypes: [
                {
                    name: 'data_processing',
                    frequency: 100,
                    averageDuration: 5,
                    complexity: 'linear',
                    resourceUsage: { cpu: 0.7, memory: 512, io: 50, network: 10 },
                    dependencies: [],
                    parallelizable: true,
                    scalingFactor: 0.8
                }
            ],
            parallelizability: 0.7,
            serialPortion: 0.3,
            memoryIntensity: 'medium',
            cpuIntensity: 'high',
            ioPattern: 'mixed',
            dataLocality: 0.6,
            branchPredictability: 0.8,
            synchronizationOverhead: 0.1
        };
    }
    async establishBaseline() {
        return {
            throughput: 1000,
            latency: 50,
            resourceUtilization: {
                cpu: 0.6,
                memory: 0.5,
                io: 0.4,
                network: 0.3
            },
            errorRate: 0.001,
            availability: 0.999,
            measuredAt: Date.now(),
            conditions: ['Normal load', 'Standard configuration']
        };
    }
    initializeStrategies() {
        // Amdahl 최적화 전략
        this.optimizationStrategies.set('amdahl_optimization', {
            name: 'Amdahl Law Optimization',
            description: 'Optimize based on Amdahl\'s law to maximize parallel efficiency',
            applicableWorkloads: ['cpu_intensive', 'parallel_processing'],
            algorithm: {
                type: 'amdahl_optimization',
                implementation: 'parallel_optimization',
                complexity: 'O(n log n)',
                stability: 'stable',
                tunableParameters: ['parallelism_level', 'serial_optimization']
            },
            parameters: [
                {
                    name: 'parallelism_level',
                    type: 'number',
                    defaultValue: 8,
                    range: { min: 1, max: 64 },
                    description: 'Number of parallel execution units',
                    impact: 'high',
                    autoTunable: true
                }
            ],
            expectedImprovement: 0.4,
            implementationCost: 0.6,
            riskLevel: 'medium',
            dependencies: []
        });
        // 적응형 스케줄링 전략
        this.optimizationStrategies.set('adaptive_scheduling', {
            name: 'Adaptive Scheduling',
            description: 'Dynamic task scheduling based on real-time conditions',
            applicableWorkloads: ['variable_load', 'mixed_workload'],
            algorithm: {
                type: 'adaptive_scheduling',
                implementation: 'dynamic_scheduler',
                complexity: 'O(log n)',
                stability: 'stable',
                tunableParameters: ['adaptation_interval', 'load_threshold']
            },
            parameters: [],
            expectedImprovement: 0.3,
            implementationCost: 0.4,
            riskLevel: 'low',
            dependencies: []
        });
    }
    getDefaultStrategy() {
        return this.optimizationStrategies.get('amdahl_optimization');
    }
    generateFallbackAmdahlRecommendations(serialPortion, optimalCores, bottlenecks) {
        const recommendations = [];
        if (serialPortion > 0.5) {
            recommendations.push('High serial portion detected - consider code refactoring to increase parallelizability');
        }
        if (optimalCores < 4) {
            recommendations.push('Limited parallelization potential - focus on serial optimization');
        }
        else {
            recommendations.push(`Increase parallelism to ${optimalCores} cores for optimal performance`);
        }
        if (bottlenecks.length > 0) {
            recommendations.push('Address identified bottlenecks to improve overall system performance');
        }
        return recommendations;
    }
    async updateOptimizationHistory(result, profile) {
        this.optimizationHistory.push(result);
        // 히스토리 업데이트
        profile.historicalData.push({
            timestamp: result.timestamp,
            metrics: result.afterMetrics,
            configuration: result.configuration,
            workload: 1.0,
            events: ['optimization_applied']
        });
        profile.lastOptimized = result.timestamp;
        // 최근 100개 기록만 유지
        if (this.optimizationHistory.length > 100) {
            this.optimizationHistory = this.optimizationHistory.slice(-100);
        }
        if (profile.historicalData.length > 100) {
            profile.historicalData = profile.historicalData.slice(-100);
        }
    }
    /**
     * 실시간 모니터링 시작
     */
    startRealtimeMonitoring(profileId) {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        this.realtimeMonitoring = true;
        this.monitoringInterval = setInterval(async () => {
            try {
                await this.performRealtimeOptimization(profileId);
            }
            catch (error) {
                logger_js_1.default.error('Realtime optimization check failed', { error });
            }
        }, 60000); // 1분마다 체크
        logger_js_1.default.info('Real-time performance monitoring started', { profileId });
    }
    /**
     * 실시간 최적화 수행
     */
    async performRealtimeOptimization(profileId) {
        const profilesToCheck = profileId ?
            [this.profiles.get(profileId)].filter(Boolean) :
            Array.from(this.profiles.values());
        for (const profile of profilesToCheck) {
            const currentMetrics = await this.measureCurrentPerformance(profile);
            // 성능 저하 감지
            const performanceDegradation = this.detectPerformanceDegradation(profile, currentMetrics);
            if (performanceDegradation > 0.2) { // 20% 이상 성능 저하
                logger_js_1.default.warn('Performance degradation detected, triggering optimization', {
                    profileId: profile.id,
                    degradation: Math.round(performanceDegradation * 100)
                });
                // 자동 최적화 실행
                await this.optimizePerformance(profile.id, [], []);
            }
        }
    }
    detectPerformanceDegradation(profile, currentMetrics) {
        const baseline = profile.performanceBaseline;
        const throughputRatio = currentMetrics.throughput / baseline.throughput;
        const latencyRatio = currentMetrics.latency / baseline.latency;
        // 성능 저하 계산 (처리량 감소 + 지연시간 증가)
        const degradation = Math.max(0, (1 - throughputRatio) + (latencyRatio - 1));
        return Math.min(1, degradation / 2); // 정규화
    }
    /**
     * 모니터링 중지
     */
    stopRealtimeMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        this.realtimeMonitoring = false;
        logger_js_1.default.info('Real-time performance monitoring stopped');
    }
    /**
     * 성능 메트릭 조회
     */
    getPerformanceMetrics() {
        return {
            profileCount: this.profiles.size,
            optimizationHistory: this.optimizationHistory.length,
            realtimeMonitoring: this.realtimeMonitoring,
            strategyCount: this.optimizationStrategies.size,
            averageImprovement: this.calculateAverageImprovement(),
            successRate: this.calculateSuccessRate()
        };
    }
    calculateAverageImprovement() {
        if (this.optimizationHistory.length === 0)
            return 0;
        const totalImprovement = this.optimizationHistory.reduce((sum, result) => sum + result.improvement.throughput, 0);
        return totalImprovement / this.optimizationHistory.length;
    }
    calculateSuccessRate() {
        if (this.optimizationHistory.length === 0)
            return 0;
        const successCount = this.optimizationHistory.filter(result => result.success).length;
        return successCount / this.optimizationHistory.length;
    }
    /**
     * 시스템 초기화
     */
    reset() {
        this.profiles.clear();
        this.optimizationHistory = [];
        this.stopRealtimeMonitoring();
        logger_js_1.default.info('Advanced performance optimizer reset');
    }
}
exports.advancedPerformanceOptimizer = new AdvancedPerformanceOptimizer();
//# sourceMappingURL=advancedPerformanceOptimizer.js.map