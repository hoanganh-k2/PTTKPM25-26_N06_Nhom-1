// src/dashboard/dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { BooksService } from '../books/books.service';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly usersService: UsersService,
    private readonly booksService: BooksService,
    private readonly ordersService: OrdersService,
  ) {}

  async getDashboardStats() {
    try {
      // Lấy thống kê tổng quan
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
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy thống kê dashboard: ${error.message}`);
    }
  }

  private async getBooksStats() {
    try {
      const books = await this.booksService.findAll({ limit: 9999 });
      const lowStockBooks = books.books?.filter(book => 
        book.stock !== undefined && book.stock < 10
      ) || [];

      return {
        total: books.total || 0,
        lowStockBooks: lowStockBooks.slice(0, 5), // Top 5 sách sắp hết hàng
      };
    } catch (error) {
      return { total: 0, lowStockBooks: [] };
    }
  }

  private async getUsersStats() {
    try {
      const users = await this.usersService.findAll({ limit: 9999 });
      
      // Tính tăng trưởng người dùng (giả lập - có thể cải thiện với dữ liệu thực)
      const thisMonth = new Date().getMonth();
      const thisYear = new Date().getFullYear();
      
      return {
        total: users.total || 0,
        growth: 12, // Giả lập 12% tăng trưởng
      };
    } catch (error) {
      return { total: 0, growth: 0 };
    }
  }

  private async getOrdersStats() {
    try {
      const orders = await this.ordersService.findAll({ limit: 9999 });
      
      // Tính tổng doanh thu
      const totalRevenue = orders.orders?.reduce((sum, order) => {
        return sum + (order.totalAmount || 0);
      }, 0) || 0;

      // Lấy đơn hàng gần đây
      const recentOrders = orders.orders?.slice(0, 5) || [];

      return {
        total: orders.total || 0,
        totalRevenue,
        recentOrders,
        growth: 8, // Giả lập 8% tăng trưởng
      };
    } catch (error) {
      return { 
        total: 0, 
        totalRevenue: 0, 
        recentOrders: [],
        growth: 0 
      };
    }
  }

  async getRevenueByPeriod(period: string = 'month') {
    try {
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
    } catch (error) {
      throw new Error(`Lỗi khi lấy dữ liệu doanh thu: ${error.message}`);
    }
  }
}