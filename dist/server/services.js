import logger from '../utils/logger.js';
import { ProjectStateManager } from '../utils/state.js';
import { PerformanceMonitor } from '../utils/performance.js';
import { AILearningEngine } from '../utils/ai.js';
let services = null;
export async function initializeServices() {
    if (services) {
        return services;
    }
    logger.info('Initializing services...');
    try {
        const stateManager = new ProjectStateManager();
        const performanceMonitor = new PerformanceMonitor();
        const aiEngine = new AILearningEngine();
        // Initialize each service
        await stateManager.initialize();
        await performanceMonitor.initialize();
        await aiEngine.initialize();
        services = {
            stateManager,
            performanceMonitor,
            aiEngine
        };
        logger.info('Services initialized successfully');
        return services;
    }
    catch (error) {
        logger.error('Failed to initialize services', { error });
        throw error;
    }
}
export function getServices() {
    if (!services) {
        throw new Error('Services not initialized');
    }
    return services;
}
//# sourceMappingURL=services.js.map