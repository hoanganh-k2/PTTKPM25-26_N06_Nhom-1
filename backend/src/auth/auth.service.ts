// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  CreateUserDto,
  LoginDto,
  User,
  UserResponseDto,
} from '../models/user.model';
import * as bcrypt from 'bcrypt';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  private supabase;

  constructor(private jwtService: JwtService) {
    // Khởi tạo Supabase client
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_KEY || '',
    );
  }

  // Đăng ký người dùng mới
  async register(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Kiểm tra email đã tồn tại chưa
    const { data: existingUser } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', createUserDto.email)
      .single();

    if (existingUser) {
      throw new UnauthorizedException('Email đã được sử dụng');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Tạo user mới trong Supabase
    const { data, error } = await this.supabase
      .from('users')
      .insert([
        {
          full_name: createUserDto.fullName,
          email: createUserDto.email,
          password: hashedPassword,
          role: 'customer', // Mặc định là khách hàng
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Đăng ký thất bại: ${error.message}`);
    }

    // Convert from snake_case to camelCase
    return {
      id: data.id,
      fullName: data.full_name,
      email: data.email,
      isAdmin: data.role === 'admin',
      role: data.role || 'customer',
      createdAt: new Date(data.created_at),
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
      phone: data.phone,
    };
  }

  // Đăng nhập
  async login(
    loginDto: LoginDto,
  ): Promise<{ token: string; user: UserResponseDto }> {
    // Tìm user theo email
    const { data: user, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', loginDto.email)
      .single();

    if (error || !user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Tạo JWT token
    const payload = { 
      sub: user.id, 
      email: user.email, 
      isAdmin: user.role === 'admin',
      role: user.role || 'customer'
    };
    
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        isAdmin: user.role === 'admin',
        role: user.role || 'customer',
        createdAt: new Date(user.created_at),
        updatedAt: user.updated_at ? new Date(user.updated_at) : undefined,
        phone: user.phone,
      },
    };
  }

  // Lấy thông tin user từ token
  async getUserFromToken(token: string): Promise<UserResponseDto> {
    try {
      const payload = this.jwtService.verify(token);

      // Lấy thông tin user từ Supabase
      const { data: user, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', payload.sub)
        .single();

      if (error || !user) {
        throw new UnauthorizedException('User không tồn tại');
      }

      return {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        isAdmin: user.role === 'admin',
        role: user.role || 'customer',
        createdAt: new Date(user.created_at),
        updatedAt: user.updated_at ? new Date(user.updated_at) : undefined,
        phone: user.phone,
      };
    } catch (error) {
      throw new UnauthorizedException('Token không hợp lệ');
    }
  }

  // Cập nhật thông tin profile
  async updateProfile(
    userId: string,
    updateData: any,
  ): Promise<{ success: boolean; message: string; user: UserResponseDto }> {
    try {
      // Chuẩn bị dữ liệu cập nhật
      const updateFields: any = {
        updated_at: new Date().toISOString(),
      };

      // Cập nhật tên nếu có
      if (updateData.fullName !== undefined) {
        updateFields.full_name = updateData.fullName;
      }

      // Cập nhật email nếu có (kiểm tra trùng lặp)
      if (updateData.email !== undefined) {
        const { data: existingUser } = await this.supabase
          .from('users')
          .select('id')
          .eq('email', updateData.email)
          .neq('id', userId)
          .single();

        if (existingUser) {
          throw new Error('Email này đã được sử dụng bởi tài khoản khác');
        }

        updateFields.email = updateData.email;
      }

      // Cập nhật số điện thoại nếu có
      if (updateData.phone !== undefined) {
        updateFields.phone = updateData.phone || null;
      }

      // Cập nhật mật khẩu nếu có
      if (updateData.newPassword && updateData.currentPassword) {
        // Lấy thông tin user hiện tại để kiểm tra mật khẩu cũ
        const { data: currentUser } = await this.supabase
          .from('users')
          .select('password')
          .eq('id', userId)
          .single();

        if (!currentUser) {
          throw new Error('User không tồn tại');
        }

        // Kiểm tra mật khẩu hiện tại
        const isCurrentPasswordValid = await bcrypt.compare(
          updateData.currentPassword,
          currentUser.password,
        );

        if (!isCurrentPasswordValid) {
          throw new Error('Mật khẩu hiện tại không đúng');
        }

        // Hash mật khẩu mới
        updateFields.password = await bcrypt.hash(updateData.newPassword, 10);
      }

      // Cập nhật trong database
      const { data: updatedUser, error } = await this.supabase
        .from('users')
        .update(updateFields)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Cập nhật thất bại: ${error.message}`);
      }

      // Trả về thông tin user đã cập nhật
      return {
        success: true,
        message: 'Cập nhật thông tin thành công',
        user: {
          id: updatedUser.id,
          fullName: updatedUser.full_name,
          email: updatedUser.email,
          isAdmin: updatedUser.role === 'admin',
          role: updatedUser.role || 'customer',
          createdAt: new Date(updatedUser.created_at),
          updatedAt: updatedUser.updated_at ? new Date(updatedUser.updated_at) : undefined,
          phone: updatedUser.phone,
        },
      };
    } catch (error) {
      throw new Error(error.message || 'Có lỗi xảy ra khi cập nhật thông tin');
    }
  }
}
