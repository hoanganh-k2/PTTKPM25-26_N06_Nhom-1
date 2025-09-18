// src/orders/orders.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto } from '../models/order.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { WarehouseManagerGuard } from '../auth/warehouse-manager.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Lấy danh sách tất cả đơn hàng (Admin và Warehouse Manager)
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin')
  async findAllAdmin(@Query() query) {
    return this.ordersService.findAll(query);
  }

  // Lấy danh sách đơn hàng của người dùng hiện tại
  @UseGuards(JwtAuthGuard)
  @Get('my-orders')
  async findMyOrders(@Request() req, @Query() query) {
    const userId = req.user.id;
    return this.ordersService.findAll({ ...query, userId });
  }

  // Lấy chi tiết đơn hàng theo ID (Admin, Warehouse Manager hoặc chủ đơn hàng)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const order = await this.ordersService.findById(id);
    
    // Kiểm tra quyền truy cập
    if (req.user.role !== 'admin' && req.user.role !== 'warehouse_manager' && 
        order.userId !== req.user.id) {
      throw new Error('Không có quyền truy cập đơn hàng này');
    }
    
    return order;
  }

  // Tạo đơn hàng mới
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    return this.ordersService.create(req.user.id, createOrderDto);
  }

  // Cập nhật trạng thái đơn hàng (Admin và Warehouse Manager)
  @UseGuards(JwtAuthGuard, WarehouseManagerGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  // Hủy đơn hàng (Người dùng chỉ có thể hủy đơn hàng của mình)
  @UseGuards(JwtAuthGuard)
  @Put(':id/cancel')
  async cancel(@Param('id') id: string, @Request() req) {
    const order = await this.ordersService.findById(id);
    
    // Kiểm tra quyền hủy đơn
    if (req.user.role !== 'admin' && order.userId !== req.user.id) {
      throw new Error('Không có quyền hủy đơn hàng này');
    }
    
    return this.ordersService.cancel(id);
  }

  // Lấy thống kê đơn hàng (Admin)
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/statistics')
  async getStatistics() {
    return this.ordersService.getStatistics();
  }
}
