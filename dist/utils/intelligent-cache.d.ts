/**
 * Intelligent Caching System for Shattered Moon MCP
 * Redis-like caching capabilities with advanced features
 */
import { EventEmitter } from 'events';
export interface CacheEntry<T = any> {
    readonly key: string;
    value: T;
    readonly createdAt: number;
    readonly expiresAt?: number;
    accessCount: number;
    lastAccessed: number;
    size: number;
    tags: Set<string>;
    metadata: Record<string, any>;
}
export interface CacheStats {
    totalEntries: number;
    totalSize: number;
    hitCount: number;
    missCount: number;
    hitRate: number;
    evictionCount: number;
    memoryUsage: {
        used: number;
        available: number;
        percentage: number;
    };
}
export interface CacheConfig {
    maxSize: number;
    maxEntries: number;
    defaultTTL: number;
    cleanupInterval: number;
    evictionPolicy: 'lru' | 'lfu' | 'fifo' | 'ttl';
    compressionThreshold: number;
    enableStats: boolean;
    enableEvents: boolean;
}
/**
 * Intelligent Cache with Redis-like capabilities
 */
export declare class IntelligentCache extends EventEmitter {
    private entries;
    private config;
    private policy;
    private cleanupTimer?;
    private stats;
    constructor(config?: Partial<CacheConfig>);
    /**
     * Set a value in the cache
     */
    set<T>(key: string, value: T, options?: {
        ttl?: number;
        tags?: string[];
        metadata?: Record<string, any>;
    }): void;
    /**
     * Get a value from the cache
     */
    get<T>(key: string): T | null;
    /**
     * Check if a key exists in the cache
     */
    has(key: string): boolean;
    /**
     * Delete a key from the cache
     */
    delete(key: string): boolean;
    /**
     * Clear all entries from the cache
     */
    clear(): void;
    /**
     * Get cache statistics
     */
    getStats(): CacheStats;
    /**
     * Get entries by tag
     */
    getByTag(tag: string): Array<{
        key: string;
        value: any;
        entry: CacheEntry;
    }>;
    /**
     * Delete entries by tag
     */
    deleteByTag(tag: string): number;
    /**
     * Set TTL for a key
     */
    expire(key: string, ttl: number): boolean;
    /**
     * Get TTL for a key
     */
    ttl(key: string): number;
    /**
     * Get all keys matching a pattern
     */
    keys(pattern?: string): string[];
    /**
     * Cleanup expired entries
     */
    cleanup(): number;
    /**
     * Destroy the cache and cleanup resources
     */
    destroy(): void;
    private createEvictionPolicy;
    private ensureSpace;
    private evictEntry;
    private startCleanupTimer;
    private serialize;
    private deserialize;
    private calculateSize;
}
/**
 * Get or create the global cache instance
 */
export declare function getGlobalCache(config?: Partial<CacheConfig>): IntelligentCache;
/**
 * Destroy the global cache instance
 */
export declare function destroyGlobalCache(): void;
export declare function Cached(options?: {
    ttl?: number;
    key?: string;
    tags?: string[];
    namespace?: string;
}): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
//# sourceMappingURL=intelligent-cache.d.ts.map