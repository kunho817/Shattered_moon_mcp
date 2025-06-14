"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeServices = initializeServices;
exports.getServices = getServices;
const logger_js_1 = __importDefault(require("../utils/logger.js"));
const state_js_1 = require("../utils/state.js");
const performance_js_1 = require("../utils/performance.js");
const ai_js_1 = require("../utils/ai.js");
const manager_js_1 = require("../session/manager.js");
const state_js_2 = require("../session/state.js");
const LearningIntegration_js_1 = require("../services/LearningIntegration.js");
let services = null;
async function initializeServices() {
    if (services) {
        return services;
    }
    logger_js_1.default.info('Initializing services...');
    try {
        const stateManager = new state_js_1.ProjectStateManager();
        const performanceMonitor = new performance_js_1.PerformanceMonitor();
        const aiEngine = new ai_js_1.AILearningEngine();
        const sessionManager = new manager_js_1.SessionManager({
            defaultSessionDuration: 24 * 60 * 60 * 1000, // 24 hours
            maxSessions: 1000,
            cleanupInterval: 60000 // 1 minute
        });
        const globalStateManager = new state_js_2.StateManager({
            persistenceDir: './data/state',
            persistenceInterval: 30000, // 30 seconds
            cleanupInterval: 60000 // 1 minute
        });
        // Initialize each service
        await stateManager.initialize();
        await performanceMonitor.initialize();
        await aiEngine.initialize();
        // Initialize state namespaces
        globalStateManager.createNamespace('sessions', { persistent: true });
        globalStateManager.createNamespace('cache', { persistent: false, defaultTTL: 3600000 }); // 1 hour TTL
        globalStateManager.createNamespace('user_preferences', { persistent: true });
        globalStateManager.createNamespace('temp', { persistent: false, defaultTTL: 300000 }); // 5 minutes TTL
        // Initialize learning integration
        const learningIntegration = (0, LearningIntegration_js_1.initializeLearningIntegration)(performanceMonitor);
        services = {
            stateManager,
            performanceMonitor,
            aiEngine,
            sessionManager,
            globalStateManager,
            learningIntegration
        };
        logger_js_1.default.info('Services initialized successfully');
        return services;
    }
    catch (error) {
        logger_js_1.default.error('Failed to initialize services', { error });
        throw error;
    }
}
function getServices() {
    if (!services) {
        throw new Error('Services not initialized');
    }
    return services;
}
//# sourceMappingURL=services.js.map