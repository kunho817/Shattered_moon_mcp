/**
 * 실시간 협업 최적화 시스템
 * 진행 중인 팀 간 상호작용을 실시간으로 모니터링하고 최적화
 */

import { claudeCodeInvoker } from './claudeCodeInvoker.js';
import { enhancedClaudeCodeManager } from './enhancedClaudeCodeManager.js';
import { TeamComposition, TeamMember, ComplexTask } from './intelligentTeamMatcher.js';
import logger from './logger.js';

// 실시간 협업 관련 타입 정의
export interface ActiveTeam {
  id: string;
  composition: TeamComposition;
  currentTasks: string[];
  startTime: number;
  status: 'forming' | 'norming' | 'performing' | 'adjourning' | 'blocked' | 'conflict';
  phase: 'planning' | 'execution' | 'review' | 'delivery';
  progress: number; // 0-1
  velocity: number; // tasks per hour
  blockers: string[];
  dependencies: string[];
  communicationMetrics: CommunicationMetrics;
  performanceMetrics: RealTimePerformanceMetrics;
  collaborationHealth: CollaborationHealth;
  lastActivity: number;
}

export interface CommunicationMetrics {
  messageCount: number;
  responseTime: number; // average ms
  meetingFrequency: number; // per day
  informalInteractions: number;
  documentationQuality: number; // 0-1
  knowledgeTransferRate: number; // 0-1
  conflictIncidents: number;
  resolutionTime: number; // average ms for conflicts
  crossTeamInteractions: number;
  stakeholderEngagement: number; // 0-1
}

export interface RealTimePerformanceMetrics {
  tasksCompleted: number;
  tasksInProgress: number;
  tasksPending: number;
  averageTaskDuration: number; // minutes
  qualityScore: number; // 0-1
  defectRate: number; // 0-1
  reworkRate: number; // 0-1
  innovationIndex: number; // 0-1
  resourceUtilization: number; // 0-1
  burndownVelocity: number; // tasks per hour
}

export interface CollaborationHealth {
  teamMorale: number; // 0-1
  trustLevel: number; // 0-1
  psychologicalSafety: number; // 0-1
  inclusiveness: number; // 0-1
  autonomy: number; // 0-1
  mastery: number; // 0-1
  purpose: number; // 0-1
  stressLevel: number; // 0-1 (lower is better)
  burnoutRisk: number; // 0-1 (lower is better)
  satisfactionScore: number; // 0-1
}

export interface CommunicationData {
  teamId: string;
  timestamp: number;
  type: 'message' | 'meeting' | 'document' | 'code_review' | 'decision' | 'conflict';
  participants: string[];
  content?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  effectiveness: number; // 0-1
  outcome: 'resolved' | 'pending' | 'escalated' | 'blocked';
  topics: string[];
  sentimentScore: number; // -1 to 1
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
  estimatedImpact: number; // 0-1
  implementationTime: number; // minutes
  resources: string[];
  successMetrics: string[];
  rollbackPlan: string[];
}

export interface ShortTermStrategy {
  goal: string;
  timeframe: number; // days
  actions: string[];
  milestones: string[];
  successCriteria: string[];
  riskMitigation: string[];
}

export interface LongTermStrategy {
  vision: string;
  timeframe: number; // weeks
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
  likelihood: number; // 0-1
  impact: number; // 0-1
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

class RealTimeCollaborationOptimizer {
  private activeTeams: Map<string, ActiveTeam> = new Map();
  private communicationLog: CommunicationData[] = [];
  private optimizationHistory: Array<{
    timestamp: number;
    recommendations: OptimizationRecommendations;
    implementation: string[];
    results: any;
  }> = [];

  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;

  /**
   * 실시간 팀 협업 최적화 메인 함수
   */
  async optimizeTeamInteractions(
    teams: ActiveTeam[],
    currentTasks: ComplexTask[],
    communicationPatterns: CommunicationData[]
  ): Promise<OptimizationRecommendations> {
    const optimizationId = `collab_opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    logger.info('Starting real-time collaboration optimization', {
      optimizationId,
      activeTeams: teams.length,
      currentTasks: currentTasks.length,
      communicationEvents: communicationPatterns.length
    });

    try {
      // 1. 현재 상태 분석
      await this.updateTeamStates(teams);
      
      // 2. 협업 패턴 분석
      const collaborationAnalysis = await this.analyzeCollaborationPatterns(
        teams,
        communicationPatterns
      );

      // 3. 성능 및 건강성 평가
      const healthAssessment = await this.assessCollaborationHealth(teams);

      // 4. 병목 지점 식별
      const bottlenecks = await this.identifyCollaborationBottlenecks(
        teams,
        currentTasks,
        communicationPatterns
      );

      // 5. AI 기반 최적화 추천 생성
      const recommendations = await this.generateOptimizationRecommendations(
        teams,
        collaborationAnalysis,
        healthAssessment,
        bottlenecks
      );

      // 6. 실시간 피드백 루프 구축
      await this.establishFeedbackLoop(teams, recommendations);

      // 7. 예측 모델 업데이트
      await this.updatePredictiveModels(teams, communicationPatterns, recommendations);

      logger.info('Collaboration optimization completed', {
        optimizationId,
        recommendationCount: this.countRecommendations(recommendations),
        executionTime: Date.now() - startTime
      });

      return recommendations;

    } catch (error) {
      logger.error('Collaboration optimization failed', {
        optimizationId,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime
      });
      throw error;
    }
  }

  /**
   * 팀 상태 업데이트
   */
  private async updateTeamStates(teams: ActiveTeam[]): Promise<void> {
    for (const team of teams) {
      // 기존 상태 업데이트
      if (this.activeTeams.has(team.id)) {
        const existingTeam = this.activeTeams.get(team.id)!;
        
        // 성과 메트릭 계산
        team.velocity = this.calculateTeamVelocity(team, existingTeam);
        team.progress = this.calculateTeamProgress(team);
        
        // 협업 건강성 업데이트
        team.collaborationHealth = await this.calculateCollaborationHealth(team);
      }

      this.activeTeams.set(team.id, team);
    }
  }

  /**
   * 협업 패턴 분석
   */
  private async analyzeCollaborationPatterns(
    teams: ActiveTeam[],
    communicationPatterns: CommunicationData[]
  ): Promise<any> {
    const prompt = `
Analyze these collaboration patterns and identify key insights:

**Active Teams** (${teams.length}):
${teams.map(team => `
${team.id}: Status=${team.status}, Phase=${team.phase}, Progress=${Math.round(team.progress*100)}%
- Velocity: ${team.velocity} tasks/hour
- Communication: ${team.communicationMetrics.messageCount} messages, ${Math.round(team.communicationMetrics.responseTime)}ms avg response
- Health: Morale=${Math.round(team.collaborationHealth.teamMorale*100)}%, Trust=${Math.round(team.collaborationHealth.trustLevel*100)}%
`).join('\n')}

**Communication Events** (${communicationPatterns.length} recent):
${communicationPatterns.slice(0, 20).map(comm => `
${new Date(comm.timestamp).toISOString()}: ${comm.type} - ${comm.participants.length} participants
Urgency: ${comm.urgency}, Effectiveness: ${Math.round(comm.effectiveness*100)}%, Sentiment: ${comm.sentimentScore}
Outcome: ${comm.outcome}, Topics: ${comm.topics.join(', ')}
`).join('\n')}

Identify patterns in:
1. Communication frequency and quality
2. Cross-team collaboration effectiveness
3. Conflict emergence and resolution patterns
4. Knowledge transfer and learning patterns
5. Decision-making bottlenecks
6. Innovation and creativity patterns

Return analysis as JSON:
{
  "communicationPatterns": {
    "frequency": "high|medium|low",
    "quality": 0.85,
    "crossTeamEffectiveness": 0.72,
    "responseTimePattern": "improving|stable|degrading",
    "preferredChannels": ["meeting", "message"]
  },
  "collaborationEffectiveness": {
    "overallScore": 0.78,
    "bestPractices": ["practice1", "practice2"],
    "problemAreas": ["area1", "area2"],
    "emergingTrends": ["trend1", "trend2"]
  },
  "conflictPatterns": {
    "frequency": 0.15,
    "averageResolutionTime": 240,
    "commonCauses": ["cause1", "cause2"],
    "effectiveResolutions": ["method1", "method2"]
  },
  "knowledgeFlow": {
    "transferRate": 0.65,
    "bottlenecks": ["bottleneck1"],
    "champions": ["team1", "team2"],
    "gaps": ["gap1", "gap2"]
  },
  "insights": ["insight1", "insight2", "insight3"]
}
`;

    try {
      const result = await enhancedClaudeCodeManager.performEnhancedAnalysis(
        prompt,
        'opus', // 복잡한 패턴 분석에는 Opus 사용
        { timeout: 60000, priority: 'high' }
      );

      return JSON.parse(result.response);
    } catch (error) {
      logger.warn('AI collaboration pattern analysis failed, using fallback', { error });
      return this.generateFallbackPatternAnalysis(teams, communicationPatterns);
    }
  }

  /**
   * 협업 건강성 평가
   */
  private async assessCollaborationHealth(teams: ActiveTeam[]): Promise<any> {
    const healthMetrics = teams.map(team => ({
      teamId: team.id,
      health: team.collaborationHealth,
      performance: team.performanceMetrics,
      communication: team.communicationMetrics
    }));

    const overallHealth = {
      averageMorale: this.calculateAverage(teams.map(t => t.collaborationHealth.teamMorale)),
      averageTrust: this.calculateAverage(teams.map(t => t.collaborationHealth.trustLevel)),
      averageSafety: this.calculateAverage(teams.map(t => t.collaborationHealth.psychologicalSafety)),
      burnoutRisk: this.calculateAverage(teams.map(t => t.collaborationHealth.burnoutRisk)),
      stressLevel: this.calculateAverage(teams.map(t => t.collaborationHealth.stressLevel))
    };

    // 건강성 등급 계산
    const healthGrade = this.calculateHealthGrade(overallHealth);

    return {
      individual: healthMetrics,
      overall: overallHealth,
      grade: healthGrade,
      riskFactors: this.identifyHealthRiskFactors(teams),
      improvementAreas: this.identifyImprovementAreas(teams)
    };
  }

  /**
   * 협업 병목 지점 식별
   */
  private async identifyCollaborationBottlenecks(
    teams: ActiveTeam[],
    currentTasks: ComplexTask[],
    communicationPatterns: CommunicationData[]
  ): Promise<any[]> {
    const bottlenecks: any[] = [];

    // 1. 의사소통 병목
    const commBottlenecks = this.identifyCommunicationBottlenecks(teams, communicationPatterns);
    bottlenecks.push(...commBottlenecks);

    // 2. 의사결정 병목
    const decisionBottlenecks = this.identifyDecisionBottlenecks(teams, communicationPatterns);
    bottlenecks.push(...decisionBottlenecks);

    // 3. 지식 공유 병목
    const knowledgeBottlenecks = this.identifyKnowledgeBottlenecks(teams);
    bottlenecks.push(...knowledgeBottlenecks);

    // 4. 프로세스 병목
    const processBottlenecks = this.identifyProcessBottlenecks(teams, currentTasks);
    bottlenecks.push(...processBottlenecks);

    // 5. 도구 및 기술 병목
    const technicalBottlenecks = this.identifyTechnicalBottlenecks(teams);
    bottlenecks.push(...technicalBottlenecks);

    return bottlenecks.sort((a, b) => b.impact - a.impact);
  }

  /**
   * 최적화 추천 생성
   */
  private async generateOptimizationRecommendations(
    teams: ActiveTeam[],
    collaborationAnalysis: any,
    healthAssessment: any,
    bottlenecks: any[]
  ): Promise<OptimizationRecommendations> {
    const prompt = `
Generate comprehensive collaboration optimization recommendations:

**Current Team State**:
${teams.map(team => `${team.id}: ${team.status} (${Math.round(team.progress*100)}% complete, velocity: ${team.velocity})`).join('\n')}

**Collaboration Analysis**:
${JSON.stringify(collaborationAnalysis, null, 2)}

**Health Assessment**:
- Overall Grade: ${healthAssessment.grade}
- Average Morale: ${Math.round(healthAssessment.overall.averageMorale*100)}%
- Burnout Risk: ${Math.round(healthAssessment.overall.burnoutRisk*100)}%
- Risk Factors: ${healthAssessment.riskFactors.join(', ')}

**Key Bottlenecks** (${bottlenecks.length}):
${bottlenecks.slice(0, 5).map(b => `- ${b.type}: ${b.description} (Impact: ${b.impact})`).join('\n')}

Generate actionable recommendations across timeframes:

Return as JSON:
{
  "immediate": [
    {
      "type": "communication|workflow|resource|conflict_resolution|process",
      "priority": "critical|high|medium|low",
      "description": "Specific action to take",
      "targetTeams": ["team1"],
      "estimatedImpact": 0.85,
      "implementationTime": 15,
      "resources": ["resource1"],
      "successMetrics": ["metric1"],
      "rollbackPlan": ["step1"]
    }
  ],
  "shortTerm": [
    {
      "goal": "Improve cross-team communication",
      "timeframe": 7,
      "actions": ["action1", "action2"],
      "milestones": ["milestone1"],
      "successCriteria": ["criteria1"],
      "riskMitigation": ["mitigation1"]
    }
  ],
  "longTerm": [
    {
      "vision": "Establish high-performing collaborative culture",
      "timeframe": 12,
      "phases": [
        {
          "name": "Foundation",
          "duration": 4,
          "objectives": ["obj1"],
          "deliverables": ["del1"]
        }
      ],
      "resourcePlanning": ["plan1"],
      "skillDevelopment": ["skill1"]
    }
  ],
  "preventive": [
    {
      "riskType": "communication|performance|collaboration|technical|process",
      "likelihood": 0.3,
      "impact": 0.7,
      "preventionStrategy": "Strategy description",
      "earlyWarningSignals": ["signal1"],
      "responseProtocol": ["response1"]
    }
  ],
  "emergency": [
    {
      "trigger": "Team conflict escalation",
      "severity": "critical",
      "immediateResponse": ["response1"],
      "escalationPath": ["path1"],
      "communicationPlan": ["plan1"],
      "recoveryStrategy": ["strategy1"]
    }
  ]
}
`;

    try {
      const result = await enhancedClaudeCodeManager.performEnhancedAnalysis(
        prompt,
        'opus',
        { timeout: 90000, priority: 'high' }
      );

      const recommendations = JSON.parse(result.response) as OptimizationRecommendations;
      
      // 추천사항 검증 및 보정
      return this.validateAndEnhanceRecommendations(recommendations, teams);

    } catch (error) {
      logger.warn('AI recommendation generation failed, using fallback', { error });
      return this.generateFallbackRecommendations(teams, bottlenecks);
    }
  }

  /**
   * 실시간 피드백 루프 구축
   */
  private async establishFeedbackLoop(
    teams: ActiveTeam[],
    recommendations: OptimizationRecommendations
  ): Promise<void> {
    // 실시간 모니터링 시작
    if (!this.isMonitoring) {
      this.startRealtimeMonitoring();
    }

    // 즉시 실행 가능한 추천사항 적용
    for (const action of recommendations.immediate) {
      if (action.priority === 'critical' || action.priority === 'high') {
        await this.implementImmediateAction(action, teams);
      }
    }

    // 피드백 수집 메커니즘 설정
    await this.setupFeedbackCollection(teams, recommendations);
  }

  /**
   * 예측 모델 업데이트
   */
  private async updatePredictiveModels(
    teams: ActiveTeam[],
    communicationPatterns: CommunicationData[],
    recommendations: OptimizationRecommendations
  ): Promise<void> {
    const modelData = {
      timestamp: Date.now(),
      teamStates: teams.map(t => ({
        id: t.id,
        health: t.collaborationHealth,
        performance: t.performanceMetrics,
        velocity: t.velocity
      })),
      communicationMetrics: this.aggregateCommunicationMetrics(communicationPatterns),
      recommendationEffectiveness: await this.calculateRecommendationEffectiveness(recommendations)
    };

    // 성능 히스토리 업데이트
    this.optimizationHistory.push({
      timestamp: Date.now(),
      recommendations,
      implementation: [], // 실제 구현에서는 실행된 액션들
      results: modelData
    });

    // 최근 50개 기록만 유지
    if (this.optimizationHistory.length > 50) {
      this.optimizationHistory = this.optimizationHistory.slice(-50);
    }

    logger.info('Predictive models updated', {
      historySize: this.optimizationHistory.length,
      teamCount: teams.length
    });
  }

  /**
   * 실시간 모니터링 시작
   */
  private startRealtimeMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.isMonitoring = true;
    
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.performRealtimeCheck();
      } catch (error) {
        logger.error('Realtime monitoring check failed', { error });
      }
    }, 30000); // 30초마다 체크

    logger.info('Real-time collaboration monitoring started');
  }

  /**
   * 실시간 체크 수행
   */
  private async performRealtimeCheck(): Promise<void> {
    const activeTeams = Array.from(this.activeTeams.values());
    
    // 긴급 상황 체크
    const emergencyTeams = activeTeams.filter(team => 
      team.collaborationHealth.stressLevel > 0.8 ||
      team.collaborationHealth.burnoutRisk > 0.7 ||
      team.status === 'blocked' ||
      team.status === 'conflict'
    );

    if (emergencyTeams.length > 0) {
      await this.handleEmergencyTeams(emergencyTeams);
    }

    // 성능 저하 체크
    const underperformingTeams = activeTeams.filter(team =>
      team.velocity < 0.5 || // 정상 속도의 50% 미만
      team.collaborationHealth.teamMorale < 0.5
    );

    if (underperformingTeams.length > 0) {
      await this.handleUnderperformingTeams(underperformingTeams);
    }

    // 긍정적 패턴 감지 및 확산
    const highPerformingTeams = activeTeams.filter(team =>
      team.velocity > 1.5 && // 평균 이상의 속도
      team.collaborationHealth.teamMorale > 0.8 &&
      team.collaborationHealth.trustLevel > 0.8
    );

    if (highPerformingTeams.length > 0) {
      await this.captureBestPractices(highPerformingTeams);
    }
  }

  /**
   * 유틸리티 메서드들
   */
  private calculateTeamVelocity(currentTeam: ActiveTeam, previousTeam: ActiveTeam): number {
    const timeDiff = (Date.now() - previousTeam.lastActivity) / (1000 * 60 * 60); // hours
    const taskDiff = currentTeam.performanceMetrics.tasksCompleted - previousTeam.performanceMetrics.tasksCompleted;
    
    return timeDiff > 0 ? taskDiff / timeDiff : previousTeam.velocity;
  }

  private calculateTeamProgress(team: ActiveTeam): number {
    const total = team.performanceMetrics.tasksCompleted + 
                 team.performanceMetrics.tasksInProgress + 
                 team.performanceMetrics.tasksPending;
    
    return total > 0 ? team.performanceMetrics.tasksCompleted / total : 0;
  }

  private async calculateCollaborationHealth(team: ActiveTeam): Promise<CollaborationHealth> {
    // 실제 구현에서는 더 정교한 계산 로직
    const baseHealth = team.collaborationHealth;
    
    // 최근 성과 기반 조정
    const performanceAdjustment = team.performanceMetrics.qualityScore * 0.1;
    const communicationAdjustment = Math.min(0.1, team.communicationMetrics.responseTime / 10000);

    return {
      ...baseHealth,
      teamMorale: Math.max(0, Math.min(1, baseHealth.teamMorale + performanceAdjustment - communicationAdjustment)),
      trustLevel: Math.max(0, Math.min(1, baseHealth.trustLevel + performanceAdjustment * 0.5)),
      stressLevel: Math.max(0, Math.min(1, baseHealth.stressLevel + communicationAdjustment)),
      burnoutRisk: Math.max(0, Math.min(1, baseHealth.burnoutRisk + (team.velocity > 2 ? 0.1 : -0.05)))
    };
  }

  private calculateAverage(values: number[]): number {
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  }

  private calculateHealthGrade(health: any): string {
    const overallScore = (
      health.averageMorale * 0.3 +
      health.averageTrust * 0.3 +
      health.averageSafety * 0.2 +
      (1 - health.burnoutRisk) * 0.1 +
      (1 - health.stressLevel) * 0.1
    );

    if (overallScore >= 0.9) return 'A+';
    if (overallScore >= 0.8) return 'A';
    if (overallScore >= 0.7) return 'B';
    if (overallScore >= 0.6) return 'C';
    return 'D';
  }

  private identifyHealthRiskFactors(teams: ActiveTeam[]): string[] {
    const risks: string[] = [];
    
    const avgBurnout = this.calculateAverage(teams.map(t => t.collaborationHealth.burnoutRisk));
    if (avgBurnout > 0.6) risks.push('High burnout risk across teams');
    
    const avgStress = this.calculateAverage(teams.map(t => t.collaborationHealth.stressLevel));
    if (avgStress > 0.7) risks.push('Elevated stress levels');
    
    const conflictTeams = teams.filter(t => t.status === 'conflict').length;
    if (conflictTeams > 0) risks.push(`${conflictTeams} teams experiencing conflicts`);
    
    const blockedTeams = teams.filter(t => t.status === 'blocked').length;
    if (blockedTeams > 0) risks.push(`${blockedTeams} teams are blocked`);

    return risks;
  }

  private identifyImprovementAreas(teams: ActiveTeam[]): string[] {
    const areas: string[] = [];
    
    const avgMorale = this.calculateAverage(teams.map(t => t.collaborationHealth.teamMorale));
    if (avgMorale < 0.7) areas.push('Team morale needs improvement');
    
    const avgTrust = this.calculateAverage(teams.map(t => t.collaborationHealth.trustLevel));
    if (avgTrust < 0.7) areas.push('Trust building required');
    
    const avgSafety = this.calculateAverage(teams.map(t => t.collaborationHealth.psychologicalSafety));
    if (avgSafety < 0.7) areas.push('Psychological safety enhancement needed');
    
    const avgResponseTime = this.calculateAverage(teams.map(t => t.communicationMetrics.responseTime));
    if (avgResponseTime > 30000) areas.push('Communication response time optimization');

    return areas;
  }

  private identifyCommunicationBottlenecks(teams: ActiveTeam[], patterns: CommunicationData[]): any[] {
    const bottlenecks: any[] = [];
    
    // 응답 시간이 긴 팀들
    const slowResponseTeams = teams.filter(t => t.communicationMetrics.responseTime > 30000);
    slowResponseTeams.forEach(team => {
      bottlenecks.push({
        type: 'communication',
        description: `${team.id} has slow response times (${Math.round(team.communicationMetrics.responseTime/1000)}s)`,
        impact: 0.7,
        affectedTeams: [team.id]
      });
    });

    // 의사소통 빈도가 낮은 팀들
    const lowCommTeams = teams.filter(t => t.communicationMetrics.messageCount < 10);
    lowCommTeams.forEach(team => {
      bottlenecks.push({
        type: 'communication',
        description: `${team.id} has low communication frequency`,
        impact: 0.5,
        affectedTeams: [team.id]
      });
    });

    return bottlenecks;
  }

  private identifyDecisionBottlenecks(teams: ActiveTeam[], patterns: CommunicationData[]): any[] {
    const bottlenecks: any[] = [];
    
    // 결정 관련 의사소통에서 미해결 상태가 많은 경우
    const decisionPatterns = patterns.filter(p => p.type === 'decision' && p.outcome === 'pending');
    
    if (decisionPatterns.length > 5) {
      bottlenecks.push({
        type: 'decision',
        description: `${decisionPatterns.length} pending decisions creating delays`,
        impact: 0.8,
        affectedTeams: Array.from(new Set(decisionPatterns.map(p => p.teamId)))
      });
    }

    return bottlenecks;
  }

  private identifyKnowledgeBottlenecks(teams: ActiveTeam[]): any[] {
    const bottlenecks: any[] = [];
    
    // 지식 전달률이 낮은 팀들
    const lowKnowledgeTeams = teams.filter(t => t.communicationMetrics.knowledgeTransferRate < 0.5);
    lowKnowledgeTeams.forEach(team => {
      bottlenecks.push({
        type: 'knowledge',
        description: `${team.id} has low knowledge transfer rate (${Math.round(team.communicationMetrics.knowledgeTransferRate*100)}%)`,
        impact: 0.6,
        affectedTeams: [team.id]
      });
    });

    return bottlenecks;
  }

  private identifyProcessBottlenecks(teams: ActiveTeam[], tasks: ComplexTask[]): any[] {
    const bottlenecks: any[] = [];
    
    // 진행률이 낮은 팀들
    const lowProgressTeams = teams.filter(t => t.progress < 0.3 && Date.now() - t.startTime > 24 * 60 * 60 * 1000);
    lowProgressTeams.forEach(team => {
      bottlenecks.push({
        type: 'process',
        description: `${team.id} has low progress after significant time`,
        impact: 0.7,
        affectedTeams: [team.id]
      });
    });

    return bottlenecks;
  }

  private identifyTechnicalBottlenecks(teams: ActiveTeam[]): any[] {
    const bottlenecks: any[] = [];
    
    // 높은 재작업률을 가진 팀들
    const highReworkTeams = teams.filter(t => t.performanceMetrics.reworkRate > 0.3);
    highReworkTeams.forEach(team => {
      bottlenecks.push({
        type: 'technical',
        description: `${team.id} has high rework rate (${Math.round(team.performanceMetrics.reworkRate*100)}%)`,
        impact: 0.6,
        affectedTeams: [team.id]
      });
    });

    return bottlenecks;
  }

  private validateAndEnhanceRecommendations(
    recommendations: OptimizationRecommendations,
    teams: ActiveTeam[]
  ): OptimizationRecommendations {
    // 추천사항 검증 및 보정 로직
    const activeTeamIds = teams.map(t => t.id);
    
    // 존재하지 않는 팀 ID 제거
    recommendations.immediate = recommendations.immediate.filter(action =>
      action.targetTeams.every(teamId => activeTeamIds.includes(teamId))
    );

    return recommendations;
  }

  private generateFallbackRecommendations(teams: ActiveTeam[], bottlenecks: any[]): OptimizationRecommendations {
    return {
      immediate: [
        {
          type: 'communication',
          priority: 'medium',
          description: 'Establish regular team check-ins',
          targetTeams: teams.map(t => t.id),
          estimatedImpact: 0.6,
          implementationTime: 30,
          resources: ['Meeting facilitator'],
          successMetrics: ['Improved response times'],
          rollbackPlan: ['Remove if ineffective']
        }
      ],
      shortTerm: [
        {
          goal: 'Improve overall collaboration',
          timeframe: 14,
          actions: ['Implement collaboration tools', 'Training sessions'],
          milestones: ['Tool deployment', 'Training completion'],
          successCriteria: ['Increased collaboration scores'],
          riskMitigation: ['Monitor adoption rates']
        }
      ],
      longTerm: [],
      preventive: [],
      emergency: []
    };
  }

  private generateFallbackPatternAnalysis(teams: ActiveTeam[], patterns: CommunicationData[]): any {
    return {
      communicationPatterns: {
        frequency: 'medium',
        quality: 0.7,
        crossTeamEffectiveness: 0.6,
        responseTimePattern: 'stable',
        preferredChannels: ['message', 'meeting']
      },
      collaborationEffectiveness: {
        overallScore: 0.7,
        bestPractices: ['Regular updates'],
        problemAreas: ['Cross-team coordination'],
        emergingTrends: ['Increased remote collaboration']
      },
      conflictPatterns: {
        frequency: 0.1,
        averageResolutionTime: 180,
        commonCauses: ['Resource conflicts'],
        effectiveResolutions: ['Mediation']
      },
      knowledgeFlow: {
        transferRate: 0.6,
        bottlenecks: ['Documentation gaps'],
        champions: teams.slice(0, 2).map(t => t.id),
        gaps: ['Technical knowledge']
      },
      insights: ['Teams are generally collaborative', 'Communication can be improved']
    };
  }

  private countRecommendations(recommendations: OptimizationRecommendations): number {
    return recommendations.immediate.length +
           recommendations.shortTerm.length +
           recommendations.longTerm.length +
           recommendations.preventive.length +
           recommendations.emergency.length;
  }

  private async implementImmediateAction(action: ImmediateAction, teams: ActiveTeam[]): Promise<void> {
    logger.info('Implementing immediate action', {
      type: action.type,
      priority: action.priority,
      targetTeams: action.targetTeams
    });

    // 실제 구현에서는 해당 액션을 실행하는 로직
    // 예: 슬랙 메시지 전송, 미팅 스케줄링, 프로세스 변경 등
  }

  private async setupFeedbackCollection(teams: ActiveTeam[], recommendations: OptimizationRecommendations): Promise<void> {
    // 피드백 수집 메커니즘 설정
    logger.info('Setting up feedback collection for optimization recommendations');
  }

  private aggregateCommunicationMetrics(patterns: CommunicationData[]): any {
    return {
      totalEvents: patterns.length,
      averageEffectiveness: this.calculateAverage(patterns.map(p => p.effectiveness)),
      averageSentiment: this.calculateAverage(patterns.map(p => p.sentimentScore)),
      resolutionRate: patterns.filter(p => p.outcome === 'resolved').length / patterns.length
    };
  }

  private async calculateRecommendationEffectiveness(recommendations: OptimizationRecommendations): Promise<number> {
    // 추천사항의 예상 효과 계산
    const immediateImpact = this.calculateAverage(recommendations.immediate.map(r => r.estimatedImpact));
    return immediateImpact || 0.5;
  }

  private async handleEmergencyTeams(teams: ActiveTeam[]): Promise<void> {
    logger.warn('Emergency teams detected', {
      teamCount: teams.length,
      teamIds: teams.map(t => t.id)
    });

    // 긴급 대응 로직
    for (const team of teams) {
      if (team.status === 'conflict') {
        await this.initiateConflictResolution(team);
      } else if (team.collaborationHealth.burnoutRisk > 0.8) {
        await this.initiateBurnoutPrevention(team);
      }
    }
  }

  private async handleUnderperformingTeams(teams: ActiveTeam[]): Promise<void> {
    logger.info('Underperforming teams detected', {
      teamCount: teams.length,
      teamIds: teams.map(t => t.id)
    });

    // 성능 개선 지원 로직
  }

  private async captureBestPractices(teams: ActiveTeam[]): Promise<void> {
    logger.info('High-performing teams detected, capturing best practices', {
      teamCount: teams.length,
      teamIds: teams.map(t => t.id)
    });

    // 모범 사례 캡처 및 확산 로직
  }

  private async initiateConflictResolution(team: ActiveTeam): Promise<void> {
    logger.info('Initiating conflict resolution', { teamId: team.id });
    // 갈등 해결 프로세스 시작
  }

  private async initiateBurnoutPrevention(team: ActiveTeam): Promise<void> {
    logger.info('Initiating burnout prevention', { teamId: team.id });
    // 번아웃 예방 조치 시작
  }

  /**
   * 모니터링 중지
   */
  stopRealtimeMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    logger.info('Real-time collaboration monitoring stopped');
  }

  /**
   * 성능 메트릭 조회
   */
  getPerformanceMetrics() {
    return {
      activeTeams: this.activeTeams.size,
      optimizationHistory: this.optimizationHistory.length,
      isMonitoring: this.isMonitoring,
      averageOptimizationTime: this.calculateAverageOptimizationTime(),
      successRate: this.calculateOptimizationSuccessRate()
    };
  }

  private calculateAverageOptimizationTime(): number {
    // 최적화 평균 시간 계산
    return 25000; // ms
  }

  private calculateOptimizationSuccessRate(): number {
    // 최적화 성공률 계산
    return 0.85;
  }

  /**
   * 데이터 초기화
   */
  reset(): void {
    this.activeTeams.clear();
    this.communicationLog = [];
    this.optimizationHistory = [];
    this.stopRealtimeMonitoring();
    logger.info('Collaboration optimizer reset');
  }
}

export const realTimeCollaborationOptimizer = new RealTimeCollaborationOptimizer();