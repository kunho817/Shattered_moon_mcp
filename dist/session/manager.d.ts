import { EventEmitter } from 'events';
import { z } from 'zod';
declare const SessionDataSchema: z.ZodObject<{
    userId: z.ZodOptional<z.ZodString>;
    preferences: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    projectContext: z.ZodOptional<z.ZodObject<{
        activeTeams: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        currentTasks: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        workingDirectory: z.ZodOptional<z.ZodString>;
        lastActivity: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        activeTeams?: string[] | undefined;
        currentTasks?: string[] | undefined;
        workingDirectory?: string | undefined;
        lastActivity?: string | undefined;
    }, {
        activeTeams?: string[] | undefined;
        currentTasks?: string[] | undefined;
        workingDirectory?: string | undefined;
        lastActivity?: string | undefined;
    }>>;
    capabilities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    permissions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    metadata?: Record<string, any> | undefined;
    userId?: string | undefined;
    preferences?: Record<string, any> | undefined;
    projectContext?: {
        activeTeams?: string[] | undefined;
        currentTasks?: string[] | undefined;
        workingDirectory?: string | undefined;
        lastActivity?: string | undefined;
    } | undefined;
    capabilities?: string[] | undefined;
    permissions?: string[] | undefined;
}, {
    metadata?: Record<string, any> | undefined;
    userId?: string | undefined;
    preferences?: Record<string, any> | undefined;
    projectContext?: {
        activeTeams?: string[] | undefined;
        currentTasks?: string[] | undefined;
        workingDirectory?: string | undefined;
        lastActivity?: string | undefined;
    } | undefined;
    capabilities?: string[] | undefined;
    permissions?: string[] | undefined;
}>;
declare const SessionConfigSchema: z.ZodObject<{
    sessionId: z.ZodString;
    expiresAt: z.ZodDate;
    clientInfo: z.ZodOptional<z.ZodObject<{
        userAgent: z.ZodOptional<z.ZodString>;
        ipAddress: z.ZodOptional<z.ZodString>;
        platform: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
        platform?: string | undefined;
    }, {
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
        platform?: string | undefined;
    }>>;
    data: z.ZodObject<{
        userId: z.ZodOptional<z.ZodString>;
        preferences: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        projectContext: z.ZodOptional<z.ZodObject<{
            activeTeams: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            currentTasks: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            workingDirectory: z.ZodOptional<z.ZodString>;
            lastActivity: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            activeTeams?: string[] | undefined;
            currentTasks?: string[] | undefined;
            workingDirectory?: string | undefined;
            lastActivity?: string | undefined;
        }, {
            activeTeams?: string[] | undefined;
            currentTasks?: string[] | undefined;
            workingDirectory?: string | undefined;
            lastActivity?: string | undefined;
        }>>;
        capabilities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        permissions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        metadata?: Record<string, any> | undefined;
        userId?: string | undefined;
        preferences?: Record<string, any> | undefined;
        projectContext?: {
            activeTeams?: string[] | undefined;
            currentTasks?: string[] | undefined;
            workingDirectory?: string | undefined;
            lastActivity?: string | undefined;
        } | undefined;
        capabilities?: string[] | undefined;
        permissions?: string[] | undefined;
    }, {
        metadata?: Record<string, any> | undefined;
        userId?: string | undefined;
        preferences?: Record<string, any> | undefined;
        projectContext?: {
            activeTeams?: string[] | undefined;
            currentTasks?: string[] | undefined;
            workingDirectory?: string | undefined;
            lastActivity?: string | undefined;
        } | undefined;
        capabilities?: string[] | undefined;
        permissions?: string[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    data: {
        metadata?: Record<string, any> | undefined;
        userId?: string | undefined;
        preferences?: Record<string, any> | undefined;
        projectContext?: {
            activeTeams?: string[] | undefined;
            currentTasks?: string[] | undefined;
            workingDirectory?: string | undefined;
            lastActivity?: string | undefined;
        } | undefined;
        capabilities?: string[] | undefined;
        permissions?: string[] | undefined;
    };
    sessionId: string;
    expiresAt: Date;
    clientInfo?: {
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
        platform?: string | undefined;
    } | undefined;
}, {
    data: {
        metadata?: Record<string, any> | undefined;
        userId?: string | undefined;
        preferences?: Record<string, any> | undefined;
        projectContext?: {
            activeTeams?: string[] | undefined;
            currentTasks?: string[] | undefined;
            workingDirectory?: string | undefined;
            lastActivity?: string | undefined;
        } | undefined;
        capabilities?: string[] | undefined;
        permissions?: string[] | undefined;
    };
    sessionId: string;
    expiresAt: Date;
    clientInfo?: {
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
        platform?: string | undefined;
    } | undefined;
}>;
export type SessionData = z.infer<typeof SessionDataSchema>;
export type SessionConfig = z.infer<typeof SessionConfigSchema>;
export interface SessionMetrics {
    totalSessions: number;
    activeSessions: number;
    expiredSessions: number;
    averageSessionDuration: number;
    lastCleanup: Date;
}
export declare class SessionManager extends EventEmitter {
    private sessions;
    private sessionsByClient;
    private cleanupInterval;
    private defaultSessionDuration;
    private maxSessions;
    constructor(options?: {
        defaultSessionDuration?: number;
        maxSessions?: number;
        cleanupInterval?: number;
    });
    createSession(clientId: string, clientInfo?: {
        userAgent?: string;
        ipAddress?: string;
        platform?: string;
    }, initialData?: Partial<SessionData>): string;
    getSession(sessionId: string): SessionConfig | null;
    getSessionByClient(clientId: string): SessionConfig | null;
    updateSession(sessionId: string, updates: Partial<SessionData>): boolean;
    updateSessionByClient(clientId: string, updates: Partial<SessionData>): boolean;
    destroySession(sessionId: string): boolean;
    destroySessionByClient(clientId: string): boolean;
    refreshSession(sessionId: string, duration?: number): boolean;
    getActiveSessions(): SessionConfig[];
    getMetrics(): SessionMetrics;
    searchSessions(criteria: {
        userId?: string;
        clientIP?: string;
        hasTeams?: string[];
        hasTasks?: string[];
        minDuration?: number;
    }): SessionConfig[];
    exportSessionData(sessionId: string): any;
    importSessionData(sessionData: any, clientId: string): string | null;
    private generateSessionId;
    private cleanupExpiredSessions;
    private getOldestSession;
    private calculateAverageDuration;
    shutdown(): Promise<void>;
}
export {};
//# sourceMappingURL=manager.d.ts.map