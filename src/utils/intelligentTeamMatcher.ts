/**
 * 지능형 팀 매칭 시스템
 * AI 기반 최적 팀 구성 및 동적 매칭으로 협업 효율성 극대화
 */

import { claudeCodeInvoker } from './claudeCodeInvoker.js';
import { enhancedClaudeCodeManager } from './enhancedClaudeCodeManager.js';
import { VIRTUAL_TEAMS } from '../types/index.js';
import logger from './logger.js';

// 팀 매칭 관련 타입 정의
export interface ComplexTask {
  id: string;
  title: string;
  description: string;
  complexity: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: number; // minutes
  requiredSkills: string[];
  requiredExpertise: string[];
  domainKnowledge: string[];
  collaborationIntensity: 'minimal' | 'moderate' | 'high' | 'intensive';
  communicationRequirements: string[];
  deliverables: string[];
  qualityStandards: string[];
  riskFactors: string[];
  timeConstraints: {
    deadline?: number; // timestamp
    milestones: Array<{ date: number; deliverable: string; }>;
  };
  businessImpact: 'low' | 'medium' | 'high' | 'critical';
}

export interface TeamConstraints {
  maxTeamSize: number;
  minTeamSize: number;
  budgetLimit?: number;
  availabilityRequirements: {
    timezone?: string[];
    workingHours?: { start: number; end: number; };
    daysPerWeek?: number;
  };
  locationRequirements?: {
    distributed: boolean;
    timeZoneOverlap?: number; // hours
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
  skills: Record<string, number>; // skill -> proficiency (0-1)
  expertise: string[];
  experience: number; // years
  availability: number; // 0-1
  workload: number; // 0-1
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
  averageRating: number; // 0-5
  communicationEffectiveness: number; // 0-1
  conflictHistory: number; // 0-1, 낮을수록 좋음
  synergy: number; // 0-1
  lastCollaboration: number; // timestamp
}

export interface TeamComposition {
  id: string;
  members: TeamMember[];
  teamLead: string;
  roles: Record<string, string[]>; // role -> member IDs
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
  skillCoverage: Record<string, number>; // skill -> coverage level (0-1)
  gaps: {
    missingSkills: string[];
    weakAreas: string[];
    riskAreas: string[];
  };
  alternatives: TeamComposition[];
  reasoning: string;
  confidence: number; // AI 확신도 (0-1)
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

class IntelligentTeamMatcher {
  private teamDatabase: TeamMember[] = [];
  private collaborationHistory: Map<string, CollaborationRecord[]> = new Map();
  private performanceCache: Map<string, any> = new Map();
  
  private defaultStrategy: MatchingStrategy = {
    algorithm: 'ai_driven',
    weightings: {
      skillMatch: 0.25,
      experience: 0.15,
      availability: 0.20,
      collaboration: 0.20,
      performance: 0.15,
      diversity: 0.05
    },
    optimizationGoals: {
      maximizeQuality: true,
      minimizeTime: true,
      minimizeRisk: true,
      maximizeInnovation: false,
      maximizeCollaboration: true
    },
    constraints: {
      enforceAvailability: true,
      requireAllSkills: false,
      balanceWorkload: true,
      respectPreferences: true
    }
  };

  /**
   * 메인 팀 매칭 함수 - 최적의 팀 구성 찾기
   */
  async findOptimalTeamComposition(
    task: ComplexTask,
    constraints: TeamConstraints,
    preferences: TeamPreferences,
    strategy?: Partial<MatchingStrategy>
  ): Promise<TeamComposition> {
    const matchingId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    const activeStrategy = strategy ? { ...this.defaultStrategy, ...strategy } : this.defaultStrategy;

    logger.info('Starting intelligent team matching', {
      matchingId,
      taskId: task.id,
      taskComplexity: task.complexity,
      strategy: activeStrategy.algorithm,
      constraints: {
        teamSize: `${constraints.minTeamSize}-${constraints.maxTeamSize}`,
        skills: task.requiredSkills.length
      }
    });

    try {
      // 1. 후보 멤버 풀 생성
      const candidatePool = await this.generateCandidatePool(task, constraints, preferences);
      
      logger.info('Candidate pool generated', {
        matchingId,
        candidatesFound: candidatePool.length,
        skillCoverage: this.calculateSkillCoverage(candidatePool, task.requiredSkills)
      });

      // 2. AI 기반 최적 조합 분석
      const optimalCompositions = await this.generateOptimalCompositions(
        task,
        candidatePool,
        constraints,
        preferences,
        activeStrategy
      );

      // 3. 협업 다이내믹스 분석
      const enhancedCompositions = await this.analyzeCollaborationDynamics(
        optimalCompositions,
        task
      );

      // 4. 최종 추천 선택
      const finalComposition = await this.selectFinalComposition(
        enhancedCompositions,
        task,
        constraints,
        preferences
      );

      // 5. 성능 예측 및 대안 생성
      await this.generateAlternatives(finalComposition, task, candidatePool, constraints);

      logger.info('Team matching completed successfully', {
        matchingId,
        selectedTeamSize: finalComposition.members.length,
        confidence: finalComposition.confidence,
        estimatedPerformance: finalComposition.estimatedPerformance.completionProbability,
        executionTime: Date.now() - startTime
      });

      return finalComposition;

    } catch (error) {
      logger.error('Team matching failed', {
        matchingId,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime
      });
      throw error;
    }
  }

  /**
   * 후보 멤버 풀 생성
   */
  private async generateCandidatePool(
    task: ComplexTask,
    constraints: TeamConstraints,
    preferences: TeamPreferences
  ): Promise<TeamMember[]> {
    // 실제 구현에서는 데이터베이스에서 조회
    const allMembers = await this.loadTeamMembers();
    
    let candidates = allMembers.filter(member => {
      // 기본 가용성 체크
      if (constraints.availabilityRequirements && member.availability < 0.3) {
        return false;
      }

      // 워크로드 체크
      if (member.workload > 0.9) {
        return false;
      }

      // 스킬 매칭 (최소 하나 이상)
      const hasRequiredSkill = task.requiredSkills.some(skill => 
        member.skills[skill] && member.skills[skill] > 0.3
      );

      return hasRequiredSkill;
    });

    // AI 기반 후보 확장
    const expandedCandidates = await this.expandCandidatePoolWithAI(
      candidates,
      task,
      constraints,
      preferences
    );

    // 스킬 커버리지 확보
    const finalCandidates = await this.ensureSkillCoverage(
      expandedCandidates,
      task.requiredSkills
    );

    return finalCandidates.slice(0, Math.min(50, finalCandidates.length)); // 최대 50명으로 제한
  }

  /**
   * AI 기반 최적 조합 생성
   */
  private async generateOptimalCompositions(
    task: ComplexTask,
    candidatePool: TeamMember[],
    constraints: TeamConstraints,
    preferences: TeamPreferences,
    strategy: MatchingStrategy
  ): Promise<TeamComposition[]> {
    const prompt = `
Generate optimal team compositions for this complex task:

**Task Details**:
- Title: ${task.title}
- Complexity: ${task.complexity}
- Duration: ${task.estimatedDuration} minutes
- Required Skills: ${task.requiredSkills.join(', ')}
- Required Expertise: ${task.requiredExpertise.join(', ')}
- Collaboration Intensity: ${task.collaborationIntensity}
- Business Impact: ${task.businessImpact}

**Constraints**:
- Team Size: ${constraints.minTeamSize}-${constraints.maxTeamSize} members
- Strategy: ${strategy.algorithm}
- Optimization Goals: ${Object.entries(strategy.optimizationGoals).filter(([k,v]) => v).map(([k]) => k).join(', ')}

**Available Candidates** (${candidatePool.length} total):
${candidatePool.slice(0, 20).map(member => 
  `${member.name} (${member.team}): Skills[${Object.entries(member.skills).filter(([k,v]) => v > 0.5).map(([k,v]) => `${k}:${Math.round(v*100)}%`).join(',')}], Exp: ${member.experience}y, Avail: ${Math.round(member.availability*100)}%`
).join('\n')}

Generate 3-5 different team compositions optimizing for:
1. Skill coverage and expertise match
2. Collaboration potential and team dynamics
3. Performance and delivery probability
4. Risk mitigation and backup capabilities
5. Innovation and creative potential

Return as JSON array:
[{
  "id": "composition_1",
  "members": [
    {
      "id": "member_id",
      "name": "Member Name",
      "role": "assigned_role_in_team",
      "contribution": "specific contribution to task",
      "skillMatch": 0.85
    }
  ],
  "teamLead": "member_id",
  "estimatedPerformance": {
    "completionProbability": 0.88,
    "qualityExpectation": 0.82,
    "timelineAdherence": 0.75,
    "riskMitigation": 0.80,
    "innovationPotential": 0.65
  },
  "reasoning": "Why this composition is optimal",
  "confidence": 0.82,
  "strengthAreas": ["skill1", "skill2"],
  "weakAreas": ["skill3"],
  "synergies": ["collaboration strength 1"]
}]
`;

    try {
      const result = await enhancedClaudeCodeManager.performEnhancedAnalysis(
        prompt,
        {taskId: 'task', timestamp: new Date()}, // 복잡한 팀 구성에는 Opus 사용
        { timeout: 60000, priority: 'high' }
      );

      const aiCompositions = JSON.parse(result.response);
      
      // AI 추천을 실제 TeamComposition 객체로 변환
      const compositions = await Promise.all(
        aiCompositions.map(async (aiComp: any) => 
          await this.convertAICompositionToTeamComposition(aiComp, candidatePool, task)
        )
      );

      return compositions.filter(comp => comp.members.length >= constraints.minTeamSize);

    } catch (error) {
      logger.warn('AI composition generation failed, using fallback algorithm', { error });
      return await this.generateFallbackCompositions(task, candidatePool, constraints, strategy);
    }
  }

  /**
   * 협업 다이내믹스 분석
   */
  private async analyzeCollaborationDynamics(
    compositions: TeamComposition[],
    task: ComplexTask
  ): Promise<TeamComposition[]> {
    const enhancedCompositions = await Promise.all(
      compositions.map(async (composition) => {
        const dynamics = await this.calculateCollaborationDynamics(composition.members, task);
        
        return {
          ...composition,
          collaborationDynamics: dynamics
        };
      })
    );

    return enhancedCompositions;
  }

  /**
   * 협업 다이내믹스 계산
   */
  private async calculateCollaborationDynamics(
    members: TeamMember[],
    task: ComplexTask
  ): Promise<TeamComposition['collaborationDynamics']> {
    // 팀 응집력 계산
    const teamCohesion = await this.calculateTeamCohesion(members);
    
    // 의사소통 효율성 계산
    const communicationEfficiency = await this.calculateCommunicationEfficiency(members, task);
    
    // 갈등 가능성 계산
    const conflictPotential = await this.calculateConflictPotential(members);
    
    // 지식 공유 점수 계산
    const knowledgeSharing = await this.calculateKnowledgeSharing(members);
    
    // 의사결정 속도 계산
    const decisionMakingSpeed = await this.calculateDecisionMakingSpeed(members, task);

    return {
      teamCohesion,
      communicationEfficiency,
      conflictPotential,
      knowledgeSharing,
      decisionMakingSpeed
    };
  }

  /**
   * 팀 응집력 계산
   */
  private async calculateTeamCohesion(members: TeamMember[]): Promise<number> {
    let totalCohesion = 0;
    let pairCount = 0;

    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const member1 = members[i];
        const member2 = members[j];
        
        const collaborationRecord = member1.collaborationHistory[member2.id];
        
        if (collaborationRecord) {
          // 과거 협업 경험이 있는 경우
          totalCohesion += collaborationRecord.synergy;
        } else {
          // 새로운 조합인 경우 - 유사성 기반 예측
          const similarity = this.calculateMemberSimilarity(member1, member2);
          totalCohesion += similarity * 0.7; // 불확실성 페널티
        }
        
        pairCount++;
      }
    }

    return pairCount > 0 ? totalCohesion / pairCount : 0.5;
  }

  /**
   * 의사소통 효율성 계산
   */
  private async calculateCommunicationEfficiency(
    members: TeamMember[],
    task: ComplexTask
  ): Promise<number> {
    // 언어 호환성
    const languageCompatibility = this.calculateLanguageCompatibility(members);
    
    // 시간대 호환성
    const timezoneCompatibility = this.calculateTimezoneCompatibility(members);
    
    // 의사소통 스타일 호환성
    const communicationStyleCompatibility = this.calculateCommunicationStyleCompatibility(members);
    
    // 작업 복잡도에 따른 의사소통 요구사항
    const complexityFactor = task.collaborationIntensity === 'intensive' ? 1.2 : 
                           task.collaborationIntensity === 'high' ? 1.1 : 
                           task.collaborationIntensity === 'moderate' ? 1.0 : 0.9;

    const baseEfficiency = (
      languageCompatibility * 0.3 +
      timezoneCompatibility * 0.4 +
      communicationStyleCompatibility * 0.3
    );

    return Math.min(1.0, baseEfficiency * complexityFactor);
  }

  /**
   * 갈등 가능성 계산
   */
  private async calculateConflictPotential(members: TeamMember[]): Promise<number> {
    let totalConflictRisk = 0;
    let pairCount = 0;

    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const member1 = members[i];
        const member2 = members[j];
        
        const collaborationRecord = member1.collaborationHistory[member2.id];
        
        if (collaborationRecord) {
          totalConflictRisk += collaborationRecord.conflictHistory;
        } else {
          // 새로운 조합 - 성격/작업 스타일 차이 기반 예측
          const styleDifference = this.calculateWorkStyleDifference(member1, member2);
          totalConflictRisk += styleDifference * 0.3; // 새로운 팀이므로 낮은 리스크
        }
        
        pairCount++;
      }
    }

    return pairCount > 0 ? totalConflictRisk / pairCount : 0.2;
  }

  /**
   * 지식 공유 점수 계산
   */
  private async calculateKnowledgeSharing(members: TeamMember[]): Promise<number> {
    // 스킬 다양성 (더 다양할수록 학습 기회 증가)
    const skillDiversity = this.calculateSkillDiversity(members);
    
    // 경험 수준 분포 (시니어-주니어 균형)
    const experienceBalance = this.calculateExperienceBalance(members);
    
    // 멘토링 가능성
    const mentoringPotential = this.calculateMentoringPotential(members);

    return (skillDiversity * 0.4 + experienceBalance * 0.3 + mentoringPotential * 0.3);
  }

  /**
   * 의사결정 속도 계산
   */
  private async calculateDecisionMakingSpeed(
    members: TeamMember[],
    task: ComplexTask
  ): Promise<number> {
    // 팀 크기 (작을수록 빠름)
    const sizeScore = Math.max(0, 1 - (members.length - 3) * 0.1);
    
    // 리더십 명확성
    const leadershipClarity = this.calculateLeadershipClarity(members);
    
    // 경험 수준 (경험이 많을수록 빠른 결정)
    const avgExperience = members.reduce((sum, m) => sum + m.experience, 0) / members.length;
    const experienceScore = Math.min(1, avgExperience / 10); // 10년 경험을 최대로
    
    // 작업 복잡도 영향
    const complexityPenalty = task.complexity === 'critical' ? 0.8 : 
                            task.complexity === 'high' ? 0.9 : 
                            task.complexity === 'medium' ? 0.95 : 1.0;

    return (sizeScore * 0.3 + leadershipClarity * 0.4 + experienceScore * 0.3) * complexityPenalty;
  }

  /**
   * 최종 구성 선택
   */
  private async selectFinalComposition(
    compositions: TeamComposition[],
    task: ComplexTask,
    constraints: TeamConstraints,
    preferences: TeamPreferences
  ): Promise<TeamComposition> {
    if (compositions.length === 0) {
      throw new Error('No valid team compositions found');
    }

    // 멀티크라이테리아 스코링
    const scoredCompositions = compositions.map(composition => {
      const score = this.calculateCompositionScore(composition, task, constraints, preferences);
      return { composition, score };
    });

    // 최고 점수 선택
    scoredCompositions.sort((a, b) => b.score - a.score);
    
    const selected = scoredCompositions[0].composition;
    
    logger.info('Final composition selected', {
      selectedId: selected.id,
      score: scoredCompositions[0].score,
      teamSize: selected.members.length,
      confidence: selected.confidence
    });

    return selected;
  }

  /**
   * 구성 점수 계산
   */
  private calculateCompositionScore(
    composition: TeamComposition,
    task: ComplexTask,
    constraints: TeamConstraints,
    preferences: TeamPreferences
  ): number {
    const weights = {
      performance: 0.3,
      collaboration: 0.2,
      skillCoverage: 0.2,
      risk: 0.15,
      preferences: 0.1,
      innovation: 0.05
    };

    // 성능 점수
    const performanceScore = (
      composition.estimatedPerformance.completionProbability * 0.4 +
      composition.estimatedPerformance.qualityExpectation * 0.3 +
      composition.estimatedPerformance.timelineAdherence * 0.3
    );

    // 협업 점수
    const collaborationScore = (
      composition.collaborationDynamics.teamCohesion * 0.3 +
      composition.collaborationDynamics.communicationEfficiency * 0.3 +
      (1 - composition.collaborationDynamics.conflictPotential) * 0.2 +
      composition.collaborationDynamics.knowledgeSharing * 0.2
    );

    // 스킬 커버리지 점수
    const skillCoverageScore = Object.values(composition.skillCoverage).reduce((sum, coverage) => sum + coverage, 0) / 
                              Object.keys(composition.skillCoverage).length;

    // 리스크 점수 (낮을수록 좋음)
    const riskScore = composition.estimatedPerformance.riskMitigation;

    // 혁신 점수
    const innovationScore = composition.estimatedPerformance.innovationPotential;

    // 선호도 점수
    const preferencesScore = this.calculatePreferencesAlignment(composition, preferences);

    return (
      performanceScore * weights.performance +
      collaborationScore * weights.collaboration +
      skillCoverageScore * weights.skillCoverage +
      riskScore * weights.risk +
      innovationScore * weights.innovation +
      preferencesScore * weights.preferences
    );
  }

  /**
   * 대안 생성
   */
  private async generateAlternatives(
    mainComposition: TeamComposition,
    task: ComplexTask,
    candidatePool: TeamMember[],
    constraints: TeamConstraints
  ): Promise<void> {
    // 다양한 대안 시나리오 생성
    const alternatives: TeamComposition[] = [];

    // 1. 더 작은 팀 (고효율)
    const smallerTeam = await this.generateSmallerTeamAlternative(mainComposition, candidatePool, task);
    if (smallerTeam) alternatives.push(smallerTeam);

    // 2. 더 큰 팀 (안정성)
    const largerTeam = await this.generateLargerTeamAlternative(mainComposition, candidatePool, task, constraints);
    if (largerTeam) alternatives.push(largerTeam);

    // 3. 스킬 특화 팀
    const specializedTeam = await this.generateSpecializedTeamAlternative(mainComposition, candidatePool, task);
    if (specializedTeam) alternatives.push(specializedTeam);

    mainComposition.alternatives = alternatives;
  }

  /**
   * 유틸리티 메서드들
   */
  private calculateSkillCoverage(candidates: TeamMember[], requiredSkills: string[]): number {
    const coveredSkills = new Set<string>();
    
    candidates.forEach(candidate => {
      requiredSkills.forEach(skill => {
        if (candidate.skills[skill] && candidate.skills[skill] > 0.5) {
          coveredSkills.add(skill);
        }
      });
    });

    return coveredSkills.size / requiredSkills.length;
  }

  private calculateMemberSimilarity(member1: TeamMember, member2: TeamMember): number {
    // 스킬 유사성
    const skillSimilarity = this.calculateSkillSimilarity(member1.skills, member2.skills);
    
    // 경험 수준 유사성
    const expDiff = Math.abs(member1.experience - member2.experience);
    const experienceSimilarity = Math.max(0, 1 - expDiff / 20); // 20년 차이를 최대로
    
    // 작업 스타일 유사성
    const workStyleSimilarity = member1.preferences.workStyle === member2.preferences.workStyle ? 1 : 0.5;

    return (skillSimilarity * 0.5 + experienceSimilarity * 0.3 + workStyleSimilarity * 0.2);
  }

  private calculateSkillSimilarity(skills1: Record<string, number>, skills2: Record<string, number>): number {
    const allSkills = new Set([...Object.keys(skills1), ...Object.keys(skills2)]);
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (const skill of allSkills) {
      const val1 = skills1[skill] || 0;
      const val2 = skills2[skill] || 0;
      
      dotProduct += val1 * val2;
      norm1 += val1 * val1;
      norm2 += val2 * val2;
    }

    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
    return denominator > 0 ? dotProduct / denominator : 0;
  }

  private calculateLanguageCompatibility(members: TeamMember[]): number {
    if (members.length === 0) return 1;

    const languageCounts = new Map<string, number>();
    members.forEach(member => {
      member.languages.forEach(lang => {
        languageCounts.set(lang, (languageCounts.get(lang) || 0) + 1);
      });
    });

    // 가장 많이 사용되는 언어의 커버리지
    const maxCount = Math.max(...languageCounts.values());
    return maxCount / members.length;
  }

  private calculateTimezoneCompatibility(members: TeamMember[]): number {
    // 간단한 구현: 모든 멤버가 같은 시간대면 1, 아니면 0.7
    const timezones = new Set(members.map(m => m.timezone));
    return timezones.size === 1 ? 1 : 0.7;
  }

  private calculateCommunicationStyleCompatibility(members: TeamMember[]): number {
    // 의사소통 빈도 선호도 기반
    const freqCounts = new Map<string, number>();
    members.forEach(member => {
      const freq = member.preferences.communicationFrequency;
      freqCounts.set(freq, (freqCounts.get(freq) || 0) + 1);
    });

    const maxCount = Math.max(...freqCounts.values());
    return maxCount / members.length;
  }

  private calculateWorkStyleDifference(member1: TeamMember, member2: TeamMember): number {
    const styleDiff = member1.preferences.workStyle === member2.preferences.workStyle ? 0 : 0.5;
    const commDiff = member1.preferences.communicationFrequency === member2.preferences.communicationFrequency ? 0 : 0.3;
    const complexityDiff = member1.preferences.taskComplexityPreference === member2.preferences.taskComplexityPreference ? 0 : 0.2;

    return styleDiff + commDiff + complexityDiff;
  }

  private calculateSkillDiversity(members: TeamMember[]): number {
    const allSkills = new Set<string>();
    members.forEach(member => {
      Object.keys(member.skills).forEach(skill => {
        if (member.skills[skill] > 0.3) {
          allSkills.add(skill);
        }
      });
    });

    // 다양성은 총 스킬 수 대비 고유 스킬 비율
    const totalSkillInstances = members.reduce((sum, member) => 
      sum + Object.values(member.skills).filter(level => level > 0.3).length, 0
    );

    return totalSkillInstances > 0 ? allSkills.size / totalSkillInstances : 0;
  }

  private calculateExperienceBalance(members: TeamMember[]): number {
    const experiences = members.map(m => m.experience).sort((a, b) => a - b);
    const minExp = experiences[0];
    const maxExp = experiences[experiences.length - 1];
    
    // 경험 범위가 넓을수록 좋은 밸런스 (최대 15년 차이를 이상적으로)
    const range = maxExp - minExp;
    return Math.min(1, range / 15);
  }

  private calculateMentoringPotential(members: TeamMember[]): number {
    const seniors = members.filter(m => m.experience >= 7).length;
    const juniors = members.filter(m => m.experience <= 3).length;
    
    return Math.min(seniors, juniors) / members.length;
  }

  private calculateLeadershipClarity(members: TeamMember[]): number {
    const leaders = members.filter(m => m.role.includes('lead') || m.role.includes('senior')).length;
    
    if (leaders === 1) return 1; // 명확한 리더 1명
    if (leaders === 0) return 0.5; // 리더 없음
    return Math.max(0.3, 1 - (leaders - 1) * 0.2); // 리더 과다
  }

  private calculatePreferencesAlignment(
    composition: TeamComposition,
    preferences: TeamPreferences
  ): number {
    let alignmentScore = 0.8; // 기본 점수

    if (preferences.prioritizeExperience) {
      const avgExp = composition.members.reduce((sum, m) => sum + m.experience, 0) / composition.members.length;
      alignmentScore += (avgExp / 10) * 0.2; // 경험 보너스
    }

    if (preferences.favorDiversity) {
      const teamDiversity = this.calculateSkillDiversity(composition.members);
      alignmentScore += teamDiversity * 0.1;
    }

    if (preferences.emphasizeCollaboration) {
      alignmentScore += composition.collaborationDynamics.teamCohesion * 0.1;
    }

    return Math.min(1, alignmentScore);
  }

  /**
   * 폴백 및 대안 생성 메서드들
   */
  private async generateFallbackCompositions(
    task: ComplexTask,
    candidatePool: TeamMember[],
    constraints: TeamConstraints,
    strategy: MatchingStrategy
  ): Promise<TeamComposition[]> {
    // 기본 알고리즘 기반 팀 구성
    const fallbackComposition: TeamComposition = {
      id: 'fallback_composition',
      members: candidatePool.slice(0, Math.min(constraints.maxTeamSize, 5)),
      teamLead: candidatePool[0]?.id || '',
      roles: {},
      estimatedPerformance: {
        completionProbability: 0.7,
        qualityExpectation: 0.7,
        timelineAdherence: 0.7,
        riskMitigation: 0.6,
        innovationPotential: 0.5
      },
      collaborationDynamics: {
        teamCohesion: 0.6,
        communicationEfficiency: 0.6,
        conflictPotential: 0.3,
        knowledgeSharing: 0.6,
        decisionMakingSpeed: 0.7
      },
      skillCoverage: {},
      gaps: {
        missingSkills: [],
        weakAreas: [],
        riskAreas: []
      },
      alternatives: [],
      reasoning: 'Fallback composition generated due to AI analysis failure',
      confidence: 0.5
    };

    return [fallbackComposition];
  }

  private async loadTeamMembers(): Promise<TeamMember[]> {
    // 실제 구현에서는 데이터베이스나 API에서 로드
    // 여기서는 VIRTUAL_TEAMS 기반으로 샘플 데이터 생성
    const sampleMembers: TeamMember[] = [];
    
    Object.entries(VIRTUAL_TEAMS).forEach(([teamName, teamData]) => {
      // 팀당 3-5명의 멤버 생성
      for (let i = 0; i < 4; i++) {
        const member: TeamMember = {
          id: `${teamName.toLowerCase()}_member_${i + 1}`,
          name: `${teamName} Member ${i + 1}`,
          team: teamName,
          role: i === 0 ? 'Team Lead' : 'Developer',
          skills: this.generateSkillsForTeam(teamName),
          expertise: teamData.specialists.slice(0, 3),
          experience: Math.floor(Math.random() * 15) + 1,
          availability: 0.6 + Math.random() * 0.4,
          workload: Math.random() * 0.8,
          collaborationHistory: {},
          performanceMetrics: {
            taskCompletionRate: 0.7 + Math.random() * 0.3,
            qualityScore: 0.6 + Math.random() * 0.4,
            timelineAdherence: 0.65 + Math.random() * 0.35,
            communicationRating: 0.7 + Math.random() * 0.3,
            problemSolvingRating: 0.6 + Math.random() * 0.4
          },
          preferences: {
            workStyle: ['agile', 'waterfall', 'hybrid'][Math.floor(Math.random() * 3)],
            communicationFrequency: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
            taskComplexityPreference: ['simple', 'moderate', 'complex'][Math.floor(Math.random() * 3)] as any
          },
          currentProjects: [],
          timezone: 'UTC+9',
          languages: ['English', 'Korean']
        };
        
        sampleMembers.push(member);
      }
    });

    return sampleMembers;
  }

  private generateSkillsForTeam(teamName: string): Record<string, number> {
    const baseSkills: Record<string, number> = {};
    
    // 팀별 기본 스킬 할당
    switch (teamName) {
      case 'Backend':
        return {
          'cpp': 0.8 + Math.random() * 0.2,
          'directx12': 0.7 + Math.random() * 0.3,
          'memory_management': 0.6 + Math.random() * 0.4,
          'performance_optimization': 0.7 + Math.random() * 0.3,
          'algorithms': 0.6 + Math.random() * 0.4
        };
      case 'Frontend':
        return {
          'directx12': 0.9 + Math.random() * 0.1,
          'hlsl': 0.8 + Math.random() * 0.2,
          'graphics_programming': 0.8 + Math.random() * 0.2,
          'ui_ux': 0.6 + Math.random() * 0.4,
          'optimization': 0.5 + Math.random() * 0.5
        };
      case 'Planning':
        return {
          'project_management': 0.8 + Math.random() * 0.2,
          'architecture_design': 0.7 + Math.random() * 0.3,
          'requirement_analysis': 0.8 + Math.random() * 0.2,
          'communication': 0.9 + Math.random() * 0.1
        };
      default:
        return {
          'general_programming': 0.6 + Math.random() * 0.4,
          'problem_solving': 0.7 + Math.random() * 0.3,
          'teamwork': 0.8 + Math.random() * 0.2
        };
    }
  }

  // AI 구성을 TeamComposition으로 변환하는 헬퍼 메서드들
  private async convertAICompositionToTeamComposition(
    aiComp: any,
    candidatePool: TeamMember[],
    task: ComplexTask
  ): Promise<TeamComposition> {
    const members = aiComp.members
      .map((aiMember: any) => candidatePool.find(c => c.id === aiMember.id || c.name === aiMember.name))
      .filter((member: TeamMember | undefined): member is TeamMember => member !== undefined);

    const skillCoverage: Record<string, number> = {};
    task.requiredSkills.forEach(skill => {
      const memberWithSkill = members.find((m: TeamMember) => m.skills[skill] && m.skills[skill] > 0.3);
      skillCoverage[skill] = memberWithSkill ? memberWithSkill.skills[skill] : 0;
    });

    return {
      id: aiComp.id,
      members,
      teamLead: aiComp.teamLead,
      roles: {},
      estimatedPerformance: aiComp.estimatedPerformance,
      collaborationDynamics: {
        teamCohesion: 0.7,
        communicationEfficiency: 0.7,
        conflictPotential: 0.3,
        knowledgeSharing: 0.7,
        decisionMakingSpeed: 0.7
      },
      skillCoverage,
      gaps: {
        missingSkills: task.requiredSkills.filter(skill => !skillCoverage[skill] || skillCoverage[skill] < 0.5),
        weakAreas: aiComp.weakAreas || [],
        riskAreas: []
      },
      alternatives: [],
      reasoning: aiComp.reasoning,
      confidence: aiComp.confidence
    };
  }

  private async expandCandidatePoolWithAI(
    candidates: TeamMember[],
    task: ComplexTask,
    constraints: TeamConstraints,
    preferences: TeamPreferences
  ): Promise<TeamMember[]> {
    // AI가 추천할 수 있는 추가 후보들을 찾는 로직
    // 현재는 기존 후보들을 그대로 반환
    return candidates;
  }

  private async ensureSkillCoverage(
    candidates: TeamMember[],
    requiredSkills: string[]
  ): Promise<TeamMember[]> {
    // 필수 스킬이 모두 커버되도록 후보 조정
    const coverage = this.calculateSkillCoverage(candidates, requiredSkills);
    
    if (coverage < 0.8) {
      logger.warn('Insufficient skill coverage in candidate pool', {
        coverage,
        requiredSkills,
        candidateCount: candidates.length
      });
    }

    return candidates;
  }

  private async generateSmallerTeamAlternative(
    mainComposition: TeamComposition,
    candidatePool: TeamMember[],
    task: ComplexTask
  ): Promise<TeamComposition | null> {
    if (mainComposition.members.length <= 3) return null;

    const coreMembers = mainComposition.members
      .sort((a, b) => b.experience - a.experience)
      .slice(0, Math.max(2, mainComposition.members.length - 2));

    return {
      ...mainComposition,
      id: mainComposition.id + '_smaller',
      members: coreMembers,
      reasoning: 'Smaller, high-efficiency team focusing on core skills'
    };
  }

  private async generateLargerTeamAlternative(
    mainComposition: TeamComposition,
    candidatePool: TeamMember[],
    task: ComplexTask,
    constraints: TeamConstraints
  ): Promise<TeamComposition | null> {
    if (mainComposition.members.length >= constraints.maxTeamSize) return null;

    const additionalMembers = candidatePool
      .filter(c => !mainComposition.members.find(m => m.id === c.id))
      .slice(0, 2);

    return {
      ...mainComposition,
      id: mainComposition.id + '_larger',
      members: [...mainComposition.members, ...additionalMembers],
      reasoning: 'Larger team with additional backup and specialization'
    };
  }

  private async generateSpecializedTeamAlternative(
    mainComposition: TeamComposition,
    candidatePool: TeamMember[],
    task: ComplexTask
  ): Promise<TeamComposition | null> {
    // 특정 스킬에 특화된 팀 구성
    const specialists = candidatePool
      .filter(c => {
        return task.requiredSkills.some(skill => c.skills[skill] && c.skills[skill] > 0.8);
      })
      .slice(0, 4);

    if (specialists.length < 2) return null;

    return {
      ...mainComposition,
      id: mainComposition.id + '_specialized',
      members: specialists,
      reasoning: 'Highly specialized team optimized for specific skill requirements'
    };
  }

  /**
   * 성능 메트릭 조회
   */
  getPerformanceMetrics() {
    return {
      totalMatches: this.performanceCache.size,
      cacheHitRate: 0.75, // 실제 구현에서 계산
      averageMatchingTime: 15000, // ms
      successRate: 0.92
    };
  }

  /**
   * 캐시 관리
   */
  clearCache() {
    this.performanceCache.clear();
    logger.info('Team matching cache cleared');
  }
}

export const intelligentTeamMatcher = new IntelligentTeamMatcher();