import logger from './logger.js';
import { enhancedClaudeCodeManager } from './enhancedClaudeCodeManager.js';

export interface DependencyNode {
  id: string;
  type: 'task' | 'resource' | 'team' | 'knowledge';
  name: string;
  dependencies: string[];
  dependents: string[];
  status: 'available' | 'busy' | 'blocked' | 'failed';
  priority: number;
  estimatedResolutionTime?: number;
}

export interface DependencyGraph {
  nodes: Map<string, DependencyNode>;
  edges: DependencyEdge[];
  criticalPath: string[];
  cycles: string[][];
  resolutionOrder: string[];
}

export interface DependencyEdge {
  from: string;
  to: string;
  type: 'hard' | 'soft' | 'resource' | 'knowledge' | 'temporal';
  weight: number;
  blocking: boolean;
  condition?: string;
}

export interface DependencyConflict {
  id: string;
  type: 'circular' | 'resource_contention' | 'temporal' | 'knowledge_gap';
  affectedNodes: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  suggestedResolution: string[];
  autoResolvable: boolean;
}

export interface ResolutionStrategy {
  conflictId: string;
  strategy: 'break_cycle' | 'resource_allocation' | 'temporal_adjustment' | 'knowledge_transfer' | 'parallel_execution';
  steps: ResolutionStep[];
  estimatedTime: number;
  riskLevel: 'low' | 'medium' | 'high';
  successProbability: number;
}

export interface ResolutionStep {
  id: string;
  action: string;
  targetNodes: string[];
  expectedOutcome: string;
  rollbackPlan?: string;
}

export class DependencyManager {
  private static instance: DependencyManager;
  private dependencyGraphs = new Map<string, DependencyGraph>();
  private activeConflicts = new Map<string, DependencyConflict>();
  private resolutionHistory: ResolutionStrategy[] = [];

  public static getInstance(): DependencyManager {
    if (!DependencyManager.instance) {
      DependencyManager.instance = new DependencyManager();
    }
    return DependencyManager.instance;
  }

  async createDependencyGraph(
    planId: string,
    nodes: DependencyNode[],
    edges: DependencyEdge[]
  ): Promise<DependencyGraph> {
    logger.info('Creating dependency graph', { planId, nodeCount: nodes.length, edgeCount: edges.length });

    const nodeMap = new Map(nodes.map(node => [node.id, node]));
    
    // 의존성 그래프 생성
    const graph: DependencyGraph = {
      nodes: nodeMap,
      edges,
      criticalPath: [],
      cycles: [],
      resolutionOrder: []
    };

    // 순환 의존성 탐지
    graph.cycles = this.detectCycles(graph);
    
    // 크리티컬 패스 계산
    graph.criticalPath = this.calculateCriticalPath(graph);
    
    // 해결 순서 결정
    graph.resolutionOrder = this.calculateResolutionOrder(graph);

    this.dependencyGraphs.set(planId, graph);

    // 충돌 분석
    await this.analyzeConflicts(planId, graph);

    logger.info('Dependency graph created', {
      planId,
      cycles: graph.cycles.length,
      criticalPathLength: graph.criticalPath.length,
      resolutionOrder: graph.resolutionOrder.length
    });

    return graph;
  }

  private detectCycles(graph: DependencyGraph): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const path: string[] = [];

    const dfs = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) {
        // 순환 발견
        const cycleStart = path.indexOf(nodeId);
        if (cycleStart >= 0) {
          cycles.push(path.slice(cycleStart).concat([nodeId]));
        }
        return true;
      }

      if (visited.has(nodeId)) {
        return false;
      }

      visited.add(nodeId);
      recursionStack.add(nodeId);
      path.push(nodeId);

      const node = graph.nodes.get(nodeId);
      if (node) {
        for (const depId of node.dependencies) {
          if (dfs(depId)) {
            return true;
          }
        }
      }

      recursionStack.delete(nodeId);
      path.pop();
      return false;
    };

    // 모든 노드에서 DFS 시작
    for (const nodeId of graph.nodes.keys()) {
      if (!visited.has(nodeId)) {
        dfs(nodeId);
      }
    }

    return cycles;
  }

  private calculateCriticalPath(graph: DependencyGraph): string[] {
    const earliestStart = new Map<string, number>();
    const latestStart = new Map<string, number>();
    const criticalNodes = new Set<string>();

    // 순방향 패스 - 최조 시작 시간 계산
    const calculateEarliestStart = (nodeId: string): number => {
      if (earliestStart.has(nodeId)) {
        return earliestStart.get(nodeId)!;
      }

      const node = graph.nodes.get(nodeId);
      if (!node) return 0;

      let maxDependencyTime = 0;
      for (const depId of node.dependencies) {
        const depEarliestStart = calculateEarliestStart(depId);
        const depNode = graph.nodes.get(depId);
        const depDuration = depNode?.estimatedResolutionTime || 30;
        maxDependencyTime = Math.max(maxDependencyTime, depEarliestStart + depDuration);
      }

      earliestStart.set(nodeId, maxDependencyTime);
      return maxDependencyTime;
    };

    // 모든 노드의 최조 시작 시간 계산
    for (const nodeId of graph.nodes.keys()) {
      calculateEarliestStart(nodeId);
    }

    // 프로젝트 완료 시간 (최대 최조 완료 시간)
    const projectCompletionTime = Math.max(
      ...Array.from(graph.nodes.entries()).map(([nodeId, node]) => 
        (earliestStart.get(nodeId) || 0) + (node.estimatedResolutionTime || 30)
      )
    );

    // 역방향 패스 - 최늦 시작 시간 계산
    const calculateLatestStart = (nodeId: string): number => {
      if (latestStart.has(nodeId)) {
        return latestStart.get(nodeId)!;
      }

      const node = graph.nodes.get(nodeId);
      if (!node) return projectCompletionTime;

      // 이 노드에 의존하는 노드들이 없으면 프로젝트 완료 시간에서 이 노드의 소요 시간을 뺀 값
      const dependents = Array.from(graph.nodes.values()).filter(n => 
        n.dependencies.includes(nodeId)
      );

      if (dependents.length === 0) {
        const latest = projectCompletionTime - (node.estimatedResolutionTime || 30);
        latestStart.set(nodeId, latest);
        return latest;
      }

      let minDependentTime = Infinity;
      for (const dependent of dependents) {
        const dependentLatestStart = calculateLatestStart(dependent.id);
        minDependentTime = Math.min(minDependentTime, dependentLatestStart);
      }

      const latest = minDependentTime - (node.estimatedResolutionTime || 30);
      latestStart.set(nodeId, latest);
      return latest;
    };

    // 모든 노드의 최늦 시작 시간 계산
    for (const nodeId of graph.nodes.keys()) {
      calculateLatestStart(nodeId);
    }

    // 크리티컬 패스 식별 (최조 시작 시간 = 최늦 시작 시간)
    for (const nodeId of graph.nodes.keys()) {
      const earliest = earliestStart.get(nodeId) || 0;
      const latest = latestStart.get(nodeId) || 0;
      if (Math.abs(earliest - latest) < 1) { // 부동 소수점 오차 고려
        criticalNodes.add(nodeId);
      }
    }

    // 크리티컬 패스를 순서대로 정렬
    const criticalPath: string[] = [];
    const visited = new Set<string>();

    const buildPath = (nodeId: string) => {
      if (visited.has(nodeId) || !criticalNodes.has(nodeId)) return;
      
      visited.add(nodeId);
      const node = graph.nodes.get(nodeId);
      if (node) {
        // 의존성 중 크리티컬 패스에 있는 것들을 먼저 처리
        for (const depId of node.dependencies) {
          if (criticalNodes.has(depId)) {
            buildPath(depId);
          }
        }
        criticalPath.push(nodeId);
      }
    };

    // 크리티컬 패스 노드들을 순서대로 추가
    for (const nodeId of criticalNodes) {
      buildPath(nodeId);
    }

    return criticalPath;
  }

  private calculateResolutionOrder(graph: DependencyGraph): string[] {
    const inDegree = new Map<string, number>();
    const resolutionOrder: string[] = [];

    // 진입 차수 계산
    for (const nodeId of graph.nodes.keys()) {
      inDegree.set(nodeId, 0);
    }

    for (const edge of graph.edges) {
      if (edge.blocking) {
        inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
      }
    }

    // 위상 정렬
    const queue: string[] = [];
    for (const [nodeId, degree] of inDegree) {
      if (degree === 0) {
        queue.push(nodeId);
      }
    }

    while (queue.length > 0) {
      // 우선순위 기준으로 정렬 (높은 우선순위 먼저)
      queue.sort((a, b) => {
        const nodeA = graph.nodes.get(a);
        const nodeB = graph.nodes.get(b);
        return (nodeB?.priority || 0) - (nodeA?.priority || 0);
      });

      const currentNode = queue.shift()!;
      resolutionOrder.push(currentNode);

      // 현재 노드에 의존하는 노드들의 진입 차수 감소
      for (const edge of graph.edges) {
        if (edge.from === currentNode && edge.blocking) {
          const newDegree = (inDegree.get(edge.to) || 0) - 1;
          inDegree.set(edge.to, newDegree);
          
          if (newDegree === 0) {
            queue.push(edge.to);
          }
        }
      }
    }

    return resolutionOrder;
  }

  private async analyzeConflicts(planId: string, graph: DependencyGraph): Promise<void> {
    const conflicts: DependencyConflict[] = [];

    // 순환 의존성 충돌
    graph.cycles.forEach((cycle, index) => {
      conflicts.push({
        id: `circular_${planId}_${index}`,
        type: 'circular',
        affectedNodes: cycle,
        severity: 'high',
        description: `Circular dependency detected: ${cycle.join(' → ')}`,
        suggestedResolution: [
          'Break one dependency in the cycle',
          'Introduce intermediate node',
          'Change execution order'
        ],
        autoResolvable: false
      });
    });

    // 리소스 경합 충돌 탐지
    const resourceNodes = Array.from(graph.nodes.values()).filter(n => n.type === 'resource');
    const teamNodes = Array.from(graph.nodes.values()).filter(n => n.type === 'team');

    // 같은 리소스를 동시에 필요로 하는 작업들 찾기
    resourceNodes.forEach(resource => {
      const competingTasks = Array.from(graph.nodes.values()).filter(node => 
        node.dependencies.includes(resource.id) && node.type === 'task'
      );

      if (competingTasks.length > 1) {
        conflicts.push({
          id: `resource_${planId}_${resource.id}`,
          type: 'resource_contention',
          affectedNodes: [resource.id, ...competingTasks.map(t => t.id)],
          severity: competingTasks.length > 3 ? 'high' : 'medium',
          description: `Resource ${resource.name} required by ${competingTasks.length} tasks simultaneously`,
          suggestedResolution: [
            'Implement resource scheduling',
            'Add resource instances',
            'Serialize task execution'
          ],
          autoResolvable: true
        });
      }
    });

    // 지식 격차 충돌 탐지
    const knowledgeNodes = Array.from(graph.nodes.values()).filter(n => n.type === 'knowledge');
    knowledgeNodes.forEach(knowledge => {
      if (knowledge.status === 'blocked') {
        const dependentTasks = Array.from(graph.nodes.values()).filter(node =>
          node.dependencies.includes(knowledge.id)
        );

        if (dependentTasks.length > 0) {
          conflicts.push({
            id: `knowledge_${planId}_${knowledge.id}`,
            type: 'knowledge_gap',
            affectedNodes: [knowledge.id, ...dependentTasks.map(t => t.id)],
            severity: 'medium',
            description: `Knowledge gap in ${knowledge.name} blocking ${dependentTasks.length} tasks`,
            suggestedResolution: [
              'Conduct knowledge transfer session',
              'Create documentation',
              'Assign expert mentor'
            ],
            autoResolvable: false
          });
        }
      }
    });

    // 충돌 저장
    conflicts.forEach(conflict => {
      this.activeConflicts.set(conflict.id, conflict);
    });

    logger.info('Dependency conflicts analyzed', {
      planId,
      totalConflicts: conflicts.length,
      circular: conflicts.filter(c => c.type === 'circular').length,
      resource: conflicts.filter(c => c.type === 'resource_contention').length,
      knowledge: conflicts.filter(c => c.type === 'knowledge_gap').length
    });
  }

  async resolveConflicts(planId: string): Promise<ResolutionStrategy[]> {
    logger.info('Starting conflict resolution', { planId });

    const graph = this.dependencyGraphs.get(planId);
    if (!graph) {
      throw new Error(`Dependency graph for plan ${planId} not found`);
    }

    const planConflicts = Array.from(this.activeConflicts.values()).filter(
      conflict => conflict.id.includes(planId)
    );

    const resolutionStrategies: ResolutionStrategy[] = [];

    for (const conflict of planConflicts) {
      try {
        const strategy = await this.generateResolutionStrategy(conflict, graph);
        resolutionStrategies.push(strategy);

        // 자동 해결 가능한 충돌은 즉시 해결
        if (conflict.autoResolvable && strategy.riskLevel === 'low') {
          await this.executeResolutionStrategy(strategy, graph);
        }

      } catch (error) {
        logger.error('Failed to generate resolution strategy', { 
          conflictId: conflict.id, 
          error 
        });
      }
    }

    this.resolutionHistory.push(...resolutionStrategies);

    logger.info('Conflict resolution completed', {
      planId,
      strategiesGenerated: resolutionStrategies.length,
      autoResolved: resolutionStrategies.filter(s => s.riskLevel === 'low').length
    });

    return resolutionStrategies;
  }

  private async generateResolutionStrategy(
    conflict: DependencyConflict,
    graph: DependencyGraph
  ): Promise<ResolutionStrategy> {
    const strategyPrompt = `
Generate a resolution strategy for the following dependency conflict:

Conflict Type: ${conflict.type}
Severity: ${conflict.severity}
Description: ${conflict.description}
Affected Nodes: ${conflict.affectedNodes.join(', ')}

Graph Context:
- Total Nodes: ${graph.nodes.size}
- Critical Path Length: ${graph.criticalPath.length}
- Cycles: ${graph.cycles.length}

Available Resolution Approaches:
1. Break Cycle: Remove or modify dependencies to eliminate circular references
2. Resource Allocation: Schedule resources to prevent contention
3. Temporal Adjustment: Modify timing to resolve conflicts
4. Knowledge Transfer: Facilitate knowledge sharing to resolve gaps
5. Parallel Execution: Enable concurrent execution where possible

Provide a detailed resolution strategy with:
1. Primary strategy type
2. Step-by-step resolution steps
3. Expected time to resolution
4. Risk assessment (low/medium/high)
5. Success probability (0-1)

Format as JSON:
{
  "strategy": "strategy_type",
  "steps": [
    {
      "action": "description",
      "targetNodes": ["node1", "node2"],
      "expectedOutcome": "outcome description"
    }
  ],
  "estimatedTime": minutes,
  "riskLevel": "low|medium|high",
  "successProbability": 0.0-1.0
}
`;

    try {
      const aiResponse = await enhancedClaudeCodeManager.performEnhancedAnalysis(
        strategyPrompt,
        { timestamp: new Date(), sessionId: `dependency_${Date.now()}` },
        { timeout: 20000, useCache: true }
      );

      const jsonMatch = aiResponse.analysis?.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const strategyData = JSON.parse(jsonMatch[0]);

      return {
        conflictId: conflict.id,
        strategy: strategyData.strategy,
        steps: strategyData.steps.map((step: any, index: number) => ({
          id: `${conflict.id}_step_${index}`,
          action: step.action,
          targetNodes: step.targetNodes,
          expectedOutcome: step.expectedOutcome,
          rollbackPlan: step.rollbackPlan
        })),
        estimatedTime: strategyData.estimatedTime || 60,
        riskLevel: strategyData.riskLevel || 'medium',
        successProbability: strategyData.successProbability || 0.7
      };

    } catch (error) {
      logger.warn('AI strategy generation failed, using heuristic', { error });
      return this.generateHeuristicStrategy(conflict, graph);
    }
  }

  private generateHeuristicStrategy(
    conflict: DependencyConflict,
    graph: DependencyGraph
  ): ResolutionStrategy {
    // 휴리스틱 기반 전략 생성
    const baseStrategy: ResolutionStrategy = {
      conflictId: conflict.id,
      strategy: 'temporal_adjustment',
      steps: [{
        id: `${conflict.id}_heuristic_step`,
        action: `Resolve ${conflict.type} conflict through temporal adjustment`,
        targetNodes: conflict.affectedNodes,
        expectedOutcome: 'Conflict resolved with minimal disruption'
      }],
      estimatedTime: 45,
      riskLevel: 'medium',
      successProbability: 0.6
    };

    switch (conflict.type) {
      case 'circular':
        baseStrategy.strategy = 'break_cycle';
        baseStrategy.steps[0].action = 'Break circular dependency by removing least critical edge';
        break;
      case 'resource_contention':
        baseStrategy.strategy = 'resource_allocation';
        baseStrategy.steps[0].action = 'Schedule resource usage to prevent contention';
        break;
      case 'knowledge_gap':
        baseStrategy.strategy = 'knowledge_transfer';
        baseStrategy.steps[0].action = 'Facilitate knowledge transfer session';
        break;
    }

    return baseStrategy;
  }

  private async executeResolutionStrategy(
    strategy: ResolutionStrategy,
    graph: DependencyGraph
  ): Promise<void> {
    logger.info('Executing resolution strategy', { 
      strategyId: strategy.conflictId,
      type: strategy.strategy 
    });

    // 실제 해결 전략 실행 로직
    for (const step of strategy.steps) {
      logger.info('Executing resolution step', { 
        stepId: step.id,
        action: step.action 
      });

      // 단계별 실행 (실제 구현에서는 구체적인 작업 수행)
      switch (strategy.strategy) {
        case 'break_cycle':
          await this.breakCycleDependency(step.targetNodes, graph);
          break;
        case 'resource_allocation':
          await this.scheduleResourceUsage(step.targetNodes, graph);
          break;
        case 'knowledge_transfer':
          await this.facilitateKnowledgeTransfer(step.targetNodes, graph);
          break;
      }
    }

    // 충돌 해결 완료 표시
    this.activeConflicts.delete(strategy.conflictId);
  }

  private async breakCycleDependency(nodeIds: string[], graph: DependencyGraph): Promise<void> {
    // 순환 의존성 해결 로직
    logger.info('Breaking cycle dependency', { nodeIds });
    
    // 가장 약한 의존성 찾아서 제거 또는 수정
    const affectedEdges = graph.edges.filter(edge => 
      nodeIds.includes(edge.from) && nodeIds.includes(edge.to)
    );

    // 가중치가 가장 낮은 엣지 제거
    const weakestEdge = affectedEdges.reduce((min, edge) => 
      edge.weight < min.weight ? edge : min
    );

    if (weakestEdge) {
      weakestEdge.blocking = false;
      weakestEdge.type = 'soft';
      logger.info('Converted blocking edge to soft dependency', { 
        from: weakestEdge.from, 
        to: weakestEdge.to 
      });
    }
  }

  private async scheduleResourceUsage(nodeIds: string[], graph: DependencyGraph): Promise<void> {
    // 리소스 스케줄링 로직
    logger.info('Scheduling resource usage', { nodeIds });
    
    // 리소스 사용 시간을 조정하여 충돌 방지
    nodeIds.forEach((nodeId, index) => {
      const node = graph.nodes.get(nodeId);
      if (node && node.type === 'task') {
        // 작업 시작 시간을 순차적으로 조정
        node.estimatedResolutionTime = (node.estimatedResolutionTime || 30) + (index * 15);
      }
    });
  }

  private async facilitateKnowledgeTransfer(nodeIds: string[], graph: DependencyGraph): Promise<void> {
    // 지식 전달 촉진 로직
    logger.info('Facilitating knowledge transfer', { nodeIds });
    
    // 지식 노드의 상태를 사용 가능으로 변경
    nodeIds.forEach(nodeId => {
      const node = graph.nodes.get(nodeId);
      if (node && node.type === 'knowledge' && node.status === 'blocked') {
        node.status = 'available';
        node.estimatedResolutionTime = 30; // 지식 전달 세션 시간
      }
    });
  }

  getDependencyGraph(planId: string): DependencyGraph | undefined {
    return this.dependencyGraphs.get(planId);
  }

  getActiveConflicts(planId?: string): DependencyConflict[] {
    const conflicts = Array.from(this.activeConflicts.values());
    return planId ? conflicts.filter(c => c.id.includes(planId)) : conflicts;
  }

  getResolutionHistory(): ResolutionStrategy[] {
    return [...this.resolutionHistory];
  }

  async optimizeDependencyGraph(planId: string): Promise<void> {
    const graph = this.dependencyGraphs.get(planId);
    if (!graph) return;

    logger.info('Optimizing dependency graph', { planId });

    // 불필요한 의존성 제거
    const redundantEdges = this.findRedundantDependencies(graph);
    redundantEdges.forEach(edge => {
      const index = graph.edges.indexOf(edge);
      if (index > -1) {
        graph.edges.splice(index, 1);
      }
    });

    // 병렬화 기회 식별
    const parallelizableNodes = this.identifyParallelizableNodes(graph);
    parallelizableNodes.forEach(nodeId => {
      const node = graph.nodes.get(nodeId);
      if (node) {
        // 병렬 실행 가능 표시 (실제 구현에서는 노드 속성 추가)
        logger.info('Node marked as parallelizable', { nodeId });
      }
    });

    // 크리티컬 패스 재계산
    graph.criticalPath = this.calculateCriticalPath(graph);
    
    logger.info('Dependency graph optimization completed', {
      planId,
      redundantEdgesRemoved: redundantEdges.length,
      parallelizableNodes: parallelizableNodes.length,
      newCriticalPathLength: graph.criticalPath.length
    });
  }

  private findRedundantDependencies(graph: DependencyGraph): DependencyEdge[] {
    const redundant: DependencyEdge[] = [];
    
    // 전이적 감축으로 중복 의존성 찾기
    for (const edge of graph.edges) {
      const fromNode = graph.nodes.get(edge.from);
      const toNode = graph.nodes.get(edge.to);
      
      if (fromNode && toNode) {
        // A -> B -> C가 있고 A -> C도 있다면 A -> C는 중복
        const hasIndirectPath = this.hasIndirectPath(edge.from, edge.to, graph, [edge.from]);
        if (hasIndirectPath) {
          redundant.push(edge);
        }
      }
    }
    
    return redundant;
  }

  private hasIndirectPath(from: string, to: string, graph: DependencyGraph, visited: string[]): boolean {
    const fromNode = graph.nodes.get(from);
    if (!fromNode) return false;

    for (const depId of fromNode.dependencies) {
      if (visited.includes(depId)) continue; // 순환 방지
      
      if (depId === to) return true;
      
      if (this.hasIndirectPath(depId, to, graph, [...visited, depId])) {
        return true;
      }
    }
    
    return false;
  }

  private identifyParallelizableNodes(graph: DependencyGraph): string[] {
    const parallelizable: string[] = [];
    
    // 같은 레벨에 있고 서로 의존하지 않는 노드들 찾기
    const nodeLevels = this.calculateNodeLevels(graph);
    const levelGroups = new Map<number, string[]>();
    
    Object.entries(nodeLevels).forEach(([nodeId, level]) => {
      if (!levelGroups.has(level)) {
        levelGroups.set(level, []);
      }
      levelGroups.get(level)!.push(nodeId);
    });

    levelGroups.forEach(nodes => {
      if (nodes.length > 1) {
        // 같은 레벨의 노드들은 잠재적으로 병렬 실행 가능
        parallelizable.push(...nodes);
      }
    });

    return parallelizable;
  }

  private calculateNodeLevels(graph: DependencyGraph): Record<string, number> {
    const levels: Record<string, number> = {};
    const visited = new Set<string>();

    const calculateLevel = (nodeId: string): number => {
      if (levels[nodeId] !== undefined) {
        return levels[nodeId];
      }

      const node = graph.nodes.get(nodeId);
      if (!node || visited.has(nodeId)) {
        levels[nodeId] = 0;
        return 0;
      }

      visited.add(nodeId);

      let maxDepLevel = -1;
      for (const depId of node.dependencies) {
        maxDepLevel = Math.max(maxDepLevel, calculateLevel(depId));
      }

      levels[nodeId] = maxDepLevel + 1;
      visited.delete(nodeId);
      return levels[nodeId];
    };

    for (const nodeId of graph.nodes.keys()) {
      calculateLevel(nodeId);
    }

    return levels;
  }
}

export const dependencyManager = DependencyManager.getInstance();