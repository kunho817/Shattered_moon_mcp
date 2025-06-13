import { EventEmitter } from 'events';
import { z } from 'zod';
declare const StateEntrySchema: z.ZodObject<{
    key: z.ZodString;
    value: z.ZodAny;
    type: z.ZodEnum<["string", "number", "boolean", "object", "array"]>;
    timestamp: z.ZodDate;
    ttl: z.ZodOptional<z.ZodNumber>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    timestamp: Date;
    type: "string" | "number" | "boolean" | "object" | "array";
    key: string;
    metadata?: Record<string, any> | undefined;
    value?: any;
    ttl?: number | undefined;
    tags?: string[] | undefined;
}, {
    timestamp: Date;
    type: "string" | "number" | "boolean" | "object" | "array";
    key: string;
    metadata?: Record<string, any> | undefined;
    value?: any;
    ttl?: number | undefined;
    tags?: string[] | undefined;
}>;
declare const StateConfigSchema: z.ZodObject<{
    namespace: z.ZodString;
    persistent: z.ZodDefault<z.ZodBoolean>;
    maxEntries: z.ZodDefault<z.ZodNumber>;
    defaultTTL: z.ZodOptional<z.ZodNumber>;
    compression: z.ZodDefault<z.ZodBoolean>;
    encryption: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    namespace: string;
    persistent: boolean;
    maxEntries: number;
    compression: boolean;
    encryption: boolean;
    defaultTTL?: number | undefined;
}, {
    namespace: string;
    persistent?: boolean | undefined;
    maxEntries?: number | undefined;
    defaultTTL?: number | undefined;
    compression?: boolean | undefined;
    encryption?: boolean | undefined;
}>;
export type StateEntry = z.infer<typeof StateEntrySchema>;
export type StateConfig = z.infer<typeof StateConfigSchema>;
export interface StateMetrics {
    totalEntries: number;
    expiredEntries: number;
    memoryUsage: number;
    lastPersisted: Date | null;
    hitRate: number;
    operations: {
        reads: number;
        writes: number;
        deletes: number;
    };
}
export declare class StateManager extends EventEmitter {
    private states;
    private configs;
    private persistenceInterval;
    private cleanupInterval;
    private metrics;
    private persistenceDir;
    constructor(options?: {
        persistenceDir?: string;
        persistenceInterval?: number;
        cleanupInterval?: number;
    });
    createNamespace(namespace: string, config?: Partial<StateConfig>): void;
    set(namespace: string, key: string, value: any, options?: {
        ttl?: number;
        tags?: string[];
        metadata?: Record<string, any>;
    }): boolean;
    get(namespace: string, key: string): any;
    getEntry(namespace: string, key: string): StateEntry | undefined;
    delete(namespace: string, key: string): boolean;
    has(namespace: string, key: string): boolean;
    keys(namespace: string): string[];
    values(namespace: string): any[];
    entries(namespace: string): Array<[string, any]>;
    getMetrics(namespace: string): StateMetrics | undefined;
    getAllMetrics(): Record<string, StateMetrics>;
    clear(namespace: string): boolean;
    private persistAllNamespaces;
    private cleanupExpiredEntries;
    private isExpired;
    private getValueType;
    private calculateMemoryUsage;
    private evictOldestEntry;
    shutdown(): Promise<void>;
}
export {};
//# sourceMappingURL=state.d.ts.map