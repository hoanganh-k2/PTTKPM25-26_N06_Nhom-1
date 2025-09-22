// src/dashboard/dashboard.module.ts
import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { UsersModule } from '../users/users.module';
import { BooksModule } from '../books/books.module';
import { OrdersModule } from '../orders/orders.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [UsersModule, BooksModule, OrdersModule, CacheModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}