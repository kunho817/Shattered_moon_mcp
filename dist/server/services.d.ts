import { ProjectStateManager } from '../utils/state.js';
import { PerformanceMonitor } from '../utils/performance.js';
import { AILearningEngine } from '../utils/ai.js';
import { SessionManager } from '../session/manager.js';
import { StateManager } from '../session/state.js';
import { LearningIntegration } from '../services/LearningIntegration.js';
export interface Services {
    stateManager: ProjectStateManager;
    performanceMonitor: PerformanceMonitor;
    aiEngine: AILearningEngine;
    sessionManager: SessionManager;
    globalStateManager: StateManager;
    learningIntegration: LearningIntegration;
}
export declare function initializeServices(): Promise<Services>;
export declare function getServices(): Services;
//# sourceMappingURL=services.d.ts.map