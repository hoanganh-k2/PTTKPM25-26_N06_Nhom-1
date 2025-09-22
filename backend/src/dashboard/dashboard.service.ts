// src/dashboard/dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { BooksService } from '../books/books.service';
import { OrdersService } from '../orders/orders.service';
import { AdminCacheService } from '../cache/admin-cache.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly usersService: UsersService,
    private readonly booksService: BooksService,
    private readonly ordersService: OrdersService,
    private readonly cacheService: AdminCacheService,
  ) {}

  async getDashboardStats() {
    try {
      return await this.cacheService.getOrSet(
        'dashboard:stats',
        async () => {
          // Lấy thống kê tổng quan với queries được tối ưu
          const [booksStats, usersStats, ordersStats] = await Promise.all([
            this.getBooksStats(),
            this.getUsersStats(),
            this.getOrdersStats(),
          ]);

          return {
            totalBooks: booksStats.total,
            totalUsers: usersStats.total,
            totalOrders: ordersStats.total,
            totalRevenue: ordersStats.totalRevenue,
            recentOrders: ordersStats.recentOrders,
            lowStockBooks: booksStats.lowStockBooks,
            userGrowth: usersStats.growth,
            orderGrowth: ordersStats.growth,
            newUsersThisMonth: usersStats.newThisMonth,
            ordersThisMonth: ordersStats.ordersThisMonth,
          };
        }
      );
    } catch (error) {
      throw new Error(`Lỗi khi lấy thống kê dashboard: ${error.message}`);
    }
  }

  private async getBooksStats() {
    try {
      return await this.booksService.getStats();
    } catch (error) {
      return { total: 0, lowStockBooks: [] };
    }
  }

  private async getUsersStats() {
    try {
      return await this.usersService.getStats();
    } catch (error) {
      return { total: 0, newThisMonth: 0, newLastMonth: 0, growth: 0 };
    }
  }

  private async getOrdersStats() {
    try {
      return await this.ordersService.getStats();
    } catch (error) {
      return { 
        total: 0, 
        totalRevenue: 0, 
        recentOrders: [],
        ordersThisMonth: 0,
        ordersLastMonth: 0,
        growth: 0 
      };
    }
  }

  async getRevenueByPeriod(period: string = 'month') {
    try {
      return await this.cacheService.getOrSet(
        `dashboard:revenue:${period}`,
        async () => {
          // Giả lập dữ liệu doanh thu theo thời gian
          // Trong thực tế, bạn sẽ query database với điều kiện thời gian
          const mockData = {
            week: [
              { date: '2024-01-01', revenue: 1500000 },
              { date: '2024-01-02', revenue: 2000000 },
              { date: '2024-01-03', revenue: 1800000 },
              { date: '2024-01-04', revenue: 2200000 },
              { date: '2024-01-05', revenue: 1900000 },
              { date: '2024-01-06', revenue: 2100000 },
              { date: '2024-01-07', revenue: 2300000 },
            ],
            month: [
              { date: '2024-01', revenue: 45000000 },
              { date: '2024-02', revenue: 52000000 },
              { date: '2024-03', revenue: 48000000 },
              { date: '2024-04', revenue: 55000000 },
              { date: '2024-05', revenue: 58000000 },
              { date: '2024-06', revenue: 62000000 },
            ],
            year: [
              { date: '2022', revenue: 580000000 },
              { date: '2023', revenue: 650000000 },
              { date: '2024', revenue: 720000000 },
            ]
          };

          return mockData[period] || mockData.month;
        },
        5 * 60 * 1000 // Cache for 5 minutes
      );
    } catch (error) {
      throw new Error(`Lỗi khi lấy dữ liệu doanh thu: ${error.message}`);
    }
  }
}