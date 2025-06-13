"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionManager = void 0;
const events_1 = require("events");
const crypto_1 = __importDefault(require("crypto"));
const zod_1 = require("zod");
const logger_js_1 = __importDefault(require("../utils/logger.js"));
// Session data schemas
const SessionDataSchema = zod_1.z.object({
    userId: zod_1.z.string().optional(),
    preferences: zod_1.z.record(zod_1.z.any()).optional(),
    projectContext: zod_1.z.object({
        activeTeams: zod_1.z.array(zod_1.z.string()).optional(),
        currentTasks: zod_1.z.array(zod_1.z.string()).optional(),
        workingDirectory: zod_1.z.string().optional(),
        lastActivity: zod_1.z.string().optional()
    }).optional(),
    capabilities: zod_1.z.array(zod_1.z.string()).optional(),
    permissions: zod_1.z.array(zod_1.z.string()).optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional()
});
const SessionConfigSchema = zod_1.z.object({
    sessionId: zod_1.z.string(),
    expiresAt: zod_1.z.date(),
    clientInfo: zod_1.z.object({
        userAgent: zod_1.z.string().optional(),
        ipAddress: zod_1.z.string().optional(),
        platform: zod_1.z.string().optional()
    }).optional(),
    data: SessionDataSchema
});
class SessionManager extends events_1.EventEmitter {
    sessions = new Map();
    sessionsByClient = new Map(); // clientId -> sessionId
    cleanupInterval = null;
    defaultSessionDuration = 24 * 60 * 60 * 1000; // 24 hours
    maxSessions = 1000;
    constructor(options = {}) {
        super();
        this.defaultSessionDuration = options.defaultSessionDuration || this.defaultSessionDuration;
        this.maxSessions = options.maxSessions || this.maxSessions;
        // Start automatic cleanup
        const cleanupInterval = options.cleanupInterval || 60000; // 1 minute
        this.cleanupInterval = setInterval(() => {
            this.cleanupExpiredSessions();
        }, cleanupInterval);
        logger_js_1.default.info('Session Manager initialized', {
            defaultDuration: this.defaultSessionDuration,
            maxSessions: this.maxSessions
        });
    }
    // Create a new session
    createSession(clientId, clientInfo, initialData) {
        // Check if client already has a session
        const existingSessionId = this.sessionsByClient.get(clientId);
        if (existingSessionId && this.sessions.has(existingSessionId)) {
            logger_js_1.default.info(`Client ${clientId} already has session ${existingSessionId}`);
            return existingSessionId;
        }
        // Generate new session ID
        const sessionId = this.generateSessionId();
        // Check session limits
        if (this.sessions.size >= this.maxSessions) {
            this.cleanupExpiredSessions();
            if (this.sessions.size >= this.maxSessions) {
                // Remove oldest session
                const oldestSession = this.getOldestSession();
                if (oldestSession) {
                    this.destroySession(oldestSession);
                }
            }
        }
        // Create session
        const session = {
            sessionId,
            expiresAt: new Date(Date.now() + this.defaultSessionDuration),
            clientInfo,
            data: {
                preferences: {},
                projectContext: {
                    activeTeams: [],
                    currentTasks: [],
                    lastActivity: new Date().toISOString()
                },
                capabilities: ['tools', 'resources', 'prompts'],
                permissions: ['read', 'execute'],
                metadata: {},
                ...initialData
            }
        };
        this.sessions.set(sessionId, session);
        this.sessionsByClient.set(clientId, sessionId);
        this.emit('sessionCreated', { sessionId, clientId, session });
        logger_js_1.default.info(`Session created: ${sessionId} for client ${clientId}`);
        return sessionId;
    }
    // Get session by ID
    getSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return null;
        }
        // Check expiration
        if (session.expiresAt < new Date()) {
            this.destroySession(sessionId);
            return null;
        }
        return session;
    }
    // Get session by client ID
    getSessionByClient(clientId) {
        const sessionId = this.sessionsByClient.get(clientId);
        if (!sessionId) {
            return null;
        }
        return this.getSession(sessionId);
    }
    // Update session data
    updateSession(sessionId, updates) {
        const session = this.getSession(sessionId);
        if (!session) {
            return false;
        }
        // Merge updates
        session.data = {
            ...session.data,
            ...updates,
            projectContext: {
                ...session.data.projectContext,
                ...updates.projectContext,
                lastActivity: new Date().toISOString()
            }
        };
        // Extend session if recently active
        const now = new Date();
        const timeUntilExpiry = session.expiresAt.getTime() - now.getTime();
        if (timeUntilExpiry < this.defaultSessionDuration * 0.25) { // Extend if less than 25% remaining
            session.expiresAt = new Date(now.getTime() + this.defaultSessionDuration);
            logger_js_1.default.debug(`Session ${sessionId} extended`);
        }
        this.emit('sessionUpdated', { sessionId, session, updates });
        return true;
    }
    // Update session by client ID
    updateSessionByClient(clientId, updates) {
        const sessionId = this.sessionsByClient.get(clientId);
        if (!sessionId) {
            return false;
        }
        return this.updateSession(sessionId, updates);
    }
    // Destroy session
    destroySession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return false;
        }
        this.sessions.delete(sessionId);
        // Remove from client mapping
        for (const [clientId, sid] of this.sessionsByClient.entries()) {
            if (sid === sessionId) {
                this.sessionsByClient.delete(clientId);
                break;
            }
        }
        this.emit('sessionDestroyed', { sessionId, session });
        logger_js_1.default.info(`Session destroyed: ${sessionId}`);
        return true;
    }
    // Destroy session by client ID
    destroySessionByClient(clientId) {
        const sessionId = this.sessionsByClient.get(clientId);
        if (!sessionId) {
            return false;
        }
        return this.destroySession(sessionId);
    }
    // Refresh session (extend expiration)
    refreshSession(sessionId, duration) {
        const session = this.getSession(sessionId);
        if (!session) {
            return false;
        }
        const extensionTime = duration || this.defaultSessionDuration;
        session.expiresAt = new Date(Date.now() + extensionTime);
        this.emit('sessionRefreshed', { sessionId, session });
        logger_js_1.default.debug(`Session refreshed: ${sessionId}`);
        return true;
    }
    // Get all active sessions
    getActiveSessions() {
        const now = new Date();
        return Array.from(this.sessions.values()).filter(session => session.expiresAt > now);
    }
    // Get session metrics
    getMetrics() {
        const now = new Date();
        const activeSessions = this.getActiveSessions();
        const expiredSessions = this.sessions.size - activeSessions.length;
        // Calculate average duration for completed sessions
        const averageDuration = this.calculateAverageDuration();
        return {
            totalSessions: this.sessions.size,
            activeSessions: activeSessions.length,
            expiredSessions,
            averageSessionDuration: averageDuration,
            lastCleanup: new Date()
        };
    }
    // Search sessions by criteria
    searchSessions(criteria) {
        return this.getActiveSessions().filter(session => {
            if (criteria.userId && session.data.userId !== criteria.userId) {
                return false;
            }
            if (criteria.clientIP && session.clientInfo?.ipAddress !== criteria.clientIP) {
                return false;
            }
            if (criteria.hasTeams) {
                const sessionTeams = session.data.projectContext?.activeTeams || [];
                if (!criteria.hasTeams.some(team => sessionTeams.includes(team))) {
                    return false;
                }
            }
            if (criteria.hasTasks) {
                const sessionTasks = session.data.projectContext?.currentTasks || [];
                if (!criteria.hasTasks.some(task => sessionTasks.includes(task))) {
                    return false;
                }
            }
            if (criteria.minDuration) {
                const sessionAge = Date.now() - (session.expiresAt.getTime() - this.defaultSessionDuration);
                if (sessionAge < criteria.minDuration) {
                    return false;
                }
            }
            return true;
        });
    }
    // Export session data
    exportSessionData(sessionId) {
        const session = this.getSession(sessionId);
        if (!session) {
            return null;
        }
        return {
            sessionId: session.sessionId,
            createdAt: new Date(session.expiresAt.getTime() - this.defaultSessionDuration),
            expiresAt: session.expiresAt,
            clientInfo: session.clientInfo,
            data: session.data
        };
    }
    // Import session data
    importSessionData(sessionData, clientId) {
        try {
            const validated = SessionConfigSchema.parse({
                ...sessionData,
                expiresAt: new Date(sessionData.expiresAt)
            });
            this.sessions.set(validated.sessionId, validated);
            this.sessionsByClient.set(clientId, validated.sessionId);
            this.emit('sessionImported', { sessionId: validated.sessionId, clientId });
            return validated.sessionId;
        }
        catch (error) {
            logger_js_1.default.error('Failed to import session data', { error });
            return null;
        }
    }
    // Private methods
    generateSessionId() {
        return crypto_1.default.randomBytes(16).toString('hex');
    }
    cleanupExpiredSessions() {
        const now = new Date();
        let cleanedCount = 0;
        for (const [sessionId, session] of this.sessions.entries()) {
            if (session.expiresAt <= now) {
                this.destroySession(sessionId);
                cleanedCount++;
            }
        }
        if (cleanedCount > 0) {
            logger_js_1.default.info(`Cleaned up ${cleanedCount} expired sessions`);
            this.emit('sessionCleanup', { cleanedCount });
        }
    }
    getOldestSession() {
        let oldestSession = null;
        let oldestTime = Infinity;
        for (const [sessionId, session] of this.sessions.entries()) {
            const sessionTime = session.expiresAt.getTime() - this.defaultSessionDuration;
            if (sessionTime < oldestTime) {
                oldestTime = sessionTime;
                oldestSession = sessionId;
            }
        }
        return oldestSession;
    }
    calculateAverageDuration() {
        const sessions = Array.from(this.sessions.values());
        if (sessions.length === 0)
            return 0;
        const totalDuration = sessions.reduce((sum, session) => {
            const createdAt = session.expiresAt.getTime() - this.defaultSessionDuration;
            const endTime = Math.min(session.expiresAt.getTime(), Date.now());
            return sum + (endTime - createdAt);
        }, 0);
        return totalDuration / sessions.length;
    }
    // Cleanup on shutdown
    async shutdown() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        // Export all sessions before shutdown (for persistence)
        const sessionCount = this.sessions.size;
        this.sessions.clear();
        this.sessionsByClient.clear();
        logger_js_1.default.info(`Session Manager shutdown complete. ${sessionCount} sessions cleared.`);
    }
}
exports.SessionManager = SessionManager;
//# sourceMappingURL=manager.js.map