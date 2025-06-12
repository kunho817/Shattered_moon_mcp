import { EventEmitter } from 'events';
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
export declare class AILearningEngine extends EventEmitter {
    private learning;
    private analysisInterval;
    constructor();
    initialize(): Promise<void>;
    recordTaskPattern(task: {
        type: string;
        complexity: string;
        teams: string[];
        duration: number;
        success: boolean;
    }): void;
    recordErrorPattern(error: {
        tool: string;
        errorType: string;
        context: any;
    }): void;
    analyzeWorkload(task: {
        description: string;
        keywords: string[];
    }): {
        complexity: 'low' | 'medium' | 'high' | 'critical';
        confidence: number;
        suggestedTeams: string[];
        estimatedDuration: number;
    };
    private calculateComplexityScore;
    private scoreToComplexity;
    private calculateConfidence;
    private taskMatchesPattern;
    private suggestTeams;
    private estimateDuration;
    private updateRecommendations;
    getRecommendations(context?: string): string[];
    predictTaskOutcome(task: any): {
        successProbability: number;
        estimatedDuration: number;
        potentialIssues: string[];
    };
    private analyzePatterns;
    shutdown(): Promise<void>;
}
//# sourceMappingURL=ai.d.ts.map