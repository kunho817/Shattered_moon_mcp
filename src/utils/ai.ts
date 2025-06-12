import { EventEmitter } from 'events';
import logger from './logger.js';

export interface Pattern {
  id: string;
  type: 'task' | 'error' | 'performance' | 'usage';
  pattern: any;
  frequency: number;
  lastSeen: Date;
  confidence: number;
}

export interface Learning {
  patterns: Map<string, Pattern>;
  recommendations: Map<string, string[]>;
  predictions: Map<string, any>;
}

export class AILearningEngine extends EventEmitter {
  private learning: Learning;
  private analysisInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.learning = {
      patterns: new Map(),
      recommendations: new Map(),
      predictions: new Map()
    };
  }

  async initialize(): Promise<void> {
    logger.info('Initializing AI learning engine');
    
    // Start pattern analysis
    this.analysisInterval = setInterval(() => {
      this.analyzePatterns();
    }, 300000); // Every 5 minutes
  }

  recordTaskPattern(task: {
    type: string;
    complexity: string;
    teams: string[];
    duration: number;
    success: boolean;
  }): void {
    const patternKey = `${task.type}_${task.complexity}_${task.teams.sort().join('_')}`;
    
    const existing = this.learning.patterns.get(patternKey);
    if (existing) {
      existing.frequency++;
      existing.lastSeen = new Date();
      existing.confidence = Math.min(existing.confidence * 1.1, 1.0);
    } else {
      this.learning.patterns.set(patternKey, {
        id: patternKey,
        type: 'task',
        pattern: task,
        frequency: 1,
        lastSeen: new Date(),
        confidence: 0.5
      });
    }

    this.updateRecommendations('task', task);
  }

  recordErrorPattern(error: {
    tool: string;
    errorType: string;
    context: any;
  }): void {
    const patternKey = `${error.tool}_${error.errorType}`;
    
    const existing = this.learning.patterns.get(patternKey);
    if (existing) {
      existing.frequency++;
      existing.lastSeen = new Date();
    } else {
      this.learning.patterns.set(patternKey, {
        id: patternKey,
        type: 'error',
        pattern: error,
        frequency: 1,
        lastSeen: new Date(),
        confidence: 0.7
      });
    }

    this.updateRecommendations('error', error);
  }

  analyzeWorkload(task: {
    description: string;
    keywords: string[];
  }): {
    complexity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    suggestedTeams: string[];
    estimatedDuration: number;
  } {
    // Analyze based on learned patterns
    const complexityScore = this.calculateComplexityScore(task);
    const complexity = this.scoreToComplexity(complexityScore);
    const confidence = this.calculateConfidence(task);
    const teams = this.suggestTeams(task);
    const duration = this.estimateDuration(task, complexity);

    return {
      complexity,
      confidence,
      suggestedTeams: teams,
      estimatedDuration: duration
    };
  }

  private calculateComplexityScore(task: { keywords: string[] }): number {
    let score = 0;
    
    const complexityKeywords = {
      low: ['simple', 'basic', 'fix', 'update', 'minor'],
      medium: ['implement', 'integrate', 'refactor', 'optimize'],
      high: ['architect', 'design', 'complex', 'system', 'pipeline'],
      critical: ['critical', 'urgent', 'breaking', 'security', 'performance']
    };

    task.keywords.forEach(keyword => {
      const lowerKeyword = keyword.toLowerCase();
      if (complexityKeywords.critical.some(k => lowerKeyword.includes(k))) {
        score += 4;
      } else if (complexityKeywords.high.some(k => lowerKeyword.includes(k))) {
        score += 3;
      } else if (complexityKeywords.medium.some(k => lowerKeyword.includes(k))) {
        score += 2;
      } else if (complexityKeywords.low.some(k => lowerKeyword.includes(k))) {
        score += 1;
      }
    });

    return Math.min(score / task.keywords.length, 4);
  }

  private scoreToComplexity(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 3.5) return 'critical';
    if (score >= 2.5) return 'high';
    if (score >= 1.5) return 'medium';
    return 'low';
  }

  private calculateConfidence(task: any): number {
    // Base confidence on pattern matches
    let confidence = 0.5;
    let matches = 0;

    this.learning.patterns.forEach(pattern => {
      if (pattern.type === 'task' && this.taskMatchesPattern(task, pattern.pattern)) {
        confidence += pattern.confidence * 0.1;
        matches++;
      }
    });

    return Math.min(confidence + (matches * 0.05), 0.95);
  }

  private taskMatchesPattern(task: any, pattern: any): boolean {
    // Simplified pattern matching
    if (task.type && pattern.type && task.type !== pattern.type) {
      return false;
    }
    
    // Check keyword overlap
    if (task.keywords && pattern.keywords) {
      const overlap = task.keywords.filter((k: string) => 
        pattern.keywords.includes(k)
      ).length;
      return overlap > task.keywords.length * 0.5;
    }

    return false;
  }

  private suggestTeams(task: { keywords: string[] }): string[] {
    const teams = new Set<string>();
    
    const teamKeywords = {
      planning: ['design', 'architect', 'plan', 'spec', 'requirement'],
      backend: ['server', 'api', 'database', 'algorithm', 'logic'],
      frontend: ['ui', 'render', 'graphics', 'shader', 'display'],
      testing: ['test', 'verify', 'validate', 'qa', 'quality'],
      documentation: ['document', 'docs', 'readme', 'tutorial', 'guide'],
      performance: ['optimize', 'performance', 'speed', 'profile', 'benchmark'],
      devops: ['deploy', 'ci', 'cd', 'build', 'release']
    };

    task.keywords.forEach(keyword => {
      const lowerKeyword = keyword.toLowerCase();
      Object.entries(teamKeywords).forEach(([team, keywords]) => {
        if (keywords.some(k => lowerKeyword.includes(k))) {
          teams.add(team);
        }
      });
    });

    // Default to planning team if no matches
    if (teams.size === 0) {
      teams.add('planning');
    }

    return Array.from(teams);
  }

  private estimateDuration(task: any, complexity: string): number {
    // Base estimates in minutes
    const baseEstimates = {
      low: 30,
      medium: 120,
      high: 480,
      critical: 720
    };

    let estimate = baseEstimates[complexity as keyof typeof baseEstimates] || 120;

    // Adjust based on learned patterns
    this.learning.patterns.forEach(pattern => {
      if (pattern.type === 'task' && 
          pattern.pattern.complexity === complexity &&
          pattern.pattern.duration) {
        // Weight recent patterns more heavily
        const weight = pattern.confidence * pattern.frequency / 100;
        estimate = estimate * (1 - weight) + pattern.pattern.duration * weight;
      }
    });

    return Math.round(estimate);
  }

  private updateRecommendations(type: string, data: any): void {
    const recommendations: string[] = [];

    if (type === 'task') {
      if (data.duration > 300 && data.teams.length === 1) {
        recommendations.push('Consider involving multiple teams for long-duration tasks');
      }
      if (!data.success && data.complexity === 'high') {
        recommendations.push('High complexity tasks are failing - consider breaking them down');
      }
    } else if (type === 'error') {
      if (data.errorType === 'timeout') {
        recommendations.push(`Increase timeout for ${data.tool} or optimize performance`);
      }
      if (data.errorType === 'validation') {
        recommendations.push(`Review input validation for ${data.tool}`);
      }
    }

    if (recommendations.length > 0) {
      this.learning.recommendations.set(`${type}_${Date.now()}`, recommendations);
      this.emit('recommendationsUpdated', recommendations);
    }
  }

  getRecommendations(context?: string): string[] {
    const allRecommendations: string[] = [];
    
    this.learning.recommendations.forEach((recs, key) => {
      if (!context || key.includes(context)) {
        allRecommendations.push(...recs);
      }
    });

    // Add pattern-based recommendations
    const frequentErrors = Array.from(this.learning.patterns.values())
      .filter(p => p.type === 'error' && p.frequency > 5);
    
    frequentErrors.forEach(error => {
      allRecommendations.push(
        `Frequent error pattern detected: ${error.pattern.tool} - ${error.pattern.errorType}`
      );
    });

    return [...new Set(allRecommendations)]; // Remove duplicates
  }

  predictTaskOutcome(task: any): {
    successProbability: number;
    estimatedDuration: number;
    potentialIssues: string[];
  } {
    const analysis = this.analyzeWorkload(task);
    let successProbability = 0.8; // Base probability
    const potentialIssues: string[] = [];

    // Adjust based on complexity
    const complexityPenalties = {
      low: 0,
      medium: 0.1,
      high: 0.2,
      critical: 0.3
    };
    
    successProbability -= complexityPenalties[analysis.complexity] || 0;

    // Check for error patterns
    this.learning.patterns.forEach(pattern => {
      if (pattern.type === 'error' && pattern.frequency > 3) {
        successProbability -= 0.05;
        potentialIssues.push(`Previous errors with ${pattern.pattern.tool}`);
      }
    });

    // Team availability impact
    if (analysis.suggestedTeams.length > 3) {
      successProbability -= 0.1;
      potentialIssues.push('Requires coordination across many teams');
    }

    return {
      successProbability: Math.max(successProbability, 0.1),
      estimatedDuration: analysis.estimatedDuration,
      potentialIssues
    };
  }

  private analyzePatterns(): void {
    // Decay old patterns
    const now = Date.now();
    this.learning.patterns.forEach((pattern, key) => {
      const age = now - pattern.lastSeen.getTime();
      if (age > 7 * 24 * 3600000) { // 7 days
        pattern.confidence *= 0.9;
        if (pattern.confidence < 0.1) {
          this.learning.patterns.delete(key);
        }
      }
    });

    logger.debug(`Pattern analysis complete. Active patterns: ${this.learning.patterns.size}`);
  }

  async shutdown(): Promise<void> {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
    }
  }
}