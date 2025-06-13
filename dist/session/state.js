"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateManager = void 0;
const events_1 = require("events");
const zod_1 = require("zod");
const logger_js_1 = __importDefault(require("../utils/logger.js"));
// State schemas
const StateEntrySchema = zod_1.z.object({
    key: zod_1.z.string(),
    value: zod_1.z.any(),
    type: zod_1.z.enum(['string', 'number', 'boolean', 'object', 'array']),
    timestamp: zod_1.z.date(),
    ttl: zod_1.z.number().optional(), // Time to live in milliseconds
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional()
});
const StateConfigSchema = zod_1.z.object({
    namespace: zod_1.z.string(),
    persistent: zod_1.z.boolean().default(false),
    maxEntries: zod_1.z.number().default(1000),
    defaultTTL: zod_1.z.number().optional(),
    compression: zod_1.z.boolean().default(false),
    encryption: zod_1.z.boolean().default(false)
});
class StateManager extends events_1.EventEmitter {
    states = new Map(); // namespace -> key -> entry
    configs = new Map();
    persistenceInterval = null;
    cleanupInterval = null;
    metrics = new Map();
    persistenceDir;
    constructor(options = {}) {
        super();
        this.persistenceDir = options.persistenceDir || './data/state';
        // Start persistence interval
        if (options.persistenceInterval) {
            this.persistenceInterval = setInterval(() => {
                this.persistAllNamespaces();
            }, options.persistenceInterval);
        }
        // Start cleanup interval
        const cleanupInterval = options.cleanupInterval || 60000; // 1 minute
        this.cleanupInterval = setInterval(() => {
            this.cleanupExpiredEntries();
        }, cleanupInterval);
        logger_js_1.default.info('State Manager initialized', {
            persistenceDir: this.persistenceDir
        });
    }
    // Create or configure a namespace
    createNamespace(namespace, config = {}) {
        const fullConfig = {
            namespace,
            persistent: false,
            maxEntries: 1000,
            compression: false,
            encryption: false,
            ...config
        };
        this.configs.set(namespace, fullConfig);
        this.states.set(namespace, new Map());
        this.metrics.set(namespace, {
            totalEntries: 0,
            expiredEntries: 0,
            memoryUsage: 0,
            lastPersisted: null,
            hitRate: 0,
            operations: { reads: 0, writes: 0, deletes: 0 }
        });
        logger_js_1.default.info(`State namespace created: ${namespace}`, fullConfig);
        this.emit('namespaceCreated', { namespace, config: fullConfig });
    }
    // Set a value
    set(namespace, key, value, options = {}) {
        if (!this.states.has(namespace)) {
            this.createNamespace(namespace);
        }
        const config = this.configs.get(namespace);
        const stateMap = this.states.get(namespace);
        const metrics = this.metrics.get(namespace);
        // Check max entries limit
        if (stateMap.size >= config.maxEntries && !stateMap.has(key)) {
            this.evictOldestEntry(namespace);
        }
        // Determine value type
        const type = this.getValueType(value);
        // Calculate TTL
        const ttl = options.ttl || config.defaultTTL;
        const entry = {
            key,
            value,
            type,
            timestamp: new Date(),
            ttl,
            tags: options.tags,
            metadata: options.metadata
        };
        stateMap.set(key, entry);
        metrics.operations.writes++;
        metrics.totalEntries = stateMap.size;
        metrics.memoryUsage = this.calculateMemoryUsage(namespace);
        this.emit('stateSet', { namespace, key, value, entry });
        logger_js_1.default.debug(`State set: ${namespace}.${key}`);
        return true;
    }
    // Get a value
    get(namespace, key) {
        const stateMap = this.states.get(namespace);
        const metrics = this.metrics.get(namespace);
        if (!stateMap || !metrics) {
            return undefined;
        }
        const entry = stateMap.get(key);
        if (!entry) {
            return undefined;
        }
        // Check TTL
        if (this.isExpired(entry)) {
            this.delete(namespace, key);
            return undefined;
        }
        metrics.operations.reads++;
        this.emit('stateGet', { namespace, key, value: entry.value });
        return entry.value;
    }
    // Get entry with metadata
    getEntry(namespace, key) {
        const stateMap = this.states.get(namespace);
        if (!stateMap) {
            return undefined;
        }
        const entry = stateMap.get(key);
        if (!entry || this.isExpired(entry)) {
            return undefined;
        }
        return entry;
    }
    // Delete a value
    delete(namespace, key) {
        const stateMap = this.states.get(namespace);
        const metrics = this.metrics.get(namespace);
        if (!stateMap || !metrics) {
            return false;
        }
        const deleted = stateMap.delete(key);
        if (deleted) {
            metrics.operations.deletes++;
            metrics.totalEntries = stateMap.size;
            metrics.memoryUsage = this.calculateMemoryUsage(namespace);
            this.emit('stateDeleted', { namespace, key });
            logger_js_1.default.debug(`State deleted: ${namespace}.${key}`);
        }
        return deleted;
    }
    // Check if key exists
    has(namespace, key) {
        const stateMap = this.states.get(namespace);
        if (!stateMap) {
            return false;
        }
        const entry = stateMap.get(key);
        return entry !== undefined && !this.isExpired(entry);
    }
    // Get all keys in namespace
    keys(namespace) {
        const stateMap = this.states.get(namespace);
        if (!stateMap) {
            return [];
        }
        return Array.from(stateMap.keys()).filter(key => {
            const entry = stateMap.get(key);
            return entry && !this.isExpired(entry);
        });
    }
    // Get all values in namespace
    values(namespace) {
        return this.keys(namespace).map(key => this.get(namespace, key));
    }
    // Get all entries in namespace
    entries(namespace) {
        return this.keys(namespace).map(key => [key, this.get(namespace, key)]);
    }
    // Get namespace metrics
    getMetrics(namespace) {
        return this.metrics.get(namespace);
    }
    // Get all metrics
    getAllMetrics() {
        const result = {};
        for (const [namespace, metrics] of this.metrics.entries()) {
            result[namespace] = { ...metrics };
        }
        return result;
    }
    // Clear namespace
    clear(namespace) {
        const stateMap = this.states.get(namespace);
        if (!stateMap) {
            return false;
        }
        const count = stateMap.size;
        stateMap.clear();
        const metrics = this.metrics.get(namespace);
        metrics.totalEntries = 0;
        metrics.memoryUsage = 0;
        this.emit('namespaceCleared', { namespace, count });
        logger_js_1.default.info(`State namespace cleared: ${namespace} (${count} entries)`);
        return true;
    }
    // Persist all persistent namespaces
    async persistAllNamespaces() {
        // Implementation for persistence
        logger_js_1.default.debug('Persisting all namespaces');
    }
    // Cleanup expired entries
    cleanupExpiredEntries() {
        let totalCleaned = 0;
        for (const [namespace, stateMap] of this.states.entries()) {
            const metrics = this.metrics.get(namespace);
            let cleaned = 0;
            for (const [key, entry] of stateMap.entries()) {
                if (this.isExpired(entry)) {
                    stateMap.delete(key);
                    cleaned++;
                }
            }
            if (cleaned > 0) {
                metrics.expiredEntries += cleaned;
                metrics.totalEntries = stateMap.size;
                metrics.memoryUsage = this.calculateMemoryUsage(namespace);
                totalCleaned += cleaned;
            }
        }
        if (totalCleaned > 0) {
            logger_js_1.default.debug(`Cleaned up ${totalCleaned} expired state entries`);
            this.emit('expiredCleanup', { count: totalCleaned });
        }
    }
    // Helper methods
    isExpired(entry) {
        if (!entry.ttl)
            return false;
        return Date.now() - entry.timestamp.getTime() > entry.ttl;
    }
    getValueType(value) {
        if (Array.isArray(value))
            return 'array';
        return typeof value;
    }
    calculateMemoryUsage(namespace) {
        const stateMap = this.states.get(namespace);
        if (!stateMap)
            return 0;
        let size = 0;
        for (const [, entry] of stateMap.entries()) {
            size += JSON.stringify(entry).length;
        }
        return size;
    }
    evictOldestEntry(namespace) {
        const stateMap = this.states.get(namespace);
        if (!stateMap || stateMap.size === 0)
            return;
        let oldestKey = null;
        let oldestTime = Infinity;
        for (const [key, entry] of stateMap.entries()) {
            if (entry.timestamp.getTime() < oldestTime) {
                oldestTime = entry.timestamp.getTime();
                oldestKey = key;
            }
        }
        if (oldestKey) {
            this.delete(namespace, oldestKey);
            logger_js_1.default.debug(`Evicted oldest entry: ${namespace}.${oldestKey}`);
        }
    }
    // Shutdown
    async shutdown() {
        if (this.persistenceInterval) {
            clearInterval(this.persistenceInterval);
            this.persistenceInterval = null;
        }
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        // Persist all before shutdown
        await this.persistAllNamespaces();
        const totalEntries = Array.from(this.states.values())
            .reduce((sum, map) => sum + map.size, 0);
        this.states.clear();
        this.configs.clear();
        this.metrics.clear();
        logger_js_1.default.info(`State Manager shutdown complete. ${totalEntries} entries cleared.`);
    }
}
exports.StateManager = StateManager;
//# sourceMappingURL=state.js.map