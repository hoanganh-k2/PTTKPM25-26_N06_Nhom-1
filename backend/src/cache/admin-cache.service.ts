// src/cache/admin-cache.service.ts
import { Injectable } from '@nestjs/common';

interface CacheItem {
  data: any;
  timestamp: number;
  ttl: number;
}

@Injectable()
export class AdminCacheService {
  private cache = new Map<string, CacheItem>();
  
  // Default TTL values (in milliseconds)
  private readonly DEFAULT_TTL = {
    dashboard: 2 * 60 * 1000,     // 2 minutes
    books: 5 * 60 * 1000,        // 5 minutes
    users: 3 * 60 * 1000,        // 3 minutes
    orders: 1 * 60 * 1000,       // 1 minute
    categories: 10 * 60 * 1000,  // 10 minutes
    authors: 10 * 60 * 1000,     // 10 minutes
    publishers: 10 * 60 * 1000,  // 10 minutes
  };

  /**
   * Get cached data
   */
  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      // Cache expired
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * Set cached data with default or custom TTL
   */
  set(key: string, data: any, customTtl?: number): void {
    const ttl = customTtl || this.getDefaultTtl(key);
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Delete cached data
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear cache by pattern (e.g., 'books:*', 'dashboard:*')
   */
  clearByPattern(pattern: string): number {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    let deletedCount = 0;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }
    
    return deletedCount;
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    totalKeys: number;
    validKeys: number;
    expiredKeys: number;
    memoryUsage: string;
  } {
    const now = Date.now();
    let validKeys = 0;
    let expiredKeys = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        expiredKeys++;
      } else {
        validKeys++;
      }
    }

    return {
      totalKeys: this.cache.size,
      validKeys,
      expiredKeys,
      memoryUsage: `${Math.round(JSON.stringify([...this.cache.entries()]).length / 1024)} KB`,
    };
  }

  /**
   * Clean up expired cache entries
   */
  cleanup(): number {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Get default TTL based on cache key pattern
   */
  private getDefaultTtl(key: string): number {
    if (key.startsWith('dashboard:')) return this.DEFAULT_TTL.dashboard;
    if (key.startsWith('books:')) return this.DEFAULT_TTL.books;
    if (key.startsWith('users:')) return this.DEFAULT_TTL.users;
    if (key.startsWith('orders:')) return this.DEFAULT_TTL.orders;
    if (key.startsWith('categories:')) return this.DEFAULT_TTL.categories;
    if (key.startsWith('authors:')) return this.DEFAULT_TTL.authors;
    if (key.startsWith('publishers:')) return this.DEFAULT_TTL.publishers;
    
    return this.DEFAULT_TTL.dashboard; // Default fallback
  }

  /**
   * Generate cache key for paginated data
   */
  generateKey(prefix: string, params: any = {}): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          result[key] = params[key];
        }
        return result;
      }, {});

    const paramString = Object.keys(sortedParams).length > 0 
      ? ':' + JSON.stringify(sortedParams) 
      : '';
    
    return `${prefix}${paramString}`;
  }

  /**
   * Wrapper method for cached operations
   */
  async getOrSet<T>(
    key: string, 
    fetchFunction: () => Promise<T>, 
    customTtl?: number
  ): Promise<T> {
    // Try to get from cache
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const data = await fetchFunction();
    
    // Cache the result
    this.set(key, data, customTtl);
    
    return data;
  }
}