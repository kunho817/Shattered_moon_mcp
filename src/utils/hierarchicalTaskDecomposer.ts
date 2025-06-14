/**
 * 계층적 작업 분해 시스템
 * 4단계 계층으로 작업을 분해하여 유연성과 세분화 극대화
 */

import { claudeCodeInvoker } from './claudeCodeInvoker.js';
import { enhancedClaudeCodeManager } from './enhancedClaudeCodeManager.js';
import logger from './logger.js';

// 계층적 작업 타입 정의
export interface StrategicTask {
  id: string;
  title: string;
  description: string;
  duration: number; // 1-4시간
  complexity: 'low' | 'medium' | 'high' | 'critical';
  requiredTeams: string[];
  prerequisites: string[];
  deliverables: string[];
  dependencies: string[];
}

export interface TacticalTask {
  id: string;
  parentStrategicId: string;
  title: string;
  description: string;
  duration: number; // 15-60분
  skillRequirements: string[];
  estimatedEffort: number;
  riskLevel: 'low' | 'medium' | 'high';
  testCriteria: string[];
}

export interface OperationalTask {
  id: string;
  parentTacticalId: string;
  title: string;
  description: string;
  duration: number; // 5-15분
  atomicActions: string[];
  verificationSteps: string[];
  rollbackPlan: string[];
}

export interface AtomicTask {
  id: string;
  parentOperationalId: string;
  action: string;
  parameters: Record<string, any>;
  duration: number; // 1-5분
  idempotent: boolean;
  retryable: boolean;
  validationFunction?: string;
}

export interface HierarchicalTaskDecomposition {
  id: string;
  originalTask: string;
  context: string;
  timestamp: number;
  level1: StrategicTask[];
  level2: TacticalTask[];
  level3: OperationalTask[];
  level4: AtomicTask[];
  metadata: {
    totalEstimatedDuration: number;
    parallelismOpportunities: string[];
    riskAssessment: string;
    successCriteria: string[];
    qualityGates: string[];
  };
}

export interface DecompositionStrategy {
  strategy: 'time_based' | 'complexity_based' | 'team_based' | 'hybrid' | 'adaptive';
  maxLevels: number;
  targetGranularity: number; // 1-10, 10이 가장 세분화
  parallelismPreference: number; // 0-1, 1이 최대 병렬화
  riskTolerance: 'conservative' | 'balanced' | 'aggressive';
  qualityRequirement: number; // 0-1, 1이 최고 품질
}

export interface DecompositionContext {
  projectType: string;
  teamCapabilities: string[];
  timeConstraints: number;
  resourceLimitations: string[];
  priorityLevel: number;
  complexityFactors: string[];
}

class HierarchicalTaskDecomposer {
  private performanceMetrics = {
    decompositionsPerformed: 0,
    averageDecompositionTime: 0,
    successRate: 0,
    qualityScore: 0
  };

  /**
   * 메인 분해 함수 - 작업을 4단계 계층으로 분해
   */
  async decomposeTask(
    task: string,
    context: string,
    strategy: DecompositionStrategy,
    decompositionContext: DecompositionContext
  ): Promise<HierarchicalTaskDecomposition> {
    const startTime = Date.now();
    const decompositionId = `hier_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    logger.info('Starting hierarchical task decomposition', {
      decompositionId,
      task: task.substring(0, 100),
      strategy,
      context: decompositionContext
    });

    try {
      // Level 1: Strategic Tasks (1-4시간)
      const strategicTasks = await this.createStrategicTasks(
        task,
        context,
        strategy,
        decompositionContext
      );

      // Level 2: Tactical Tasks (15-60분)
      const tacticalTasks = await this.createTacticalTasks(
        strategicTasks,
        strategy,
        decompositionContext
      );

      // Level 3: Operational Tasks (5-15분)
      const operationalTasks = await this.createOperationalTasks(
        tacticalTasks,
        strategy,
        decompositionContext
      );

      // Level 4: Atomic Tasks (1-5분)
      const atomicTasks = await this.createAtomicTasks(
        operationalTasks,
        strategy,
        decompositionContext
      );

      // 메타데이터 생성
      const metadata = await this.generateMetadata(
        strategicTasks,
        tacticalTasks,
        operationalTasks,
        atomicTasks,
        strategy
      );

      const decomposition: HierarchicalTaskDecomposition = {
        id: decompositionId,
        originalTask: task,
        context,
        timestamp: Date.now(),
        level1: strategicTasks,
        level2: tacticalTasks,
        level3: operationalTasks,
        level4: atomicTasks,
        metadata
      };

      // 성능 메트릭 업데이트
      this.updatePerformanceMetrics(startTime, decomposition);

      logger.info('Hierarchical decomposition completed successfully', {
        decompositionId,
        strategicTasks: strategicTasks.length,
        tacticalTasks: tacticalTasks.length,
        operationalTasks: operationalTasks.length,
        atomicTasks: atomicTasks.length,
        totalDuration: metadata.totalEstimatedDuration,
        executionTime: Date.now() - startTime
      });

      return decomposition;

    } catch (error) {
      logger.error('Hierarchical decomposition failed', {
        decompositionId,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime
      });
      throw error;
    }
  }

  /**
   * Level 1: Strategic Tasks 생성 (1-4시간)
   */
  private async createStrategicTasks(
    task: string,
    context: string,
    strategy: DecompositionStrategy,
    decompositionContext: DecompositionContext
  ): Promise<StrategicTask[]> {
    const prompt = `
Analyze this task and break it down into strategic-level components (1-4 hour duration each):

**Original Task**: ${task}
**Context**: ${context}
**Strategy**: ${strategy.strategy}
**Target Granularity**: ${strategy.targetGranularity}/10
**Risk Tolerance**: ${strategy.riskTolerance}
**Project Type**: ${decompositionContext.projectType}
**Team Capabilities**: ${decompositionContext.teamCapabilities.join(', ')}

Create 2-6 strategic tasks that:
1. Each takes 1-4 hours to complete
2. Can be assigned to different teams
3. Have clear deliverables and success criteria
4. Consider dependencies and prerequisites
5. Align with the complexity level: ${strategy.qualityRequirement > 0.8 ? 'high quality' : 'balanced'}

Return as JSON array with this structure:
[{
  "id": "strategic_1",
  "title": "Strategic Task Title",
  "description": "Detailed description of what needs to be accomplished",
  "duration": 120, // minutes (60-240 range)
  "complexity": "medium",
  "requiredTeams": ["Backend", "Frontend"],
  "prerequisites": ["requirement1", "requirement2"],
  "deliverables": ["deliverable1", "deliverable2"],
  "dependencies": ["other_task_id"]
}]
`;

    const result = await enhancedClaudeCodeManager.performEnhancedAnalysis(
      prompt,
      'opus', // 전략적 분석에는 Opus 사용
      { timeout: 45000, priority: 'high' }
    );

    try {
      const strategicTasks = JSON.parse(result.response) as StrategicTask[];
      
      // 검증 및 보정
      return strategicTasks.map((task, index) => ({
        ...task,
        id: task.id || `strategic_${index + 1}`,
        duration: Math.max(60, Math.min(240, task.duration || 120))
      }));
    } catch (parseError) {
      logger.warn('Failed to parse strategic tasks, using fallback', { parseError });
      return this.createFallbackStrategicTasks(task, decompositionContext);
    }
  }

  /**
   * Level 2: Tactical Tasks 생성 (15-60분)
   */
  private async createTacticalTasks(
    strategicTasks: StrategicTask[],
    strategy: DecompositionStrategy,
    decompositionContext: DecompositionContext
  ): Promise<TacticalTask[]> {
    const allTacticalTasks: TacticalTask[] = [];

    for (const strategicTask of strategicTasks) {
      const prompt = `
Break down this strategic task into tactical-level tasks (15-60 minutes each):

**Strategic Task**: ${strategicTask.title}
**Description**: ${strategicTask.description}
**Duration**: ${strategicTask.duration} minutes
**Required Teams**: ${strategicTask.requiredTeams.join(', ')}
**Deliverables**: ${strategicTask.deliverables.join(', ')}

Create 2-8 tactical tasks that:
1. Each takes 15-60 minutes to complete
2. Have specific skill requirements
3. Include clear test criteria
4. Consider risk levels
5. Break down the strategic task completely

Return as JSON array:
[{
  "id": "tactical_1",
  "parentStrategicId": "${strategicTask.id}",
  "title": "Tactical Task Title",
  "description": "Specific implementation details",
  "duration": 30, // minutes (15-60 range)
  "skillRequirements": ["skill1", "skill2"],
  "estimatedEffort": 7, // 1-10 scale
  "riskLevel": "medium",
  "testCriteria": ["test1", "test2"]
}]
`;

      const result = await enhancedClaudeCodeManager.performEnhancedAnalysis(
        prompt,
        'sonnet', // 전술적 분해에는 Sonnet 사용
        { timeout: 30000, priority: 'medium' }
      );

      try {
        const tacticalTasks = JSON.parse(result.response) as TacticalTask[];
        allTacticalTasks.push(...tacticalTasks.map((task, index) => ({
          ...task,
          id: task.id || `tactical_${strategicTask.id}_${index + 1}`,
          parentStrategicId: strategicTask.id,
          duration: Math.max(15, Math.min(60, task.duration || 30))
        })));
      } catch (parseError) {
        logger.warn('Failed to parse tactical tasks, using fallback', { 
          strategicTaskId: strategicTask.id,
          parseError 
        });
        allTacticalTasks.push(...this.createFallbackTacticalTasks(strategicTask));
      }
    }

    return allTacticalTasks;
  }

  /**
   * Level 3: Operational Tasks 생성 (5-15분)
   */
  private async createOperationalTasks(
    tacticalTasks: TacticalTask[],
    strategy: DecompositionStrategy,
    decompositionContext: DecompositionContext
  ): Promise<OperationalTask[]> {
    const allOperationalTasks: OperationalTask[] = [];

    // 배치 처리로 성능 최적화
    const batchSize = 3;
    for (let i = 0; i < tacticalTasks.length; i += batchSize) {
      const batch = tacticalTasks.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (tacticalTask) => {
        const prompt = `
Break down this tactical task into operational tasks (5-15 minutes each):

**Tactical Task**: ${tacticalTask.title}
**Description**: ${tacticalTask.description}
**Duration**: ${tacticalTask.duration} minutes
**Skills Required**: ${tacticalTask.skillRequirements.join(', ')}

Create 2-5 operational tasks that:
1. Each takes 5-15 minutes to complete
2. Have specific atomic actions
3. Include verification steps
4. Have rollback plans
5. Are executable by a single person

Return as JSON array:
[{
  "id": "operational_1",
  "parentTacticalId": "${tacticalTask.id}",
  "title": "Operational Task Title",
  "description": "Specific actions to be taken",
  "duration": 10, // minutes (5-15 range)
  "atomicActions": ["action1", "action2"],
  "verificationSteps": ["verify1", "verify2"],
  "rollbackPlan": ["rollback1", "rollback2"]
}]
`;

        try {
          const result = await enhancedClaudeCodeManager.performEnhancedAnalysis(
            prompt,
            'sonnet',
            { timeout: 25000, priority: 'medium' }
          );

          const operationalTasks = JSON.parse(result.response) as OperationalTask[];
          return operationalTasks.map((task, index) => ({
            ...task,
            id: task.id || `operational_${tacticalTask.id}_${index + 1}`,
            parentTacticalId: tacticalTask.id,
            duration: Math.max(5, Math.min(15, task.duration || 10))
          }));
        } catch (error) {
          logger.warn('Failed to create operational tasks, using fallback', {
            tacticalTaskId: tacticalTask.id,
            error
          });
          return this.createFallbackOperationalTasks(tacticalTask);
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          allOperationalTasks.push(...result.value);
        }
      });
    }

    return allOperationalTasks;
  }

  /**
   * Level 4: Atomic Tasks 생성 (1-5분)
   */
  private async createAtomicTasks(
    operationalTasks: OperationalTask[],
    strategy: DecompositionStrategy,
    decompositionContext: DecompositionContext
  ): Promise<AtomicTask[]> {
    const allAtomicTasks: AtomicTask[] = [];

    // 병렬 처리로 성능 최적화
    const atomicPromises = operationalTasks.map(async (operationalTask) => {
      const prompt = `
Break down this operational task into atomic tasks (1-5 minutes each):

**Operational Task**: ${operationalTask.title}
**Description**: ${operationalTask.description}
**Atomic Actions**: ${operationalTask.atomicActions.join(', ')}

Create 1-4 atomic tasks that:
1. Each takes 1-5 minutes to complete
2. Are single, specific actions
3. Are idempotent if possible
4. Have clear parameters
5. Can be retried safely

Return as JSON array:
[{
  "id": "atomic_1",
  "parentOperationalId": "${operationalTask.id}",
  "action": "Specific action to perform",
  "parameters": {"param1": "value1"},
  "duration": 3, // minutes (1-5 range)
  "idempotent": true,
  "retryable": true,
  "validationFunction": "optional validation code"
}]
`;

      try {
        const result = await enhancedClaudeCodeManager.performEnhancedAnalysis(
          prompt,
          'sonnet',
          { timeout: 20000, priority: 'low' }
        );

        const atomicTasks = JSON.parse(result.response) as AtomicTask[];
        return atomicTasks.map((task, index) => ({
          ...task,
          id: task.id || `atomic_${operationalTask.id}_${index + 1}`,
          parentOperationalId: operationalTask.id,
          duration: Math.max(1, Math.min(5, task.duration || 3))
        }));
      } catch (error) {
        logger.warn('Failed to create atomic tasks, using fallback', {
          operationalTaskId: operationalTask.id,
          error
        });
        return this.createFallbackAtomicTasks(operationalTask);
      }
    });

    const results = await Promise.allSettled(atomicPromises);
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        allAtomicTasks.push(...result.value);
      }
    });

    return allAtomicTasks;
  }

  /**
   * 메타데이터 생성
   */
  private async generateMetadata(
    strategicTasks: StrategicTask[],
    tacticalTasks: TacticalTask[],
    operationalTasks: OperationalTask[],
    atomicTasks: AtomicTask[],
    strategy: DecompositionStrategy
  ): Promise<HierarchicalTaskDecomposition['metadata']> {
    const totalDuration = strategicTasks.reduce((sum, task) => sum + task.duration, 0);
    
    // 병렬화 기회 분석
    const parallelismOpportunities = await this.analyzeParallelismOpportunities(
      strategicTasks,
      tacticalTasks,
      operationalTasks
    );

    // 리스크 평가
    const riskAssessment = await this.assessRisks(strategicTasks, tacticalTasks);

    return {
      totalEstimatedDuration: totalDuration,
      parallelismOpportunities,
      riskAssessment,
      successCriteria: strategicTasks.flatMap(task => task.deliverables),
      qualityGates: tacticalTasks.flatMap(task => task.testCriteria)
    };
  }

  /**
   * 병렬화 기회 분석
   */
  private async analyzeParallelismOpportunities(
    strategicTasks: StrategicTask[],
    tacticalTasks: TacticalTask[],
    operationalTasks: OperationalTask[]
  ): Promise<string[]> {
    const opportunities: string[] = [];

    // 독립적인 전략 작업 식별
    const independentStrategic = strategicTasks.filter(task => 
      task.dependencies.length === 0 || 
      !task.dependencies.some(dep => strategicTasks.some(t => t.id === dep))
    );

    if (independentStrategic.length > 1) {
      opportunities.push(`${independentStrategic.length} strategic tasks can run in parallel`);
    }

    // 팀별 병렬 처리 기회
    const teamGroups = new Map<string, number>();
    strategicTasks.forEach(task => {
      task.requiredTeams.forEach(team => {
        teamGroups.set(team, (teamGroups.get(team) || 0) + 1);
      });
    });

    teamGroups.forEach((count, team) => {
      if (count > 1) {
        opportunities.push(`${team} team can handle ${count} tasks simultaneously`);
      }
    });

    return opportunities;
  }

  /**
   * 리스크 평가
   */
  private async assessRisks(
    strategicTasks: StrategicTask[],
    tacticalTasks: TacticalTask[]
  ): Promise<string> {
    const highComplexityTasks = strategicTasks.filter(task => 
      task.complexity === 'high' || task.complexity === 'critical'
    ).length;

    const highRiskTactical = tacticalTasks.filter(task => 
      task.riskLevel === 'high'
    ).length;

    if (highComplexityTasks > 2 && highRiskTactical > 3) {
      return 'High risk: Multiple complex strategic tasks with high-risk tactical components';
    } else if (highComplexityTasks > 1 || highRiskTactical > 2) {
      return 'Medium risk: Some complex or high-risk components identified';
    } else {
      return 'Low risk: Well-structured decomposition with manageable complexity';
    }
  }

  /**
   * 폴백 메서드들
   */
  private createFallbackStrategicTasks(
    task: string,
    context: DecompositionContext
  ): StrategicTask[] {
    return [
      {
        id: 'strategic_fallback_1',
        title: 'Analysis and Planning',
        description: `Analyze requirements and create implementation plan for: ${task}`,
        duration: 90,
        complexity: 'medium',
        requiredTeams: ['Planning'],
        prerequisites: [],
        deliverables: ['Requirements analysis', 'Implementation plan'],
        dependencies: []
      },
      {
        id: 'strategic_fallback_2',
        title: 'Implementation',
        description: `Implement the core functionality for: ${task}`,
        duration: 150,
        complexity: 'high',
        requiredTeams: ['Backend', 'Frontend'],
        prerequisites: ['strategic_fallback_1'],
        deliverables: ['Working implementation'],
        dependencies: ['strategic_fallback_1']
      }
    ];
  }

  private createFallbackTacticalTasks(strategicTask: StrategicTask): TacticalTask[] {
    return [
      {
        id: `tactical_${strategicTask.id}_fallback_1`,
        parentStrategicId: strategicTask.id,
        title: 'Setup and Configuration',
        description: `Setup environment and configuration for ${strategicTask.title}`,
        duration: 30,
        skillRequirements: ['configuration', 'setup'],
        estimatedEffort: 5,
        riskLevel: 'low',
        testCriteria: ['Environment configured', 'Dependencies installed']
      }
    ];
  }

  private createFallbackOperationalTasks(tacticalTask: TacticalTask): OperationalTask[] {
    return [
      {
        id: `operational_${tacticalTask.id}_fallback_1`,
        parentTacticalId: tacticalTask.id,
        title: 'Execute Task',
        description: `Execute ${tacticalTask.title}`,
        duration: 10,
        atomicActions: ['perform action'],
        verificationSteps: ['verify completion'],
        rollbackPlan: ['revert changes']
      }
    ];
  }

  private createFallbackAtomicTasks(operationalTask: OperationalTask): AtomicTask[] {
    return [
      {
        id: `atomic_${operationalTask.id}_fallback_1`,
        parentOperationalId: operationalTask.id,
        action: operationalTask.title,
        parameters: {},
        duration: 3,
        idempotent: false,
        retryable: true
      }
    ];
  }

  /**
   * 성능 메트릭 업데이트
   */
  private updatePerformanceMetrics(
    startTime: number,
    decomposition: HierarchicalTaskDecomposition
  ): void {
    const executionTime = Date.now() - startTime;
    
    this.performanceMetrics.decompositionsPerformed++;
    this.performanceMetrics.averageDecompositionTime = 
      (this.performanceMetrics.averageDecompositionTime * (this.performanceMetrics.decompositionsPerformed - 1) + executionTime) / 
      this.performanceMetrics.decompositionsPerformed;

    // 품질 점수 계산 (완료된 레벨 수와 작업 수 기반)
    const qualityScore = Math.min(1.0, (
      decomposition.level1.length * 0.4 +
      decomposition.level2.length * 0.3 +
      decomposition.level3.length * 0.2 +
      decomposition.level4.length * 0.1
    ) / 20);

    this.performanceMetrics.qualityScore = 
      (this.performanceMetrics.qualityScore * (this.performanceMetrics.decompositionsPerformed - 1) + qualityScore) / 
      this.performanceMetrics.decompositionsPerformed;
  }

  /**
   * 성능 메트릭 조회
   */
  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }

  /**
   * 적응형 전략 추천
   */
  async recommendStrategy(
    task: string,
    context: string,
    constraints: { timeLimit?: number; teamSize?: number; complexity?: string }
  ): Promise<DecompositionStrategy> {
    const prompt = `
Analyze this task and recommend the optimal decomposition strategy:

**Task**: ${task}
**Context**: ${context}
**Constraints**: ${JSON.stringify(constraints)}

Consider:
1. Task complexity and requirements
2. Available time and resources
3. Team size and capabilities
4. Risk factors and quality requirements

Recommend the best strategy from: time_based, complexity_based, team_based, hybrid, adaptive

Return as JSON:
{
  "strategy": "hybrid",
  "maxLevels": 4,
  "targetGranularity": 7,
  "parallelismPreference": 0.8,
  "riskTolerance": "balanced",
  "qualityRequirement": 0.85,
  "reasoning": "Explanation for this recommendation"
}
`;

    try {
      const result = await enhancedClaudeCodeManager.performEnhancedAnalysis(
        prompt,
        'opus',
        { timeout: 30000, priority: 'medium' }
      );

      const recommendation = JSON.parse(result.response);
      logger.info('Strategy recommendation generated', { recommendation });
      
      return recommendation;
    } catch (error) {
      logger.warn('Failed to generate strategy recommendation, using default', { error });
      
      // 기본 전략 반환
      return {
        strategy: 'hybrid',
        maxLevels: 4,
        targetGranularity: 6,
        parallelismPreference: 0.7,
        riskTolerance: 'balanced',
        qualityRequirement: 0.8
      };
    }
  }
}

export const hierarchicalTaskDecomposer = new HierarchicalTaskDecomposer();