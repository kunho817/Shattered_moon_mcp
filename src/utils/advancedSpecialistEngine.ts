/**
 * 고급 전문가 엔진
 * 동적 전문가 생성, AI 기반 스킬 매칭, 실시간 전문가 진화 시스템
 */

import { claudeCodeInvoker } from './claudeCodeInvoker.js';
import { enhancedClaudeCodeManager } from './enhancedClaudeCodeManager.js';
import { SPECIALISTS } from '../types/index.js';
import logger from './logger.js';

// 고급 전문가 시스템 타입 정의
export interface DynamicSpecialist {
  id: string;
  name: string;
  type: string;
  baseType: string; // 기본 전문가 유형
  level: 'junior' | 'mid' | 'senior' | 'expert' | 'master';
  skills: Record<string, SpecialistSkill>;
  expertise: string[];
  experienceYears: number;
  specializations: string[];
  adaptability: number; // 0-1, 새로운 기술 학습 능력
  creativity: number; // 0-1, 혁신적 솔루션 제안 능력
  collaboration: number; // 0-1, 팀 협업 능력
  leadership: number; // 0-1, 리더십 능력
  problemSolving: number; // 0-1, 문제 해결 능력
  currentProjects: string[];
  availability: number; // 0-1
  workload: number; // 0-1
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
  level: number; // 0-1
  confidence: number; // 0-1
  lastUsed: number; // timestamp
  learningCurve: number; // improvement rate
  certifications: string[];
  practicalExperience: number; // years
  theoreticalKnowledge: number; // 0-1
  teachingAbility: number; // 0-1, 다른 사람을 가르칠 수 있는 능력
}

export interface SpecialistPerformance {
  taskCompletionRate: number; // 0-1
  qualityScore: number; // 0-1
  speedScore: number; // 0-1
  innovationScore: number; // 0-1
  reliabilityScore: number; // 0-1
  mentorshipScore: number; // 0-1
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
  effectiveness: number; // 0-1
  timeInvested: number; // hours
  context: string;
}

export interface CollaborationRecord {
  partnerId: string;
  partnerType: 'human' | 'ai' | 'specialist';
  projectId: string;
  duration: number; // hours
  effectiveness: number; // 0-1
  roleInTeam: string;
  contribution: number; // 0-1
  feedback: string;
  conflicts: number;
  resolutions: number;
}

export interface TemporaryEnhancement {
  id: string;
  type: 'skill_boost' | 'focus_mode' | 'creativity_boost' | 'speed_enhancement' | 'quality_focus';
  skill?: string;
  multiplier: number; // enhancement factor
  duration: number; // minutes
  startTime: number;
  endTime: number;
  cost: number; // resource cost
  effectiveness: number; // actual vs expected
}

export interface EmergencyCapability {
  triggerCondition: string;
  responseType: 'rapid_learning' | 'expertise_borrowing' | 'collaborative_solving' | 'creative_breakthrough';
  activationThreshold: number; // urgency level 0-1
  effectiveness: number; // 0-1
  cooldownPeriod: number; // minutes
  lastUsed: number; // timestamp
  successCount: number;
  failureCount: number;
}

export interface ProjectRecord {
  id: string;
  name: string;
  type: string;
  complexity: 'low' | 'medium' | 'high' | 'critical';
  duration: number; // hours
  role: string;
  contribution: number; // 0-1
  qualityResult: number; // 0-1
  timelineAdherence: number; // 0-1
  innovationLevel: number; // 0-1
  lessonsLearned: string[];
  skillsUsed: string[];
  skillsGained: string[];
}

export interface SpecialistEvolutionPlan {
  specialistId: string;
  currentLevel: string;
  targetLevel: string;
  evolutionPath: EvolutionStep[];
  estimatedDuration: number; // hours
  requiredResources: string[];
  successProbability: number; // 0-1
  riskFactors: string[];
  milestones: EvolutionMilestone[];
}

export interface EvolutionStep {
  stepId: string;
  name: string;
  description: string;
  requiredSkills: string[];
  learningActivities: LearningActivity[];
  estimatedTime: number; // hours
  prerequisites: string[];
  successCriteria: string[];
}

export interface LearningActivity {
  type: 'project_work' | 'mentorship' | 'training' | 'research' | 'collaboration' | 'experimentation';
  description: string;
  estimatedTime: number; // hours
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  expectedGain: number; // skill improvement 0-1
  resources: string[];
}

export interface EvolutionMilestone {
  name: string;
  description: string;
  targetDate: number; // timestamp
  successCriteria: string[];
  rewards: string[];
  skillRequirements: Record<string, number>;
}

export interface SpecialistCreationRequest {
  taskContext: string;
  requiredSkills: string[];
  complexity: 'low' | 'medium' | 'high' | 'critical';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  duration: number; // minutes
  teamContext: string;
  collaborationStyle: string;
  innovationRequired: boolean;
  leadershipRequired: boolean;
  mentorshipRequired: boolean;
  emergencyMode: boolean;
  budgetConstraints?: number;
  timeConstraints?: number;
  qualityRequirements: number; // 0-1
}

export interface SpecialistMatchResult {
  specialist: DynamicSpecialist;
  matchScore: number; // 0-1
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
  confidence: number; // 0-1
}

class AdvancedSpecialistEngine {
  private specialists: Map<string, DynamicSpecialist> = new Map();
  private evolutionPlans: Map<string, SpecialistEvolutionPlan> = new Map();
  private performanceHistory: Map<string, ProjectRecord[]> = new Map();
  
  private nextSpecialistId = 1;
  
  /**
   * 동적 전문가 생성 메인 함수
   */
  async createDynamicSpecialist(request: SpecialistCreationRequest): Promise<DynamicSpecialist> {
    const creationId = `spec_create_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    logger.info('Creating dynamic specialist', {
      creationId,
      taskContext: request.taskContext.substring(0, 100),
      requiredSkills: request.requiredSkills,
      complexity: request.complexity,
      urgency: request.urgency
    });

    try {
      // 1. 기본 전문가 유형 선택
      const baseType = await this.selectBaseSpecialistType(request);
      
      // 2. AI 기반 전문가 커스터마이징
      const customization = await this.generateSpecialistCustomization(request, baseType);
      
      // 3. 스킬 프로파일 생성
      const skillProfile = await this.generateSkillProfile(request, baseType, customization);
      
      // 4. 성능 특성 정의
      const performanceProfile = await this.generatePerformanceProfile(request, skillProfile);
      
      // 5. 학습 및 적응 능력 설정
      const adaptationProfile = await this.generateAdaptationProfile(request, customization);
      
      // 6. 응급 상황 대응 능력 설정
      const emergencyCapabilities = await this.generateEmergencyCapabilities(request, baseType);
      
      // 7. 전문가 객체 생성
      const specialist = await this.assembleSpecialist(
        baseType,
        customization,
        skillProfile,
        performanceProfile,
        adaptationProfile,
        emergencyCapabilities,
        request
      );

      // 8. 진화 계획 수립
      const evolutionPlan = await this.createEvolutionPlan(specialist, request);
      
      // 9. 등록 및 모니터링 설정
      await this.registerSpecialist(specialist, evolutionPlan);

      logger.info('Dynamic specialist created successfully', {
        creationId,
        specialistId: specialist.id,
        baseType: specialist.baseType,
        level: specialist.level,
        skillCount: Object.keys(specialist.skills).length,
        executionTime: Date.now() - startTime
      });

      return specialist;

    } catch (error) {
      logger.error('Dynamic specialist creation failed', {
        creationId,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime
      });
      throw error;
    }
  }

  /**
   * 기본 전문가 유형 선택
   */
  private async selectBaseSpecialistType(request: SpecialistCreationRequest): Promise<string> {
    const prompt = `
Select the most appropriate base specialist type for this task:

**Task Context**: ${request.taskContext}
**Required Skills**: ${request.requiredSkills.join(', ')}
**Complexity**: ${request.complexity}
**Innovation Required**: ${request.innovationRequired}
**Leadership Required**: ${request.leadershipRequired}

**Available Base Types**:
${Object.keys(SPECIALISTS).map(type => `- ${type}: ${SPECIALISTS[type as keyof typeof SPECIALISTS].description}`).join('\n')}

Consider:
1. Primary skill alignment
2. Secondary skill coverage
3. Complexity handling capability
4. Innovation requirements
5. Leadership and mentorship needs

Return just the specialist type name that best matches.
`;

    try {
      const result = await enhancedClaudeCodeManager.performEnhancedAnalysis(
        prompt,
        {
          taskId: `specialist_select_${Date.now()}`,
          timestamp: new Date(),
          sessionId: 'advanced_specialist_engine'
        }, // 빠른 선택을 위해 Sonnet 사용
        { timeout: 20000, priority: 'medium' }
      );

      const selectedType = result.response?.trim() || 'algorithm-specialist';
      
      if (selectedType in SPECIALISTS) {
        return selectedType;
      } else {
        logger.warn('AI selected invalid specialist type, using fallback', { selectedType });
        return this.selectFallbackSpecialistType(request);
      }
    } catch (error) {
      logger.warn('AI specialist type selection failed, using fallback', { error });
      return this.selectFallbackSpecialistType(request);
    }
  }

  /**
   * 전문가 커스터마이징 생성
   */
  private async generateSpecialistCustomization(
    request: SpecialistCreationRequest,
    baseType: string
  ): Promise<any> {
    const prompt = `
Generate detailed customization for a ${baseType} specialist:

**Task Requirements**:
- Context: ${request.taskContext}
- Skills: ${request.requiredSkills.join(', ')}
- Complexity: ${request.complexity}
- Duration: ${request.duration} minutes
- Team Context: ${request.teamContext}
- Quality Requirements: ${Math.round(request.qualityRequirements * 100)}%

**Base Specialist**: ${baseType}
**Base Capabilities**: ${SPECIALISTS[baseType as keyof typeof SPECIALISTS]?.capabilities.join(', ') || 'Unknown'}

Generate customizations:
1. Specialized skills beyond base capabilities
2. Experience level and years
3. Personality traits for collaboration
4. Working style preferences
5. Communication style
6. Innovation approach
7. Problem-solving methodology

Return as JSON:
{
  "experienceLevel": "junior|mid|senior|expert|master",
  "experienceYears": 8,
  "specializations": ["specialization1", "specialization2"],
  "personalityTraits": {
    "collaboration": 0.85,
    "creativity": 0.75,
    "adaptability": 0.80,
    "leadership": 0.60,
    "problemSolving": 0.90
  },
  "workingStyle": "agile|methodical|innovative|collaborative",
  "communicationStyle": "direct|collaborative|consultative|supportive",
  "innovationApproach": "incremental|breakthrough|systematic|experimental",
  "problemSolvingMethod": "analytical|creative|systematic|intuitive",
  "preferredTaskTypes": ["task_type1", "task_type2"],
  "strengthAreas": ["area1", "area2"],
  "developmentAreas": ["area1", "area2"]
}
`;

    try {
      const result = await enhancedClaudeCodeManager.performEnhancedAnalysis(
        prompt,
        {taskId: 'task', timestamp: new Date()}, // 세밀한 커스터마이징에는 Opus 사용
        { timeout: 45000, priority: 'high' }
      );

      return JSON.parse(result.response || '{}');
    } catch (error) {
      logger.warn('AI specialist customization failed, using fallback', { error });
      return this.generateFallbackCustomization(request, baseType);
    }
  }

  /**
   * 스킬 프로파일 생성
   */
  private async generateSkillProfile(
    request: SpecialistCreationRequest,
    baseType: string,
    customization: any
  ): Promise<Record<string, SpecialistSkill>> {
    const skillProfile: Record<string, SpecialistSkill> = {};
    
    // 기본 스킬 추가
    const baseSpecialist = SPECIALISTS[baseType as keyof typeof SPECIALISTS];
    if (baseSpecialist?.skills) {
      Object.entries(baseSpecialist.skills).forEach(([skill, level]) => {
        skillProfile[skill] = this.createSkillFromBase(skill, level as number, customization);
      });
    }

    // 요구되는 스킬 추가/강화
    request.requiredSkills.forEach(skill => {
      if (skillProfile[skill]) {
        // 기존 스킬 강화
        skillProfile[skill].level = Math.min(1.0, skillProfile[skill].level + 0.2);
        skillProfile[skill].confidence = Math.min(1.0, skillProfile[skill].confidence + 0.15);
      } else {
        // 새로운 스킬 추가
        skillProfile[skill] = this.createNewSkill(skill, customization.experienceLevel);
      }
    });

    // 전문화 스킬 추가
    if (customization.specializations) {
      customization.specializations.forEach((specialization: string) => {
        const specializationSkills = this.getSpecializationSkills(specialization);
        specializationSkills.forEach(skill => {
          if (!skillProfile[skill]) {
            skillProfile[skill] = this.createSpecializedSkill(skill, customization.experienceLevel);
          } else {
            skillProfile[skill].level = Math.min(1.0, skillProfile[skill].level + 0.1);
          }
        });
      });
    }

    return skillProfile;
  }

  /**
   * 성능 프로파일 생성
   */
  private async generatePerformanceProfile(
    request: SpecialistCreationRequest,
    skillProfile: Record<string, SpecialistSkill>
  ): Promise<SpecialistPerformance> {
    const avgSkillLevel = Object.values(skillProfile).reduce((sum, skill) => sum + skill.level, 0) / 
                         Object.keys(skillProfile).length;

    const basePerformance = {
      taskCompletionRate: 0.7 + (avgSkillLevel * 0.25),
      qualityScore: 0.65 + (avgSkillLevel * 0.3),
      speedScore: 0.6 + (Math.random() * 0.35), // 개인차 반영
      innovationScore: 0.5 + (Math.random() * 0.4),
      reliabilityScore: 0.75 + (avgSkillLevel * 0.2),
      mentorshipScore: 0.4 + (Math.random() * 0.5),
      recentProjects: [] as any[],
      strengths: [] as string[],
      weaknesses: [] as string[],
      improvementAreas: [] as string[]
    };

    // 복잡도와 요구사항에 따른 조정
    if (request.complexity === 'critical') {
      basePerformance.qualityScore *= 1.1;
      basePerformance.reliabilityScore *= 1.15;
    }

    if (request.innovationRequired) {
      basePerformance.innovationScore *= 1.3;
    }

    // Update with computed values
    basePerformance.strengths = this.identifyStrengths(skillProfile, basePerformance);
    basePerformance.weaknesses = this.identifyWeaknesses(skillProfile, basePerformance);
    basePerformance.improvementAreas = this.identifyImprovementAreas(skillProfile, request);
    
    return basePerformance;
  }

  /**
   * 적응 프로파일 생성
   */
  private async generateAdaptationProfile(
    request: SpecialistCreationRequest,
    customization: any
  ): Promise<{ learningHistory: LearningRecord[]; adaptability: number }> {
    const adaptability = customization.personalityTraits?.adaptability || (0.6 + Math.random() * 0.3);
    
    // 초기 학습 히스토리 생성 (경험을 시뮬레이션)
    const learningHistory: LearningRecord[] = [];
    const experienceMonths = this.experienceLevelToYears(customization.experienceLevel) * 12;
    
    // 경험에 따른 학습 기록 생성
    for (let i = 0; i < Math.min(10, Math.floor(experienceMonths / 6)); i++) {
      learningHistory.push({
        timestamp: Date.now() - (Math.random() * experienceMonths * 30 * 24 * 60 * 60 * 1000),
        skill: request.requiredSkills[Math.floor(Math.random() * request.requiredSkills.length)],
        beforeLevel: Math.random() * 0.5,
        afterLevel: 0.5 + Math.random() * 0.4,
        learningMethod: ['project', 'training', 'mentorship', 'self_study'][Math.floor(Math.random() * 4)] as any,
        effectiveness: 0.6 + Math.random() * 0.35,
        timeInvested: 20 + Math.random() * 100,
        context: `Previous project learning experience`
      });
    }

    return { learningHistory, adaptability };
  }

  /**
   * 응급 상황 대응 능력 생성
   */
  private async generateEmergencyCapabilities(
    request: SpecialistCreationRequest,
    baseType: string
  ): Promise<EmergencyCapability[]> {
    const capabilities: EmergencyCapability[] = [];

    // 기본 응급 대응 능력
    capabilities.push({
      triggerCondition: 'Critical deadline approaching',
      responseType: 'rapid_learning',
      activationThreshold: 0.8,
      effectiveness: 0.7 + Math.random() * 0.25,
      cooldownPeriod: 240, // 4시간
      lastUsed: 0,
      successCount: 0,
      failureCount: 0
    });

    if (request.innovationRequired) {
      capabilities.push({
        triggerCondition: 'Innovation breakthrough needed',
        responseType: 'creative_breakthrough',
        activationThreshold: 0.7,
        effectiveness: 0.6 + Math.random() * 0.3,
        cooldownPeriod: 480, // 8시간
        lastUsed: 0,
        successCount: 0,
        failureCount: 0
      });
    }

    if (request.teamContext.includes('collaboration')) {
      capabilities.push({
        triggerCondition: 'Team coordination crisis',
        responseType: 'collaborative_solving',
        activationThreshold: 0.6,
        effectiveness: 0.8 + Math.random() * 0.15,
        cooldownPeriod: 120, // 2시간
        lastUsed: 0,
        successCount: 0,
        failureCount: 0
      });
    }

    return capabilities;
  }

  /**
   * 전문가 객체 조립
   */
  private async assembleSpecialist(
    baseType: string,
    customization: any,
    skillProfile: Record<string, SpecialistSkill>,
    performanceProfile: SpecialistPerformance,
    adaptationProfile: { learningHistory: LearningRecord[]; adaptability: number },
    emergencyCapabilities: EmergencyCapability[],
    request: SpecialistCreationRequest
  ): Promise<DynamicSpecialist> {
    const specialistId = `dynamic_specialist_${this.nextSpecialistId++}_${Date.now()}`;
    
    return {
      id: specialistId,
      name: `${customization.experienceLevel.charAt(0).toUpperCase() + customization.experienceLevel.slice(1)} ${baseType}`,
      type: `Enhanced_${baseType}`,
      baseType,
      level: customization.experienceLevel,
      skills: skillProfile,
      expertise: [...(SPECIALISTS[baseType as keyof typeof SPECIALISTS]?.capabilities || []), ...customization.specializations],
      experienceYears: customization.experienceYears,
      specializations: customization.specializations,
      adaptability: adaptationProfile.adaptability,
      creativity: customization.personalityTraits?.creativity || 0.7,
      collaboration: customization.personalityTraits?.collaboration || 0.7,
      leadership: customization.personalityTraits?.leadership || 0.5,
      problemSolving: customization.personalityTraits?.problemSolving || 0.8,
      currentProjects: [],
      availability: 1.0, // 새로 생성된 전문가는 완전 가용
      workload: 0.0,
      performance: performanceProfile,
      learningHistory: adaptationProfile.learningHistory,
      collaborationHistory: [],
      temporaryEnhancements: [],
      emergencyCapabilities,
      metadata: {
        createdAt: Date.now(),
        lastUpdated: Date.now(),
        evolutionCount: 0,
        successRate: 0.85, // 초기 예상 성공률
        preferredTaskTypes: customization.preferredTaskTypes || [request.complexity],
        workingStyle: customization.workingStyle,
        communicationStyle: customization.communicationStyle
      }
    };
  }

  /**
   * 진화 계획 생성
   */
  private async createEvolutionPlan(
    specialist: DynamicSpecialist,
    request: SpecialistCreationRequest
  ): Promise<SpecialistEvolutionPlan> {
    const prompt = `
Create an evolution plan for this specialist:

**Current Specialist**:
- Type: ${specialist.type}
- Level: ${specialist.level}
- Experience: ${specialist.experienceYears} years
- Skills: ${Object.entries(specialist.skills).map(([skill, data]) => `${skill}(${Math.round(data.level*100)}%)`).join(', ')}
- Strengths: ${specialist.performance.strengths.join(', ')}
- Improvement Areas: ${specialist.performance.improvementAreas.join(', ')}

**Task Context**: ${request.taskContext}
**Required Skills**: ${request.requiredSkills.join(', ')}

Design a growth plan with:
1. Next evolution level target
2. Required skill improvements
3. Learning activities
4. Timeline and milestones
5. Success criteria

Return as JSON:
{
  "targetLevel": "senior|expert|master",
  "estimatedDuration": 160,
  "evolutionSteps": [
    {
      "stepId": "step_1",
      "name": "Skill Enhancement Phase",
      "description": "Focus on core skill development",
      "requiredSkills": ["skill1", "skill2"],
      "learningActivities": [
        {
          "type": "project_work",
          "description": "Lead complex project",
          "estimatedTime": 40,
          "difficulty": "hard",
          "expectedGain": 0.15
        }
      ],
      "estimatedTime": 80,
      "prerequisites": [],
      "successCriteria": ["criteria1", "criteria2"]
    }
  ],
  "milestones": [
    {
      "name": "Mid-point Assessment",
      "description": "Evaluate progress",
      "targetDate": 1717635600000,
      "successCriteria": ["criteria1"],
      "skillRequirements": {"skill1": 0.8}
    }
  ],
  "riskFactors": ["risk1", "risk2"],
  "successProbability": 0.85
}
`;

    try {
      const result = await enhancedClaudeCodeManager.performEnhancedAnalysis(
        prompt,
        {taskId: 'task', timestamp: new Date()},
        { timeout: 45000, priority: 'medium' }
      );

      const planData = JSON.parse(result.response || '{}');
      
      return {
        specialistId: specialist.id,
        currentLevel: specialist.level,
        targetLevel: planData.targetLevel,
        evolutionPath: planData.evolutionSteps,
        estimatedDuration: planData.estimatedDuration,
        requiredResources: ['Time allocation', 'Project assignments', 'Mentorship'],
        successProbability: planData.successProbability,
        riskFactors: planData.riskFactors,
        milestones: planData.milestones
      };
    } catch (error) {
      logger.warn('AI evolution plan generation failed, using fallback', { error });
      return this.generateFallbackEvolutionPlan(specialist);
    }
  }

  /**
   * 전문가 등록 및 모니터링 설정
   */
  private async registerSpecialist(
    specialist: DynamicSpecialist,
    evolutionPlan: SpecialistEvolutionPlan
  ): Promise<void> {
    this.specialists.set(specialist.id, specialist);
    this.evolutionPlans.set(specialist.id, evolutionPlan);
    this.performanceHistory.set(specialist.id, []);

    logger.info('Specialist registered successfully', {
      specialistId: specialist.id,
      type: specialist.type,
      level: specialist.level,
      skillCount: Object.keys(specialist.skills).length
    });
  }

  /**
   * 최적 전문가 매칭
   */
  async findBestSpecialistMatch(
    request: SpecialistCreationRequest,
    availableSpecialists?: DynamicSpecialist[]
  ): Promise<SpecialistMatchResult> {
    const candidates = availableSpecialists || Array.from(this.specialists.values());
    
    if (candidates.length === 0) {
      // 기존 전문가가 없으면 새로 생성
      const newSpecialist = await this.createDynamicSpecialist(request);
      return {
        specialist: newSpecialist,
        matchScore: 1.0,
        strengthAreas: newSpecialist.performance.strengths,
        weakAreas: newSpecialist.performance.weaknesses,
        enhancementSuggestions: [],
        riskFactors: [],
        expectedPerformance: {
          quality: newSpecialist.performance.qualityScore,
          speed: newSpecialist.performance.speedScore,
          innovation: newSpecialist.performance.innovationScore,
          collaboration: newSpecialist.collaboration
        },
        confidence: 0.9
      };
    }

    // 매칭 점수 계산
    const matchResults = await Promise.all(
      candidates.map(async (specialist) => {
        const matchScore = await this.calculateMatchScore(specialist, request);
        const enhancements = await this.suggestTemporaryEnhancements(specialist, request);
        
        return {
          specialist,
          matchScore,
          strengthAreas: this.identifyMatchStrengths(specialist, request),
          weakAreas: this.identifyMatchWeaknesses(specialist, request),
          enhancementSuggestions: enhancements,
          riskFactors: this.assessMatchRisks(specialist, request),
          expectedPerformance: this.predictPerformance(specialist, request),
          confidence: this.calculateMatchConfidence(specialist, request, matchScore)
        };
      })
    );

    // 최고 매칭 점수 선택
    matchResults.sort((a, b) => b.matchScore - a.matchScore);
    
    const bestMatch = matchResults[0];
    
    logger.info('Best specialist match found', {
      specialistId: bestMatch.specialist.id,
      matchScore: bestMatch.matchScore,
      confidence: bestMatch.confidence
    });

    return bestMatch;
  }

  /**
   * 전문가 성능 업데이트
   */
  async updateSpecialistPerformance(
    specialistId: string,
    projectRecord: ProjectRecord
  ): Promise<void> {
    const specialist = this.specialists.get(specialistId);
    if (!specialist) {
      throw new Error(`Specialist ${specialistId} not found`);
    }

    // 성능 히스토리 업데이트
    const history = this.performanceHistory.get(specialistId) || [];
    history.push(projectRecord);
    this.performanceHistory.set(specialistId, history);

    // 성능 메트릭 재계산
    specialist.performance = await this.recalculatePerformance(specialist, history);
    
    // 스킬 레벨 업데이트 (사용한 스킬들의 경험치 증가)
    projectRecord.skillsUsed.forEach(skill => {
      if (specialist.skills[skill]) {
        specialist.skills[skill].level = Math.min(1.0, specialist.skills[skill].level + 0.02);
        specialist.skills[skill].lastUsed = Date.now();
        specialist.skills[skill].practicalExperience += projectRecord.duration / 8; // 8시간 = 1일 경험
      }
    });

    // 새로운 스킬 추가
    projectRecord.skillsGained.forEach(skill => {
      if (!specialist.skills[skill]) {
        specialist.skills[skill] = this.createNewSkill(skill, specialist.level);
      }
    });

    // 학습 기록 추가
    if (projectRecord.skillsGained.length > 0) {
      specialist.learningHistory.push({
        timestamp: Date.now(),
        skill: projectRecord.skillsGained[0], // 주요 습득 스킬
        beforeLevel: 0,
        afterLevel: specialist.skills[projectRecord.skillsGained[0]].level,
        learningMethod: 'project',
        effectiveness: projectRecord.qualityResult,
        timeInvested: projectRecord.duration,
        context: `Project: ${projectRecord.name}`
      });
    }

    // 진화 상태 체크
    await this.checkEvolutionTrigger(specialist);

    specialist.metadata.lastUpdated = Date.now();
    specialist.metadata.successRate = history.reduce((sum, record) => sum + record.qualityResult, 0) / history.length;

    logger.info('Specialist performance updated', {
      specialistId,
      newSuccessRate: specialist.metadata.successRate,
      skillsGained: projectRecord.skillsGained.length
    });
  }

  /**
   * 유틸리티 메서드들
   */
  private selectFallbackSpecialistType(request: SpecialistCreationRequest): string {
    // 스킬 기반 기본 선택
    const specialistTypes = Object.keys(SPECIALISTS);
    
    for (const type of specialistTypes) {
      const specialist = SPECIALISTS[type as keyof typeof SPECIALISTS];
      if (specialist.skills && request.requiredSkills.some(skill => skill in specialist.skills)) {
        return type;
      }
    }

    return specialistTypes[0] || 'dx12-specialist'; // 기본값
  }

  private generateFallbackCustomization(request: SpecialistCreationRequest, baseType: string): any {
    return {
      experienceLevel: request.complexity === 'critical' ? 'expert' : 
                     request.complexity === 'high' ? 'senior' : 'mid',
      experienceYears: 5 + Math.floor(Math.random() * 10),
      specializations: request.requiredSkills.slice(0, 2),
      personalityTraits: {
        collaboration: 0.7 + Math.random() * 0.25,
        creativity: 0.6 + Math.random() * 0.3,
        adaptability: 0.65 + Math.random() * 0.3,
        leadership: request.leadershipRequired ? 0.8 : 0.5,
        problemSolving: 0.75 + Math.random() * 0.2
      },
      workingStyle: 'agile',
      communicationStyle: 'collaborative',
      innovationApproach: 'systematic',
      problemSolvingMethod: 'analytical',
      preferredTaskTypes: [request.complexity],
      strengthAreas: request.requiredSkills.slice(0, 2),
      developmentAreas: ['communication', 'leadership']
    };
  }

  private createSkillFromBase(skill: string, baseLevel: number, customization: any): SpecialistSkill {
    const levelMultiplier = this.experienceLevelToMultiplier(customization.experienceLevel);
    
    return {
      level: Math.min(1.0, baseLevel * levelMultiplier),
      confidence: Math.min(1.0, baseLevel * levelMultiplier * 0.9),
      lastUsed: Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000), // 최근 30일 내
      learningCurve: 0.1 + Math.random() * 0.1,
      certifications: [],
      practicalExperience: customization.experienceYears * 0.7,
      theoreticalKnowledge: Math.min(1.0, baseLevel * levelMultiplier * 1.1),
      teachingAbility: Math.max(0, (baseLevel * levelMultiplier) - 0.3)
    };
  }

  private createNewSkill(skill: string, experienceLevel: string): SpecialistSkill {
    const baseLevel = this.experienceLevelToSkillLevel(experienceLevel);
    
    return {
      level: baseLevel + Math.random() * 0.2,
      confidence: baseLevel * 0.8,
      lastUsed: 0,
      learningCurve: 0.05 + Math.random() * 0.15,
      certifications: [],
      practicalExperience: 0,
      theoreticalKnowledge: baseLevel * 1.2,
      teachingAbility: Math.max(0, baseLevel - 0.4)
    };
  }

  private createSpecializedSkill(skill: string, experienceLevel: string): SpecialistSkill {
    const newSkill = this.createNewSkill(skill, experienceLevel);
    newSkill.level += 0.15; // 전문화 보너스
    newSkill.confidence += 0.1;
    return newSkill;
  }

  private getSpecializationSkills(specialization: string): string[] {
    const specializationMap: Record<string, string[]> = {
      'performance_optimization': ['profiling', 'caching', 'parallel_processing'],
      'graphics_programming': ['hlsl', 'directx12', 'vulkan', 'opengl'],
      'memory_management': ['heap_management', 'garbage_collection', 'memory_profiling'],
      'ai_systems': ['machine_learning', 'neural_networks', 'decision_trees'],
      'networking': ['tcp_ip', 'udp', 'websockets', 'p2p'],
      'database_design': ['sql', 'nosql', 'indexing', 'query_optimization']
    };

    return specializationMap[specialization] || [specialization];
  }

  private experienceLevelToYears(level: string): number {
    const levelMap = {
      'junior': 1 + Math.random() * 2,
      'mid': 3 + Math.random() * 3,
      'senior': 6 + Math.random() * 4,
      'expert': 10 + Math.random() * 5,
      'master': 15 + Math.random() * 10
    };
    return levelMap[level as keyof typeof levelMap] || 5;
  }

  private experienceLevelToMultiplier(level: string): number {
    const multiplierMap = {
      'junior': 0.6,
      'mid': 0.8,
      'senior': 1.0,
      'expert': 1.2,
      'master': 1.4
    };
    return multiplierMap[level as keyof typeof multiplierMap] || 1.0;
  }

  private experienceLevelToSkillLevel(level: string): number {
    const skillMap = {
      'junior': 0.3,
      'mid': 0.5,
      'senior': 0.7,
      'expert': 0.85,
      'master': 0.95
    };
    return skillMap[level as keyof typeof skillMap] || 0.5;
  }

  private identifyStrengths(skillProfile: Record<string, SpecialistSkill>, performance: SpecialistPerformance): string[] {
    const strengths: string[] = [];
    
    // 높은 스킬 레벨 영역
    Object.entries(skillProfile).forEach(([skill, data]) => {
      if (data.level > 0.8) {
        strengths.push(skill);
      }
    });

    // 성능 기반 강점
    if (performance.qualityScore > 0.8) strengths.push('high_quality_delivery');
    if (performance.speedScore > 0.8) strengths.push('fast_execution');
    if (performance.innovationScore > 0.8) strengths.push('innovation');
    if (performance.reliabilityScore > 0.8) strengths.push('reliability');

    return strengths.slice(0, 5); // 최대 5개
  }

  private identifyWeaknesses(skillProfile: Record<string, SpecialistSkill>, performance: SpecialistPerformance): string[] {
    const weaknesses: string[] = [];
    
    // 낮은 성능 영역
    if (performance.speedScore < 0.6) weaknesses.push('execution_speed');
    if (performance.innovationScore < 0.5) weaknesses.push('innovation');
    if (performance.mentorshipScore < 0.4) weaknesses.push('mentorship');

    return weaknesses;
  }

  private identifyImprovementAreas(skillProfile: Record<string, SpecialistSkill>, request: SpecialistCreationRequest): string[] {
    const areas: string[] = [];
    
    // 요구 스킬 중 부족한 영역
    request.requiredSkills.forEach(skill => {
      if (!skillProfile[skill] || skillProfile[skill].level < 0.7) {
        areas.push(skill);
      }
    });

    return areas.slice(0, 3);
  }

  private async calculateMatchScore(specialist: DynamicSpecialist, request: SpecialistCreationRequest): Promise<number> {
    let score = 0;

    // 스킬 매칭 (40%)
    const skillMatch = this.calculateSkillMatch(specialist, request);
    score += skillMatch * 0.4;

    // 경험 레벨 적합성 (20%)
    const experienceMatch = this.calculateExperienceMatch(specialist, request);
    score += experienceMatch * 0.2;

    // 가용성 (15%)
    score += specialist.availability * 0.15;

    // 성능 히스토리 (15%)
    const performanceScore = (specialist.performance.taskCompletionRate + specialist.performance.qualityScore) / 2;
    score += performanceScore * 0.15;

    // 혁신 요구사항 매칭 (10%)
    if (request.innovationRequired) {
      score += specialist.creativity * 0.1;
    } else {
      score += 0.1;
    }

    return Math.min(1.0, score);
  }

  private calculateSkillMatch(specialist: DynamicSpecialist, request: SpecialistCreationRequest): number {
    const requiredSkills = request.requiredSkills;
    let totalMatch = 0;

    requiredSkills.forEach(skill => {
      if (specialist.skills[skill]) {
        totalMatch += specialist.skills[skill].level;
      }
    });

    return requiredSkills.length > 0 ? totalMatch / requiredSkills.length : 0;
  }

  private calculateExperienceMatch(specialist: DynamicSpecialist, request: SpecialistCreationRequest): number {
    const complexityLevelMap = {
      'low': ['junior', 'mid'],
      'medium': ['mid', 'senior'],
      'high': ['senior', 'expert'],
      'critical': ['expert', 'master']
    };

    const appropriateLevels = complexityLevelMap[request.complexity];
    return appropriateLevels.includes(specialist.level) ? 1.0 : 0.6;
  }

  private identifyMatchStrengths(specialist: DynamicSpecialist, request: SpecialistCreationRequest): string[] {
    const strengths: string[] = [];
    
    request.requiredSkills.forEach(skill => {
      if (specialist.skills[skill] && specialist.skills[skill].level > 0.8) {
        strengths.push(`Excellent ${skill} skills`);
      }
    });

    return strengths;
  }

  private identifyMatchWeaknesses(specialist: DynamicSpecialist, request: SpecialistCreationRequest): string[] {
    const weaknesses: string[] = [];
    
    request.requiredSkills.forEach(skill => {
      if (!specialist.skills[skill] || specialist.skills[skill].level < 0.5) {
        weaknesses.push(`Limited ${skill} experience`);
      }
    });

    return weaknesses;
  }

  private async suggestTemporaryEnhancements(specialist: DynamicSpecialist, request: SpecialistCreationRequest): Promise<TemporaryEnhancement[]> {
    const enhancements: TemporaryEnhancement[] = [];

    // 스킬 부족 영역에 대한 임시 강화
    request.requiredSkills.forEach(skill => {
      if (!specialist.skills[skill] || specialist.skills[skill].level < 0.7) {
        enhancements.push({
          id: `enhance_${skill}_${Date.now()}`,
          type: 'skill_boost',
          skill,
          multiplier: 1.3,
          duration: request.duration,
          startTime: Date.now(),
          endTime: Date.now() + (request.duration * 60 * 1000),
          cost: 10,
          effectiveness: 0.8
        });
      }
    });

    // 긴급 모드인 경우 속도 강화
    if (request.urgency === 'critical') {
      enhancements.push({
        id: `speed_boost_${Date.now()}`,
        type: 'speed_enhancement',
        multiplier: 1.5,
        duration: request.duration,
        startTime: Date.now(),
        endTime: Date.now() + (request.duration * 60 * 1000),
        cost: 15,
        effectiveness: 0.75
      });
    }

    return enhancements.slice(0, 3); // 최대 3개
  }

  private assessMatchRisks(specialist: DynamicSpecialist, request: SpecialistCreationRequest): string[] {
    const risks: string[] = [];

    if (specialist.workload > 0.8) {
      risks.push('High current workload may affect performance');
    }

    if (specialist.performance.reliabilityScore < 0.7) {
      risks.push('Reliability concerns based on history');
    }

    const skillGap = request.requiredSkills.filter(skill => 
      !specialist.skills[skill] || specialist.skills[skill].level < 0.5
    ).length;

    if (skillGap > 0) {
      risks.push(`${skillGap} required skills below proficiency level`);
    }

    return risks;
  }

  private predictPerformance(specialist: DynamicSpecialist, request: SpecialistCreationRequest): any {
    const basePerformance = specialist.performance;
    
    // 요구사항에 따른 성능 예측 조정
    let qualityMultiplier = 1.0;
    let speedMultiplier = 1.0;
    let innovationMultiplier = 1.0;
    let collaborationMultiplier = 1.0;

    // 복잡도에 따른 조정
    if (request.complexity === 'critical' && specialist.level !== 'expert' && specialist.level !== 'master') {
      qualityMultiplier *= 0.9;
      speedMultiplier *= 0.8;
    }

    // 스킬 매칭에 따른 조정
    const skillMatch = this.calculateSkillMatch(specialist, request);
    qualityMultiplier *= (0.7 + skillMatch * 0.3);
    speedMultiplier *= (0.8 + skillMatch * 0.2);

    return {
      quality: Math.min(1.0, basePerformance.qualityScore * qualityMultiplier),
      speed: Math.min(1.0, basePerformance.speedScore * speedMultiplier),
      innovation: Math.min(1.0, basePerformance.innovationScore * innovationMultiplier),
      collaboration: Math.min(1.0, specialist.collaboration * collaborationMultiplier)
    };
  }

  private calculateMatchConfidence(specialist: DynamicSpecialist, request: SpecialistCreationRequest, matchScore: number): number {
    let confidence = matchScore;

    // 과거 성과에 따른 신뢰도 조정
    if (specialist.metadata.successRate > 0.8) confidence += 0.1;
    if (specialist.metadata.successRate < 0.6) confidence -= 0.1;

    // 경험 기반 조정
    const history = this.performanceHistory.get(specialist.id);
    if (history && history.length > 5) {
      confidence += 0.05; // 충분한 데이터
    } else {
      confidence -= 0.05; // 데이터 부족
    }

    return Math.max(0, Math.min(1.0, confidence));
  }

  private async recalculatePerformance(specialist: DynamicSpecialist, history: ProjectRecord[]): Promise<SpecialistPerformance> {
    if (history.length === 0) return specialist.performance;

    const recent = history.slice(-10); // 최근 10개 프로젝트
    
    return {
      taskCompletionRate: recent.reduce((sum, p) => sum + (p.contribution > 0.8 ? 1 : 0), 0) / recent.length,
      qualityScore: recent.reduce((sum, p) => sum + p.qualityResult, 0) / recent.length,
      speedScore: recent.reduce((sum, p) => sum + p.timelineAdherence, 0) / recent.length,
      innovationScore: recent.reduce((sum, p) => sum + p.innovationLevel, 0) / recent.length,
      reliabilityScore: recent.filter(p => p.timelineAdherence > 0.8).length / recent.length,
      mentorshipScore: specialist.performance.mentorshipScore, // 별도 계산 필요
      recentProjects: recent,
      strengths: this.identifyStrengths(specialist.skills, specialist.performance),
      weaknesses: this.identifyWeaknesses(specialist.skills, specialist.performance),
      improvementAreas: recent.flatMap(p => p.lessonsLearned).slice(0, 3)
    };
  }

  private async checkEvolutionTrigger(specialist: DynamicSpecialist): Promise<void> {
    const evolutionPlan = this.evolutionPlans.get(specialist.id);
    if (!evolutionPlan) return;

    // 진화 조건 체크
    const avgSkillLevel = Object.values(specialist.skills).reduce((sum, skill) => sum + skill.level, 0) / 
                         Object.keys(specialist.skills).length;

    const shouldEvolve = avgSkillLevel > 0.85 && 
                        specialist.metadata.successRate > 0.8 &&
                        specialist.performance.qualityScore > 0.8;

    if (shouldEvolve) {
      await this.triggerEvolution(specialist, evolutionPlan);
    }
  }

  private async triggerEvolution(specialist: DynamicSpecialist, plan: SpecialistEvolutionPlan): Promise<void> {
    const levelMap = ['junior', 'mid', 'senior', 'expert', 'master'];
    const currentIndex = levelMap.indexOf(specialist.level);
    
    if (currentIndex < levelMap.length - 1) {
      specialist.level = levelMap[currentIndex + 1] as any;
      specialist.metadata.evolutionCount++;
      specialist.metadata.lastUpdated = Date.now();
      
      // 스킬 레벨 향상
      Object.values(specialist.skills).forEach(skill => {
        skill.level = Math.min(1.0, skill.level + 0.1);
        skill.confidence = Math.min(1.0, skill.confidence + 0.05);
      });

      logger.info('Specialist evolved', {
        specialistId: specialist.id,
        newLevel: specialist.level,
        evolutionCount: specialist.metadata.evolutionCount
      });
    }
  }

  private generateFallbackEvolutionPlan(specialist: DynamicSpecialist): SpecialistEvolutionPlan {
    return {
      specialistId: specialist.id,
      currentLevel: specialist.level,
      targetLevel: specialist.level === 'junior' ? 'mid' : 'senior',
      evolutionPath: [
        {
          stepId: 'step_1',
          name: 'Skill Development',
          description: 'Focus on core skill improvement',
          requiredSkills: Object.keys(specialist.skills).slice(0, 3),
          learningActivities: [
            {
              type: 'project_work',
              description: 'Complete challenging projects',
              estimatedTime: 80,
              difficulty: 'medium',
              expectedGain: 0.1,
              resources: ['Time', 'Guidance']
            }
          ],
          estimatedTime: 120,
          prerequisites: [],
          successCriteria: ['Improved skill levels', 'Successful project completion']
        }
      ],
      estimatedDuration: 120,
      requiredResources: ['Time allocation', 'Project assignments'],
      successProbability: 0.8,
      riskFactors: ['Time constraints', 'Resource availability'],
      milestones: [
        {
          name: 'Mid-point Review',
          description: 'Assess progress halfway through',
          targetDate: Date.now() + (60 * 24 * 60 * 60 * 1000), // 60 days
          successCriteria: ['Skill improvement visible'],
          skillRequirements: {},
          rewards: ['Performance bonus', 'Skill certification']
        }
      ]
    };
  }

  /**
   * 전문가 상태 조회
   */
  getSpecialist(specialistId: string): DynamicSpecialist | undefined {
    return this.specialists.get(specialistId);
  }

  /**
   * 모든 전문가 조회
   */
  getAllSpecialists(): DynamicSpecialist[] {
    return Array.from(this.specialists.values());
  }

  /**
   * 전문가 성능 메트릭 조회
   */
  getPerformanceMetrics() {
    return {
      totalSpecialists: this.specialists.size,
      averageSuccessRate: this.calculateAverageSuccessRate(),
      specializationDistribution: this.getSpecializationDistribution(),
      levelDistribution: this.getLevelDistribution(),
      totalEvolutions: this.getTotalEvolutions()
    };
  }

  private calculateAverageSuccessRate(): number {
    const specialists = Array.from(this.specialists.values());
    if (specialists.length === 0) return 0;
    
    return specialists.reduce((sum, s) => sum + s.metadata.successRate, 0) / specialists.length;
  }

  private getSpecializationDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    Array.from(this.specialists.values()).forEach(specialist => {
      specialist.specializations.forEach(spec => {
        distribution[spec] = (distribution[spec] || 0) + 1;
      });
    });

    return distribution;
  }

  private getLevelDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    Array.from(this.specialists.values()).forEach(specialist => {
      distribution[specialist.level] = (distribution[specialist.level] || 0) + 1;
    });

    return distribution;
  }

  private getTotalEvolutions(): number {
    return Array.from(this.specialists.values()).reduce((sum, s) => sum + s.metadata.evolutionCount, 0);
  }

  /**
   * 시스템 초기화
   */
  reset(): void {
    this.specialists.clear();
    this.evolutionPlans.clear();
    this.performanceHistory.clear();
    this.nextSpecialistId = 1;
    logger.info('Advanced specialist engine reset');
  }
}

export const advancedSpecialistEngine = new AdvancedSpecialistEngine();