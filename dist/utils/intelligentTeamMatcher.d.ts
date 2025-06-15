/**
 * 지능형 팀 매칭 시스템
 * AI 기반 최적 팀 구성 및 동적 매칭으로 협업 효율성 극대화
 */
export interface ComplexTask {
    id: string;
    title: string;
    description: string;
    complexity: 'low' | 'medium' | 'high' | 'critical';
    estimatedDuration: number;
    requiredSkills: string[];
    requiredExpertise: string[];
    domainKnowledge: string[];
    collaborationIntensity: 'minimal' | 'moderate' | 'high' | 'intensive';
    communicationRequirements: string[];
    deliverables: string[];
    qualityStandards: string[];
    riskFactors: string[];
    timeConstraints: {
        deadline?: number;
        milestones: Array<{
            date: number;
            deliverable: string;
        }>;
    };
    businessImpact: 'low' | 'medium' | 'high' | 'critical';
}
export interface TeamConstraints {
    maxTeamSize: number;
    minTeamSize: number;
    budgetLimit?: number;
    availabilityRequirements: {
        timezone?: string[];
        workingHours?: {
            start: number;
            end: number;
        };
        daysPerWeek?: number;
    };
    locationRequirements?: {
        distributed: boolean;
        timeZoneOverlap?: number;
    };
    securityClearance?: string[];
    complianceRequirements?: string[];
}
export interface TeamPreferences {
    prioritizeExperience: boolean;
    favorDiversity: boolean;
    emphasizeCollaboration: boolean;
    preferSpecialists: boolean;
    workStylePreference: 'agile' | 'waterfall' | 'hybrid';
    communicationStyle: 'formal' | 'informal' | 'mixed';
    leadershipStyle: 'hierarchical' | 'collaborative' | 'self_organizing';
    culturalFit: string[];
}
export interface TeamMember {
    id: string;
    name: string;
    team: string;
    role: string;
    skills: Record<string, number>;
    expertise: string[];
    experience: number;
    availability: number;
    workload: number;
    collaborationHistory: Record<string, CollaborationRecord>;
    performanceMetrics: {
        taskCompletionRate: number;
        qualityScore: number;
        timelineAdherence: number;
        communicationRating: number;
        problemSolvingRating: number;
    };
    preferences: {
        workStyle: string;
        communicationFrequency: 'low' | 'medium' | 'high';
        taskComplexityPreference: 'simple' | 'moderate' | 'complex';
    };
    currentProjects: string[];
    timezone: string;
    languages: string[];
}
export interface CollaborationRecord {
    partnerId: string;
    projectCount: number;
    successRate: number;
    averageRating: number;
    communicationEffectiveness: number;
    conflictHistory: number;
    synergy: number;
    lastCollaboration: number;
}
export interface TeamComposition {
    id: string;
    members: TeamMember[];
    teamLead: string;
    roles: Record<string, string[]>;
    estimatedPerformance: {
        completionProbability: number;
        qualityExpectation: number;
        timelineAdherence: number;
        riskMitigation: number;
        innovationPotential: number;
    };
    collaborationDynamics: {
        teamCohesion: number;
        communicationEfficiency: number;
        conflictPotential: number;
        knowledgeSharing: number;
        decisionMakingSpeed: number;
    };
    skillCoverage: Record<string, number>;
    gaps: {
        missingSkills: string[];
        weakAreas: string[];
        riskAreas: string[];
    };
    alternatives: TeamComposition[];
    reasoning: string;
    confidence: number;
}
export interface MatchingStrategy {
    algorithm: 'skill_optimization' | 'collaboration_history' | 'balanced' | 'ai_driven' | 'hybrid';
    weightings: {
        skillMatch: number;
        experience: number;
        availability: number;
        collaboration: number;
        performance: number;
        diversity: number;
    };
    optimizationGoals: {
        maximizeQuality: boolean;
        minimizeTime: boolean;
        minimizeRisk: boolean;
        maximizeInnovation: boolean;
        maximizeCollaboration: boolean;
    };
    constraints: {
        enforceAvailability: boolean;
        requireAllSkills: boolean;
        balanceWorkload: boolean;
        respectPreferences: boolean;
    };
}
declare class IntelligentTeamMatcher {
    private teamDatabase;
    private collaborationHistory;
    private performanceCache;
    private defaultStrategy;
    /**
     * 메인 팀 매칭 함수 - 최적의 팀 구성 찾기
     */
    findOptimalTeamComposition(task: ComplexTask, constraints: TeamConstraints, preferences: TeamPreferences, strategy?: Partial<MatchingStrategy>): Promise<TeamComposition>;
    /**
     * 후보 멤버 풀 생성
     */
    private generateCandidatePool;
    /**
     * AI 기반 최적 조합 생성
     */
    private generateOptimalCompositions;
    /**
     * 협업 다이내믹스 분석
     */
    private analyzeCollaborationDynamics;
    /**
     * 협업 다이내믹스 계산
     */
    private calculateCollaborationDynamics;
    /**
     * 팀 응집력 계산
     */
    private calculateTeamCohesion;
    /**
     * 의사소통 효율성 계산
     */
    private calculateCommunicationEfficiency;
    /**
     * 갈등 가능성 계산
     */
    private calculateConflictPotential;
    /**
     * 지식 공유 점수 계산
     */
    private calculateKnowledgeSharing;
    /**
     * 의사결정 속도 계산
     */
    private calculateDecisionMakingSpeed;
    /**
     * 최종 구성 선택
     */
    private selectFinalComposition;
    /**
     * 구성 점수 계산
     */
    private calculateCompositionScore;
    /**
     * 대안 생성
     */
    private generateAlternatives;
    /**
     * 유틸리티 메서드들
     */
    private calculateSkillCoverage;
    private calculateMemberSimilarity;
    private calculateSkillSimilarity;
    private calculateLanguageCompatibility;
    private calculateTimezoneCompatibility;
    private calculateCommunicationStyleCompatibility;
    private calculateWorkStyleDifference;
    private calculateSkillDiversity;
    private calculateExperienceBalance;
    private calculateMentoringPotential;
    private calculateLeadershipClarity;
    private calculatePreferencesAlignment;
    /**
     * 폴백 및 대안 생성 메서드들
     */
    private generateFallbackCompositions;
    private loadTeamMembers;
    private generateSkillsForTeam;
    private convertAICompositionToTeamComposition;
    private expandCandidatePoolWithAI;
    private ensureSkillCoverage;
    private generateSmallerTeamAlternative;
    private generateLargerTeamAlternative;
    private generateSpecializedTeamAlternative;
    /**
     * 성능 메트릭 조회
     */
    getPerformanceMetrics(): {
        totalMatches: number;
        cacheHitRate: number;
        averageMatchingTime: number;
        successRate: number;
    };
    /**
     * 캐시 관리
     */
    clearCache(): void;
}
export declare const intelligentTeamMatcher: IntelligentTeamMatcher;
export {};
//# sourceMappingURL=intelligentTeamMatcher.d.ts.map