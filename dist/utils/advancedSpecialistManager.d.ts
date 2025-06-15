/**
 * 고급 전문가 관리 시스템
 * 동적 전문가 생성, 스킬 조합 최적화, 적응형 전문화 구현
 */
import { TeamMember } from './intelligentTeamMatcher.js';
export interface DynamicSpecialist {
    id: string;
    name: string;
    baseSpecialty: string;
    customizations: SpecialistCustomization[];
    skillProfile: AdvancedSkillProfile;
    contextAdaptations: ContextAdaptation[];
    performanceHistory: PerformanceRecord[];
    learningPath: LearningPath;
    collaborationNetwork: CollaborationNetwork;
    availability: AvailabilityProfile;
    costProfile: CostProfile;
    generatedAt: number;
    lastUpdated: number;
    version: string;
}
export interface SpecialistCustomization {
    type: 'skill_enhancement' | 'domain_specialization' | 'tool_proficiency' | 'methodology_focus' | 'hybrid_capability';
    name: string;
    description: string;
    skillModifiers: Record<string, number>;
    contextTriggers: string[];
    effectivenessMeasure: number;
    energyCost: number;
    learningCurve: number;
}
export interface AdvancedSkillProfile {
    coreSkills: Record<string, SkillLevel>;
    emergingSkills: Record<string, SkillLevel>;
    crossDomainSkills: Record<string, SkillLevel>;
    metaSkills: Record<string, SkillLevel>;
    skillSynergies: SkillSynergy[];
    weaknesses: string[];
    growthPotential: Record<string, number>;
    specializations: string[];
}
export interface SkillLevel {
    proficiency: number;
    experience: number;
    lastUsed: number;
    growthRate: number;
    confidence: number;
    teachingAbility: number;
}
export interface SkillSynergy {
    skills: string[];
    multiplier: number;
    conditions: string[];
    discoveredAt: number;
}
export interface ContextAdaptation {
    contextType: string;
    adaptationStrategy: string;
    skillAdjustments: Record<string, number>;
    performanceModifier: number;
    learnings: string[];
    successRate: number;
    averageAdaptationTime: number;
}
export interface PerformanceRecord {
    taskId: string;
    taskType: string;
    startTime: number;
    endTime: number;
    quality: number;
    efficiency: number;
    innovation: number;
    collaboration: number;
    learningGains: Record<string, number>;
    feedback: string[];
    contextFactors: string[];
}
export interface LearningPath {
    currentFocus: string[];
    plannedSkills: string[];
    learningGoals: LearningGoal[];
    mentorships: Mentorship[];
    autoLearningEnabled: boolean;
    learningVelocity: number;
    curiosityIndex: number;
}
export interface LearningGoal {
    skill: string;
    targetProficiency: number;
    deadline: number;
    strategy: string;
    progress: number;
    obstacles: string[];
}
export interface Mentorship {
    mentorId: string;
    menteeId: string;
    skills: string[];
    relationship: 'formal' | 'informal' | 'peer';
    effectiveness: number;
    startDate: number;
}
export interface CollaborationNetwork {
    preferredPartners: string[];
    conflictualPartners: string[];
    mentoring: string[];
    learningFrom: string[];
    networkStrength: number;
    trustNetwork: Record<string, number>;
    communicationPreferences: Record<string, string>;
    crossTeamConnections: string[];
}
export interface AvailabilityProfile {
    totalCapacity: number;
    currentUtilization: number;
    scheduleFlexibility: number;
    timezoneCompatibility: string[];
    preferredWorkingHours: {
        start: number;
        end: number;
    };
    workStylePreferences: string[];
    availabilityPatterns: Record<string, number>;
}
export interface CostProfile {
    hourlyRate: number;
    skillPremiums: Record<string, number>;
    complexityMultipliers: Record<string, number>;
    urgencyMultipliers: Record<string, number>;
    bulkDiscounts: Record<string, number>;
    specializations: Record<string, number>;
}
export interface SpecialistRequest {
    requiredSkills: string[];
    preferredSpecializations: string[];
    taskComplexity: 'low' | 'medium' | 'high' | 'critical';
    urgency: 'low' | 'medium' | 'high' | 'critical';
    duration: number;
    budget?: number;
    context: string;
    collaborationRequirements: string[];
    learningOpportunities: string[];
    customRequirements?: Record<string, any>;
}
export interface SpecialistRecommendation {
    specialists: DynamicSpecialist[];
    reasoning: string;
    confidenceScore: number;
    alternativeOptions: DynamicSpecialist[];
    skillGaps: string[];
    estimatedCost: number;
    estimatedTimeline: number;
    riskFactors: string[];
    successProbability: number;
    learningOpportunities: string[];
    networkEffects: string[];
}
declare class AdvancedSpecialistManager {
    private specialistRegistry;
    private skillDatabase;
    private performanceCache;
    private learningAnalytics;
    private generationCount;
    private lastOptimization;
    /**
     * 메인 전문가 생성 및 추천 함수
     */
    generateOptimalSpecialists(request: SpecialistRequest, existingTeam?: TeamMember[]): Promise<SpecialistRecommendation>;
    /**
     * 요청 분석 및 최적화
     */
    private analyzeAndOptimizeRequest;
    /**
     * 기존 전문가 매칭
     */
    private findExistingMatches;
    /**
     * 새로운 전문가 동적 생성
     */
    private generateNewSpecialists;
    /**
     * 동적 전문가 생성
     */
    private createDynamicSpecialist;
    /**
     * AI 데이터로부터 전문가 객체 구축
     */
    private buildSpecialistFromAIData;
    /**
     * 하이브리드 전문가 생성
     */
    private createHybridSpecialist;
    /**
     * 전문가 조합 최적화
     */
    private optimizeSpecialistCombination;
    /**
     * 추천 구축
     */
    private buildRecommendation;
    /**
     * 유틸리티 메서드들
     */
    private calculateSpecialistMatch;
    private calculateQuickMatchScore;
    private calculateSkillMatchScore;
    private identifySkillGaps;
    private identifyRemainingSkillGaps;
    private calculateEstimatedCost;
    private calculateSpecialistCost;
    private calculateSuccessProbability;
    private calculateOverallSkillCoverage;
    private identifyRiskFactors;
    private calculateHourlyRate;
    private createTemplateSpecialist;
    private analyzeLearningOpportunities;
    private calculateNetworkEffects;
    /**
     * 성능 메트릭 및 관리 메서드들
     */
    getPerformanceMetrics(): {
        totalSpecialists: number;
        generationCount: number;
        lastOptimization: number;
        cacheSize: number;
        averageMatchTime: number;
        successRate: number;
    };
    /**
     * 전문가 업데이트 및 학습
     */
    updateSpecialistPerformance(specialistId: string, performanceRecord: PerformanceRecord): Promise<void>;
    /**
     * 전문가 폐기 및 정리
     */
    cleanupObsoleteSpecialists(): Promise<void>;
    /**
     * 레지스트리 초기화
     */
    reset(): void;
}
export declare const advancedSpecialistManager: AdvancedSpecialistManager;
export {};
//# sourceMappingURL=advancedSpecialistManager.d.ts.map