"use strict";
/**
 * Advanced TypeScript Utilities for Shattered Moon MCP
 * Provides advanced type manipulation, generic constraints, and utility types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPError = void 0;
exports.Performance = Performance;
exports.Retry = Retry;
exports.Cache = Cache;
exports.isPromise = isPromise;
exports.isMCPResult = isMCPResult;
exports.isNonEmptyArray = isNonEmptyArray;
exports.debounce = debounce;
exports.throttle = throttle;
exports.createSuccess = createSuccess;
exports.createError = createError;
exports.handleAsyncResult = handleAsyncResult;
exports.validateSchema = validateSchema;
exports.createSchemaValidator = createSchemaValidator;
// Advanced Error Handling
class MCPError extends Error {
    code;
    suggestions;
    metadata;
    constructor(message, code, suggestions = [], metadata) {
        super(message);
        this.code = code;
        this.suggestions = suggestions;
        this.metadata = metadata;
        this.name = 'MCPError';
    }
}
exports.MCPError = MCPError;
// Performance Monitoring Decorator Factory
function Performance(metricName) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        const name = metricName || `${target.constructor.name}.${String(propertyKey)}`;
        descriptor.value = async function (...args) {
            const startTime = performance.now();
            try {
                const result = await originalMethod.apply(this, args);
                const endTime = performance.now();
                console.log(`[Performance] ${name}: ${endTime - startTime}ms`);
                return result;
            }
            catch (error) {
                const endTime = performance.now();
                console.error(`[Performance] ${name} failed after ${endTime - startTime}ms:`, error);
                throw error;
            }
        };
        return descriptor;
    };
}
// Retry Decorator Factory
function Retry(maxAttempts = 3, delayMs = 1000) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            let lastError;
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    return await originalMethod.apply(this, args);
                }
                catch (error) {
                    lastError = error;
                    console.warn(`[Retry] Attempt ${attempt}/${maxAttempts} failed for ${String(propertyKey)}:`, error);
                    if (attempt < maxAttempts) {
                        await new Promise(resolve => setTimeout(resolve, delayMs));
                    }
                }
            }
            throw lastError;
        };
        return descriptor;
    };
}
// Cache Decorator Factory
function Cache(ttlMs = 60000) {
    const cache = new Map();
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
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
function isPromise(value) {
    return value && typeof value.then === 'function';
}
function isMCPResult(value) {
    return value && typeof value === 'object' && 'success' in value;
}
function isNonEmptyArray(value) {
    return value.length > 0;
}
function debounce(func, delayMs) {
    let timeoutId = null;
    let lastArgs;
    let result;
    const debouncedFn = ((...args) => {
        lastArgs = args;
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            result = func(...lastArgs);
            timeoutId = null;
        }, delayMs);
        return result;
    });
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
function throttle(func, delayMs) {
    let timeoutId = null;
    let lastExecTime = 0;
    const throttledFn = ((...args) => {
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
    });
    throttledFn.cancel = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    };
    return throttledFn;
}
// Result Helper Functions
function createSuccess(data, metadata) {
    return { success: true, data, metadata };
}
function createError(error, code, suggestions) {
    return { success: false, error, code, suggestions };
}
function handleAsyncResult(promise, errorHandler) {
    return promise
        .then(data => createSuccess(data))
        .catch(error => {
        if (errorHandler) {
            return errorHandler(error);
        }
        return createError(error.message || 'Unknown error occurred', error.code, error.suggestions);
    });
}
// Schema Validation Utilities
function validateSchema(schema, data) {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return { success: false, errors: result.error };
}
function createSchemaValidator(schema) {
    return (data) => {
        return validateSchema(schema, data);
    };
}
//# sourceMappingURL=advanced-types.js.map