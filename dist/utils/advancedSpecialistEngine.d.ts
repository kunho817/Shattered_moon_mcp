/**
 * 고급 전문가 엔진
 * 동적 전문가 생성, AI 기반 스킬 매칭, 실시간 전문가 진화 시스템
 */
export interface DynamicSpecialist {
    id: string;
    name: string;
    type: string;
    baseType: string;
    level: 'junior' | 'mid' | 'senior' | 'expert' | 'master';
    skills: Record<string, SpecialistSkill>;
    expertise: string[];
    experienceYears: number;
    specializations: string[];
    adaptability: number;
    creativity: number;
    collaboration: number;
    leadership: number;
    problemSolving: number;
    currentProjects: string[];
    availability: number;
    workload: number;
    performance: SpecialistPerformance;
    learningHistory: LearningRecord[];
    collaborationHistory: CollaborationRecord[];
    temporaryEnhancements: TemporaryEnhancement[];
    emergencyCapabilities: EmergencyCapability[];
    metadata: {
        createdAt: number;
        lastUpdated: number;
        evolutionCount: number;
        successRate: number;
        preferredTaskTypes: string[];
        workingStyle: string;
        communicationStyle: string;
    };
}
export interface SpecialistSkill {
    level: number;
    confidence: number;
    lastUsed: number;
    learningCurve: number;
    certifications: string[];
    practicalExperience: number;
    theoreticalKnowledge: number;
    teachingAbility: number;
}
export interface SpecialistPerformance {
    taskCompletionRate: number;
    qualityScore: number;
    speedScore: number;
    innovationScore: number;
    reliabilityScore: number;
    mentorshipScore: number;
    recentProjects: ProjectRecord[];
    strengths: string[];
    weaknesses: string[];
    improvementAreas: string[];
}
export interface LearningRecord {
    timestamp: number;
    skill: string;
    beforeLevel: number;
    afterLevel: number;
    learningMethod: 'project' | 'training' | 'mentorship' | 'self_study' | 'collaboration';
    effectiveness: number;
    timeInvested: number;
    context: string;
}
export interface CollaborationRecord {
    partnerId: string;
    partnerType: 'human' | 'ai' | 'specialist';
    projectId: string;
    duration: number;
    effectiveness: number;
    roleInTeam: string;
    contribution: number;
    feedback: string;
    conflicts: number;
    resolutions: number;
}
export interface TemporaryEnhancement {
    id: string;
    type: 'skill_boost' | 'focus_mode' | 'creativity_boost' | 'speed_enhancement' | 'quality_focus';
    skill?: string;
    multiplier: number;
    duration: number;
    startTime: number;
    endTime: number;
    cost: number;
    effectiveness: number;
}
export interface EmergencyCapability {
    triggerCondition: string;
    responseType: 'rapid_learning' | 'expertise_borrowing' | 'collaborative_solving' | 'creative_breakthrough';
    activationThreshold: number;
    effectiveness: number;
    cooldownPeriod: number;
    lastUsed: number;
    successCount: number;
    failureCount: number;
}
export interface ProjectRecord {
    id: string;
    name: string;
    type: string;
    complexity: 'low' | 'medium' | 'high' | 'critical';
    duration: number;
    role: string;
    contribution: number;
    qualityResult: number;
    timelineAdherence: number;
    innovationLevel: number;
    lessonsLearned: string[];
    skillsUsed: string[];
    skillsGained: string[];
}
export interface SpecialistEvolutionPlan {
    specialistId: string;
    currentLevel: string;
    targetLevel: string;
    evolutionPath: EvolutionStep[];
    estimatedDuration: number;
    requiredResources: string[];
    successProbability: number;
    riskFactors: string[];
    milestones: EvolutionMilestone[];
}
export interface EvolutionStep {
    stepId: string;
    name: string;
    description: string;
    requiredSkills: string[];
    learningActivities: LearningActivity[];
    estimatedTime: number;
    prerequisites: string[];
    successCriteria: string[];
}
export interface LearningActivity {
    type: 'project_work' | 'mentorship' | 'training' | 'research' | 'collaboration' | 'experimentation';
    description: string;
    estimatedTime: number;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    expectedGain: number;
    resources: string[];
}
export interface EvolutionMilestone {
    name: string;
    description: string;
    targetDate: number;
    successCriteria: string[];
    rewards: string[];
    skillRequirements: Record<string, number>;
}
export interface SpecialistCreationRequest {
    taskContext: string;
    requiredSkills: string[];
    complexity: 'low' | 'medium' | 'high' | 'critical';
    urgency: 'low' | 'medium' | 'high' | 'critical';
    duration: number;
    teamContext: string;
    collaborationStyle: string;
    innovationRequired: boolean;
    leadershipRequired: boolean;
    mentorshipRequired: boolean;
    emergencyMode: boolean;
    budgetConstraints?: number;
    timeConstraints?: number;
    qualityRequirements: number;
}
export interface SpecialistMatchResult {
    specialist: DynamicSpecialist;
    matchScore: number;
    strengthAreas: string[];
    weakAreas: string[];
    enhancementSuggestions: TemporaryEnhancement[];
    riskFactors: string[];
    expectedPerformance: {
        quality: number;
        speed: number;
        innovation: number;
        collaboration: number;
    };
    confidence: number;
}
declare class AdvancedSpecialistEngine {
    private specialists;
    private evolutionPlans;
    private performanceHistory;
    private nextSpecialistId;
    /**
     * 동적 전문가 생성 메인 함수
     */
    createDynamicSpecialist(request: SpecialistCreationRequest): Promise<DynamicSpecialist>;
    /**
     * 기본 전문가 유형 선택
     */
    private selectBaseSpecialistType;
    /**
     * 전문가 커스터마이징 생성
     */
    private generateSpecialistCustomization;
    /**
     * 스킬 프로파일 생성
     */
    private generateSkillProfile;
    /**
     * 성능 프로파일 생성
     */
    private generatePerformanceProfile;
    /**
     * 적응 프로파일 생성
     */
    private generateAdaptationProfile;
    /**
     * 응급 상황 대응 능력 생성
     */
    private generateEmergencyCapabilities;
    /**
     * 전문가 객체 조립
     */
    private assembleSpecialist;
    /**
     * 진화 계획 생성
     */
    private createEvolutionPlan;
    /**
     * 전문가 등록 및 모니터링 설정
     */
    private registerSpecialist;
    /**
     * 최적 전문가 매칭
     */
    findBestSpecialistMatch(request: SpecialistCreationRequest, availableSpecialists?: DynamicSpecialist[]): Promise<SpecialistMatchResult>;
    /**
     * 전문가 성능 업데이트
     */
    updateSpecialistPerformance(specialistId: string, projectRecord: ProjectRecord): Promise<void>;
    /**
     * 유틸리티 메서드들
     */
    private selectFallbackSpecialistType;
    private generateFallbackCustomization;
    private createSkillFromBase;
    private createNewSkill;
    private createSpecializedSkill;
    private getSpecializationSkills;
    private experienceLevelToYears;
    private experienceLevelToMultiplier;
    private experienceLevelToSkillLevel;
    private identifyStrengths;
    private identifyWeaknesses;
    private identifyImprovementAreas;
    private calculateMatchScore;
    private calculateSkillMatch;
    private calculateExperienceMatch;
    private identifyMatchStrengths;
    private identifyMatchWeaknesses;
    private suggestTemporaryEnhancements;
    private assessMatchRisks;
    private predictPerformance;
    private calculateMatchConfidence;
    private recalculatePerformance;
    private checkEvolutionTrigger;
    private triggerEvolution;
    private generateFallbackEvolutionPlan;
    /**
     * 전문가 상태 조회
     */
    getSpecialist(specialistId: string): DynamicSpecialist | undefined;
    /**
     * 모든 전문가 조회
     */
    getAllSpecialists(): DynamicSpecialist[];
    /**
     * 전문가 성능 메트릭 조회
     */
    getPerformanceMetrics(): {
        totalSpecialists: number;
        averageSuccessRate: number;
        specializationDistribution: Record<string, number>;
        levelDistribution: Record<string, number>;
        totalEvolutions: number;
    };
    private calculateAverageSuccessRate;
    private getSpecializationDistribution;
    private getLevelDistribution;
    private getTotalEvolutions;
    /**
     * 시스템 초기화
     */
    reset(): void;
}
export declare const advancedSpecialistEngine: AdvancedSpecialistEngine;
export {};
//# sourceMappingURL=advancedSpecialistEngine.d.ts.map