import { ProjectStateManager } from '../utils/state.js';
import { PerformanceMonitor } from '../utils/performance.js';
import { AILearningEngine } from '../utils/ai.js';
import { SessionManager } from '../session/manager.js';
import { StateManager } from '../session/state.js';
export interface Services {
    stateManager: ProjectStateManager;
    performanceMonitor: PerformanceMonitor;
    aiEngine: AILearningEngine;
    sessionManager: SessionManager;
    globalStateManager: StateManager;
}
export declare function initializeServices(): Promise<Services>;
export declare function getServices(): Services;
//# sourceMappingURL=services.d.ts.map