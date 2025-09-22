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

      // Tìm kiếm theo tên và mô tả
      if (params.search && params.search.trim()) {
        const searchTerm = params.search.trim();
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Lọc theo năm thành lập
      if (params.foundedYear) {
        query = query.eq('founded_year', params.foundedYear);
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
      // Validation cơ bản
      if (!createPublisherDto.name || createPublisherDto.name.trim() === '') {
        throw new BadRequestException('Tên nhà xuất bản không được để trống');
      }

      // Kiểm tra trùng tên
      const { data: existing } = await this.supabase
        .from('publishers')
        .select('id')
        .eq('name', createPublisherDto.name.trim())
        .single();

      if (existing) {
        throw new BadRequestException('Tên nhà xuất bản đã tồn tại');
      }

      const publisherData = {
        name: createPublisherDto.name.trim(),
        description: createPublisherDto.description?.trim() || null,
        founded_year: createPublisherDto.foundedYear || null,
        logo: createPublisherDto.logo?.trim() || null,
        website: createPublisherDto.website?.trim() || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await this.supabase
        .from('publishers')
        .insert([publisherData])
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

      // Validation cơ bản
      if (updatePublisherDto.name !== undefined) {
        if (!updatePublisherDto.name || updatePublisherDto.name.trim() === '') {
          throw new BadRequestException('Tên nhà xuất bản không được để trống');
        }

        // Kiểm tra trùng tên (nếu có thay đổi tên)
        const { data: existing } = await this.supabase
          .from('publishers')
          .select('id')
          .eq('name', updatePublisherDto.name.trim())
          .neq('id', id)
          .single();

        if (existing) {
          throw new BadRequestException('Tên nhà xuất bản đã tồn tại');
        }
      }

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (updatePublisherDto.name !== undefined) updateData.name = updatePublisherDto.name.trim();
      if (updatePublisherDto.description !== undefined) updateData.description = updatePublisherDto.description?.trim() || null;
      if (updatePublisherDto.foundedYear !== undefined) updateData.founded_year = updatePublisherDto.foundedYear || null;
      if (updatePublisherDto.logo !== undefined) updateData.logo = updatePublisherDto.logo?.trim() || null;
      if (updatePublisherDto.website !== undefined) updateData.website = updatePublisherDto.website?.trim() || null;
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