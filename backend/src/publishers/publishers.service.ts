// src/publishers/publishers.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { Publisher, CreatePublisherDto, UpdatePublisherDto } from '../models/publisher.model';

@Injectable()
export class PublishersService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_KEY || '',
    );
  }

  // Chuyển đổi từ snake_case (database) sang camelCase (API response)
  private formatPublisher(publisher: any): Publisher {
    return {
      id: publisher.id,
      name: publisher.name,
      description: publisher.description,
      foundedYear: publisher.founded_year,
      logo: publisher.logo,
      website: publisher.website,
      createdAt: new Date(publisher.created_at),
      updatedAt: new Date(publisher.updated_at),
    };
  }

  // Lấy tất cả nhà xuất bản
  async findAll(params: any = {}): Promise<{
    publishers: Publisher[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      let query = this.supabase.from('publishers').select('*', { count: 'exact' });

      // Tìm kiếm theo tên
      if (params.search) {
        query = query.ilike('name', `%${params.search}%`);
      }

      // Lọc theo năm thành lập
      if (params.foundedYear) {
        query = query.eq('founded_year', params.foundedYear);
      }

      // Phân trang
      const page = parseInt(params.page) || 1;
      const limit = parseInt(params.limit) || 10;
      const start = (page - 1) * limit;
      const end = start + limit - 1;

      if (params.page) {
        query = query.range(start, end);
      }

      // Sắp xếp
      query = query.order('name', { ascending: true });

      const { data, error, count } = await query;

      if (error) {
        throw new BadRequestException(`Lỗi khi truy vấn nhà xuất bản: ${error.message}`);
      }

      const publishers = data?.map(publisher => this.formatPublisher(publisher)) || [];

      return {
        publishers,
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      throw new BadRequestException(`Lỗi khi lấy danh sách nhà xuất bản: ${error.message}`);
    }
  }

  // Lấy nhà xuất bản theo ID
  async findById(id: string): Promise<Publisher> {
    try {
      const { data, error } = await this.supabase
        .from('publishers')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        throw new NotFoundException(`Không tìm thấy nhà xuất bản với ID: ${id}`);
      }

      return this.formatPublisher(data);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Lỗi khi lấy thông tin nhà xuất bản: ${error.message}`);
    }
  }

  // Tạo nhà xuất bản mới
  async create(createPublisherDto: CreatePublisherDto): Promise<Publisher> {
    try {
      // Kiểm tra trùng tên
      const { data: existing } = await this.supabase
        .from('publishers')
        .select('id')
        .eq('name', createPublisherDto.name)
        .single();

      if (existing) {
        throw new BadRequestException('Tên nhà xuất bản đã tồn tại');
      }

      const { data, error } = await this.supabase
        .from('publishers')
        .insert([{
          name: createPublisherDto.name,
          description: createPublisherDto.description,
          founded_year: createPublisherDto.foundedYear,
          logo: createPublisherDto.logo,
          website: createPublisherDto.website,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        throw new BadRequestException(`Lỗi khi tạo nhà xuất bản: ${error.message}`);
      }

      return this.formatPublisher(data);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Lỗi khi tạo nhà xuất bản: ${error.message}`);
    }
  }

  // Cập nhật nhà xuất bản
  async update(id: string, updatePublisherDto: UpdatePublisherDto): Promise<Publisher> {
    try {
      // Kiểm tra nhà xuất bản tồn tại
      await this.findById(id);

      // Kiểm tra trùng tên (nếu có thay đổi tên)
      if (updatePublisherDto.name) {
        const { data: existing } = await this.supabase
          .from('publishers')
          .select('id')
          .eq('name', updatePublisherDto.name)
          .neq('id', id)
          .single();

        if (existing) {
          throw new BadRequestException('Tên nhà xuất bản đã tồn tại');
        }
      }

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (updatePublisherDto.name !== undefined) updateData.name = updatePublisherDto.name;
      if (updatePublisherDto.description !== undefined) updateData.description = updatePublisherDto.description;
      if (updatePublisherDto.foundedYear !== undefined) updateData.founded_year = updatePublisherDto.foundedYear;
      if (updatePublisherDto.logo !== undefined) updateData.logo = updatePublisherDto.logo;
      if (updatePublisherDto.website !== undefined) updateData.website = updatePublisherDto.website;

      const { data, error } = await this.supabase
        .from('publishers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new BadRequestException(`Lỗi khi cập nhật nhà xuất bản: ${error.message}`);
      }

      return this.formatPublisher(data);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Lỗi khi cập nhật nhà xuất bản: ${error.message}`);
    }
  }

  // Xóa nhà xuất bản
  async remove(id: string): Promise<{ success: boolean; message: string }> {
    try {
      // Kiểm tra nhà xuất bản tồn tại
      await this.findById(id);

      // Kiểm tra xem có sách nào của nhà xuất bản này không
      const { data: books, error: booksError } = await this.supabase
        .from('books')
        .select('id')
        .eq('publisher_id', id)
        .limit(1);

      if (booksError) {
        console.warn('Không thể kiểm tra sách của nhà xuất bản:', booksError);
      }

      if (books && books.length > 0) {
        throw new BadRequestException('Không thể xóa nhà xuất bản đang có sách');
      }

      const { error } = await this.supabase
        .from('publishers')
        .delete()
        .eq('id', id);

      if (error) {
        throw new BadRequestException(`Lỗi khi xóa nhà xuất bản: ${error.message}`);
      }

      return {
        success: true,
        message: 'Xóa nhà xuất bản thành công',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Lỗi khi xóa nhà xuất bản: ${error.message}`);
    }
  }
}