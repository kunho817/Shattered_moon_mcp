"use strict";
/**
 * Intelligent Caching System for Shattered Moon MCP
 * Redis-like caching capabilities with advanced features
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntelligentCache = void 0;
exports.getGlobalCache = getGlobalCache;
exports.destroyGlobalCache = destroyGlobalCache;
exports.Cached = Cached;
const events_1 = require("events");
const logger_js_1 = __importDefault(require("./logger.js"));
class LRUPolicy {
    onAccess(entry) {
        entry.lastAccessed = Date.now();
    }
    onSet(entry) {
        entry.lastAccessed = Date.now();
    }
    selectVictim(entries) {
        let oldestKey = null;
        let oldestTime = Infinity;
        for (const [key, entry] of entries) {
            if (entry.lastAccessed < oldestTime) {
                oldestTime = entry.lastAccessed;
                oldestKey = key;
            }
        }
        return oldestKey;
    }
}
class LFUPolicy {
    onAccess(entry) {
        entry.accessCount++;
        entry.lastAccessed = Date.now();
    }
    onSet(entry) {
        entry.accessCount = 1;
        entry.lastAccessed = Date.now();
    }
    selectVictim(entries) {
        let leastUsedKey = null;
        let leastCount = Infinity;
        for (const [key, entry] of entries) {
            if (entry.accessCount < leastCount) {
                leastCount = entry.accessCount;
                leastUsedKey = key;
            }
        }
        return leastUsedKey;
    }
}
class FIFOPolicy {
    onAccess(entry) {
        entry.accessCount++;
        entry.lastAccessed = Date.now();
    }
    onSet(entry) {
        entry.lastAccessed = Date.now();
    }
    selectVictim(entries) {
        let oldestKey = null;
        let oldestTime = Infinity;
        for (const [key, entry] of entries) {
            if (entry.createdAt < oldestTime) {
                oldestTime = entry.createdAt;
                oldestKey = key;
            }
        }
        return oldestKey;
    }
}
class TTLPolicy {
    onAccess(entry) {
        entry.accessCount++;
        entry.lastAccessed = Date.now();
    }
    onSet(entry) {
        entry.lastAccessed = Date.now();
    }
    selectVictim(entries) {
        const now = Date.now();
        let soonestExpiryKey = null;
        let soonestExpiry = Infinity;
        for (const [key, entry] of entries) {
            if (entry.expiresAt && entry.expiresAt < soonestExpiry) {
                soonestExpiry = entry.expiresAt;
                soonestExpiryKey = key;
            }
        }
        return soonestExpiryKey;
    }
}
/**
 * Intelligent Cache with Redis-like capabilities
 */
class IntelligentCache extends events_1.EventEmitter {
    entries = new Map();
    config;
    policy;
    cleanupTimer;
    stats = {
        hitCount: 0,
        missCount: 0,
        evictionCount: 0,
        totalSize: 0
    };
    constructor(config = {}) {
        super();
        this.config = {
            maxSize: 100 * 1024 * 1024, // 100MB
            maxEntries: 10000,
            defaultTTL: 3600000, // 1 hour
            cleanupInterval: 60000, // 1 minute
            evictionPolicy: 'lru',
            compressionThreshold: 1024, // 1KB
            enableStats: true,
            enableEvents: true,
            ...config
        };
        this.policy = this.createEvictionPolicy(this.config.evictionPolicy);
        this.startCleanupTimer();
    }
    /**
     * Set a value in the cache
     */
    set(key, value, options = {}) {
        const now = Date.now();
        const serializedValue = this.serialize(value);
        const size = this.calculateSize(serializedValue);
        // Check if we need to make space
        this.ensureSpace(size);
        const entry = {
            key,
            value: serializedValue,
            createdAt: now,
            expiresAt: options.ttl ? now + options.ttl : now + this.config.defaultTTL,
            accessCount: 0,
            lastAccessed: now,
            size,
            tags: new Set(options.tags || []),
            metadata: options.metadata || {}
        };
        // Remove existing entry if present
        if (this.entries.has(key)) {
            this.delete(key);
        }
        this.entries.set(key, entry);
        this.stats.totalSize += size;
        this.policy.onSet(entry);
        if (this.config.enableEvents) {
            this.emit('set', key, value, entry);
        }
        logger_js_1.default.debug(`Cache set: ${key} (size: ${size} bytes, ttl: ${options.ttl || this.config.defaultTTL}ms)`);
    }
    /**
     * Get a value from the cache
     */
    get(key) {
        const entry = this.entries.get(key);
        if (!entry) {
            this.stats.missCount++;
            if (this.config.enableEvents) {
                this.emit('miss', key);
            }
            return null;
        }
        // Check if expired
        if (entry.expiresAt && Date.now() > entry.expiresAt) {
            this.delete(key);
            this.stats.missCount++;
            if (this.config.enableEvents) {
                this.emit('miss', key);
                this.emit('expire', key, entry);
            }
            return null;
        }
        this.stats.hitCount++;
        this.policy.onAccess(entry);
        if (this.config.enableEvents) {
            this.emit('hit', key, entry);
        }
        const value = this.deserialize(entry.value);
        logger_js_1.default.debug(`Cache hit: ${key} (access count: ${entry.accessCount})`);
        return value;
    }
    /**
     * Check if a key exists in the cache
     */
    has(key) {
        const entry = this.entries.get(key);
        if (!entry)
            return false;
        // Check if expired
        if (entry.expiresAt && Date.now() > entry.expiresAt) {
            this.delete(key);
            return false;
        }
        return true;
    }
    /**
     * Delete a key from the cache
     */
    delete(key) {
        const entry = this.entries.get(key);
        if (!entry)
            return false;
        this.entries.delete(key);
        this.stats.totalSize -= entry.size;
        if (this.config.enableEvents) {
            this.emit('delete', key, entry);
        }
        logger_js_1.default.debug(`Cache delete: ${key} (size: ${entry.size} bytes)`);
        return true;
    }
    /**
     * Clear all entries from the cache
     */
    clear() {
        const count = this.entries.size;
        this.entries.clear();
        this.stats.totalSize = 0;
        if (this.config.enableEvents) {
            this.emit('clear', count);
        }
        logger_js_1.default.debug(`Cache cleared: ${count} entries`);
    }
    /**
     * Get cache statistics
     */
    getStats() {
        const memoryUsed = this.stats.totalSize;
        const memoryAvailable = this.config.maxSize - memoryUsed;
        const hitRate = this.stats.hitCount + this.stats.missCount > 0
            ? (this.stats.hitCount / (this.stats.hitCount + this.stats.missCount)) * 100
            : 0;
        return {
            totalEntries: this.entries.size,
            totalSize: this.stats.totalSize,
            hitCount: this.stats.hitCount,
            missCount: this.stats.missCount,
            hitRate,
            evictionCount: this.stats.evictionCount,
            memoryUsage: {
                used: memoryUsed,
                available: memoryAvailable,
                percentage: (memoryUsed / this.config.maxSize) * 100
            }
        };
    }
    /**
     * Get entries by tag
     */
    getByTag(tag) {
        const results = [];
        for (const [key, entry] of this.entries) {
            if (entry.tags.has(tag)) {
                const value = this.deserialize(entry.value);
                results.push({ key, value, entry });
            }
        }
        return results;
    }
    /**
     * Delete entries by tag
     */
    deleteByTag(tag) {
        let deletedCount = 0;
        for (const [key, entry] of this.entries) {
            if (entry.tags.has(tag)) {
                this.delete(key);
                deletedCount++;
            }
        }
        return deletedCount;
    }
    /**
     * Set TTL for a key
     */
    expire(key, ttl) {
        const entry = this.entries.get(key);
        if (!entry)
            return false;
        entry.expiresAt = Date.now() + ttl;
        return true;
    }
    /**
     * Get TTL for a key
     */
    ttl(key) {
        const entry = this.entries.get(key);
        if (!entry || !entry.expiresAt)
            return -1;
        const remaining = entry.expiresAt - Date.now();
        return remaining > 0 ? remaining : 0;
    }
    /**
     * Get all keys matching a pattern
     */
    keys(pattern) {
        const keys = Array.from(this.entries.keys());
        if (!pattern)
            return keys;
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return keys.filter(key => regex.test(key));
    }
    /**
     * Cleanup expired entries
     */
    cleanup() {
        const now = Date.now();
        let cleanedCount = 0;
        for (const [key, entry] of this.entries) {
            if (entry.expiresAt && now > entry.expiresAt) {
                this.delete(key);
                cleanedCount++;
            }
        }
        if (cleanedCount > 0) {
            logger_js_1.default.debug(`Cache cleanup: removed ${cleanedCount} expired entries`);
        }
        return cleanedCount;
    }
    /**
     * Destroy the cache and cleanup resources
     */
    destroy() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
        this.clear();
        this.removeAllListeners();
    }
    // Private methods
    createEvictionPolicy(policy) {
        switch (policy) {
            case 'lfu': return new LFUPolicy();
            case 'fifo': return new FIFOPolicy();
            case 'ttl': return new TTLPolicy();
            default: return new LRUPolicy();
        }
    }
    ensureSpace(requiredSize) {
        // Check entry count limit
        while (this.entries.size >= this.config.maxEntries) {
            this.evictEntry();
        }
        // Check size limit
        while (this.stats.totalSize + requiredSize > this.config.maxSize) {
            if (!this.evictEntry()) {
                break; // No more entries to evict
            }
        }
    }
    evictEntry() {
        const victimKey = this.policy.selectVictim(this.entries);
        if (!victimKey)
            return false;
        const entry = this.entries.get(victimKey);
        if (entry) {
            this.delete(victimKey);
            this.stats.evictionCount++;
            if (this.config.enableEvents) {
                this.emit('evict', victimKey, entry);
            }
            logger_js_1.default.debug(`Cache eviction: ${victimKey} (policy: ${this.config.evictionPolicy})`);
            return true;
        }
        return false;
    }
    startCleanupTimer() {
        this.cleanupTimer = setInterval(() => {
            this.cleanup();
        }, this.config.cleanupInterval);
    }
    serialize(value) {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            return value;
        }
        const serialized = JSON.stringify(value);
        // Optional compression for large values
        if (serialized.length > this.config.compressionThreshold) {
            // In a real implementation, you might use zlib or another compression library
            return { __compressed: true, data: serialized };
        }
        return serialized;
    }
    deserialize(value) {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            return value;
        }
        if (value && value.__compressed) {
            // Decompress if needed
            return JSON.parse(value.data);
        }
        return JSON.parse(value);
    }
    calculateSize(value) {
        if (typeof value === 'string') {
            return value.length * 2; // Assume UTF-16
        }
        if (typeof value === 'number') {
            return 8; // 64-bit number
        }
        if (typeof value === 'boolean') {
            return 1;
        }
        return JSON.stringify(value).length * 2;
    }
}
exports.IntelligentCache = IntelligentCache;
// Global cache instance
let globalCache = null;
/**
 * Get or create the global cache instance
 */
function getGlobalCache(config) {
    if (!globalCache) {
        globalCache = new IntelligentCache(config);
    }
    return globalCache;
}
/**
 * Destroy the global cache instance
 */
function destroyGlobalCache() {
    if (globalCache) {
        globalCache.destroy();
        globalCache = null;
    }
}
// Cache decorator for automatic caching
function Cached(options = {}) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        const cache = getGlobalCache();
        descriptor.value = async function (...args) {
            const namespace = options.namespace || target.constructor.name;
            const keyBase = options.key || `${namespace}.${propertyKey}`;
            const cacheKey = `${keyBase}.${JSON.stringify(args)}`;
            // Try to get from cache
            const cached = cache.get(cacheKey);
            if (cached !== null) {
                return cached;
            }
            // Execute original method
            const result = await originalMethod.apply(this, args);
            // Cache the result
            cache.set(cacheKey, result, {
                ttl: options.ttl,
                tags: options.tags,
                metadata: { method: propertyKey, class: namespace }
            });
            return result;
        };
        return descriptor;
    };
}
//# sourceMappingURL=intelligent-cache.js.map