// src/categories/categories.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../models/category.model';

@Injectable()
export class CategoriesService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_KEY || '',
    );
  }

  // Chuyển đổi từ snake_case (database) sang camelCase (API response)
  private formatCategory(category: any): Category {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      createdAt: new Date(category.created_at),
      updatedAt: new Date(category.updated_at),
    };
  }

  // Lấy tất cả thể loại
  async findAll(params: any = {}): Promise<{
    categories: Category[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      let query = this.supabase.from('categories').select('*', { count: 'exact' });

      // Tìm kiếm theo tên
      if (params.search) {
        query = query.ilike('name', `%${params.search}%`);
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
        throw new BadRequestException(`Lỗi khi truy vấn thể loại: ${error.message}`);
      }

      const categories = data?.map(category => this.formatCategory(category)) || [];

      return {
        categories,
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      throw new BadRequestException(`Lỗi khi lấy danh sách thể loại: ${error.message}`);
    }
  }

  // Lấy thể loại theo ID
  async findById(id: string): Promise<Category> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        throw new NotFoundException(`Không tìm thấy thể loại với ID: ${id}`);
      }

      return this.formatCategory(data);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Lỗi khi lấy thông tin thể loại: ${error.message}`);
    }
  }

  // Tạo thể loại mới
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    try {
      // Kiểm tra trùng tên
      const { data: existing } = await this.supabase
        .from('categories')
        .select('id')
        .eq('name', createCategoryDto.name)
        .single();

      if (existing) {
        throw new BadRequestException('Tên thể loại đã tồn tại');
      }

      const { data, error } = await this.supabase
        .from('categories')
        .insert([{
          name: createCategoryDto.name,
          description: createCategoryDto.description,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        throw new BadRequestException(`Lỗi khi tạo thể loại: ${error.message}`);
      }

      return this.formatCategory(data);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Lỗi khi tạo thể loại: ${error.message}`);
    }
  }

  // Cập nhật thể loại
  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    try {
      // Kiểm tra thể loại tồn tại
      await this.findById(id);

      // Kiểm tra trùng tên (nếu có thay đổi tên)
      if (updateCategoryDto.name) {
        const { data: existing } = await this.supabase
          .from('categories')
          .select('id')
          .eq('name', updateCategoryDto.name)
          .neq('id', id)
          .single();

        if (existing) {
          throw new BadRequestException('Tên thể loại đã tồn tại');
        }
      }

      const { data, error } = await this.supabase
        .from('categories')
        .update({
          ...updateCategoryDto,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new BadRequestException(`Lỗi khi cập nhật thể loại: ${error.message}`);
      }

      return this.formatCategory(data);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Lỗi khi cập nhật thể loại: ${error.message}`);
    }
  }

  // Xóa thể loại
  async remove(id: string): Promise<{ success: boolean; message: string }> {
    try {
      // Kiểm tra thể loại tồn tại
      await this.findById(id);

      // Kiểm tra xem có sách nào đang sử dụng thể loại này không
      const { data: books, error: booksError } = await this.supabase
        .from('book_categories')
        .select('book_id')
        .eq('category_id', id)
        .limit(1);

      if (booksError) {
        console.warn('Không thể kiểm tra sách sử dụng thể loại:', booksError);
      }

      if (books && books.length > 0) {
        throw new BadRequestException('Không thể xóa thể loại đang được sử dụng bởi sách');
      }

      const { error } = await this.supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        throw new BadRequestException(`Lỗi khi xóa thể loại: ${error.message}`);
      }

      return {
        success: true,
        message: 'Xóa thể loại thành công',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Lỗi khi xóa thể loại: ${error.message}`);
    }
  }
}