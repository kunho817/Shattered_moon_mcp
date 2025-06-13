/**
 * Advanced TypeScript Utilities for Shattered Moon MCP
 * Provides advanced type manipulation, generic constraints, and utility types
 */
import { z } from 'zod';
export type NonEmptyArray<T> = [T, ...T[]];
export type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type MCPResult<T> = {
    success: true;
    data: T;
    metadata?: Record<string, unknown>;
} | {
    success: false;
    error: string;
    code?: string;
    suggestions?: string[];
};
export type AsyncMCPResult<T> = Promise<MCPResult<T>>;
export type InferSchemaType<T extends z.ZodSchema> = z.infer<T>;
export type SchemaValidationResult<T> = {
    success: true;
    data: T;
} | {
    success: false;
    errors: z.ZodError;
};
export interface PerformanceMetric {
    name: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    metadata?: Record<string, unknown>;
}
export type PerformanceTracker = {
    start(name: string, metadata?: Record<string, unknown>): void;
    end(name: string): PerformanceMetric | null;
    getMetrics(): PerformanceMetric[];
    reset(): void;
};
export declare class MCPError extends Error {
    readonly code: string;
    readonly suggestions: string[];
    readonly metadata?: Record<string, unknown> | undefined;
    constructor(message: string, code: string, suggestions?: string[], metadata?: Record<string, unknown> | undefined);
}
export type ErrorHandler<T> = (error: Error) => MCPResult<T>;
export type MethodDecorator<T = any> = (target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T> | void;
export type ClassDecorator<T extends new (...args: any[]) => any> = (constructor: T) => T | void;
export declare function Performance(metricName?: string): MethodDecorator;
export declare function Retry(maxAttempts?: number, delayMs?: number): MethodDecorator;
export declare function Cache(ttlMs?: number): MethodDecorator;
export declare function isPromise<T>(value: any): value is Promise<T>;
export declare function isMCPResult<T>(value: any): value is MCPResult<T>;
export declare function isNonEmptyArray<T>(value: T[]): value is NonEmptyArray<T>;
export type Debounced<T extends (...args: any[]) => any> = T & {
    cancel(): void;
    flush(): ReturnType<T> | undefined;
};
export declare function debounce<T extends (...args: any[]) => any>(func: T, delayMs: number): Debounced<T>;
export type Throttled<T extends (...args: any[]) => any> = T & {
    cancel(): void;
};
export declare function throttle<T extends (...args: any[]) => any>(func: T, delayMs: number): Throttled<T>;
export declare function createSuccess<T>(data: T, metadata?: Record<string, unknown>): MCPResult<T>;
export declare function createError<T>(error: string, code?: string, suggestions?: string[]): MCPResult<T>;
export declare function handleAsyncResult<T>(promise: Promise<T>, errorHandler?: ErrorHandler<T>): AsyncMCPResult<T>;
export declare function validateSchema<T extends z.ZodSchema>(schema: T, data: unknown): SchemaValidationResult<z.infer<T>>;
export declare function createSchemaValidator<T extends z.ZodSchema>(schema: T): (data: unknown) => SchemaValidationResult<z.infer<T>>;
export type KeysOfType<T, U> = {
    [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];
export type OptionalKeys<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];
export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];
export type Flatten<T> = T extends readonly (infer U)[] ? U : T;
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
export interface EventMap {
    [key: string]: (...args: any[]) => void;
}
export type EventEmitter<T extends EventMap> = {
    on<K extends keyof T>(event: K, listener: T[K]): void;
    off<K extends keyof T>(event: K, listener: T[K]): void;
    emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): void;
    removeAllListeners<K extends keyof T>(event?: K): void;
};
export interface MCPServerConfig {
    transport: {
        stdio?: boolean;
        http?: {
            port: number;
            cors?: boolean;
        };
        websocket?: {
            port: number;
        };
    };
    security: {
        rateLimit: {
            windowMs: number;
            maxRequests: number;
        };
        validation: boolean;
        circuitBreaker: {
            failureThreshold: number;
            recoveryTimeMs: number;
        };
    };
    logging: {
        level: 'debug' | 'info' | 'warn' | 'error';
        format: 'json' | 'simple';
    };
    performance: {
        monitoring: boolean;
        metricsRetentionMs: number;
    };
}
export type DeepMerge<T, U> = {
    [K in keyof T | keyof U]: K extends keyof U ? K extends keyof T ? T[K] extends object ? U[K] extends object ? DeepMerge<T[K], U[K]> : U[K] : U[K] : U[K] : K extends keyof T ? T[K] : never;
};
//# sourceMappingURL=advanced-types.d.ts.map