"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskGranularityEngine = exports.TaskGranularityEngine = void 0;
const logger_js_1 = __importDefault(require("./logger.js"));
const enhancedClaudeCodeManager_js_1 = require("./enhancedClaudeCodeManager.js");
class TaskGranularityEngine {
    static instance;
    static getInstance() {
        if (!TaskGranularityEngine.instance) {
            TaskGranularityEngine.instance = new TaskGranularityEngine();
        }
        return TaskGranularityEngine.instance;
    }
    async analyzeTaskGranularity(task, context = '', strategy = this.getDefaultStrategy()) {
        logger_js_1.default.info('Starting task granularity analysis', { task, strategy });
        try {
            // Claude Code를 사용한 지능형 작업 분석
            const analysisPrompt = this.buildGranularityAnalysisPrompt(task, context, strategy);
            const analysis = await enhancedClaudeCodeManager_js_1.enhancedClaudeCodeManager.performEnhancedAnalysis(analysisPrompt, {
                timestamp: new Date(),
                sessionId: `granularity_${Date.now()}`
            }, { timeout: 30000, useCache: true });
            // 분석 결과를 TaskBreakdown으로 변환
            const breakdown = await this.parseAnalysisResults(analysis, task, strategy);
            // 의존성 그래프 최적화
            breakdown.dependencies = await this.optimizeDependencyGraph(breakdown.dependencies);
            // 병렬화 점수 계산
            breakdown.parallelizationScore = this.calculateParallelizationScore(breakdown);
            // 크리티컬 패스 식별
            breakdown.criticalPath = this.identifyCriticalPath(breakdown);
            logger_js_1.default.info('Task granularity analysis completed', {
                subtaskCount: breakdown.subtasks.length,
                parallelizationScore: breakdown.parallelizationScore,
                granularityLevel: breakdown.granularityLevel
            });
            return breakdown;
        }
        catch (error) {
            logger_js_1.default.error('Task granularity analysis failed', { error, task });
            return this.createFallbackBreakdown(task);
        }
    }
    buildGranularityAnalysisPrompt(task, context, strategy) {
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
    async parseAnalysisResults(analysis, originalTask, strategy) {
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
        }
        catch (error) {
            logger_js_1.default.warn('Failed to parse analysis results, using heuristic breakdown', { error });
            return this.createHeuristicBreakdown(originalTask, strategy);
        }
    }
    createHeuristicBreakdown(task, strategy) {
        // 휴리스틱 기반 작업 분해
        const subtasks = [
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
    generateHeuristicDependencies(subtasks) {
        const dependencies = [];
        for (let i = 1; i < subtasks.length; i++) {
            dependencies.push({
                fromTask: subtasks[i - 1].id,
                toTask: subtasks[i].id,
                type: 'hard',
                weight: 8,
                blocking: true
            });
        }
        return dependencies;
    }
    async optimizeDependencyGraph(dependencies) {
        // 의존성 그래프 최적화 로직
        const optimized = dependencies.filter(dep => dep.weight > 3); // 낮은 가중치 의존성 제거
        logger_js_1.default.info('Dependency graph optimized', {
            original: dependencies.length,
            optimized: optimized.length
        });
        return optimized;
    }
    calculateParallelizationScore(breakdown) {
        const totalTasks = breakdown.subtasks.length;
        const parallelizableTasks = breakdown.subtasks.filter(t => t.parallelizable).length;
        const dependencyRatio = breakdown.dependencies.length / Math.max(totalTasks, 1);
        // 병렬화 가능한 작업 비율과 의존성 밀도를 고려한 점수
        const baseScore = parallelizableTasks / Math.max(totalTasks, 1);
        const dependencyPenalty = Math.min(dependencyRatio * 0.3, 0.5);
        return Math.max(0, Math.min(1, baseScore - dependencyPenalty));
    }
    identifyCriticalPath(breakdown) {
        // 크리티컬 패스 알고리즘 (단순화된 버전)
        const taskMap = new Map(breakdown.subtasks.map(t => [t.id, t]));
        const dependencyMap = new Map();
        // 의존성 맵 구축
        breakdown.dependencies.forEach(dep => {
            if (!dependencyMap.has(dep.toTask)) {
                dependencyMap.set(dep.toTask, []);
            }
            dependencyMap.get(dep.toTask).push(dep.fromTask);
        });
        // 최장 경로 찾기 (간단한 DFS)
        const visited = new Set();
        let longestPath = [];
        const dfs = (taskId, currentPath) => {
            if (visited.has(taskId))
                return currentPath;
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
        const leafNodes = breakdown.subtasks.filter(t => !breakdown.dependencies.some(dep => dep.fromTask === t.id));
        for (const leaf of leafNodes) {
            visited.clear();
            const path = dfs(leaf.id, []);
            if (path.length > longestPath.length) {
                longestPath = path;
            }
        }
        return longestPath.reverse();
    }
    createFallbackBreakdown(task) {
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
    getDefaultStrategy() {
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
    async adjustGranularity(breakdown, targetLevel) {
        if (breakdown.granularityLevel === targetLevel) {
            return breakdown;
        }
        logger_js_1.default.info('Adjusting task granularity', {
            from: breakdown.granularityLevel,
            to: targetLevel
        });
        // 세분화 레벨에 따른 작업 재분해
        if (targetLevel === 'fine' || targetLevel === 'ultra-fine') {
            return await this.refineTasks(breakdown, targetLevel);
        }
        else {
            return await this.coarsenTasks(breakdown, targetLevel);
        }
    }
    async refineTasks(breakdown, level) {
        const refinedSubtasks = [];
        for (const subtask of breakdown.subtasks) {
            if (subtask.atomicity < 7 && subtask.estimatedTime > 30) {
                // 작업을 더 세분화
                const subBreakdown = await this.analyzeTaskGranularity(subtask.description, '', {
                    strategy: 'time_based',
                    targetParallelism: 2,
                    maxSubtasks: level === 'ultra-fine' ? 6 : 4,
                    minTaskDuration: level === 'ultra-fine' ? 10 : 15,
                    maxTaskDuration: 45,
                    atomicityThreshold: level === 'ultra-fine' ? 9 : 8
                });
                refinedSubtasks.push(...subBreakdown.subtasks);
            }
            else {
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
    async coarsenTasks(breakdown, level) {
        // 유사한 작업들을 병합하여 더 큰 단위로 만들기
        const coarsenedSubtasks = [];
        const processed = new Set();
        for (const subtask of breakdown.subtasks) {
            if (processed.has(subtask.id))
                continue;
            // 유사한 팀과 스킬을 가진 작업들 찾기
            const similarTasks = breakdown.subtasks.filter(t => !processed.has(t.id) &&
                t.suggestedTeam === subtask.suggestedTeam &&
                t.requiredSkills.some(skill => subtask.requiredSkills.includes(skill)));
            if (similarTasks.length > 1) {
                // 작업들을 병합
                const mergedTask = {
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
            }
            else {
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
    mergeComplexity(complexities) {
        const complexityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
        const maxLevel = Math.max(...complexities.map(c => complexityLevels[c]));
        return Object.entries(complexityLevels).find(([_, level]) => level === maxLevel)[0];
    }
}
exports.TaskGranularityEngine = TaskGranularityEngine;
exports.taskGranularityEngine = TaskGranularityEngine.getInstance();
//# sourceMappingURL=taskGranularityEngine.js.map