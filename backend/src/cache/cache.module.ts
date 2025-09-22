// src/cache/cache.module.ts
import { Module } from '@nestjs/common';
import { AdminCacheService } from './admin-cache.service';

@Module({
  providers: [AdminCacheService],
  exports: [AdminCacheService],
})
export class CacheModule {}