/**
 * Advanced TypeScript Utilities for Shattered Moon MCP
 * Provides advanced type manipulation, generic constraints, and utility types
 */

import { z } from 'zod';

// Advanced Generic Constraints
export type NonEmptyArray<T> = [T, ...T[]];
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Utility Types for MCP Operations
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

// Advanced Schema Utilities
export type InferSchemaType<T extends z.ZodSchema> = z.infer<T>;
export type SchemaValidationResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  errors: z.ZodError;
};

// Performance Monitoring Types
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

// Advanced Error Handling
export class MCPError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly suggestions: string[] = [],
    public readonly metadata?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'MCPError';
  }
}

export type ErrorHandler<T> = (error: Error) => MCPResult<T>;

// Decorator Types and Factory
export type MethodDecorator<T = any> = (
  target: any,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>
) => TypedPropertyDescriptor<T> | void;

export type ClassDecorator<T extends new (...args: any[]) => any> = (constructor: T) => T | void;

// Performance Monitoring Decorator Factory
export function Performance(metricName?: string): MethodDecorator {
  return function (target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) {
    const originalMethod = descriptor.value;
    const name = metricName || `${target.constructor.name}.${String(propertyKey)}`;
    
    descriptor.value = async function (...args: any[]) {
      const startTime = performance.now();
      try {
        const result = await originalMethod.apply(this, args);
        const endTime = performance.now();
        console.log(`[Performance] ${name}: ${endTime - startTime}ms`);
        return result;
      } catch (error) {
        const endTime = performance.now();
        console.error(`[Performance] ${name} failed after ${endTime - startTime}ms:`, error);
        throw error;
      }
    };
    
    return descriptor;
  };
}

// Retry Decorator Factory
export function Retry(maxAttempts: number = 3, delayMs: number = 1000): MethodDecorator {
  return function (target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      let lastError: Error;
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error as Error;
          console.warn(`[Retry] Attempt ${attempt}/${maxAttempts} failed for ${String(propertyKey)}:`, error);
          
          if (attempt < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
          }
        }
      }
      
      throw lastError!;
    };
    
    return descriptor;
  };
}

// Cache Decorator Factory
export function Cache(ttlMs: number = 60000): MethodDecorator {
  const cache = new Map<string, { value: any; expiry: number }>();
  
  return function (target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}.${String(propertyKey)}.${JSON.stringify(args)}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() < cached.expiry) {
        return cached.value;
      }
      
      const result = await originalMethod.apply(this, args);
      cache.set(cacheKey, { value: result, expiry: Date.now() + ttlMs });
      
      return result;
    };
    
    return descriptor;
  };
}

// Type Guards
export function isPromise<T>(value: any): value is Promise<T> {
  return value && typeof value.then === 'function';
}

export function isMCPResult<T>(value: any): value is MCPResult<T> {
  return value && typeof value === 'object' && 'success' in value;
}

export function isNonEmptyArray<T>(value: T[]): value is NonEmptyArray<T> {
  return value.length > 0;
}

// Advanced Function Utilities
export type Debounced<T extends (...args: any[]) => any> = T & {
  cancel(): void;
  flush(): ReturnType<T> | undefined;
};

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delayMs: number
): Debounced<T> {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T>;
  let result: ReturnType<T> | undefined;
  
  const debouncedFn = ((...args: Parameters<T>) => {
    lastArgs = args;
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      result = func(...lastArgs);
      timeoutId = null;
    }, delayMs);
    
    return result;
  }) as Debounced<T>;
  
  debouncedFn.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
  
  debouncedFn.flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      result = func(...lastArgs);
      timeoutId = null;
    }
    return result;
  };
  
  return debouncedFn;
}

export type Throttled<T extends (...args: any[]) => any> = T & {
  cancel(): void;
};

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delayMs: number
): Throttled<T> {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  
  const throttledFn = ((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastExecTime >= delayMs) {
      lastExecTime = now;
      return func(...args);
    }
    
    if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastExecTime = Date.now();
        func(...args);
        timeoutId = null;
      }, delayMs - (now - lastExecTime));
    }
  }) as Throttled<T>;
  
  throttledFn.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
  
  return throttledFn;
}

// Result Helper Functions
export function createSuccess<T>(data: T, metadata?: Record<string, unknown>): MCPResult<T> {
  return { success: true, data, metadata };
}

export function createError<T>(
  error: string,
  code?: string,
  suggestions?: string[]
): MCPResult<T> {
  return { success: false, error, code, suggestions };
}

export function handleAsyncResult<T>(
  promise: Promise<T>,
  errorHandler?: ErrorHandler<T>
): AsyncMCPResult<T> {
  return promise
    .then(data => createSuccess(data))
    .catch(error => {
      if (errorHandler) {
        return errorHandler(error);
      }
      return createError(
        error.message || 'Unknown error occurred',
        error.code,
        error.suggestions
      );
    });
}

// Schema Validation Utilities
export function validateSchema<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): SchemaValidationResult<z.infer<T>> {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

export function createSchemaValidator<T extends z.ZodSchema>(schema: T) {
  return (data: unknown): SchemaValidationResult<z.infer<T>> => {
    return validateSchema(schema, data);
  };
}

// Advanced Type Manipulation
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

// Event System Types
export interface EventMap {
  [key: string]: (...args: any[]) => void;
}

export type EventEmitter<T extends EventMap> = {
  on<K extends keyof T>(event: K, listener: T[K]): void;
  off<K extends keyof T>(event: K, listener: T[K]): void;
  emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): void;
  removeAllListeners<K extends keyof T>(event?: K): void;
};

// Configuration Types
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
  [K in keyof T | keyof U]: K extends keyof U
    ? K extends keyof T
      ? T[K] extends object
        ? U[K] extends object
          ? DeepMerge<T[K], U[K]>
          : U[K]
        : U[K]
      : U[K]
    : K extends keyof T
    ? T[K]
    : never;
};