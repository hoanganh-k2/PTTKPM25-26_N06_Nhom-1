// src/users/users.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';
import {
  CreateUserDto,
  UpdateUserDto,
  User,
  UserResponseDto,
  UserRole,
} from '../models/user.model';

@Injectable()
export class UsersService {
  private supabase;

  constructor() {
    // Khởi tạo Supabase client
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_KEY || '',
    );
  }

  // Chuyển đổi từ snake_case (database) sang camelCase (API response)
  private formatUser(user: any): UserResponseDto {
    return {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone || null,
      address: user.address || null,
      role: user.role || (user.is_admin ? 'admin' : 'customer'),
      isAdmin: user.is_admin,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at),
    };
  }

  // Lấy tất cả người dùng với phân trang và lọc
  async findAll(params: any = {}): Promise<{
    users: UserResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      console.log('UsersService - findAll params:', params);
      
      let query = this.supabase.from('users').select('*', { count: 'exact' });

      // Tìm kiếm theo từ khóa
      if (params.search && params.search.trim()) {
        const searchTerm = params.search.trim();
        query = query.or(
          `full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`,
        );
      }

      // Lọc theo role
      if (params.role && params.role !== 'all') {
        query = query.eq('role', params.role);
      }

      // Phân trang
      const page = parseInt(params.page) || 1;
      const limit = params.page ? (parseInt(params.limit) || 10) : 1000; // Nếu không có page thì lấy nhiều hơn
      const start = (page - 1) * limit;
      const end = start + limit - 1;

      if (params.page) {
        query = query.range(start, end);
      }

      // Sắp xếp
      if (params.sortBy) {
        const order = params.sortOrder === 'desc' ? 'desc' : 'asc';
        query = query.order(params.sortBy, { ascending: order === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      console.log('UsersService - executing query...');
      const { data, error, count } = await query;

      if (error) {
        console.error('UsersService - query error:', error);
        throw new BadRequestException(`Lỗi khi truy vấn người dùng: ${error.message}`);
      }

      console.log('UsersService - query result:', { count, dataLength: data?.length });

      // Chuyển đổi từ snake_case sang camelCase
      const users = data?.map(user => this.formatUser(user)) || [];

      return {
        users,
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      console.error('UsersService - findAll error:', error);
      throw new BadRequestException(`Lỗi khi lấy danh sách người dùng: ${error.message}`);
    }
  }

  // Lấy người dùng theo ID
  async findById(id: string): Promise<UserResponseDto> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        throw new NotFoundException(`Không tìm thấy người dùng với ID: ${id}`);
      }

      return this.formatUser(data);
    } catch (error) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID: ${id}`);
    }
  }

  // Tạo người dùng mới
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      console.log('UsersService - create user:', { ...createUserDto, password: '[HIDDEN]' });

      // Validation cơ bản
      if (!createUserDto.email || createUserDto.email.trim() === '') {
        throw new BadRequestException('Email không được để trống');
      }
      if (!createUserDto.fullName || createUserDto.fullName.trim() === '') {
        throw new BadRequestException('Họ tên không được để trống');
      }
      if (!createUserDto.password || createUserDto.password.length < 6) {
        throw new BadRequestException('Mật khẩu phải có ít nhất 6 ký tự');
      }

      // Kiểm tra email đã tồn tại chưa
      const { data: existingUser } = await this.supabase
        .from('users')
        .select('*')
        .eq('email', createUserDto.email.trim())
        .single();

      if (existingUser) {
        throw new BadRequestException('Email đã được sử dụng');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const userData = {
        full_name: createUserDto.fullName.trim(),
        email: createUserDto.email.trim().toLowerCase(),
        password: hashedPassword,
        is_admin: createUserDto.role === UserRole.ADMIN,
        role: createUserDto.role || UserRole.CUSTOMER,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('UsersService - inserting user data:', { ...userData, password: '[HIDDEN]' });

      // Tạo user mới trong Supabase
      const { data, error } = await this.supabase
        .from('users')
        .insert([userData])
        .select('*')
        .single();

      if (error) {
        console.error('UsersService - create error:', error);
        throw new BadRequestException(`Lỗi khi tạo người dùng: ${error.message}`);
      }

      console.log('UsersService - user created successfully:', { ...data, password: '[HIDDEN]' });
      return this.formatUser(data);
    } catch (error) {
      console.error('UsersService - create error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Lỗi khi tạo người dùng: ${error.message}`);
    }
  }

  // Cập nhật thông tin người dùng
  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    try {
      console.log('UsersService - update user:', { id, updateUserDto: { ...updateUserDto, password: updateUserDto.password ? '[HIDDEN]' : undefined } });

      // Kiểm tra người dùng tồn tại
      await this.findById(id);

      // Validation cơ bản
      if (updateUserDto.fullName !== undefined && (!updateUserDto.fullName || updateUserDto.fullName.trim() === '')) {
        throw new BadRequestException('Họ tên không được để trống');
      }
      // Chỉ validate password nếu nó được cung cấp và không rỗng
      if (updateUserDto.password !== undefined && updateUserDto.password !== '' && updateUserDto.password.length < 6) {
        throw new BadRequestException('Mật khẩu phải có ít nhất 6 ký tự');
      }

      // Chuẩn bị dữ liệu cập nhật
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (updateUserDto.fullName !== undefined) updateData.full_name = updateUserDto.fullName.trim();
      if (updateUserDto.phone !== undefined) updateData.phone = updateUserDto.phone?.trim() || null;
      if (updateUserDto.address !== undefined) updateData.address = updateUserDto.address?.trim() || null;

      // Nếu có email mới và khác email cũ, kiểm tra email đã tồn tại chưa
      if (updateUserDto.email) {
        const { data: currentUser } = await this.supabase
          .from('users')
          .select('email')
          .eq('id', id)
          .single();

        if (currentUser && currentUser.email !== updateUserDto.email.trim().toLowerCase()) {
          // Kiểm tra email mới đã tồn tại chưa
          const { data: existingUser } = await this.supabase
            .from('users')
            .select('*')
            .eq('email', updateUserDto.email.trim().toLowerCase())
            .single();

          if (existingUser) {
            throw new BadRequestException('Email đã được sử dụng');
          }

          updateData.email = updateUserDto.email.trim().toLowerCase();
        }
      }

      // Nếu có mật khẩu mới và không rỗng, hash và cập nhật
      if (updateUserDto.password && updateUserDto.password.trim() !== '') {
        updateData.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      // Cập nhật role nếu được cung cấp
      if (updateUserDto.role !== undefined) {
        updateData.role = updateUserDto.role;
        updateData.is_admin = updateUserDto.role === UserRole.ADMIN;
      }

      console.log('UsersService - updating user data:', { ...updateData, password: updateData.password ? '[HIDDEN]' : undefined });

      // Cập nhật trong Supabase
      const { data, error } = await this.supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error('UsersService - update error:', error);
        throw new BadRequestException(`Lỗi khi cập nhật người dùng: ${error.message}`);
      }

      console.log('UsersService - user updated successfully:', { ...data, password: '[HIDDEN]' });
      return this.formatUser(data);
    } catch (error) {
      console.error('UsersService - update error:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Lỗi khi cập nhật người dùng: ${error.message}`);
    }
  }

  // Xóa người dùng
  async remove(id: string): Promise<{ success: boolean; message: string }> {
    try {
      // Kiểm tra người dùng tồn tại
      await this.findById(id);

      // Xóa khỏi Supabase
      const { error } = await this.supabase.from('users').delete().eq('id', id);

      if (error) {
        throw new BadRequestException(`Lỗi khi xóa người dùng: ${error.message}`);
      }

      return { success: true, message: 'Xóa người dùng thành công' };
    } catch (error) {
      throw new BadRequestException(`Lỗi khi xóa người dùng: ${error.message}`);
    }
  }

  // Thay đổi trạng thái người dùng
  async changeStatus(
    id: string,
    status: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Kiểm tra người dùng tồn tại
      await this.findById(id);

      // Cập nhật trạng thái
      const { error } = await this.supabase
        .from('users')
        .update({ status })
        .eq('id', id);

      if (error) {
        throw new BadRequestException(
          `Lỗi khi cập nhật trạng thái người dùng: ${error.message}`,
        );
      }

      return {
        success: true,
        message: `Cập nhật trạng thái người dùng thành công: ${status}`,
      };
    } catch (error) {
      throw new BadRequestException(
        `Lỗi khi cập nhật trạng thái người dùng: ${error.message}`,
      );
    }
  }

  // Lấy thống kê người dùng
  async getUserStatistics() {
    try {
      const { data: users, error } = await this.supabase
        .from('users')
        .select('role, created_at');

      if (error) {
        throw new BadRequestException(`Lỗi khi lấy thống kê người dùng: ${error.message}`);
      }

      const totalUsers = users.length;
      const adminCount = users.filter(user => user.role === 'admin').length;
      const customerCount = users.filter(user => user.role === 'customer').length;
      
      // Thống kê theo tháng
      const now = new Date();
      const thisMonth = users.filter(user => {
        const createdAt = new Date(user.created_at);
        return createdAt.getMonth() === now.getMonth() && 
               createdAt.getFullYear() === now.getFullYear();
      }).length;

      const lastMonth = users.filter(user => {
        const createdAt = new Date(user.created_at);
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
        return createdAt.getMonth() === lastMonthDate.getMonth() && 
               createdAt.getFullYear() === lastMonthDate.getFullYear();
      }).length;

      const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

      return {
        totalUsers,
        adminCount,
        customerCount,
        newUsersThisMonth: thisMonth,
        newUsersLastMonth: lastMonth,
        growth: Math.round(growth * 100) / 100,
      };
    } catch (error) {
      throw new BadRequestException(`Lỗi khi lấy thống kê người dùng: ${error.message}`);
    }
  }

  // Kích hoạt người dùng
  async activateUser(id: string): Promise<{ success: boolean; message: string }> {
    try {
      await this.findById(id);

      const { error } = await this.supabase
        .from('users')
        .update({ status: 'active' })
        .eq('id', id);

      if (error) {
        throw new BadRequestException(`Lỗi khi kích hoạt người dùng: ${error.message}`);
      }

      return {
        success: true,
        message: 'Kích hoạt người dùng thành công',
      };
    } catch (error) {
      throw new BadRequestException(`Lỗi khi kích hoạt người dùng: ${error.message}`);
    }
  }

  // Đặt lại mật khẩu người dùng
  async resetUserPassword(id: string): Promise<{ success: boolean; message: string; newPassword: string }> {
    try {
      await this.findById(id);

      // Tạo mật khẩu mới ngẫu nhiên
      const newPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const { error } = await this.supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', id);

      if (error) {
        throw new BadRequestException(`Lỗi khi đặt lại mật khẩu: ${error.message}`);
      }

      return {
        success: true,
        message: 'Đặt lại mật khẩu thành công',
        newPassword,
      };
    } catch (error) {
      throw new BadRequestException(`Lỗi khi đặt lại mật khẩu: ${error.message}`);
    }
  }
}
