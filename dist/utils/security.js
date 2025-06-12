import { z } from 'zod';
import logger from './logger.js';
export class RateLimiter {
    config;
    requests = new Map();
    blocked = new Map();
    violations = new Map();
    constructor(config = {
        windowMs: 60000, // 1 minute
        maxRequests: 60,
        burstLimit: 10,
        burstWindowMs: 10000 // 10 seconds
    }) {
        this.config = config;
    }
    check(identifier) {
        // Check if blocked
        const blockedUntil = this.blocked.get(identifier);
        if (blockedUntil && Date.now() < blockedUntil) {
            return false;
        }
        const now = Date.now();
        const requests = this.requests.get(identifier) || [];
        // Clean old requests
        const validRequests = requests.filter(time => now - time < this.config.windowMs);
        // Check burst limit
        if (this.config.burstLimit && this.config.burstWindowMs) {
            const burstRequests = validRequests.filter(time => now - time < (this.config.burstWindowMs || 0));
            if (burstRequests.length >= this.config.burstLimit) {
                this.recordViolation(identifier);
                return false;
            }
        }
        // Check rate limit
        if (validRequests.length >= this.config.maxRequests) {
            this.recordViolation(identifier);
            return false;
        }
        // Record request
        validRequests.push(now);
        this.requests.set(identifier, validRequests);
        return true;
    }
    recordViolation(identifier) {
        const violations = (this.violations.get(identifier) || 0) + 1;
        this.violations.set(identifier, violations);
        // Block after 5 violations
        if (violations >= 5) {
            const blockDuration = Math.min(violations * 5 * 60000, 3600000); // Max 1 hour
            this.blocked.set(identifier, Date.now() + blockDuration);
            logger.warn(`Blocked ${identifier} for ${blockDuration}ms due to rate limit violations`);
        }
    }
    reset(identifier) {
        this.requests.delete(identifier);
        this.violations.delete(identifier);
        this.blocked.delete(identifier);
    }
}
// Input validation and sanitization
export class SecurityValidator {
    static injectionPatterns = {
        sql: /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script|javascript|eval)\b)|(-{2})|(\|\|)|(\/\*)|(\*\/)/gi,
        xss: /<script[^>]*>|<\/script>|javascript:|on\w+\s*=|<iframe|<object|<embed|<link|<meta/gi,
        command: /([;&|`$])|(\.\.)|(\\x[0-9a-f]{2})/gi,
        pathTraversal: /(\.\.[\/\\])|([\/\\]\.\.)|(\.\.%2[fF])|(%2[eE]\.\.)/g
    };
    static validateInput(schema, input) {
        try {
            return schema.parse(input);
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                logger.error('Input validation failed', { errors: error.errors });
                throw new Error(`Invalid input: ${error.errors.map(e => e.message).join(', ')}`);
            }
            throw error;
        }
    }
    static detectInjection(input) {
        for (const [type, pattern] of Object.entries(this.injectionPatterns)) {
            if (pattern.test(input)) {
                logger.warn(`Potential ${type} injection detected`, { input });
                return true;
            }
        }
        return false;
    }
    static sanitizeString(input) {
        // Remove potential injection patterns
        let sanitized = input;
        // HTML encode special characters
        sanitized = sanitized
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
        return sanitized;
    }
    static sanitizeFilePath(path) {
        // Remove path traversal attempts
        return path.replace(this.injectionPatterns.pathTraversal, '');
    }
    static maskSensitiveData(data) {
        if (typeof data === 'string') {
            // Mask potential API keys, tokens, passwords
            return data.replace(/(api[_-]?key|token|password|secret|auth|bearer)\s*[:=]\s*['"]?([^'"\s]+)['"]?/gi, '$1=***MASKED***');
        }
        if (typeof data === 'object' && data !== null) {
            const masked = Array.isArray(data) ? [] : {};
            for (const [key, value] of Object.entries(data)) {
                if (/^(password|token|secret|api[_-]?key|auth)$/i.test(key)) {
                    masked[key] = '***MASKED***';
                }
                else {
                    masked[key] = this.maskSensitiveData(value);
                }
            }
            return masked;
        }
        return data;
    }
}
// Circuit breaker for service protection
export class CircuitBreaker {
    threshold;
    timeout;
    resetTimeout;
    failures = 0;
    lastFailureTime = 0;
    state = 'closed';
    constructor(threshold = 5, timeout = 60000, resetTimeout = 30000) {
        this.threshold = threshold;
        this.timeout = timeout;
        this.resetTimeout = resetTimeout;
    }
    async execute(operation) {
        if (this.state === 'open') {
            if (Date.now() - this.lastFailureTime > this.timeout) {
                this.state = 'half-open';
            }
            else {
                throw new Error('Circuit breaker is OPEN');
            }
        }
        try {
            const result = await operation();
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure();
            throw error;
        }
    }
    onSuccess() {
        if (this.state === 'half-open') {
            this.reset();
        }
    }
    onFailure() {
        this.failures++;
        this.lastFailureTime = Date.now();
        if (this.failures >= this.threshold) {
            this.state = 'open';
            logger.error(`Circuit breaker opened after ${this.failures} failures`);
            // Schedule reset
            setTimeout(() => {
                this.state = 'half-open';
                logger.info('Circuit breaker moved to half-open state');
            }, this.resetTimeout);
        }
    }
    reset() {
        this.failures = 0;
        this.state = 'closed';
        this.lastFailureTime = 0;
        logger.info('Circuit breaker reset to closed state');
    }
    getState() {
        return this.state;
    }
}
//# sourceMappingURL=security.js.map