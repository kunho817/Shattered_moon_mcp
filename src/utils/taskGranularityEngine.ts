import logger from './logger.js';
import { enhancedClaudeCodeManager } from './enhancedClaudeCodeManager.js';

export interface TaskBreakdown {
  originalTask: string;
  subtasks: SubTask[];
  dependencies: TaskDependency[];
  estimatedDuration: number;
  parallelizationScore: number;
  granularityLevel: 'coarse' | 'medium' | 'fine' | 'ultra-fine';
  criticalPath: string[];
}

export interface SubTask {
  id: string;
  description: string;
  complexity: 'low' | 'medium' | 'high' | 'critical';
  estimatedTime: number;
  requiredSkills: string[];
  suggestedTeam: string;
  prerequisites: string[];
  parallelizable: boolean;
  atomicity: number; // 1-10, how atomic/indivisible this task is
  priority: number;
  contextRequirement: string[];
}

export interface TaskDependency {
  fromTask: string;
  toTask: string;
  type: 'hard' | 'soft' | 'resource' | 'knowledge';
  weight: number;
  blocking: boolean;
}

export interface GranularityStrategy {
  strategy: 'time_based' | 'skill_based' | 'resource_based' | 'dependency_based' | 'hybrid';
  targetParallelism: number;
  maxSubtasks: number;
  minTaskDuration: number; // minutes
  maxTaskDuration: number; // minutes
  atomicityThreshold: number;
}

export class TaskGranularityEngine {
  private static instance: TaskGranularityEngine;
  
  public static getInstance(): TaskGranularityEngine {
    if (!TaskGranularityEngine.instance) {
      TaskGranularityEngine.instance = new TaskGranularityEngine();
    }
    return TaskGranularityEngine.instance;
  }

  async analyzeTaskGranularity(
    task: string,
    context: string = '',
    strategy: GranularityStrategy = this.getDefaultStrategy()
  ): Promise<TaskBreakdown> {
    logger.info('Starting task granularity analysis', { task, strategy });

    try {
      // Claude Code를 사용한 지능형 작업 분석
      const analysisPrompt = this.buildGranularityAnalysisPrompt(task, context, strategy);
      
      const analysis = await enhancedClaudeCodeManager.performEnhancedAnalysis(
        analysisPrompt,
        {
          timestamp: new Date(),
          sessionId: `granularity_${Date.now()}`
        },
        { timeout: 30000, useCache: true }
      );

      // 분석 결과를 TaskBreakdown으로 변환
      const breakdown = await this.parseAnalysisResults(analysis, task, strategy);

      // 의존성 그래프 최적화
      breakdown.dependencies = await this.optimizeDependencyGraph(breakdown.dependencies);

      // 병렬화 점수 계산
      breakdown.parallelizationScore = this.calculateParallelizationScore(breakdown);

      // 크리티컬 패스 식별
      breakdown.criticalPath = this.identifyCriticalPath(breakdown);

      logger.info('Task granularity analysis completed', {
        subtaskCount: breakdown.subtasks.length,
        parallelizationScore: breakdown.parallelizationScore,
        granularityLevel: breakdown.granularityLevel
      });

      return breakdown;

    } catch (error) {
      logger.error('Task granularity analysis failed', { error, task });
      return this.createFallbackBreakdown(task);
    }
  }

  private buildGranularityAnalysisPrompt(
    task: string,
    context: string,
    strategy: GranularityStrategy
  ): string {
    return `# Task Granularity Analysis

**Primary Task**: ${task}
**Context**: ${context}
**Strategy**: ${strategy.strategy}
**Target Parallelism**: ${strategy.targetParallelism}
**Max Subtasks**: ${strategy.maxSubtasks}
**Duration Range**: ${strategy.minTaskDuration}-${strategy.maxTaskDuration} minutes

## Analysis Requirements:

1. **Task Decomposition**: Break down the task into optimal subtasks based on the specified strategy
2. **Dependency Analysis**: Identify hard, soft, resource, and knowledge dependencies
3. **Parallelization Opportunities**: Find tasks that can run concurrently
4. **Skill Requirements**: Match subtasks to appropriate team specializations
5. **Atomicity Assessment**: Rate how indivisible each subtask is (1-10)
6. **Time Estimation**: Provide realistic duration estimates
7. **Critical Path**: Identify the longest dependency chain

## Team Specializations Available:
- **Planning**: Game design, UX research, product management
- **Backend**: ECS specialists, memory experts, algorithm specialists  
- **Frontend**: DirectX 12 specialists, shader wizards, graphics engineers
- **Testing**: QA engineers, performance testers, automation specialists
- **Performance**: Profiler experts, optimization specialists, benchmark analysts
- **DevOps**: CI/CD engineers, deployment specialists, release managers

## Response Format:
Provide a JSON response with the following structure:
{
  "subtasks": [
    {
      "id": "unique_id",
      "description": "task description",
      "complexity": "low|medium|high|critical",
      "estimatedTime": minutes,
      "requiredSkills": ["skill1", "skill2"],
      "suggestedTeam": "team_name",
      "prerequisites": ["task_id1", "task_id2"],
      "parallelizable": true/false,
      "atomicity": 1-10,
      "priority": 1-10,
      "contextRequirement": ["requirement1"]
    }
  ],
  "dependencies": [
    {
      "fromTask": "task_id",
      "toTask": "task_id", 
      "type": "hard|soft|resource|knowledge",
      "weight": 1-10,
      "blocking": true/false
    }
  ],
  "estimatedDuration": total_minutes,
  "granularityLevel": "coarse|medium|fine|ultra-fine"
}

Focus on creating highly parallelizable, well-scoped subtasks that maximize team efficiency.`;
  }

  private async parseAnalysisResults(
    analysis: any,
    originalTask: string,
    strategy: GranularityStrategy
  ): Promise<TaskBreakdown> {
    try {
      // Claude Code 응답에서 JSON 추출
      const jsonMatch = analysis.response?.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in analysis response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        originalTask,
        subtasks: parsed.subtasks || [],
        dependencies: parsed.dependencies || [],
        estimatedDuration: parsed.estimatedDuration || 60,
        parallelizationScore: 0, // Will be calculated
        granularityLevel: parsed.granularityLevel || 'medium',
        criticalPath: [] // Will be calculated
      };

    } catch (error) {
      logger.warn('Failed to parse analysis results, using heuristic breakdown', { error });
      return this.createHeuristicBreakdown(originalTask, strategy);
    }
  }

  private createHeuristicBreakdown(task: string, strategy: GranularityStrategy): TaskBreakdown {
    // 휴리스틱 기반 작업 분해
    const subtasks: SubTask[] = [
      {
        id: `subtask_1_${Date.now()}`,
        description: `Analysis phase: ${task}`,
        complexity: 'medium',
        estimatedTime: 30,
        requiredSkills: ['analysis', 'planning'],
        suggestedTeam: 'planning',
        prerequisites: [],
        parallelizable: false,
        atomicity: 8,
        priority: 10,
        contextRequirement: ['requirements_understanding']
      },
      {
        id: `subtask_2_${Date.now()}`,
        description: `Implementation phase: ${task}`,
        complexity: 'high',
        estimatedTime: 90,
        requiredSkills: ['implementation', 'coding'],
        suggestedTeam: 'backend',
        prerequisites: [`subtask_1_${Date.now()}`],
        parallelizable: true,
        atomicity: 6,
        priority: 8,
        contextRequirement: ['implementation_plan']
      },
      {
        id: `subtask_3_${Date.now()}`,
        description: `Testing phase: ${task}`,
        complexity: 'medium',
        estimatedTime: 45,
        requiredSkills: ['testing', 'validation'],
        suggestedTeam: 'testing',
        prerequisites: [`subtask_2_${Date.now()}`],
        parallelizable: true,
        atomicity: 7,
        priority: 6,
        contextRequirement: ['test_cases']
      }
    ];

    return {
      originalTask: task,
      subtasks,
      dependencies: this.generateHeuristicDependencies(subtasks),
      estimatedDuration: subtasks.reduce((sum, t) => sum + t.estimatedTime, 0),
      parallelizationScore: 0.6,
      granularityLevel: 'medium',
      criticalPath: []
    };
  }

  private generateHeuristicDependencies(subtasks: SubTask[]): TaskDependency[] {
    const dependencies: TaskDependency[] = [];
    
    for (let i = 1; i < subtasks.length; i++) {
      dependencies.push({
        fromTask: subtasks[i-1].id,
        toTask: subtasks[i].id,
        type: 'hard',
        weight: 8,
        blocking: true
      });
    }
    
    return dependencies;
  }

  private async optimizeDependencyGraph(dependencies: TaskDependency[]): Promise<TaskDependency[]> {
    // 의존성 그래프 최적화 로직
    const optimized = dependencies.filter(dep => dep.weight > 3); // 낮은 가중치 의존성 제거
    
    logger.info('Dependency graph optimized', { 
      original: dependencies.length,
      optimized: optimized.length
    });
    
    return optimized;
  }

  private calculateParallelizationScore(breakdown: TaskBreakdown): number {
    const totalTasks = breakdown.subtasks.length;
    const parallelizableTasks = breakdown.subtasks.filter(t => t.parallelizable).length;
    const dependencyRatio = breakdown.dependencies.length / Math.max(totalTasks, 1);
    
    // 병렬화 가능한 작업 비율과 의존성 밀도를 고려한 점수
    const baseScore = parallelizableTasks / Math.max(totalTasks, 1);
    const dependencyPenalty = Math.min(dependencyRatio * 0.3, 0.5);
    
    return Math.max(0, Math.min(1, baseScore - dependencyPenalty));
  }

  private identifyCriticalPath(breakdown: TaskBreakdown): string[] {
    // 크리티컬 패스 알고리즘 (단순화된 버전)
    const taskMap = new Map(breakdown.subtasks.map(t => [t.id, t]));
    const dependencyMap = new Map<string, string[]>();
    
    // 의존성 맵 구축
    breakdown.dependencies.forEach(dep => {
      if (!dependencyMap.has(dep.toTask)) {
        dependencyMap.set(dep.toTask, []);
      }
      dependencyMap.get(dep.toTask)!.push(dep.fromTask);
    });

    // 최장 경로 찾기 (간단한 DFS)
    const visited = new Set<string>();
    let longestPath: string[] = [];

    const dfs = (taskId: string, currentPath: string[]): string[] => {
      if (visited.has(taskId)) return currentPath;
      visited.add(taskId);

      const newPath = [...currentPath, taskId];
      const dependencies = dependencyMap.get(taskId) || [];
      
      if (dependencies.length === 0) {
        return newPath;
      }

      let maxPath = newPath;
      for (const depId of dependencies) {
        const depPath = dfs(depId, newPath);
        if (depPath.length > maxPath.length) {
          maxPath = depPath;
        }
      }

      return maxPath;
    };

    // 모든 리프 노드에서 시작하여 최장 경로 찾기
    const leafNodes = breakdown.subtasks.filter(t => 
      !breakdown.dependencies.some(dep => dep.fromTask === t.id)
    );

    for (const leaf of leafNodes) {
      visited.clear();
      const path = dfs(leaf.id, []);
      if (path.length > longestPath.length) {
        longestPath = path;
      }
    }

    return longestPath.reverse();
  }

  private createFallbackBreakdown(task: string): TaskBreakdown {
    return {
      originalTask: task,
      subtasks: [{
        id: `fallback_${Date.now()}`,
        description: task,
        complexity: 'medium',
        estimatedTime: 60,
        requiredSkills: ['general'],
        suggestedTeam: 'backend',
        prerequisites: [],
        parallelizable: false,
        atomicity: 5,
        priority: 5,
        contextRequirement: []
      }],
      dependencies: [],
      estimatedDuration: 60,
      parallelizationScore: 0,
      granularityLevel: 'coarse',
      criticalPath: []
    };
  }

  private getDefaultStrategy(): GranularityStrategy {
    return {
      strategy: 'hybrid',
      targetParallelism: 4,
      maxSubtasks: 10,
      minTaskDuration: 15,
      maxTaskDuration: 120,
      atomicityThreshold: 7
    };
  }

  // 세분화 레벨 조정
  async adjustGranularity(
    breakdown: TaskBreakdown,
    targetLevel: 'coarse' | 'medium' | 'fine' | 'ultra-fine'
  ): Promise<TaskBreakdown> {
    if (breakdown.granularityLevel === targetLevel) {
      return breakdown;
    }

    logger.info('Adjusting task granularity', { 
      from: breakdown.granularityLevel, 
      to: targetLevel 
    });

    // 세분화 레벨에 따른 작업 재분해
    if (targetLevel === 'fine' || targetLevel === 'ultra-fine') {
      return await this.refineTasks(breakdown, targetLevel);
    } else {
      return await this.coarsenTasks(breakdown, targetLevel);
    }
  }

  private async refineTasks(
    breakdown: TaskBreakdown,
    level: 'fine' | 'ultra-fine'
  ): Promise<TaskBreakdown> {
    const refinedSubtasks: SubTask[] = [];
    
    for (const subtask of breakdown.subtasks) {
      if (subtask.atomicity < 7 && subtask.estimatedTime > 30) {
        // 작업을 더 세분화
        const subBreakdown = await this.analyzeTaskGranularity(
          subtask.description,
          '',
          {
            strategy: 'time_based',
            targetParallelism: 2,
            maxSubtasks: level === 'ultra-fine' ? 6 : 4,
            minTaskDuration: level === 'ultra-fine' ? 10 : 15,
            maxTaskDuration: 45,
            atomicityThreshold: level === 'ultra-fine' ? 9 : 8
          }
        );
        refinedSubtasks.push(...subBreakdown.subtasks);
      } else {
        refinedSubtasks.push(subtask);
      }
    }

    return {
      ...breakdown,
      subtasks: refinedSubtasks,
      granularityLevel: level,
      parallelizationScore: this.calculateParallelizationScore({
        ...breakdown,
        subtasks: refinedSubtasks
      })
    };
  }

  private async coarsenTasks(
    breakdown: TaskBreakdown,
    level: 'coarse' | 'medium'
  ): Promise<TaskBreakdown> {
    // 유사한 작업들을 병합하여 더 큰 단위로 만들기
    const coarsenedSubtasks: SubTask[] = [];
    const processed = new Set<string>();

    for (const subtask of breakdown.subtasks) {
      if (processed.has(subtask.id)) continue;

      // 유사한 팀과 스킬을 가진 작업들 찾기
      const similarTasks = breakdown.subtasks.filter(t => 
        !processed.has(t.id) &&
        t.suggestedTeam === subtask.suggestedTeam &&
        t.requiredSkills.some(skill => subtask.requiredSkills.includes(skill))
      );

      if (similarTasks.length > 1) {
        // 작업들을 병합
        const mergedTask: SubTask = {
          id: `merged_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          description: `Combined: ${similarTasks.map(t => t.description).join(', ')}`,
          complexity: this.mergeComplexity(similarTasks.map(t => t.complexity)),
          estimatedTime: similarTasks.reduce((sum, t) => sum + t.estimatedTime, 0),
          requiredSkills: Array.from(new Set(similarTasks.flatMap(t => t.requiredSkills))),
          suggestedTeam: subtask.suggestedTeam,
          prerequisites: Array.from(new Set(similarTasks.flatMap(t => t.prerequisites))),
          parallelizable: similarTasks.some(t => t.parallelizable),
          atomicity: Math.min(...similarTasks.map(t => t.atomicity)),
          priority: Math.max(...similarTasks.map(t => t.priority)),
          contextRequirement: Array.from(new Set(similarTasks.flatMap(t => t.contextRequirement)))
        };

        coarsenedSubtasks.push(mergedTask);
        similarTasks.forEach(t => processed.add(t.id));
      } else {
        coarsenedSubtasks.push(subtask);
        processed.add(subtask.id);
      }
    }

    return {
      ...breakdown,
      subtasks: coarsenedSubtasks,
      granularityLevel: level,
      parallelizationScore: this.calculateParallelizationScore({
        ...breakdown,
        subtasks: coarsenedSubtasks
      })
    };
  }

  private mergeComplexity(complexities: ('low' | 'medium' | 'high' | 'critical')[]): 'low' | 'medium' | 'high' | 'critical' {
    const complexityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
    const maxLevel = Math.max(...complexities.map(c => complexityLevels[c]));
    
    return Object.entries(complexityLevels).find(([_, level]) => level === maxLevel)![0] as any;
  }
}

export const taskGranularityEngine = TaskGranularityEngine.getInstance();