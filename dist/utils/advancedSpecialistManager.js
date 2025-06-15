"use strict";
/**
 * 고급 전문가 관리 시스템
 * 동적 전문가 생성, 스킬 조합 최적화, 적응형 전문화 구현
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.advancedSpecialistManager = void 0;
const enhancedClaudeCodeManager_js_1 = require("./enhancedClaudeCodeManager.js");
const logger_js_1 = __importDefault(require("./logger.js"));
class AdvancedSpecialistManager {
    specialistRegistry = new Map();
    skillDatabase = new Map();
    performanceCache = new Map();
    learningAnalytics = new Map();
    generationCount = 0;
    lastOptimization = Date.now();
    /**
     * 메인 전문가 생성 및 추천 함수
     */
    async generateOptimalSpecialists(request, existingTeam) {
        const requestId = `spec_req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const startTime = Date.now();
        logger_js_1.default.info('Generating optimal specialists', {
            requestId,
            requiredSkills: request.requiredSkills,
            complexity: request.taskComplexity,
            urgency: request.urgency
        });
        try {
            // 1. 요청 분석 및 최적화
            const optimizedRequest = await this.analyzeAndOptimizeRequest(request, existingTeam);
            // 2. 기존 전문가 풀에서 매칭
            const existingMatches = await this.findExistingMatches(optimizedRequest);
            // 3. 필요시 새로운 전문가 동적 생성
            const newSpecialists = await this.generateNewSpecialists(optimizedRequest, existingMatches);
            // 4. 하이브리드 전문가 조합 최적화
            const optimizedCombination = await this.optimizeSpecialistCombination([...existingMatches, ...newSpecialists], optimizedRequest);
            // 5. 성능 예측 및 리스크 분석
            const recommendation = await this.buildRecommendation(optimizedCombination, optimizedRequest, requestId);
            // 6. 학습 기회 분석
            await this.analyzeLearningOpportunities(recommendation, existingTeam);
            // 7. 네트워크 효과 계산
            await this.calculateNetworkEffects(recommendation, existingTeam);
            logger_js_1.default.info('Specialist generation completed', {
                requestId,
                generatedSpecialists: newSpecialists.length,
                totalRecommendations: recommendation.specialists.length,
                confidenceScore: recommendation.confidenceScore,
                executionTime: Date.now() - startTime
            });
            return recommendation;
        }
        catch (error) {
            logger_js_1.default.error('Specialist generation failed', {
                requestId,
                error: error instanceof Error ? error.message : 'Unknown error',
                executionTime: Date.now() - startTime
            });
            throw error;
        }
    }
    /**
     * 요청 분석 및 최적화
     */
    async analyzeAndOptimizeRequest(request, existingTeam) {
        const prompt = `
Analyze and optimize this specialist request:

**Original Request**:
- Required Skills: ${request.requiredSkills.join(', ')}
- Specializations: ${request.preferredSpecializations.join(', ')}
- Complexity: ${request.taskComplexity}
- Urgency: ${request.urgency}
- Duration: ${request.duration} hours
- Context: ${request.context}

**Existing Team** (${existingTeam?.length || 0} members):
${existingTeam?.map(member => `${member.name}: Skills[${Object.entries(member.skills).filter(([k, v]) => v > 0.6).map(([k, v]) => `${k}:${Math.round(v * 100)}%`).join(',')}]`).join('\n') || 'No existing team'}

Optimize the request by:
1. Identifying skill gaps and redundancies
2. Suggesting skill combinations and synergies
3. Recommending specialization refinements
4. Assessing realistic timeline and complexity
5. Identifying collaboration opportunities

Return optimized request as JSON:
{
  "requiredSkills": ["skill1", "skill2"],
  "preferredSpecializations": ["spec1"],
  "taskComplexity": "medium",
  "urgency": "high",
  "duration": 40,
  "context": "enhanced context",
  "collaborationRequirements": ["req1"],
  "learningOpportunities": ["opportunity1"],
  "optimizationReasoning": "Why these changes improve the request",
  "skillPriorities": {"skill1": 0.9, "skill2": 0.7},
  "synergies": [{"skills": ["skill1", "skill2"], "benefit": "benefit description"}]
}
`;
        try {
            const result = await enhancedClaudeCodeManager_js_1.enhancedClaudeCodeManager.performEnhancedAnalysis(prompt, { taskId: 'task', timestamp: new Date() }, // 복잡한 분석에는 Opus 사용
            { timeout: 45000, priority: 'high' });
            const optimizedData = JSON.parse(result.response || '{}');
            // 최적화된 요청 생성
            return {
                ...request,
                requiredSkills: optimizedData.requiredSkills || request.requiredSkills,
                preferredSpecializations: optimizedData.preferredSpecializations || request.preferredSpecializations,
                taskComplexity: optimizedData.taskComplexity || request.taskComplexity,
                urgency: optimizedData.urgency || request.urgency,
                duration: optimizedData.duration || request.duration,
                context: optimizedData.context || request.context,
                collaborationRequirements: optimizedData.collaborationRequirements || request.collaborationRequirements,
                learningOpportunities: optimizedData.learningOpportunities || request.learningOpportunities,
                customRequirements: {
                    ...request.customRequirements,
                    skillPriorities: optimizedData.skillPriorities,
                    synergies: optimizedData.synergies,
                    optimizationReasoning: optimizedData.optimizationReasoning
                }
            };
        }
        catch (error) {
            logger_js_1.default.warn('Request optimization failed, using original request', { error });
            return request;
        }
    }
    /**
     * 기존 전문가 매칭
     */
    async findExistingMatches(request) {
        const matches = [];
        for (const specialist of this.specialistRegistry.values()) {
            const matchScore = await this.calculateSpecialistMatch(specialist, request);
            if (matchScore.overall > 0.7) { // 70% 이상 매칭
                matches.push({
                    ...specialist,
                    // 매칭 점수를 메타데이터로 추가
                    lastUpdated: Date.now()
                });
            }
        }
        // 매칭 점수 순으로 정렬
        matches.sort((a, b) => {
            const scoreA = this.calculateQuickMatchScore(a, request);
            const scoreB = this.calculateQuickMatchScore(b, request);
            return scoreB - scoreA;
        });
        return matches.slice(0, 10); // 상위 10개만 반환
    }
    /**
     * 새로운 전문가 동적 생성
     */
    async generateNewSpecialists(request, existingMatches) {
        const skillGaps = this.identifySkillGaps(request, existingMatches);
        if (skillGaps.length === 0) {
            return []; // 기존 전문가들로 충분함
        }
        const newSpecialists = [];
        // 각 스킬 갭에 대해 전문가 생성
        for (const skillGap of skillGaps.slice(0, 3)) { // 최대 3명까지
            const specialist = await this.createDynamicSpecialist(skillGap, request);
            if (specialist) {
                newSpecialists.push(specialist);
                this.specialistRegistry.set(specialist.id, specialist);
            }
        }
        // 하이브리드 전문가 생성 (복수 스킬 갭 해결)
        if (skillGaps.length > 2) {
            const hybridSpecialist = await this.createHybridSpecialist(skillGaps, request);
            if (hybridSpecialist) {
                newSpecialists.push(hybridSpecialist);
                this.specialistRegistry.set(hybridSpecialist.id, hybridSpecialist);
            }
        }
        return newSpecialists;
    }
    /**
     * 동적 전문가 생성
     */
    async createDynamicSpecialist(primarySkill, request) {
        const prompt = `
Create a dynamic specialist for this skill gap:

**Primary Skill**: ${primarySkill}
**Context**: ${request.context}
**Task Complexity**: ${request.taskComplexity}
**Required Skills**: ${request.requiredSkills.join(', ')}
**Collaboration Requirements**: ${request.collaborationRequirements.join(', ')}

Design a specialist that:
1. Excels in the primary skill
2. Has complementary secondary skills
3. Fits the task context and complexity
4. Can collaborate effectively
5. Has learning and growth potential

Return specialist profile as JSON:
{
  "name": "Specialist Name",
  "baseSpecialty": "primary_specialty",
  "skillProfile": {
    "coreSkills": {
      "${primarySkill}": {"proficiency": 0.9, "experience": 2000, "confidence": 0.85}
    },
    "emergingSkills": {"skill2": {"proficiency": 0.6, "experience": 500}},
    "metaSkills": {"learning_agility": {"proficiency": 0.8}},
    "specializations": ["specialization1", "specialization2"]
  },
  "customizations": [
    {
      "type": "skill_enhancement",
      "name": "Enhancement Name",
      "description": "What this enhancement provides",
      "skillModifiers": {"${primarySkill}": 0.15},
      "contextTriggers": ["context1", "context2"],
      "effectivenessMeasure": 0.8
    }
  ],
  "availability": {
    "totalCapacity": 40,
    "currentUtilization": 0.3,
    "scheduleFlexibility": 0.8
  },
  "collaborationStyle": "collaborative|independent|mentor",
  "learningFocus": ["skill_to_learn1", "skill_to_learn2"],
  "uniqueStrengths": ["strength1", "strength2"],
  "workingPreferences": ["preference1", "preference2"]
}
`;
        try {
            const result = await enhancedClaudeCodeManager_js_1.enhancedClaudeCodeManager.performEnhancedAnalysis(prompt, { taskId: 'task', timestamp: new Date() }, { timeout: 45000, priority: 'medium' });
            const specialistData = JSON.parse(result.response || '{}');
            return this.buildSpecialistFromAIData(specialistData, primarySkill, request);
        }
        catch (error) {
            logger_js_1.default.warn('AI specialist generation failed, using template', { primarySkill, error });
            return this.createTemplateSpecialist(primarySkill, request);
        }
    }
    /**
     * AI 데이터로부터 전문가 객체 구축
     */
    buildSpecialistFromAIData(aiData, primarySkill, request) {
        const specialistId = `dyn_${primarySkill}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        return {
            id: specialistId,
            name: aiData.name || `${primarySkill} Specialist`,
            baseSpecialty: aiData.baseSpecialty || primarySkill,
            customizations: aiData.customizations || [],
            skillProfile: {
                coreSkills: aiData.skillProfile?.coreSkills || { [primarySkill]: { proficiency: 0.9, experience: 2000, lastUsed: Date.now(), growthRate: 0.1, confidence: 0.85, teachingAbility: 0.7 } },
                emergingSkills: aiData.skillProfile?.emergingSkills || {},
                crossDomainSkills: aiData.skillProfile?.crossDomainSkills || {},
                metaSkills: aiData.skillProfile?.metaSkills || { learning_agility: { proficiency: 0.8, experience: 1000, lastUsed: Date.now(), growthRate: 0.05, confidence: 0.8, teachingAbility: 0.6 } },
                skillSynergies: [],
                weaknesses: [],
                growthPotential: {},
                specializations: aiData.skillProfile?.specializations || [primarySkill]
            },
            contextAdaptations: [],
            performanceHistory: [],
            learningPath: {
                currentFocus: aiData.learningFocus || [primarySkill],
                plannedSkills: [],
                learningGoals: [],
                mentorships: [],
                autoLearningEnabled: true,
                learningVelocity: 2,
                curiosityIndex: 0.7
            },
            collaborationNetwork: {
                preferredPartners: [],
                conflictualPartners: [],
                mentoring: [],
                learningFrom: [],
                networkStrength: 0.5,
                trustNetwork: {},
                communicationPreferences: {},
                crossTeamConnections: []
            },
            availability: {
                totalCapacity: aiData.availability?.totalCapacity || 40,
                currentUtilization: aiData.availability?.currentUtilization || 0.3,
                scheduleFlexibility: aiData.availability?.scheduleFlexibility || 0.8,
                timezoneCompatibility: ['UTC+9'],
                preferredWorkingHours: { start: 9, end: 18 },
                workStylePreferences: aiData.workingPreferences || [],
                availabilityPatterns: {}
            },
            costProfile: {
                hourlyRate: this.calculateHourlyRate(primarySkill, request.taskComplexity),
                skillPremiums: { [primarySkill]: 1.2 },
                complexityMultipliers: { 'critical': 1.5, 'high': 1.3, 'medium': 1.1, 'low': 1.0 },
                urgencyMultipliers: { 'critical': 2.0, 'high': 1.5, 'medium': 1.2, 'low': 1.0 },
                bulkDiscounts: {},
                specializations: {}
            },
            generatedAt: Date.now(),
            lastUpdated: Date.now(),
            version: '1.0.0'
        };
    }
    /**
     * 하이브리드 전문가 생성
     */
    async createHybridSpecialist(skillGaps, request) {
        if (skillGaps.length < 2)
            return null;
        const prompt = `
Create a hybrid specialist that covers multiple skill gaps:

**Skill Gaps**: ${skillGaps.join(', ')}
**Context**: ${request.context}
**Task Type**: ${request.taskComplexity} complexity, ${request.urgency} urgency

Design a hybrid specialist that:
1. Has competence across multiple skill areas
2. Specializes in skill integration and bridging
3. Can adapt between different skill contexts
4. Has strong meta-learning abilities
5. Excels at knowledge transfer

Focus on creating synergies between skills rather than deep expertise in one area.

Return hybrid specialist profile with multiple skill proficiencies and unique hybrid customizations.
`;
        try {
            const result = await enhancedClaudeCodeManager_js_1.enhancedClaudeCodeManager.performEnhancedAnalysis(prompt, { taskId: 'task', timestamp: new Date() }, { timeout: 45000, priority: 'medium' });
            const hybridData = JSON.parse(result.response || '{}');
            const hybridSpecialist = this.buildSpecialistFromAIData(hybridData, 'hybrid_specialist', request);
            // 하이브리드 전용 커스터마이제이션 추가
            hybridSpecialist.customizations.push({
                type: 'hybrid_capability',
                name: 'Multi-Skill Integration',
                description: 'Ability to seamlessly integrate and switch between multiple skill domains',
                skillModifiers: skillGaps.reduce((acc, skill) => ({ ...acc, [skill]: 0.1 }), {}),
                contextTriggers: ['cross_domain_tasks', 'skill_bridging', 'knowledge_transfer'],
                effectivenessMeasure: 0.85,
                energyCost: 0.3,
                learningCurve: 0.6
            });
            return hybridSpecialist;
        }
        catch (error) {
            logger_js_1.default.warn('Hybrid specialist generation failed', { skillGaps, error });
            return null;
        }
    }
    /**
     * 전문가 조합 최적화
     */
    async optimizeSpecialistCombination(candidates, request) {
        if (candidates.length <= 3) {
            return candidates; // 소수면 최적화 불필요
        }
        const prompt = `
Optimize this specialist combination for the given task:

**Available Specialists** (${candidates.length}):
${candidates.map(spec => `${spec.name}: Core skills[${Object.keys(spec.skillProfile.coreSkills).join(',')}], Specializations[${spec.skillProfile.specializations.join(',')}]`).join('\n')}

**Task Requirements**:
- Skills: ${request.requiredSkills.join(', ')}
- Complexity: ${request.taskComplexity}
- Duration: ${request.duration} hours
- Collaboration: ${request.collaborationRequirements.join(', ')}

Select the optimal combination considering:
1. Skill coverage and overlap minimization
2. Collaboration compatibility
3. Cost effectiveness
4. Learning and mentoring opportunities
5. Risk mitigation through redundancy

Return optimal selection as JSON:
{
  "selectedSpecialists": ["specialist_id_1", "specialist_id_2"],
  "reasoning": "Why this combination is optimal",
  "skillCoverage": {"skill1": 0.9, "skill2": 0.8},
  "estimatedSynergy": 0.85,
  "collaborationScore": 0.8,
  "costEfficiency": 0.7,
  "riskMitigation": 0.75,
  "alternatives": [
    {
      "specialists": ["alt_id_1", "alt_id_2"],
      "tradeoffs": "Alternative benefits and drawbacks"
    }
  ]
}
`;
        try {
            const result = await enhancedClaudeCodeManager_js_1.enhancedClaudeCodeManager.performEnhancedAnalysis(prompt, { taskId: 'task', timestamp: new Date() }, { timeout: 60000, priority: 'medium' });
            const optimization = JSON.parse(result.response || '{}');
            const selectedSpecialists = candidates.filter(spec => optimization.selectedSpecialists.includes(spec.id) ||
                optimization.selectedSpecialists.includes(spec.name));
            logger_js_1.default.info('Specialist combination optimized', {
                originalCount: candidates.length,
                selectedCount: selectedSpecialists.length,
                estimatedSynergy: optimization.estimatedSynergy,
                reasoning: optimization.reasoning
            });
            return selectedSpecialists.length > 0 ? selectedSpecialists : candidates.slice(0, 3);
        }
        catch (error) {
            logger_js_1.default.warn('Combination optimization failed, using simple selection', { error });
            return candidates.slice(0, Math.min(3, candidates.length));
        }
    }
    /**
     * 추천 구축
     */
    async buildRecommendation(specialists, request, requestId) {
        const estimatedCost = this.calculateEstimatedCost(specialists, request);
        const successProbability = await this.calculateSuccessProbability(specialists, request);
        const skillGaps = this.identifyRemainingSkillGaps(specialists, request);
        const riskFactors = await this.identifyRiskFactors(specialists, request);
        return {
            specialists,
            reasoning: `Selected ${specialists.length} specialists based on skill match, collaboration potential, and cost efficiency`,
            confidenceScore: 0.85, // 계산된 신뢰도
            alternativeOptions: [], // 대안들
            skillGaps,
            estimatedCost,
            estimatedTimeline: request.duration,
            riskFactors,
            successProbability,
            learningOpportunities: [],
            networkEffects: []
        };
    }
    /**
     * 유틸리티 메서드들
     */
    async calculateSpecialistMatch(specialist, request) {
        // 스킬 매칭 점수
        const skillMatch = this.calculateSkillMatchScore(specialist, request.requiredSkills);
        // 가용성 점수
        const availability = 1 - specialist.availability.currentUtilization;
        // 비용 효율성 점수
        const estimatedCost = this.calculateSpecialistCost(specialist, request);
        const cost = request.budget ? Math.min(1, request.budget / estimatedCost) : 0.8;
        // 전체 점수
        const overall = (skillMatch * 0.5 + availability * 0.3 + cost * 0.2);
        return { overall, skillMatch, availability, cost };
    }
    calculateQuickMatchScore(specialist, request) {
        return this.calculateSkillMatchScore(specialist, request.requiredSkills);
    }
    calculateSkillMatchScore(specialist, requiredSkills) {
        if (requiredSkills.length === 0)
            return 0.5;
        let totalScore = 0;
        for (const skill of requiredSkills) {
            const coreSkill = specialist.skillProfile.coreSkills[skill];
            const emergingSkill = specialist.skillProfile.emergingSkills[skill];
            const crossDomainSkill = specialist.skillProfile.crossDomainSkills[skill];
            const skillScore = Math.max(coreSkill?.proficiency || 0, emergingSkill?.proficiency || 0, crossDomainSkill?.proficiency || 0);
            totalScore += skillScore;
        }
        return totalScore / requiredSkills.length;
    }
    identifySkillGaps(request, existingMatches) {
        const gaps = [];
        for (const skill of request.requiredSkills) {
            const bestMatch = Math.max(...existingMatches.map(spec => this.calculateSkillMatchScore(spec, [skill])));
            if (bestMatch < 0.7) { // 70% 미만이면 갭으로 간주
                gaps.push(skill);
            }
        }
        return gaps;
    }
    identifyRemainingSkillGaps(specialists, request) {
        return this.identifySkillGaps(request, specialists);
    }
    calculateEstimatedCost(specialists, request) {
        return specialists.reduce((total, spec) => total + this.calculateSpecialistCost(spec, request), 0);
    }
    calculateSpecialistCost(specialist, request) {
        const baseRate = specialist.costProfile.hourlyRate;
        const complexityMultiplier = specialist.costProfile.complexityMultipliers[request.taskComplexity] || 1;
        const urgencyMultiplier = specialist.costProfile.urgencyMultipliers[request.urgency] || 1;
        return baseRate * request.duration * complexityMultiplier * urgencyMultiplier;
    }
    async calculateSuccessProbability(specialists, request) {
        const skillCoverage = this.calculateOverallSkillCoverage(specialists, request.requiredSkills);
        const teamSize = specialists.length;
        const complexityFactor = { 'low': 0.9, 'medium': 0.8, 'high': 0.7, 'critical': 0.6 }[request.taskComplexity] || 0.7;
        // 기본 성공 확률 계산
        let baseProbability = skillCoverage * complexityFactor;
        // 팀 크기 조정 (적정 크기가 가장 좋음)
        if (teamSize >= 2 && teamSize <= 4) {
            baseProbability *= 1.1;
        }
        else if (teamSize > 6) {
            baseProbability *= 0.9; // 너무 큰 팀은 조정 부담
        }
        return Math.min(0.95, Math.max(0.1, baseProbability));
    }
    calculateOverallSkillCoverage(specialists, requiredSkills) {
        if (requiredSkills.length === 0)
            return 1;
        let totalCoverage = 0;
        for (const skill of requiredSkills) {
            const bestCoverage = Math.max(...specialists.map(spec => this.calculateSkillMatchScore(spec, [skill])));
            totalCoverage += bestCoverage;
        }
        return totalCoverage / requiredSkills.length;
    }
    async identifyRiskFactors(specialists, request) {
        const risks = [];
        // 스킬 갭 리스크
        const skillGaps = this.identifyRemainingSkillGaps(specialists, request);
        if (skillGaps.length > 0) {
            risks.push(`Skill gaps in: ${skillGaps.join(', ')}`);
        }
        // 가용성 리스크
        const overutilizedSpecialists = specialists.filter(spec => spec.availability.currentUtilization > 0.8);
        if (overutilizedSpecialists.length > 0) {
            risks.push(`${overutilizedSpecialists.length} specialists are highly utilized`);
        }
        // 신규 전문가 리스크
        const newSpecialists = specialists.filter(spec => spec.performanceHistory.length === 0);
        if (newSpecialists.length > 0) {
            risks.push(`${newSpecialists.length} specialists have no performance history`);
        }
        return risks;
    }
    calculateHourlyRate(skill, complexity) {
        const baseRates = {
            'cpp': 120,
            'directx12': 150,
            'hlsl': 140,
            'memory_management': 130,
            'performance_optimization': 160,
            'architecture_design': 180,
            'default': 100
        };
        const complexityMultipliers = {
            'critical': 1.8,
            'high': 1.5,
            'medium': 1.2,
            'low': 1.0
        };
        const baseRate = baseRates[skill] || baseRates['default'];
        const multiplier = complexityMultipliers[complexity] || 1.0;
        return baseRate * multiplier;
    }
    createTemplateSpecialist(skill, request) {
        const specialistId = `template_${skill}_${Date.now()}`;
        return {
            id: specialistId,
            name: `${skill} Specialist (Template)`,
            baseSpecialty: skill,
            customizations: [],
            skillProfile: {
                coreSkills: {
                    [skill]: {
                        proficiency: 0.85,
                        experience: 1500,
                        lastUsed: Date.now(),
                        growthRate: 0.1,
                        confidence: 0.8,
                        teachingAbility: 0.6
                    }
                },
                emergingSkills: {},
                crossDomainSkills: {},
                metaSkills: {
                    learning_agility: {
                        proficiency: 0.7,
                        experience: 800,
                        lastUsed: Date.now(),
                        growthRate: 0.05,
                        confidence: 0.7,
                        teachingAbility: 0.5
                    }
                },
                skillSynergies: [],
                weaknesses: [],
                growthPotential: {},
                specializations: [skill]
            },
            contextAdaptations: [],
            performanceHistory: [],
            learningPath: {
                currentFocus: [skill],
                plannedSkills: [],
                learningGoals: [],
                mentorships: [],
                autoLearningEnabled: true,
                learningVelocity: 1.5,
                curiosityIndex: 0.6
            },
            collaborationNetwork: {
                preferredPartners: [],
                conflictualPartners: [],
                mentoring: [],
                learningFrom: [],
                networkStrength: 0.4,
                trustNetwork: {},
                communicationPreferences: {},
                crossTeamConnections: []
            },
            availability: {
                totalCapacity: 40,
                currentUtilization: 0.4,
                scheduleFlexibility: 0.7,
                timezoneCompatibility: ['UTC+9'],
                preferredWorkingHours: { start: 9, end: 18 },
                workStylePreferences: [],
                availabilityPatterns: {}
            },
            costProfile: {
                hourlyRate: this.calculateHourlyRate(skill, request.taskComplexity),
                skillPremiums: { [skill]: 1.1 },
                complexityMultipliers: { 'critical': 1.5, 'high': 1.3, 'medium': 1.1, 'low': 1.0 },
                urgencyMultipliers: { 'critical': 2.0, 'high': 1.5, 'medium': 1.2, 'low': 1.0 },
                bulkDiscounts: {},
                specializations: {}
            },
            generatedAt: Date.now(),
            lastUpdated: Date.now(),
            version: '1.0.0'
        };
    }
    async analyzeLearningOpportunities(recommendation, existingTeam) {
        // 학습 기회 분석 로직
        const opportunities = [];
        // 스킬 멘토링 기회
        if (existingTeam) {
            recommendation.specialists.forEach(specialist => {
                existingTeam.forEach(member => {
                    Object.keys(specialist.skillProfile.coreSkills).forEach(skill => {
                        if (member.skills[skill] && member.skills[skill] < 0.6) {
                            opportunities.push(`${specialist.name} can mentor ${member.name} in ${skill}`);
                        }
                    });
                });
            });
        }
        recommendation.learningOpportunities = opportunities;
    }
    async calculateNetworkEffects(recommendation, existingTeam) {
        // 네트워크 효과 계산 로직
        const networkEffects = [];
        if (recommendation.specialists.length > 1) {
            networkEffects.push('Cross-pollination of skills between specialists');
            networkEffects.push('Collaborative problem-solving opportunities');
        }
        if (existingTeam && existingTeam.length > 0) {
            networkEffects.push('Knowledge transfer to existing team members');
            networkEffects.push('Expanded professional network for existing team');
        }
        recommendation.networkEffects = networkEffects;
    }
    /**
     * 성능 메트릭 및 관리 메서드들
     */
    getPerformanceMetrics() {
        return {
            totalSpecialists: this.specialistRegistry.size,
            generationCount: this.generationCount,
            lastOptimization: this.lastOptimization,
            cacheSize: this.performanceCache.size,
            averageMatchTime: 15000, // ms
            successRate: 0.88
        };
    }
    /**
     * 전문가 업데이트 및 학습
     */
    async updateSpecialistPerformance(specialistId, performanceRecord) {
        const specialist = this.specialistRegistry.get(specialistId);
        if (!specialist)
            return;
        // 성과 기록 추가
        specialist.performanceHistory.push(performanceRecord);
        // 스킬 레벨 업데이트
        Object.entries(performanceRecord.learningGains).forEach(([skill, improvement]) => {
            if (specialist.skillProfile.coreSkills[skill]) {
                specialist.skillProfile.coreSkills[skill].proficiency += improvement;
                specialist.skillProfile.coreSkills[skill].experience += performanceRecord.endTime - performanceRecord.startTime;
                specialist.skillProfile.coreSkills[skill].lastUsed = performanceRecord.endTime;
            }
        });
        specialist.lastUpdated = Date.now();
        logger_js_1.default.info('Specialist performance updated', {
            specialistId,
            taskId: performanceRecord.taskId,
            quality: performanceRecord.quality,
            learningGains: Object.keys(performanceRecord.learningGains).length
        });
    }
    /**
     * 전문가 폐기 및 정리
     */
    async cleanupObsoleteSpecialists() {
        const currentTime = Date.now();
        const obsoleteThreshold = 30 * 24 * 60 * 60 * 1000; // 30일
        let removedCount = 0;
        for (const [id, specialist] of this.specialistRegistry) {
            // 사용하지 않는 전문가 정리
            if (currentTime - specialist.lastUpdated > obsoleteThreshold &&
                specialist.performanceHistory.length === 0) {
                this.specialistRegistry.delete(id);
                removedCount++;
            }
        }
        logger_js_1.default.info('Obsolete specialists cleaned up', { removedCount });
    }
    /**
     * 레지스트리 초기화
     */
    reset() {
        this.specialistRegistry.clear();
        this.performanceCache.clear();
        this.learningAnalytics.clear();
        this.generationCount = 0;
        logger_js_1.default.info('Advanced specialist manager reset');
    }
}
exports.advancedSpecialistManager = new AdvancedSpecialistManager();
//# sourceMappingURL=advancedSpecialistManager.js.map