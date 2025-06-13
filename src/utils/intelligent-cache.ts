/**
 * Intelligent Caching System for Shattered Moon MCP
 * Redis-like caching capabilities with advanced features
 */

import { performance } from 'perf_hooks';
import { EventEmitter } from 'events';
import logger from './logger.js';
import type { DeepReadonly } from './advanced-types.js';

// Cache entry interface
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

// Cache statistics
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

// Cache configuration
export interface CacheConfig {
  maxSize: number; // Maximum memory in bytes
  maxEntries: number; // Maximum number of entries
  defaultTTL: number; // Default TTL in milliseconds
  cleanupInterval: number; // Cleanup interval in milliseconds
  evictionPolicy: 'lru' | 'lfu' | 'fifo' | 'ttl';
  compressionThreshold: number; // Compress values larger than this
  enableStats: boolean;
  enableEvents: boolean;
}

// Eviction policies
interface EvictionPolicy {
  onAccess(entry: CacheEntry): void;
  onSet(entry: CacheEntry): void;
  selectVictim(entries: Map<string, CacheEntry>): string | null;
}

class LRUPolicy implements EvictionPolicy {
  onAccess(entry: CacheEntry): void {
    entry.lastAccessed = Date.now();
  }

  onSet(entry: CacheEntry): void {
    entry.lastAccessed = Date.now();
  }

  selectVictim(entries: Map<string, CacheEntry>): string | null {
    let oldestKey: string | null = null;
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

class LFUPolicy implements EvictionPolicy {
  onAccess(entry: CacheEntry): void {
    entry.accessCount++;
    entry.lastAccessed = Date.now();
  }

  onSet(entry: CacheEntry): void {
    entry.accessCount = 1;
    entry.lastAccessed = Date.now();
  }

  selectVictim(entries: Map<string, CacheEntry>): string | null {
    let leastUsedKey: string | null = null;
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

class FIFOPolicy implements EvictionPolicy {
  onAccess(entry: CacheEntry): void {
    entry.accessCount++;
    entry.lastAccessed = Date.now();
  }

  onSet(entry: CacheEntry): void {
    entry.lastAccessed = Date.now();
  }

  selectVictim(entries: Map<string, CacheEntry>): string | null {
    let oldestKey: string | null = null;
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

class TTLPolicy implements EvictionPolicy {
  onAccess(entry: CacheEntry): void {
    entry.accessCount++;
    entry.lastAccessed = Date.now();
  }

  onSet(entry: CacheEntry): void {
    entry.lastAccessed = Date.now();
  }

  selectVictim(entries: Map<string, CacheEntry>): string | null {
    const now = Date.now();
    let soonestExpiryKey: string | null = null;
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
export class IntelligentCache extends EventEmitter {
  private entries = new Map<string, CacheEntry>();
  private config: CacheConfig;
  private policy: EvictionPolicy;
  private cleanupTimer?: NodeJS.Timeout;
  private stats = {
    hitCount: 0,
    missCount: 0,
    evictionCount: 0,
    totalSize: 0
  };

  constructor(config: Partial<CacheConfig> = {}) {
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
  public set<T>(
    key: string, 
    value: T, 
    options: {
      ttl?: number;
      tags?: string[];
      metadata?: Record<string, any>;
    } = {}
  ): void {
    const now = Date.now();
    const serializedValue = this.serialize(value);
    const size = this.calculateSize(serializedValue);

    // Check if we need to make space
    this.ensureSpace(size);

    const entry: CacheEntry<T> = {
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

    logger.debug(`Cache set: ${key} (size: ${size} bytes, ttl: ${options.ttl || this.config.defaultTTL}ms)`);
  }

  /**
   * Get a value from the cache
   */
  public get<T>(key: string): T | null {
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

    const value = this.deserialize<T>(entry.value);
    logger.debug(`Cache hit: ${key} (access count: ${entry.accessCount})`);
    
    return value;
  }

  /**
   * Check if a key exists in the cache
   */
  public has(key: string): boolean {
    const entry = this.entries.get(key);
    if (!entry) return false;

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
  public delete(key: string): boolean {
    const entry = this.entries.get(key);
    if (!entry) return false;

    this.entries.delete(key);
    this.stats.totalSize -= entry.size;

    if (this.config.enableEvents) {
      this.emit('delete', key, entry);
    }

    logger.debug(`Cache delete: ${key} (size: ${entry.size} bytes)`);
    return true;
  }

  /**
   * Clear all entries from the cache
   */
  public clear(): void {
    const count = this.entries.size;
    this.entries.clear();
    this.stats.totalSize = 0;

    if (this.config.enableEvents) {
      this.emit('clear', count);
    }

    logger.debug(`Cache cleared: ${count} entries`);
  }

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
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
  public getByTag(tag: string): Array<{ key: string; value: any; entry: CacheEntry }> {
    const results: Array<{ key: string; value: any; entry: CacheEntry }> = [];

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
  public deleteByTag(tag: string): number {
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
  public expire(key: string, ttl: number): boolean {
    const entry = this.entries.get(key);
    if (!entry) return false;

    (entry as any).expiresAt = Date.now() + ttl;
    return true;
  }

  /**
   * Get TTL for a key
   */
  public ttl(key: string): number {
    const entry = this.entries.get(key);
    if (!entry || !entry.expiresAt) return -1;

    const remaining = entry.expiresAt - Date.now();
    return remaining > 0 ? remaining : 0;
  }

  /**
   * Get all keys matching a pattern
   */
  public keys(pattern?: string): string[] {
    const keys = Array.from(this.entries.keys());
    
    if (!pattern) return keys;

    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return keys.filter(key => regex.test(key));
  }

  /**
   * Cleanup expired entries
   */
  public cleanup(): number {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.entries) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.debug(`Cache cleanup: removed ${cleanedCount} expired entries`);
    }

    return cleanedCount;
  }

  /**
   * Destroy the cache and cleanup resources
   */
  public destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
    this.removeAllListeners();
  }

  // Private methods
  private createEvictionPolicy(policy: string): EvictionPolicy {
    switch (policy) {
      case 'lfu': return new LFUPolicy();
      case 'fifo': return new FIFOPolicy();
      case 'ttl': return new TTLPolicy();
      default: return new LRUPolicy();
    }
  }

  private ensureSpace(requiredSize: number): void {
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

  private evictEntry(): boolean {
    const victimKey = this.policy.selectVictim(this.entries);
    if (!victimKey) return false;

    const entry = this.entries.get(victimKey);
    if (entry) {
      this.delete(victimKey);
      this.stats.evictionCount++;
      
      if (this.config.enableEvents) {
        this.emit('evict', victimKey, entry);
      }
      
      logger.debug(`Cache eviction: ${victimKey} (policy: ${this.config.evictionPolicy})`);
      return true;
    }

    return false;
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private serialize<T>(value: T): any {
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

  private deserialize<T>(value: any): T {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value as T;
    }
    
    if (value && value.__compressed) {
      // Decompress if needed
      return JSON.parse(value.data);
    }
    
    return JSON.parse(value);
  }

  private calculateSize(value: any): number {
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

// Global cache instance
let globalCache: IntelligentCache | null = null;

/**
 * Get or create the global cache instance
 */
export function getGlobalCache(config?: Partial<CacheConfig>): IntelligentCache {
  if (!globalCache) {
    globalCache = new IntelligentCache(config);
  }
  return globalCache;
}

/**
 * Destroy the global cache instance
 */
export function destroyGlobalCache(): void {
  if (globalCache) {
    globalCache.destroy();
    globalCache = null;
  }
}

// Cache decorator for automatic caching
export function Cached(options: { 
  ttl?: number; 
  key?: string; 
  tags?: string[];
  namespace?: string; 
} = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const cache = getGlobalCache();
    
    descriptor.value = async function (...args: any[]) {
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