import { z } from 'zod';
interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    burstLimit?: number;
    burstWindowMs?: number;
}
export declare class RateLimiter {
    private config;
    private requests;
    private blocked;
    private violations;
    constructor(config?: RateLimitConfig);
    check(identifier: string): boolean;
    private recordViolation;
    reset(identifier: string): void;
}
export declare class SecurityValidator {
    private static injectionPatterns;
    static validateInput<T>(schema: z.ZodSchema<T>, input: unknown): T;
    static detectInjection(input: string): boolean;
    static sanitizeString(input: string): string;
    static sanitizeFilePath(path: string): string;
    static maskSensitiveData(data: any): any;
}
export declare class CircuitBreaker {
    private threshold;
    private timeout;
    private resetTimeout;
    private failures;
    private lastFailureTime;
    private state;
    constructor(threshold?: number, timeout?: number, resetTimeout?: number);
    execute<T>(operation: () => Promise<T>): Promise<T>;
    private onSuccess;
    private onFailure;
    private reset;
    getState(): string;
}
export {};
//# sourceMappingURL=security.d.ts.map