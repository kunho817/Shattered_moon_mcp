import { EventEmitter } from 'events';
import crypto from 'crypto';
import { z } from 'zod';
import logger from '../utils/logger.js';

// Session data schemas
const SessionDataSchema = z.object({
  userId: z.string().optional(),
  preferences: z.record(z.any()).optional(),
  projectContext: z.object({
    activeTeams: z.array(z.string()).optional(),
    currentTasks: z.array(z.string()).optional(),
    workingDirectory: z.string().optional(),
    lastActivity: z.string().optional()
  }).optional(),
  capabilities: z.array(z.string()).optional(),
  permissions: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional()
});

const SessionConfigSchema = z.object({
  sessionId: z.string(),
  expiresAt: z.date(),
  clientInfo: z.object({
    userAgent: z.string().optional(),
    ipAddress: z.string().optional(),
    platform: z.string().optional()
  }).optional(),
  data: SessionDataSchema
});

export type SessionData = z.infer<typeof SessionDataSchema>;
export type SessionConfig = z.infer<typeof SessionConfigSchema>;

export interface SessionMetrics {
  totalSessions: number;
  activeSessions: number;
  expiredSessions: number;
  averageSessionDuration: number;
  lastCleanup: Date;
}

export class SessionManager extends EventEmitter {
  private sessions: Map<string, SessionConfig> = new Map();
  private sessionsByClient: Map<string, string> = new Map(); // clientId -> sessionId
  private cleanupInterval: NodeJS.Timeout | null = null;
  private defaultSessionDuration: number = 24 * 60 * 60 * 1000; // 24 hours
  private maxSessions: number = 1000;

  constructor(options: {
    defaultSessionDuration?: number;
    maxSessions?: number;
    cleanupInterval?: number;
  } = {}) {
    super();
    
    this.defaultSessionDuration = options.defaultSessionDuration || this.defaultSessionDuration;
    this.maxSessions = options.maxSessions || this.maxSessions;
    
    // Start automatic cleanup
    const cleanupInterval = options.cleanupInterval || 60000; // 1 minute
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, cleanupInterval);

    logger.info('Session Manager initialized', {
      defaultDuration: this.defaultSessionDuration,
      maxSessions: this.maxSessions
    });
  }

  // Create a new session
  createSession(clientId: string, clientInfo?: {
    userAgent?: string;
    ipAddress?: string;
    platform?: string;
  }, initialData?: Partial<SessionData>): string {
    // Check if client already has a session
    const existingSessionId = this.sessionsByClient.get(clientId);
    if (existingSessionId && this.sessions.has(existingSessionId)) {
      logger.info(`Client ${clientId} already has session ${existingSessionId}`);
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
    const session: SessionConfig = {
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
    logger.info(`Session created: ${sessionId} for client ${clientId}`);

    return sessionId;
  }

  // Get session by ID
  getSession(sessionId: string): SessionConfig | null {
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
  getSessionByClient(clientId: string): SessionConfig | null {
    const sessionId = this.sessionsByClient.get(clientId);
    if (!sessionId) {
      return null;
    }
    return this.getSession(sessionId);
  }

  // Update session data
  updateSession(sessionId: string, updates: Partial<SessionData>): boolean {
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
      logger.debug(`Session ${sessionId} extended`);
    }

    this.emit('sessionUpdated', { sessionId, session, updates });
    return true;
  }

  // Update session by client ID
  updateSessionByClient(clientId: string, updates: Partial<SessionData>): boolean {
    const sessionId = this.sessionsByClient.get(clientId);
    if (!sessionId) {
      return false;
    }
    return this.updateSession(sessionId, updates);
  }

  // Destroy session
  destroySession(sessionId: string): boolean {
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
    logger.info(`Session destroyed: ${sessionId}`);
    return true;
  }

  // Destroy session by client ID
  destroySessionByClient(clientId: string): boolean {
    const sessionId = this.sessionsByClient.get(clientId);
    if (!sessionId) {
      return false;
    }
    return this.destroySession(sessionId);
  }

  // Refresh session (extend expiration)
  refreshSession(sessionId: string, duration?: number): boolean {
    const session = this.getSession(sessionId);
    if (!session) {
      return false;
    }

    const extensionTime = duration || this.defaultSessionDuration;
    session.expiresAt = new Date(Date.now() + extensionTime);
    
    this.emit('sessionRefreshed', { sessionId, session });
    logger.debug(`Session refreshed: ${sessionId}`);
    return true;
  }

  // Get all active sessions
  getActiveSessions(): SessionConfig[] {
    const now = new Date();
    return Array.from(this.sessions.values()).filter(
      session => session.expiresAt > now
    );
  }

  // Get session metrics
  getMetrics(): SessionMetrics {
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
  searchSessions(criteria: {
    userId?: string;
    clientIP?: string;
    hasTeams?: string[];
    hasTasks?: string[];
    minDuration?: number;
  }): SessionConfig[] {
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
  exportSessionData(sessionId: string): any {
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
  importSessionData(sessionData: any, clientId: string): string | null {
    try {
      const validated = SessionConfigSchema.parse({
        ...sessionData,
        expiresAt: new Date(sessionData.expiresAt)
      });

      this.sessions.set(validated.sessionId, validated);
      this.sessionsByClient.set(clientId, validated.sessionId);

      this.emit('sessionImported', { sessionId: validated.sessionId, clientId });
      return validated.sessionId;
    } catch (error) {
      logger.error('Failed to import session data', { error });
      return null;
    }
  }

  // Private methods
  private generateSessionId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  private cleanupExpiredSessions(): void {
    const now = new Date();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt <= now) {
        this.destroySession(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.info(`Cleaned up ${cleanedCount} expired sessions`);
      this.emit('sessionCleanup', { cleanedCount });
    }
  }

  private getOldestSession(): string | null {
    let oldestSession: string | null = null;
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

  private calculateAverageDuration(): number {
    const sessions = Array.from(this.sessions.values());
    if (sessions.length === 0) return 0;

    const totalDuration = sessions.reduce((sum, session) => {
      const createdAt = session.expiresAt.getTime() - this.defaultSessionDuration;
      const endTime = Math.min(session.expiresAt.getTime(), Date.now());
      return sum + (endTime - createdAt);
    }, 0);

    return totalDuration / sessions.length;
  }

  // Cleanup on shutdown
  async shutdown(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    // Export all sessions before shutdown (for persistence)
    const sessionCount = this.sessions.size;
    this.sessions.clear();
    this.sessionsByClient.clear();

    logger.info(`Session Manager shutdown complete. ${sessionCount} sessions cleared.`);
  }
}