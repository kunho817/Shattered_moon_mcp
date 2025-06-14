import logger from '../utils/logger.js';
import { ProjectStateManager } from '../utils/state.js';
import { PerformanceMonitor } from '../utils/performance.js';
import { SessionManager } from '../session/manager.js';
import { StateManager } from '../session/state.js';

export interface Services {
  stateManager: ProjectStateManager;
  performanceMonitor: PerformanceMonitor;
  sessionManager: SessionManager;
  globalStateManager: StateManager;
}

let services: Services | null = null;

export async function initializeServices(): Promise<Services> {
  if (services) {
    return services;
  }

  logger.info('Initializing services...');

  try {
    const stateManager = new ProjectStateManager();
    const performanceMonitor = new PerformanceMonitor();
    const sessionManager = new SessionManager({
      defaultSessionDuration: 24 * 60 * 60 * 1000, // 24 hours
      maxSessions: 1000,
      cleanupInterval: 60000 // 1 minute
    });
    const globalStateManager = new StateManager({
      persistenceDir: './data/state',
      persistenceInterval: 30000, // 30 seconds
      cleanupInterval: 60000 // 1 minute
    });

    // Initialize each service
    await stateManager.initialize();
    await performanceMonitor.initialize();
    
    // Initialize state namespaces
    globalStateManager.createNamespace('sessions', { persistent: true });
    globalStateManager.createNamespace('cache', { persistent: false, defaultTTL: 3600000 }); // 1 hour TTL
    globalStateManager.createNamespace('user_preferences', { persistent: true });
    globalStateManager.createNamespace('temp', { persistent: false, defaultTTL: 300000 }); // 5 minutes TTL

    services = {
      stateManager,
      performanceMonitor,
      sessionManager,
      globalStateManager
    };

    logger.info('Services initialized successfully');
    return services;
  } catch (error) {
    logger.error('Failed to initialize services', { error });
    throw error;
  }
}

export function getServices(): Services {
  if (!services) {
    throw new Error('Services not initialized');
  }
  return services;
}