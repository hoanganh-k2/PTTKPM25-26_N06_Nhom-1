// src/cart/cart-cache.service.ts
import { Injectable } from '@nestjs/common';
import { CartResponseDto } from '../models/cart.model';

interface CacheEntry {
  data: CartResponseDto;
  timestamp: number;
}

@Injectable()
export class CartCacheService {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL = 2 * 60 * 1000; // 2 minutes TTL cho cart cache

  // Lấy cart từ cache
  get(userId: string): CartResponseDto | null {
    const entry = this.cache.get(userId);
    
    if (!entry) {
      return null;
    }

    // Kiểm tra TTL
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(userId);
      return null;
    }

    return entry.data;
  }

  // Lưu cart vào cache
  set(userId: string, cart: CartResponseDto): void {
    this.cache.set(userId, {
      data: cart,
      timestamp: Date.now()
    });
  }

  // Xóa cart khỏi cache
  delete(userId: string): void {
    this.cache.delete(userId);
  }

  // Xóa toàn bộ cache
  clear(): void {
    this.cache.clear();
  }

  // Lấy thống kê cache
  getStats(): { size: number; hitRate?: number } {
    return {
      size: this.cache.size
    };
  }
}