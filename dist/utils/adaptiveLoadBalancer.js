"use strict";
/**
 * 적응형 워크로드 밸런싱 시스템
 * 실시간으로 팀 간 워크로드를 분석하고 최적화하여 분산 처리 효율성 극대화
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adaptiveLoadBalancer = void 0;
const enhancedClaudeCodeManager_js_1 = require("./enhancedClaudeCodeManager.js");
const logger_js_1 = __importDefault(require("./logger.js"));
class AdaptiveLoadBalancer {
    performanceHistory = [];
    currentStrategy = {
        algorithm: 'adaptive',
        rebalanceThreshold: 0.8,
        maxUtilization: 0.9,
        burnoutThreshold: 0.7,
        responseTimeThreshold: 5000,
        priorityWeighting: 0.3,
        skillMatchWeighting: 0.4,
        collaborationWeighting: 0.3
    };
    /**
     * 실시간 워크로드 리밸런싱 메인 함수
     */
    async rebalanceInRealTime(currentLoad, pendingTasks, strategy) {
        const startTime = Date.now();
        const rebalanceId = `rebalance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        if (strategy) {
            this.currentStrategy = { ...this.currentStrategy, ...strategy };
        }
        logger_js_1.default.info('Starting adaptive load rebalancing', {
            rebalanceId,
            currentTeams: currentLoad.length,
            pendingTasks: pendingTasks.length,
            strategy: this.currentStrategy.algorithm
        });
        try {
            // 1. 보틀넥 분석
            const bottlenecks = await this.identifyBottlenecks(currentLoad, pendingTasks);
            logger_js_1.default.info('Bottlenecks identified', {
                rebalanceId,
                bottleneckCount: bottlenecks.length,
                criticalBottlenecks: bottlenecks.filter(b => b.severity === 'critical').length
            });
            // 2. 재분배 계획 생성
            const redistributionPlan = await this.createRedistributionPlan(bottlenecks, currentLoad, pendingTasks);
            logger_js_1.default.info('Redistribution plan created', {
                rebalanceId,
                actionCount: redistributionPlan.length,
                affectedTeams: new Set(redistributionPlan.map(a => a.sourceTeam)).size
            });
            // 3. 리밸런싱 실행
            const rebalanceResult = await this.executeRebalancing(rebalanceId, redistributionPlan, currentLoad, pendingTasks);
            // 4. 성능 히스토리 업데이트
            this.updatePerformanceHistory(currentLoad, redistributionPlan.length);
            // 5. 전략 최적화 (학습 기반)
            await this.optimizeStrategy(rebalanceResult);
            logger_js_1.default.info('Adaptive rebalancing completed', {
                rebalanceId,
                success: rebalanceResult.success,
                executionTime: rebalanceResult.executionTime,
                improvementScore: this.calculateOverallImprovement(rebalanceResult.improvementMetrics)
            });
            return rebalanceResult;
        }
        catch (error) {
            logger_js_1.default.error('Adaptive rebalancing failed', {
                rebalanceId,
                error: error instanceof Error ? error.message : 'Unknown error',
                executionTime: Date.now() - startTime
            });
            throw error;
        }
    }
    /**
     * 보틀넥 식별 및 분석
     */
    async identifyBottlenecks(currentLoad, pendingTasks) {
        const bottlenecks = [];
        // 1. 용량 보틀넥 분석
        const capacityBottlenecks = await this.analyzeCapacityBottlenecks(currentLoad);
        bottlenecks.push(...capacityBottlenecks);
        // 2. 스킬 보틀넥 분석
        const skillBottlenecks = await this.analyzeSkillBottlenecks(currentLoad, pendingTasks);
        bottlenecks.push(...skillBottlenecks);
        // 3. 의존성 보틀넥 분석
        const dependencyBottlenecks = await this.analyzeDependencyBottlenecks(pendingTasks);
        bottlenecks.push(...dependencyBottlenecks);
        // 4. 협업 보틀넥 분석
        const collaborationBottlenecks = await this.analyzeCollaborationBottlenecks(currentLoad);
        bottlenecks.push(...collaborationBottlenecks);
        // 5. AI 기반 고급 보틀넥 분석
        const aiBottlenecks = await this.performAIBottleneckAnalysis(currentLoad, pendingTasks);
        bottlenecks.push(...aiBottlenecks);
        // 중요도 순으로 정렬
        return bottlenecks.sort((a, b) => {
            const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return severityOrder[b.severity] - severityOrder[a.severity];
        });
    }
    /**
     * 용량 보틀넥 분석
     */
    async analyzeCapacityBottlenecks(currentLoad) {
        const bottlenecks = [];
        for (const team of currentLoad) {
            if (team.utilization > this.currentStrategy.maxUtilization) {
                bottlenecks.push({
                    type: 'capacity',
                    severity: team.utilization > 0.95 ? 'critical' : 'high',
                    affectedTeams: [team.teamName],
                    affectedTasks: [], // 실제 구현에서는 해당 팀의 작업 ID들
                    description: `${team.teamName} team is overloaded (${Math.round(team.utilization * 100)}% utilization)`,
                    estimatedImpact: team.avgTaskDuration * (team.utilization - this.currentStrategy.maxUtilization) * team.currentTasks,
                    recommendedActions: [
                        'Redistribute tasks to less loaded teams',
                        'Increase team capacity temporarily',
                        'Defer non-critical tasks'
                    ],
                    rootCause: `Utilization exceeded threshold: ${Math.round(team.utilization * 100)}% > ${Math.round(this.currentStrategy.maxUtilization * 100)}%`
                });
            }
            if (team.burnoutRisk > this.currentStrategy.burnoutThreshold) {
                bottlenecks.push({
                    type: 'performance',
                    severity: team.burnoutRisk > 0.85 ? 'critical' : 'medium',
                    affectedTeams: [team.teamName],
                    affectedTasks: [],
                    description: `${team.teamName} team shows high burnout risk (${Math.round(team.burnoutRisk * 100)}%)`,
                    estimatedImpact: team.avgTaskDuration * 0.5, // 번아웃으로 인한 성능 저하
                    recommendedActions: [
                        'Reduce workload temporarily',
                        'Improve work-life balance',
                        'Provide additional support'
                    ],
                    rootCause: `Burnout risk exceeded threshold: ${Math.round(team.burnoutRisk * 100)}% > ${Math.round(this.currentStrategy.burnoutThreshold * 100)}%`
                });
            }
        }
        return bottlenecks;
    }
    /**
     * 스킬 보틀넥 분석
     */
    async analyzeSkillBottlenecks(currentLoad, pendingTasks) {
        const bottlenecks = [];
        // 필요한 스킬과 사용 가능한 스킬 매칭 분석
        const requiredSkills = new Map();
        pendingTasks.forEach(task => {
            task.requiredSkills.forEach(skill => {
                requiredSkills.set(skill, (requiredSkills.get(skill) || 0) + 1);
            });
        });
        const availableSkills = new Map();
        currentLoad.forEach(team => {
            Object.entries(team.skillEfficiency).forEach(([skill, efficiency]) => {
                if (!availableSkills.has(skill)) {
                    availableSkills.set(skill, { teams: [], efficiency: 0 });
                }
                const skillData = availableSkills.get(skill);
                skillData.teams.push(team.teamName);
                skillData.efficiency = Math.max(skillData.efficiency, efficiency);
            });
        });
        // 스킬 부족 분석
        for (const [skill, demandCount] of requiredSkills) {
            const skillData = availableSkills.get(skill);
            if (!skillData) {
                bottlenecks.push({
                    type: 'skill',
                    severity: 'critical',
                    affectedTeams: [],
                    affectedTasks: pendingTasks.filter(task => task.requiredSkills.includes(skill)).map(task => task.taskId),
                    description: `Critical skill shortage: ${skill} (required by ${demandCount} tasks)`,
                    estimatedImpact: demandCount * 60, // 스킬 부족으로 인한 지연
                    recommendedActions: [
                        'Train existing team members',
                        'Hire specialists',
                        'Find alternative approaches'
                    ],
                    rootCause: `Skill ${skill} not available in any team`
                });
            }
            else if (skillData.efficiency < 0.6) {
                bottlenecks.push({
                    type: 'skill',
                    severity: 'medium',
                    affectedTeams: skillData.teams,
                    affectedTasks: pendingTasks.filter(task => task.requiredSkills.includes(skill)).map(task => task.taskId),
                    description: `Low skill efficiency: ${skill} (${Math.round(skillData.efficiency * 100)}% efficiency)`,
                    estimatedImpact: demandCount * 30,
                    recommendedActions: [
                        'Provide additional training',
                        'Pair with experienced team members',
                        'Allocate more time for skill-based tasks'
                    ],
                    rootCause: `Skill ${skill} efficiency below optimal: ${Math.round(skillData.efficiency * 100)}% < 60%`
                });
            }
        }
        return bottlenecks;
    }
    /**
     * 의존성 보틀넥 분석
     */
    async analyzeDependencyBottlenecks(pendingTasks) {
        const bottlenecks = [];
        // 의존성 그래프 구축
        const dependencyMap = new Map();
        const dependentCount = new Map();
        pendingTasks.forEach(task => {
            dependencyMap.set(task.taskId, task.dependencies);
            task.dependencies.forEach(dep => {
                dependentCount.set(dep, (dependentCount.get(dep) || 0) + 1);
            });
        });
        // 크리티컬 패스 분석
        for (const [taskId, dependentTasks] of dependentCount) {
            if (dependentTasks > 3) { // 3개 이상의 작업이 의존하는 경우
                const blockingTask = pendingTasks.find(task => task.taskId === taskId);
                bottlenecks.push({
                    type: 'dependency',
                    severity: dependentTasks > 5 ? 'critical' : 'high',
                    affectedTeams: blockingTask ? [blockingTask.assignedTeam || 'unknown'] : [],
                    affectedTasks: [taskId, ...Array.from(dependentCount.keys()).filter(id => pendingTasks.find(task => task.taskId === id)?.dependencies.includes(taskId))],
                    description: `Critical dependency bottleneck: ${taskId} blocks ${dependentTasks} other tasks`,
                    estimatedImpact: dependentTasks * (blockingTask?.estimatedDuration || 30),
                    recommendedActions: [
                        'Prioritize blocking task',
                        'Parallelize independent portions',
                        'Find alternative dependency paths'
                    ],
                    rootCause: `Task ${taskId} has ${dependentTasks} dependent tasks creating bottleneck`
                });
            }
        }
        return bottlenecks;
    }
    /**
     * 협업 보틀넥 분석
     */
    async analyzeCollaborationBottlenecks(currentLoad) {
        const bottlenecks = [];
        const lowCollaborationTeams = currentLoad.filter(team => team.collaborationScore < 0.6);
        if (lowCollaborationTeams.length > 0) {
            bottlenecks.push({
                type: 'collaboration',
                severity: 'medium',
                affectedTeams: lowCollaborationTeams.map(team => team.teamName),
                affectedTasks: [],
                description: `Poor collaboration scores detected in ${lowCollaborationTeams.length} teams`,
                estimatedImpact: lowCollaborationTeams.length * 20, // 협업 부족으로 인한 지연
                recommendedActions: [
                    'Improve communication channels',
                    'Establish clear handoff procedures',
                    'Implement collaboration tools'
                ],
                rootCause: 'Low collaboration scores indicating communication issues'
            });
        }
        return bottlenecks;
    }
    /**
     * AI 기반 고급 보틀넥 분석
     */
    async performAIBottleneckAnalysis(currentLoad, pendingTasks) {
        const prompt = `
Analyze this workload distribution and identify potential bottlenecks:

**Current Team Load**:
${currentLoad.map(team => `${team.teamName}: ${Math.round(team.utilization * 100)}% utilization, ${team.currentTasks} tasks, avg duration: ${team.avgTaskDuration}min`).join('\n')}

**Pending Tasks**:
${pendingTasks.slice(0, 10).map(task => `${task.taskId}: ${task.complexity} complexity, ${task.estimatedDuration}min, skills: ${task.requiredSkills.join(',')}`).join('\n')}
${pendingTasks.length > 10 ? `... and ${pendingTasks.length - 10} more tasks` : ''}

Identify hidden bottlenecks that might not be obvious from basic metrics:
1. Pattern-based bottlenecks
2. Emerging trends
3. Cross-team dependencies
4. Resource conflicts
5. Timeline pressures

Return as JSON array:
[{
  "type": "performance|capacity|skill|dependency|collaboration",
  "severity": "low|medium|high|critical",
  "affectedTeams": ["team1", "team2"],
  "description": "Detailed description of the bottleneck",
  "estimatedImpact": 120, // minutes of potential delay
  "recommendedActions": ["action1", "action2"],
  "rootCause": "Root cause analysis",
  "confidence": 0.85 // AI confidence in this analysis
}]
`;
        try {
            const result = await enhancedClaudeCodeManager_js_1.enhancedClaudeCodeManager.performEnhancedAnalysis(prompt, { taskId: 'task', timestamp: new Date() }, // 복잡한 분석에는 Opus 사용
            { timeout: 45000, priority: 'high' });
            const aiBottlenecks = JSON.parse(result.response);
            // 신뢰도가 높은 분석만 반환
            return aiBottlenecks
                .filter(bottleneck => bottleneck.confidence > 0.7)
                .map(({ confidence, ...bottleneck }) => bottleneck);
        }
        catch (error) {
            logger_js_1.default.warn('AI bottleneck analysis failed, using fallback', { error });
            return [];
        }
    }
    /**
     * 재분배 계획 생성
     */
    async createRedistributionPlan(bottlenecks, currentLoad, pendingTasks) {
        const actions = [];
        for (const bottleneck of bottlenecks) {
            switch (bottleneck.type) {
                case 'capacity':
                    actions.push(...await this.createCapacityRebalanceActions(bottleneck, currentLoad, pendingTasks));
                    break;
                case 'skill':
                    actions.push(...await this.createSkillRebalanceActions(bottleneck, currentLoad, pendingTasks));
                    break;
                case 'dependency':
                    actions.push(...await this.createDependencyRebalanceActions(bottleneck, pendingTasks));
                    break;
                case 'collaboration':
                    actions.push(...await this.createCollaborationRebalanceActions(bottleneck, currentLoad));
                    break;
                case 'performance':
                    actions.push(...await this.createPerformanceRebalanceActions(bottleneck, currentLoad, pendingTasks));
                    break;
            }
        }
        // AI 기반 최적화
        return await this.optimizeActionPlan(actions, currentLoad, pendingTasks);
    }
    /**
     * 용량 기반 리밸런스 액션 생성
     */
    async createCapacityRebalanceActions(bottleneck, currentLoad, pendingTasks) {
        const actions = [];
        const overloadedTeams = bottleneck.affectedTeams;
        for (const teamName of overloadedTeams) {
            const team = currentLoad.find(t => t.teamName === teamName);
            if (!team)
                continue;
            // 가장 부하가 적은 팀 찾기
            const leastLoadedTeam = currentLoad
                .filter(t => t.teamName !== teamName && t.utilization < this.currentStrategy.rebalanceThreshold)
                .sort((a, b) => a.utilization - b.utilization)[0];
            if (leastLoadedTeam) {
                // 재분배할 작업 선택 (우선순위가 낮고 의존성이 적은 작업)
                const redistributableTasks = pendingTasks
                    .filter(task => task.assignedTeam === teamName && task.priority <= 5)
                    .sort((a, b) => a.priority - b.priority)
                    .slice(0, Math.ceil(team.currentTasks * 0.3)); // 최대 30% 재분배
                if (redistributableTasks.length > 0) {
                    actions.push({
                        type: 'redistribute',
                        sourceTeam: teamName,
                        targetTeam: leastLoadedTeam.teamName,
                        taskIds: redistributableTasks.map(task => task.taskId),
                        reasoning: `Redistribute ${redistributableTasks.length} tasks from overloaded ${teamName} to ${leastLoadedTeam.teamName}`,
                        expectedImprovement: 0.3,
                        riskLevel: 'low',
                        executionTime: 10
                    });
                }
            }
        }
        return actions;
    }
    /**
     * 스킬 기반 리밸런스 액션 생성
     */
    async createSkillRebalanceActions(bottleneck, currentLoad, pendingTasks) {
        const actions = [];
        // 스킬 부족 작업을 스킬이 있는 팀에 위임
        const affectedTasks = pendingTasks.filter(task => bottleneck.affectedTasks.includes(task.taskId));
        for (const task of affectedTasks) {
            // 가장 적합한 팀 찾기 (스킬 효율성과 현재 부하 고려)
            const bestTeam = currentLoad
                .filter(team => {
                return task.requiredSkills.every(skill => team.skillEfficiency[skill] && team.skillEfficiency[skill] > 0.6);
            })
                .sort((a, b) => {
                const aScore = this.calculateTeamSuitability(a, task);
                const bScore = this.calculateTeamSuitability(b, task);
                return bScore - aScore;
            })[0];
            if (bestTeam && bestTeam.teamName !== task.assignedTeam) {
                actions.push({
                    type: 'delegate',
                    sourceTeam: task.assignedTeam || 'unassigned',
                    targetTeam: bestTeam.teamName,
                    taskIds: [task.taskId],
                    reasoning: `Delegate skill-intensive task to ${bestTeam.teamName} with higher skill efficiency`,
                    expectedImprovement: 0.4,
                    riskLevel: 'medium',
                    executionTime: 5
                });
            }
        }
        return actions;
    }
    /**
     * 의존성 기반 리밸런스 액션 생성
     */
    async createDependencyRebalanceActions(bottleneck, pendingTasks) {
        const actions = [];
        // 블로킹 작업 우선순위 상승
        const blockingTasks = pendingTasks.filter(task => bottleneck.affectedTasks.includes(task.taskId) && task.status === 'pending');
        for (const task of blockingTasks) {
            if (task.priority < 8) {
                actions.push({
                    type: 'escalate',
                    sourceTeam: task.assignedTeam || 'unassigned',
                    taskIds: [task.taskId],
                    reasoning: `Escalate priority of blocking task to reduce dependency bottleneck`,
                    expectedImprovement: 0.6,
                    riskLevel: 'low',
                    executionTime: 2
                });
            }
        }
        return actions;
    }
    /**
     * 협업 기반 리밸런스 액션 생성
     */
    async createCollaborationRebalanceActions(bottleneck, currentLoad) {
        const actions = [];
        // 협업 점수가 낮은 팀들의 작업을 더 협력적인 팀으로 분산
        const lowCollabTeams = bottleneck.affectedTeams;
        const highCollabTeams = currentLoad
            .filter(team => !lowCollabTeams.includes(team.teamName) && team.collaborationScore > 0.8)
            .sort((a, b) => b.collaborationScore - a.collaborationScore);
        if (highCollabTeams.length > 0) {
            actions.push({
                type: 'redistribute',
                sourceTeam: lowCollabTeams[0],
                targetTeam: highCollabTeams[0].teamName,
                taskIds: [], // 실제 구현에서는 특정 작업 ID들
                reasoning: `Improve collaboration by redistributing tasks to teams with higher collaboration scores`,
                expectedImprovement: 0.25,
                riskLevel: 'medium',
                executionTime: 15
            });
        }
        return actions;
    }
    /**
     * 성능 기반 리밸런스 액션 생성
     */
    async createPerformanceRebalanceActions(bottleneck, currentLoad, pendingTasks) {
        const actions = [];
        // 번아웃 위험이 있는 팀의 작업 부하 감소
        const burnoutTeams = bottleneck.affectedTeams;
        for (const teamName of burnoutTeams) {
            const team = currentLoad.find(t => t.teamName === teamName);
            if (!team)
                continue;
            // 비긴급 작업 연기
            const deferableTasks = pendingTasks
                .filter(task => task.assignedTeam === teamName && task.priority <= 4 && !task.deadline)
                .sort((a, b) => a.priority - b.priority)
                .slice(0, Math.ceil(team.currentTasks * 0.4)); // 최대 40% 연기
            if (deferableTasks.length > 0) {
                actions.push({
                    type: 'defer',
                    sourceTeam: teamName,
                    taskIds: deferableTasks.map(task => task.taskId),
                    reasoning: `Defer non-urgent tasks to reduce burnout risk in ${teamName}`,
                    expectedImprovement: 0.5,
                    riskLevel: 'low',
                    executionTime: 5
                });
            }
        }
        return actions;
    }
    /**
     * 액션 계획 최적화
     */
    async optimizeActionPlan(actions, currentLoad, pendingTasks) {
        if (actions.length === 0)
            return actions;
        const prompt = `
Optimize this load balancing action plan for maximum efficiency:

**Current Actions**:
${actions.map((action, index) => `${index + 1}. ${action.type}: ${action.sourceTeam} -> ${action.targetTeam || 'N/A'} (${action.taskIds.length} tasks) - ${action.reasoning}`).join('\n')}

**Team Status**:
${currentLoad.map(team => `${team.teamName}: ${Math.round(team.utilization * 100)}% utilization, ${team.currentTasks} tasks`).join('\n')}

Optimize by:
1. Removing conflicting actions
2. Combining similar actions
3. Reordering for maximum impact
4. Adjusting for realistic constraints
5. Minimizing disruption

Return optimized actions in same JSON format, maintaining only the most effective ones.
`;
        try {
            const result = await enhancedClaudeCodeManager_js_1.enhancedClaudeCodeManager.performEnhancedAnalysis(prompt, { taskId: 'task', timestamp: new Date() }, { timeout: 30000, priority: 'medium' });
            const optimizedActions = JSON.parse(result.response);
            logger_js_1.default.info('Action plan optimized', {
                originalActions: actions.length,
                optimizedActions: optimizedActions.length,
                reduction: Math.round((1 - optimizedActions.length / actions.length) * 100)
            });
            return optimizedActions;
        }
        catch (error) {
            logger_js_1.default.warn('Action plan optimization failed, using original plan', { error });
            return actions;
        }
    }
    /**
     * 리밸런싱 실행
     */
    async executeRebalancing(rebalanceId, actions, beforeState, pendingTasks) {
        const startTime = Date.now();
        const executedActions = [];
        const feedback = [];
        try {
            // 액션들을 순서대로 실행 (시뮬레이션)
            let afterState = JSON.parse(JSON.stringify(beforeState));
            for (const action of actions) {
                try {
                    afterState = await this.simulateActionExecution(action, afterState, pendingTasks);
                    executedActions.push(action);
                    feedback.push(`✅ ${action.type} action executed successfully`);
                }
                catch (actionError) {
                    feedback.push(`❌ ${action.type} action failed: ${actionError}`);
                    logger_js_1.default.warn('Rebalance action failed', {
                        rebalanceId,
                        action: action.type,
                        error: actionError
                    });
                }
            }
            // 개선 메트릭 계산
            const improvementMetrics = this.calculateImprovementMetrics(beforeState, afterState);
            const result = {
                rebalanceId,
                timestamp: Date.now(),
                actions: executedActions,
                beforeState,
                afterState,
                improvementMetrics,
                success: executedActions.length > 0,
                executionTime: Date.now() - startTime,
                feedback
            };
            logger_js_1.default.info('Rebalancing execution completed', {
                rebalanceId,
                executedActions: executedActions.length,
                totalActions: actions.length,
                overallImprovement: this.calculateOverallImprovement(improvementMetrics)
            });
            return result;
        }
        catch (error) {
            logger_js_1.default.error('Rebalancing execution failed', {
                rebalanceId,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            return {
                rebalanceId,
                timestamp: Date.now(),
                actions: executedActions,
                beforeState,
                afterState: beforeState,
                improvementMetrics: {
                    utilizationImprovement: 0,
                    responseTimeImprovement: 0,
                    throughputImprovement: 0,
                    burnoutReduction: 0
                },
                success: false,
                executionTime: Date.now() - startTime,
                feedback: [`Execution failed: ${error}`]
            };
        }
    }
    /**
     * 액션 실행 시뮬레이션
     */
    async simulateActionExecution(action, currentState, pendingTasks) {
        const newState = JSON.parse(JSON.stringify(currentState));
        const sourceTeam = newState.find(team => team.teamName === action.sourceTeam);
        const targetTeam = action.targetTeam ? newState.find(team => team.teamName === action.targetTeam) : null;
        if (!sourceTeam) {
            throw new Error(`Source team ${action.sourceTeam} not found`);
        }
        const affectedTasks = pendingTasks.filter(task => action.taskIds.includes(task.taskId));
        const totalTaskDuration = affectedTasks.reduce((sum, task) => sum + task.estimatedDuration, 0);
        switch (action.type) {
            case 'redistribute':
                if (targetTeam) {
                    sourceTeam.currentTasks -= action.taskIds.length;
                    sourceTeam.utilization = Math.max(0, sourceTeam.utilization - (action.taskIds.length / sourceTeam.capacity));
                    targetTeam.currentTasks += action.taskIds.length;
                    targetTeam.utilization = Math.min(1, targetTeam.utilization + (action.taskIds.length / targetTeam.capacity));
                }
                break;
            case 'defer':
                sourceTeam.currentTasks -= action.taskIds.length;
                sourceTeam.utilization = Math.max(0, sourceTeam.utilization - (action.taskIds.length / sourceTeam.capacity));
                sourceTeam.burnoutRisk = Math.max(0, sourceTeam.burnoutRisk - 0.1);
                break;
            case 'escalate':
                // 우선순위 상승으로 인한 리소스 집중
                sourceTeam.responseTime *= 0.8; // 응답 시간 개선
                break;
            case 'delegate':
                if (targetTeam) {
                    sourceTeam.currentTasks -= action.taskIds.length;
                    targetTeam.currentTasks += action.taskIds.length;
                    targetTeam.utilization = Math.min(1, targetTeam.utilization + (action.taskIds.length / targetTeam.capacity));
                }
                break;
            case 'parallelize':
                // 병렬화로 인한 효율성 향상
                sourceTeam.avgTaskDuration *= 0.7;
                break;
        }
        return newState;
    }
    /**
     * 팀 적합성 점수 계산
     */
    calculateTeamSuitability(team, task) {
        const skillScore = task.requiredSkills.reduce((sum, skill) => {
            return sum + (team.skillEfficiency[skill] || 0);
        }, 0) / task.requiredSkills.length;
        const loadScore = 1 - team.utilization; // 부하가 낮을수록 높은 점수
        const responseScore = 1 / (team.responseTime / 1000); // 응답 시간이 빠를수록 높은 점수
        return (skillScore * this.currentStrategy.skillMatchWeighting +
            loadScore * (1 - this.currentStrategy.skillMatchWeighting - this.currentStrategy.collaborationWeighting) +
            (team.collaborationScore * this.currentStrategy.collaborationWeighting));
    }
    /**
     * 개선 메트릭 계산
     */
    calculateImprovementMetrics(beforeState, afterState) {
        const beforeAvgUtilization = beforeState.reduce((sum, team) => sum + team.utilization, 0) / beforeState.length;
        const afterAvgUtilization = afterState.reduce((sum, team) => sum + team.utilization, 0) / afterState.length;
        const beforeAvgResponseTime = beforeState.reduce((sum, team) => sum + team.responseTime, 0) / beforeState.length;
        const afterAvgResponseTime = afterState.reduce((sum, team) => sum + team.responseTime, 0) / afterState.length;
        const beforeTotalTasks = beforeState.reduce((sum, team) => sum + team.currentTasks, 0);
        const afterTotalTasks = afterState.reduce((sum, team) => sum + team.currentTasks, 0);
        const beforeAvgBurnout = beforeState.reduce((sum, team) => sum + team.burnoutRisk, 0) / beforeState.length;
        const afterAvgBurnout = afterState.reduce((sum, team) => sum + team.burnoutRisk, 0) / afterState.length;
        return {
            utilizationImprovement: (beforeAvgUtilization - afterAvgUtilization) / beforeAvgUtilization,
            responseTimeImprovement: (beforeAvgResponseTime - afterAvgResponseTime) / beforeAvgResponseTime,
            throughputImprovement: (afterTotalTasks - beforeTotalTasks) / beforeTotalTasks,
            burnoutReduction: (beforeAvgBurnout - afterAvgBurnout) / beforeAvgBurnout
        };
    }
    /**
     * 전체 개선도 계산
     */
    calculateOverallImprovement(metrics) {
        return (metrics.utilizationImprovement * 0.3 +
            metrics.responseTimeImprovement * 0.3 +
            metrics.throughputImprovement * 0.2 +
            metrics.burnoutReduction * 0.2);
    }
    /**
     * 성능 히스토리 업데이트
     */
    updatePerformanceHistory(teamLoads, rebalanceActions) {
        const systemThroughput = teamLoads.reduce((sum, team) => sum + team.currentTasks, 0);
        this.performanceHistory.push({
            timestamp: Date.now(),
            teamLoads: JSON.parse(JSON.stringify(teamLoads)),
            rebalanceActions,
            systemThroughput
        });
        // 최근 100개 기록만 유지
        if (this.performanceHistory.length > 100) {
            this.performanceHistory = this.performanceHistory.slice(-100);
        }
    }
    /**
     * 전략 최적화 (학습 기반)
     */
    async optimizeStrategy(rebalanceResult) {
        if (this.performanceHistory.length < 10)
            return; // 충분한 데이터가 있을 때만 최적화
        const overallImprovement = this.calculateOverallImprovement(rebalanceResult.improvementMetrics);
        // 성과가 좋지 않으면 전략 조정
        if (overallImprovement < 0.1) {
            if (this.currentStrategy.rebalanceThreshold > 0.6) {
                this.currentStrategy.rebalanceThreshold -= 0.05; // 더 적극적으로 리밸런싱
            }
            if (this.currentStrategy.maxUtilization > 0.8) {
                this.currentStrategy.maxUtilization -= 0.05; // 더 보수적인 활용도
            }
        }
        else if (overallImprovement > 0.3) {
            // 성과가 좋으면 더 효율적으로 조정
            if (this.currentStrategy.rebalanceThreshold < 0.9) {
                this.currentStrategy.rebalanceThreshold += 0.02;
            }
        }
        logger_js_1.default.info('Strategy optimized based on performance', {
            overallImprovement,
            newThreshold: this.currentStrategy.rebalanceThreshold,
            newMaxUtilization: this.currentStrategy.maxUtilization
        });
    }
    /**
     * 현재 전략 조회
     */
    getStrategy() {
        return { ...this.currentStrategy };
    }
    /**
     * 성능 히스토리 조회
     */
    getPerformanceHistory() {
        return [...this.performanceHistory];
    }
    /**
     * 실시간 추천 시스템
     */
    async getRealtimeRecommendations(currentLoad) {
        const recommendations = [];
        const overloadedTeams = currentLoad.filter(team => team.utilization > 0.85);
        const underloadedTeams = currentLoad.filter(team => team.utilization < 0.5);
        const burnoutRiskTeams = currentLoad.filter(team => team.burnoutRisk > 0.7);
        if (overloadedTeams.length > 0) {
            recommendations.push(`⚠️ ${overloadedTeams.length} teams are overloaded - consider redistribution`);
        }
        if (underloadedTeams.length > 0 && overloadedTeams.length > 0) {
            recommendations.push(`💡 Balance workload: redistribute from ${overloadedTeams.map(t => t.teamName).join(', ')} to ${underloadedTeams.map(t => t.teamName).join(', ')}`);
        }
        if (burnoutRiskTeams.length > 0) {
            recommendations.push(`🚨 Burnout risk detected in ${burnoutRiskTeams.map(t => t.teamName).join(', ')} - reduce workload immediately`);
        }
        const avgResponseTime = currentLoad.reduce((sum, team) => sum + team.responseTime, 0) / currentLoad.length;
        if (avgResponseTime > this.currentStrategy.responseTimeThreshold) {
            recommendations.push(`⏱️ High response times detected - consider parallelizing tasks or optimizing processes`);
        }
        return recommendations;
    }
}
exports.adaptiveLoadBalancer = new AdaptiveLoadBalancer();
//# sourceMappingURL=adaptiveLoadBalancer.js.map