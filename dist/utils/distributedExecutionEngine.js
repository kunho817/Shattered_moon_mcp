"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.distributedExecutionEngine = exports.DistributedExecutionEngine = void 0;
const logger_js_1 = __importDefault(require("./logger.js"));
const taskGranularityEngine_js_1 = require("./taskGranularityEngine.js");
const enhancedClaudeCodeManager_js_1 = require("./enhancedClaudeCodeManager.js");
class DistributedExecutionEngine {
    static instance;
    activePlans = new Map();
    executionStatus = new Map();
    executionHistory = [];
    static getInstance() {
        if (!DistributedExecutionEngine.instance) {
            DistributedExecutionEngine.instance = new DistributedExecutionEngine();
        }
        return DistributedExecutionEngine.instance;
    }
    async createExecutionPlan(task, context = '', options = {}) {
        logger_js_1.default.info('Creating execution plan', { task, options });
        try {
            // 1. 작업 세분화 분석
            const breakdown = await taskGranularityEngine_js_1.taskGranularityEngine.analyzeTaskGranularity(task, context, {
                strategy: 'hybrid',
                targetParallelism: options.targetParallelism || 4,
                maxSubtasks: 15,
                minTaskDuration: 10,
                maxTaskDuration: options.maxDuration || 120,
                atomicityThreshold: 7
            });
            // 2. 실행 페이즈 생성
            const phases = await this.generateExecutionPhases(breakdown);
            // 3. 리소스 할당 최적화
            const resourceAllocation = await this.optimizeResourceAllocation(breakdown, phases, options.priorityTeams);
            // 4. 모니터링 계획 수립
            const monitoringPlan = this.createMonitoringPlan(breakdown, phases);
            // 5. 병렬화 활용도 계산
            const parallelismUtilization = this.calculateParallelismUtilization(phases);
            const plan = {
                id: `exec_plan_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                breakdown,
                phases,
                totalDuration: phases.reduce((sum, p) => sum + p.expectedDuration, 0),
                parallelismUtilization,
                resourceAllocation,
                monitoringPlan
            };
            this.activePlans.set(plan.id, plan);
            logger_js_1.default.info('Execution plan created', {
                planId: plan.id,
                subtasks: breakdown.subtasks.length,
                phases: phases.length,
                parallelismUtilization,
                totalDuration: plan.totalDuration
            });
            return plan;
        }
        catch (error) {
            logger_js_1.default.error('Failed to create execution plan', { error, task });
            throw error;
        }
    }
    async generateExecutionPhases(breakdown) {
        const phases = [];
        const processedTasks = new Set();
        let phaseIndex = 0;
        // 토폴로지 정렬을 통한 실행 순서 결정
        const taskLevels = this.calculateTaskLevels(breakdown);
        const maxLevel = Math.max(...Object.values(taskLevels));
        for (let level = 0; level <= maxLevel; level++) {
            const levelTasks = Object.entries(taskLevels)
                .filter(([_, taskLevel]) => taskLevel === level)
                .map(([taskId, _]) => taskId);
            if (levelTasks.length === 0)
                continue;
            // 같은 레벨의 작업들을 병렬 그룹으로 묶기
            const parallelGroups = this.groupParallelTasks(levelTasks, breakdown.subtasks, breakdown.dependencies);
            const phase = {
                id: `phase_${phaseIndex++}`,
                name: `Phase ${phaseIndex}: ${this.getPhaseName(levelTasks, breakdown.subtasks)}`,
                tasks: levelTasks,
                startTime: new Date(),
                expectedDuration: Math.max(...levelTasks.map(taskId => breakdown.subtasks.find(t => t.id === taskId)?.estimatedTime || 0)),
                parallelTasks: parallelGroups,
                dependencies: this.getPhaseDependencies(levelTasks, breakdown.dependencies),
                teamAssignments: this.assignTasksToTeams(levelTasks, breakdown.subtasks)
            };
            phases.push(phase);
            levelTasks.forEach(taskId => processedTasks.add(taskId));
        }
        return phases;
    }
    calculateTaskLevels(breakdown) {
        const levels = {};
        const inDegree = {};
        // 모든 작업의 진입 차수 초기화
        breakdown.subtasks.forEach(task => {
            inDegree[task.id] = 0;
            levels[task.id] = 0;
        });
        // 의존성에 따른 진입 차수 계산
        breakdown.dependencies.forEach(dep => {
            inDegree[dep.toTask] = (inDegree[dep.toTask] || 0) + 1;
        });
        // 토폴로지 정렬로 레벨 계산
        const queue = [];
        Object.entries(inDegree).forEach(([taskId, degree]) => {
            if (degree === 0) {
                queue.push(taskId);
            }
        });
        while (queue.length > 0) {
            const currentTask = queue.shift();
            breakdown.dependencies
                .filter(dep => dep.fromTask === currentTask)
                .forEach(dep => {
                levels[dep.toTask] = Math.max(levels[dep.toTask], levels[currentTask] + 1);
                inDegree[dep.toTask]--;
                if (inDegree[dep.toTask] === 0) {
                    queue.push(dep.toTask);
                }
            });
        }
        return levels;
    }
    groupParallelTasks(levelTasks, subtasks, dependencies) {
        const groups = [];
        const taskMap = new Map(subtasks.map(t => [t.id, t]));
        const remaining = new Set(levelTasks);
        while (remaining.size > 0) {
            const group = [];
            const groupTeams = new Set();
            for (const taskId of remaining) {
                const task = taskMap.get(taskId);
                if (!task)
                    continue;
                // 같은 팀에 너무 많은 작업이 할당되지 않도록 제한
                if (!groupTeams.has(task.suggestedTeam) || group.length < 3) {
                    group.push(taskId);
                    groupTeams.add(task.suggestedTeam);
                    remaining.delete(taskId);
                }
            }
            if (group.length > 0) {
                groups.push(group);
            }
            else {
                // 무한 루프 방지
                break;
            }
        }
        return groups;
    }
    getPhaseName(taskIds, subtasks) {
        const taskMap = new Map(subtasks.map(t => [t.id, t]));
        const tasks = taskIds.map(id => taskMap.get(id)).filter(Boolean);
        const commonKeywords = this.extractCommonKeywords(tasks.map(t => t.description));
        return commonKeywords.slice(0, 3).join(', ') || 'Mixed Tasks';
    }
    extractCommonKeywords(descriptions) {
        const allWords = descriptions.join(' ').toLowerCase().split(/\s+/);
        const wordCount = new Map();
        allWords.forEach(word => {
            if (word.length > 3) { // 짧은 단어 제외
                wordCount.set(word, (wordCount.get(word) || 0) + 1);
            }
        });
        return Array.from(wordCount.entries())
            .filter(([_, count]) => count > 1)
            .sort((a, b) => b[1] - a[1])
            .map(([word, _]) => word);
    }
    getPhaseDependencies(taskIds, dependencies) {
        return dependencies
            .filter(dep => taskIds.includes(dep.toTask))
            .map(dep => dep.fromTask)
            .filter(taskId => !taskIds.includes(taskId));
    }
    assignTasksToTeams(taskIds, subtasks) {
        const assignments = new Map();
        const taskMap = new Map(subtasks.map(t => [t.id, t]));
        taskIds.forEach(taskId => {
            const task = taskMap.get(taskId);
            if (task) {
                const teamTasks = assignments.get(task.suggestedTeam) || [];
                teamTasks.push(taskId);
                assignments.set(task.suggestedTeam, teamTasks);
            }
        });
        return assignments;
    }
    async optimizeResourceAllocation(breakdown, phases, priorityTeams) {
        const allocations = [];
        const teamWorkload = new Map();
        // 팀별 워크로드 계산
        breakdown.subtasks.forEach(task => {
            const current = teamWorkload.get(task.suggestedTeam) || { tasks: [], totalTime: 0 };
            current.tasks.push(task.id);
            current.totalTime += task.estimatedTime;
            teamWorkload.set(task.suggestedTeam, current);
        });
        // 리소스 할당 최적화
        for (const [team, workload] of teamWorkload) {
            const allocation = {
                team,
                allocatedTasks: workload.tasks,
                utilization: this.calculateTeamUtilization(team, workload.totalTime),
                estimatedLoad: workload.totalTime,
                peakTime: this.calculatePeakTime(team, phases),
                bufferTime: Math.max(workload.totalTime * 0.2, 30) // 20% 버퍼 또는 최소 30분
            };
            allocations.push(allocation);
        }
        // 우선순위 팀 조정
        if (priorityTeams) {
            allocations.sort((a, b) => {
                const aPriority = priorityTeams.includes(a.team) ? 1 : 0;
                const bPriority = priorityTeams.includes(b.team) ? 1 : 0;
                return bPriority - aPriority;
            });
        }
        return allocations;
    }
    calculateTeamUtilization(team, totalTime) {
        // 팀의 일반적인 용량 대비 활용도 계산 (가정: 8시간 = 480분 기준)
        const standardCapacity = 480; // 8 hours in minutes
        return Math.min(totalTime / standardCapacity, 1.5); // 최대 150% 활용
    }
    calculatePeakTime(team, phases) {
        // 해당 팀이 가장 바쁠 시점 계산
        let maxLoad = 0;
        let peakTime = new Date();
        phases.forEach(phase => {
            const teamTasks = phase.teamAssignments.get(team) || [];
            if (teamTasks.length > maxLoad) {
                maxLoad = teamTasks.length;
                peakTime = phase.startTime;
            }
        });
        return peakTime;
    }
    createMonitoringPlan(breakdown, phases) {
        const checkpoints = [];
        const alertThresholds = [
            {
                metric: 'duration',
                threshold: 1.5, // 150% of estimated time
                action: 'escalate'
            },
            {
                metric: 'team_load',
                threshold: 1.3, // 130% of capacity
                action: 'rebalance'
            },
            {
                metric: 'quality',
                threshold: 0.7, // 70% quality score
                action: 'notify'
            }
        ];
        // 각 페이즈 끝에 체크포인트 생성
        phases.forEach((phase, index) => {
            checkpoints.push({
                id: `checkpoint_${index}`,
                taskIds: phase.tasks,
                description: `Phase ${index + 1} completion check`,
                successCriteria: [
                    'All tasks completed',
                    'Quality standards met',
                    'No blocking issues'
                ],
                timeLimit: phase.expectedDuration,
                automated: true
            });
        });
        const escalationRules = [
            {
                trigger: 'task_overdue',
                condition: 'duration > 150% AND critical_path = true',
                action: 'assign_additional_resources',
                priority: 1
            },
            {
                trigger: 'quality_issue',
                condition: 'quality_score < 70%',
                action: 'pause_and_review',
                targetTeam: 'quality_assurance',
                priority: 2
            }
        ];
        return {
            checkpoints,
            alertThresholds,
            escalationRules,
            reportingInterval: 15 // 15분마다 상태 보고
        };
    }
    calculateParallelismUtilization(phases) {
        let totalTasks = 0;
        let parallelTasks = 0;
        phases.forEach(phase => {
            totalTasks += phase.tasks.length;
            const maxParallelInPhase = Math.max(...phase.parallelTasks.map(group => group.length));
            parallelTasks += maxParallelInPhase;
        });
        return totalTasks > 0 ? parallelTasks / totalTasks : 0;
    }
    async executeTask(planId) {
        const plan = this.activePlans.get(planId);
        if (!plan) {
            throw new Error(`Execution plan ${planId} not found`);
        }
        logger_js_1.default.info('Starting task execution', { planId });
        const status = {
            planId,
            currentPhase: plan.phases[0]?.id || '',
            completedTasks: [],
            activeTasks: [],
            blockedTasks: [],
            overallProgress: 0,
            teamUtilization: new Map(),
            estimatedCompletion: new Date(Date.now() + plan.totalDuration * 60000),
            alerts: [],
            metrics: {
                tasksCompleted: 0,
                tasksInProgress: 0,
                tasksPending: plan.breakdown.subtasks.length,
                averageTaskDuration: 0,
                parallelismEfficiency: 0,
                teamEfficiency: new Map(),
                qualityScore: 1.0,
                resourceUtilization: 0
            }
        };
        this.executionStatus.set(planId, status);
        // 실행 시뮬레이션 (실제 구현에서는 실제 작업 실행)
        await this.simulateExecution(plan, status);
        return status;
    }
    async simulateExecution(plan, status) {
        // 실행 시뮬레이션 로직
        logger_js_1.default.info('Simulating task execution', { planId: plan.id });
        for (const phase of plan.phases) {
            status.currentPhase = phase.id;
            // 페이즈별 작업 실행
            for (const parallelGroup of phase.parallelTasks) {
                status.activeTasks = parallelGroup;
                // 병렬 작업 그룹 실행 시뮬레이션
                await new Promise(resolve => setTimeout(resolve, 100)); // 짧은 지연
                // 작업 완료 처리
                status.completedTasks.push(...parallelGroup);
                status.activeTasks = [];
                status.metrics.tasksCompleted += parallelGroup.length;
                status.metrics.tasksPending -= parallelGroup.length;
            }
            // 진행률 업데이트
            status.overallProgress = status.completedTasks.length / plan.breakdown.subtasks.length;
        }
        logger_js_1.default.info('Task execution simulation completed', {
            planId: plan.id,
            completedTasks: status.completedTasks.length
        });
    }
    getExecutionStatus(planId) {
        return this.executionStatus.get(planId);
    }
    getAllActivePlans() {
        return Array.from(this.activePlans.values());
    }
    async optimizeOngoingExecution(planId) {
        const status = this.executionStatus.get(planId);
        const plan = this.activePlans.get(planId);
        if (!status || !plan) {
            throw new Error(`Execution ${planId} not found`);
        }
        logger_js_1.default.info('Optimizing ongoing execution', { planId });
        // 현재 실행 상태 분석
        const bottlenecks = this.identifyBottlenecks(status, plan);
        if (bottlenecks.length > 0) {
            // 병목 해결 전략 실행
            await this.resolveBottlenecks(bottlenecks, status, plan);
        }
        // 리소스 재할당
        await this.rebalanceResources(status, plan);
    }
    identifyBottlenecks(status, plan) {
        const bottlenecks = [];
        // 오래 실행되는 작업 식별
        status.activeTasks.forEach(taskId => {
            const task = plan.breakdown.subtasks.find(t => t.id === taskId);
            if (task && task.estimatedTime > 90) { // 90분 이상
                bottlenecks.push(taskId);
            }
        });
        return bottlenecks;
    }
    async resolveBottlenecks(bottlenecks, status, plan) {
        for (const taskId of bottlenecks) {
            logger_js_1.default.info('Resolving bottleneck', { taskId });
            // 병목 작업 세분화
            const task = plan.breakdown.subtasks.find(t => t.id === taskId);
            if (task && task.atomicity < 8) {
                const refinedBreakdown = await taskGranularityEngine_js_1.taskGranularityEngine.analyzeTaskGranularity(task.description, '', {
                    strategy: 'time_based',
                    targetParallelism: 3,
                    maxSubtasks: 5,
                    minTaskDuration: 15,
                    maxTaskDuration: 30,
                    atomicityThreshold: 9
                });
                // 세분화된 작업으로 교체
                if (refinedBreakdown.subtasks.length > 1) {
                    this.replaceTask(taskId, refinedBreakdown.subtasks, plan);
                }
            }
        }
    }
    replaceTask(taskId, newTasks, plan) {
        // 기존 작업을 새로운 세분화된 작업들로 교체
        const taskIndex = plan.breakdown.subtasks.findIndex(t => t.id === taskId);
        if (taskIndex >= 0) {
            plan.breakdown.subtasks.splice(taskIndex, 1, ...newTasks);
            logger_js_1.default.info('Task replaced with granular subtasks', {
                originalTask: taskId,
                newTasks: newTasks.length
            });
        }
    }
    async rebalanceResources(status, plan) {
        logger_js_1.default.info('Rebalancing resources', { planId: plan.id });
        // 팀 활용도 분석
        const teamLoads = new Map();
        plan.breakdown.subtasks.forEach(task => {
            const currentLoad = teamLoads.get(task.suggestedTeam) || 0;
            teamLoads.set(task.suggestedTeam, currentLoad + task.estimatedTime);
        });
        // 과부하 팀과 저활용 팀 식별
        const overloadedTeams = [];
        const underutilizedTeams = [];
        teamLoads.forEach((load, team) => {
            if (load > 400) { // 6시간 40분 이상
                overloadedTeams.push(team);
            }
            else if (load < 120) { // 2시간 이하
                underutilizedTeams.push(team);
            }
        });
        // 작업 재할당
        if (overloadedTeams.length > 0 && underutilizedTeams.length > 0) {
            await this.redistributeTasks(overloadedTeams, underutilizedTeams, plan);
        }
    }
    async redistributeTasks(overloadedTeams, underutilizedTeams, plan) {
        for (const overloadedTeam of overloadedTeams) {
            const teamTasks = plan.breakdown.subtasks.filter(t => t.suggestedTeam === overloadedTeam);
            const redistributableTasks = teamTasks.filter(t => t.parallelizable && t.complexity !== 'critical');
            for (const task of redistributableTasks.slice(0, 2)) { // 최대 2개 작업 재할당
                const bestAlternativeTeam = await this.findBestAlternativeTeam(task, underutilizedTeams);
                if (bestAlternativeTeam) {
                    task.suggestedTeam = bestAlternativeTeam;
                    logger_js_1.default.info('Task redistributed', {
                        taskId: task.id,
                        from: overloadedTeam,
                        to: bestAlternativeTeam
                    });
                }
            }
        }
    }
    async findBestAlternativeTeam(task, availableTeams) {
        // Claude Code를 사용하여 최적의 대안 팀 찾기
        const analysisPrompt = `
Find the best alternative team for this task:

Task: ${task.description}
Required Skills: ${task.requiredSkills.join(', ')}
Complexity: ${task.complexity}
Current Team: ${task.suggestedTeam}

Available Teams: ${availableTeams.join(', ')}

Available Team Capabilities:
- planning: Game design, UX research, product management
- backend: ECS specialists, memory experts, algorithm specialists
- frontend: DirectX 12 specialists, shader wizards, graphics engineers
- testing: QA engineers, performance testers, automation specialists
- performance: Profiler experts, optimization specialists, benchmark analysts
- devops: CI/CD engineers, deployment specialists, release managers

Return only the team name that best matches the required skills.
`;
        try {
            const analysis = await enhancedClaudeCodeManager_js_1.enhancedClaudeCodeManager.performEnhancedAnalysis(analysisPrompt, { timestamp: new Date(), sessionId: `team_selection_${Date.now()}` }, { timeout: 10000, useCache: true });
            const suggestedTeam = analysis.analysis?.trim().toLowerCase();
            return availableTeams.find(team => team.toLowerCase() === suggestedTeam) || null;
        }
        catch (error) {
            logger_js_1.default.warn('Failed to find alternative team using Claude Code', { error });
            return availableTeams[0] || null; // 폴백: 첫 번째 가용 팀
        }
    }
}
exports.DistributedExecutionEngine = DistributedExecutionEngine;
exports.distributedExecutionEngine = DistributedExecutionEngine.getInstance();
//# sourceMappingURL=distributedExecutionEngine.js.map