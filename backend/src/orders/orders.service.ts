// src/orders/orders.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import {
  CreateOrderDto,
  Order,
  OrderItemResponse,
  OrderResponseDto,
  OrderStatus,
  PaymentStatus,
  UpdateOrderDto,
} from '../models/order.model';

@Injectable()
export class OrdersService {
  private supabase;

  constructor() {
    // Khởi tạo Supabase client
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_KEY || '',
    );
  }

  // Format đối tượng order từ DB
  private formatOrder(order: any): OrderResponseDto {
    return {
      id: order.id,
      userId: order.user_id,
      status: order.status,
      totalAmount: order.total_amount,
      shippingAddress: order.shipping_address,
      billingAddress: order.billing_address,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      items: [], // Sẽ được điền sau
      createdAt: new Date(order.created_at),
      updatedAt: new Date(order.updated_at),
    };
  }

  // Lấy danh sách đơn hàng với phân trang và lọc
  async findAll(params: any = {}): Promise<{
    orders: OrderResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      let query = this.supabase.from('orders').select('*', { count: 'exact' });

      // Lọc theo user_id
      if (params.userId) {
        query = query.eq('user_id', params.userId);
      }

      // Lọc theo status
      if (params.status) {
        query = query.eq('status', params.status);
      }

      // Lọc theo khoảng thời gian
      if (params.startDate && params.endDate) {
        query = query
          .gte('created_at', params.startDate)
          .lte('created_at', params.endDate);
      }

      // Phân trang
      const page = parseInt(params.page) || 1;
      const limit = parseInt(params.limit) || 10;
      const start = (page - 1) * limit;
      const end = start + limit - 1;

      query = query.range(start, end);

      // Sắp xếp
      if (params.sortBy) {
        const order = params.sortOrder === 'desc' ? 'desc' : 'asc';
        query = query.order(params.sortBy, { ascending: order === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data: orders, error, count } = await query;

      if (error) {
        throw new BadRequestException(`Lỗi khi truy vấn đơn hàng: ${error.message}`);
      }

      // Lấy chi tiết sản phẩm cho mỗi đơn hàng
      const formattedOrders: OrderResponseDto[] = [];
      
      for (const order of orders) {
        const formattedOrder = this.formatOrder(order);
        
        // Lấy chi tiết sản phẩm
        const { data: items, error: itemsError } = await this.supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);
        
        if (!itemsError) {
          formattedOrder.items = items.map(item => ({
            bookId: item.book_id,
            bookTitle: item.book_title,
            quantity: item.quantity,
            price: item.price
          } as OrderItemResponse));
        }
        
        formattedOrders.push(formattedOrder);
      }

      return {
        orders: formattedOrders,
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      throw new BadRequestException(`Lỗi khi lấy danh sách đơn hàng: ${error.message}`);
    }
  }

  // Lấy chi tiết đơn hàng theo ID
  async findById(id: string): Promise<OrderResponseDto> {
    try {
      // Lấy thông tin đơn hàng
      const { data: order, error } = await this.supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !order) {
        throw new NotFoundException(`Không tìm thấy đơn hàng với ID: ${id}`);
      }

      const formattedOrder = this.formatOrder(order);

      // Lấy chi tiết sản phẩm trong đơn hàng
      const { data: items, error: itemsError } = await this.supabase
        .from('order_items')
        .select('*')
        .eq('order_id', id);

      if (!itemsError) {
        formattedOrder.items = items.map(item => ({
          bookId: item.book_id,
          bookTitle: item.book_title,
          quantity: item.quantity,
          price: item.price
        } as OrderItemResponse));
      }

      return formattedOrder;
    } catch (error) {
      throw new BadRequestException(`Lỗi khi lấy thông tin đơn hàng: ${error.message}`);
    }
  }

  // Tạo đơn hàng mới
  async create(userId: string, createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    // Khởi tạo transaction trong Supabase
    const client = this.supabase;
    
    try {
      // 1. Lấy thông tin sách và tính tổng tiền
      let totalAmount = 0;
      const orderItems: Array<{
        book_id: string;
        book_title: string;
        quantity: number;
        price: number;
      }> = [];
      
      for (const item of createOrderDto.items) {
        const { data: book, error } = await client
          .from('books')
          .select('title, price, stock')
          .eq('id', item.bookId)
          .single();
          
        if (error || !book) {
          throw new BadRequestException(`Không tìm thấy sách với ID: ${item.bookId}`);
        }
        
        if (book.stock < item.quantity) {
          throw new BadRequestException(`Sách "${book.title}" chỉ còn ${book.stock} quyển`);
        }
        
        const itemPrice = book.price;
        totalAmount += itemPrice * item.quantity;
        
        orderItems.push({
          book_id: item.bookId,
          book_title: book.title,
          quantity: item.quantity,
          price: itemPrice
        });
        
        // Cập nhật số lượng tồn kho
        const { error: updateError } = await client
          .from('books')
          .update({ stock: book.stock - item.quantity })
          .eq('id', item.bookId);
          
        if (updateError) {
          throw new BadRequestException(`Lỗi khi cập nhật số lượng sách: ${updateError.message}`);
        }
      }
      
      // 2. Tạo đơn hàng
      const { data: order, error: orderError } = await client
        .from('orders')
        .insert([
          {
            user_id: userId,
            status: OrderStatus.PENDING,
            total_amount: totalAmount,
            shipping_address: createOrderDto.shippingAddress,
            billing_address: createOrderDto.billingAddress || createOrderDto.shippingAddress,
            payment_method: createOrderDto.paymentMethod,
            payment_status: PaymentStatus.PENDING
          }
        ])
        .select('*')
        .single();
        
      if (orderError) {
        throw new BadRequestException(`Lỗi khi tạo đơn hàng: ${orderError.message}`);
      }
      
      // 3. Tạo chi tiết đơn hàng
      const orderItemsWithOrderId = orderItems.map(item => ({
        book_id: item.book_id,
        book_title: item.book_title,
        quantity: item.quantity,
        price: item.price,
        order_id: order.id
      }));
      
      const { error: itemsError } = await client
        .from('order_items')
        .insert(orderItemsWithOrderId);
        
      if (itemsError) {
        throw new BadRequestException(`Lỗi khi thêm chi tiết đơn hàng: ${itemsError.message}`);
      }
      
      // Trả về đơn hàng đã tạo
      return this.findById(order.id);
    } catch (error) {
      throw new BadRequestException(`Lỗi khi tạo đơn hàng: ${error.message}`);
    }
  }

  // Cập nhật trạng thái đơn hàng
  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<OrderResponseDto> {
    try {
      // Kiểm tra đơn hàng tồn tại
      await this.findById(id);

      const updateData: any = {};
      
      // Cập nhật trạng thái đơn hàng
      if (updateOrderDto.status) {
        updateData.status = updateOrderDto.status;
      }
      
      // Cập nhật trạng thái thanh toán
      if (updateOrderDto.paymentStatus) {
        updateData.payment_status = updateOrderDto.paymentStatus;
      }
      
      // Nếu không có gì để cập nhật
      if (Object.keys(updateData).length === 0) {
        return this.findById(id);
      }
      
      // Cập nhật đơn hàng
      const { error } = await this.supabase
        .from('orders')
        .update(updateData)
        .eq('id', id);
        
      if (error) {
        throw new BadRequestException(`Lỗi khi cập nhật đơn hàng: ${error.message}`);
      }
      
      // Trả về đơn hàng đã cập nhật
      return this.findById(id);
    } catch (error) {
      throw new BadRequestException(`Lỗi khi cập nhật đơn hàng: ${error.message}`);
    }
  }

  // Hủy đơn hàng
  async cancel(id: string): Promise<OrderResponseDto> {
    try {
      // Lấy thông tin đơn hàng
      const order = await this.findById(id);
      
      // Kiểm tra trạng thái đơn hàng
      if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.PROCESSING) {
        throw new BadRequestException(`Không thể hủy đơn hàng với trạng thái: ${order.status}`);
      }
      
      // Cập nhật trạng thái đơn hàng
      const { error } = await this.supabase
        .from('orders')
        .update({
          status: OrderStatus.CANCELLED
        })
        .eq('id', id);
        
      if (error) {
        throw new BadRequestException(`Lỗi khi hủy đơn hàng: ${error.message}`);
      }
      
      // Khôi phục số lượng tồn kho
      for (const item of order.items) {
        const { error: updateError } = await this.supabase
          .from('books')
          .rpc('increment_stock', {
            book_id: item.bookId,
            quantity: item.quantity
          });
          
        if (updateError) {
          console.error(`Lỗi khi khôi phục tồn kho sách ${item.bookId}: ${updateError.message}`);
        }
      }
      
      // Trả về đơn hàng đã cập nhật
      return this.findById(id);
    } catch (error) {
      throw new BadRequestException(`Lỗi khi hủy đơn hàng: ${error.message}`);
    }
  }

  // Lấy thống kê đơn hàng
  async getStatistics(): Promise<any> {
    try {
      const stats: {
        total: number;
        pending: number;
        processing: number;
        shipped: number;
        delivered: number;
        cancelled: number;
        totalSales: number;
        recentOrders: OrderResponseDto[];
      } = {
        total: 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        totalSales: 0,
        recentOrders: []
      };
      
      // Đếm số đơn hàng theo trạng thái
      const { data: countData, error: countError } = await this.supabase
        .from('orders')
        .select('status, total_amount');
        
      if (countError) {
        throw new BadRequestException(`Lỗi khi lấy thống kê đơn hàng: ${countError.message}`);
      }
      
      if (countData) {
        stats.total = countData.length;
        
        for (const order of countData) {
          if (order.status === OrderStatus.PENDING) stats.pending++;
          if (order.status === OrderStatus.PROCESSING) stats.processing++;
          if (order.status === OrderStatus.SHIPPED) stats.shipped++;
          if (order.status === OrderStatus.DELIVERED) {
            stats.delivered++;
            stats.totalSales += order.total_amount;
          }
          if (order.status === OrderStatus.CANCELLED) stats.cancelled++;
        }
      }
      
      // Lấy các đơn hàng gần đây
      const { data: recentData, error: recentError } = await this.supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (!recentError && recentData) {
        stats.recentOrders = recentData.map(order => this.formatOrder(order)) as OrderResponseDto[];
        
        // Lấy chi tiết sản phẩm cho mỗi đơn hàng
        for (const order of stats.recentOrders) {
          const { data: items } = await this.supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);
            
          if (items) {
            order.items = items.map(item => ({
              bookId: item.book_id,
              bookTitle: item.book_title,
              quantity: item.quantity,
              price: item.price
            } as OrderItemResponse));
          } else {
            order.items = [];
          }
        }
      }
      
      return stats;
    } catch (error) {
      throw new BadRequestException(`Lỗi khi lấy thống kê đơn hàng: ${error.message}`);
    }
  }
}
