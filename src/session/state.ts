import { EventEmitter } from 'events';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import logger from '../utils/logger.js';

// State schemas
const StateEntrySchema = z.object({
  key: z.string(),
  value: z.any(),
  type: z.enum(['string', 'number', 'boolean', 'object', 'array']),
  timestamp: z.date(),
  ttl: z.number().optional(), // Time to live in milliseconds
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional()
});

const StateConfigSchema = z.object({
  namespace: z.string(),
  persistent: z.boolean().default(false),
  maxEntries: z.number().default(1000),
  defaultTTL: z.number().optional(),
  compression: z.boolean().default(false),
  encryption: z.boolean().default(false)
});

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

export class StateManager extends EventEmitter {
  private states: Map<string, Map<string, StateEntry>> = new Map(); // namespace -> key -> entry
  private configs: Map<string, StateConfig> = new Map();
  private persistenceInterval: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private metrics: Map<string, StateMetrics> = new Map();
  private persistenceDir: string;

  constructor(options: {
    persistenceDir?: string;
    persistenceInterval?: number;
    cleanupInterval?: number;
  } = {}) {
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

    logger.info('State Manager initialized', {
      persistenceDir: this.persistenceDir
    });
  }

  // Create or configure a namespace
  createNamespace(namespace: string, config: Partial<StateConfig> = {}): void {
    const fullConfig: StateConfig = {
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

    logger.info(`State namespace created: ${namespace}`, fullConfig);
    this.emit('namespaceCreated', { namespace, config: fullConfig });
  }

  // Set a value
  set(namespace: string, key: string, value: any, options: {
    ttl?: number;
    tags?: string[];
    metadata?: Record<string, any>;
  } = {}): boolean {
    if (!this.states.has(namespace)) {
      this.createNamespace(namespace);
    }

    const config = this.configs.get(namespace)!;
    const stateMap = this.states.get(namespace)!;
    const metrics = this.metrics.get(namespace)!;

    // Check max entries limit
    if (stateMap.size >= config.maxEntries && !stateMap.has(key)) {
      this.evictOldestEntry(namespace);
    }

    // Determine value type
    const type = this.getValueType(value);
    
    // Calculate TTL
    const ttl = options.ttl || config.defaultTTL;
    
    const entry: StateEntry = {
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
    logger.debug(`State set: ${namespace}.${key}`);
    
    return true;
  }

  // Get a value
  get(namespace: string, key: string): any {
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
  getEntry(namespace: string, key: string): StateEntry | undefined {
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
  delete(namespace: string, key: string): boolean {
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
      logger.debug(`State deleted: ${namespace}.${key}`);
    }
    
    return deleted;
  }

  // Check if key exists
  has(namespace: string, key: string): boolean {
    const stateMap = this.states.get(namespace);
    if (!stateMap) {
      return false;
    }

    const entry = stateMap.get(key);
    return entry !== undefined && !this.isExpired(entry);
  }

  // Get all keys in namespace
  keys(namespace: string): string[] {
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
  values(namespace: string): any[] {
    return this.keys(namespace).map(key => this.get(namespace, key));
  }

  // Get all entries in namespace
  entries(namespace: string): Array<[string, any]> {
    return this.keys(namespace).map(key => [key, this.get(namespace, key)]);
  }

  // Get namespace metrics
  getMetrics(namespace: string): StateMetrics | undefined {
    return this.metrics.get(namespace);
  }

  // Get all metrics
  getAllMetrics(): Record<string, StateMetrics> {
    const result: Record<string, StateMetrics> = {};
    for (const [namespace, metrics] of this.metrics.entries()) {
      result[namespace] = { ...metrics };
    }
    return result;
  }

  // Clear namespace
  clear(namespace: string): boolean {
    const stateMap = this.states.get(namespace);
    if (!stateMap) {
      return false;
    }

    const count = stateMap.size;
    stateMap.clear();
    
    const metrics = this.metrics.get(namespace)!;
    metrics.totalEntries = 0;
    metrics.memoryUsage = 0;
    
    this.emit('namespaceCleared', { namespace, count });
    logger.info(`State namespace cleared: ${namespace} (${count} entries)`);
    
    return true;
  }

  // Persist all persistent namespaces
  private async persistAllNamespaces(): Promise<void> {
    // Implementation for persistence
    logger.debug('Persisting all namespaces');
  }

  // Cleanup expired entries
  private cleanupExpiredEntries(): void {
    let totalCleaned = 0;
    
    for (const [namespace, stateMap] of this.states.entries()) {
      const metrics = this.metrics.get(namespace)!;
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
      logger.debug(`Cleaned up ${totalCleaned} expired state entries`);
      this.emit('expiredCleanup', { count: totalCleaned });
    }
  }

  // Helper methods
  private isExpired(entry: StateEntry): boolean {
    if (!entry.ttl) return false;
    return Date.now() - entry.timestamp.getTime() > entry.ttl;
  }

  private getValueType(value: any): 'string' | 'number' | 'boolean' | 'object' | 'array' {
    if (Array.isArray(value)) return 'array';
    return typeof value as any;
  }

  private calculateMemoryUsage(namespace: string): number {
    const stateMap = this.states.get(namespace);
    if (!stateMap) return 0;
    
    let size = 0;
    for (const [, entry] of stateMap.entries()) {
      size += JSON.stringify(entry).length;
    }
    return size;
  }

  private evictOldestEntry(namespace: string): void {
    const stateMap = this.states.get(namespace);
    if (!stateMap || stateMap.size === 0) return;
    
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    
    for (const [key, entry] of stateMap.entries()) {
      if (entry.timestamp.getTime() < oldestTime) {
        oldestTime = entry.timestamp.getTime();
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.delete(namespace, oldestKey);
      logger.debug(`Evicted oldest entry: ${namespace}.${oldestKey}`);
    }
  }

  // Shutdown
  async shutdown(): Promise<void> {
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
    
    logger.info(`State Manager shutdown complete. ${totalEntries} entries cleared.`);
  }
}