// src/authors/authors.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { Author, CreateAuthorDto, UpdateAuthorDto } from '../models/author.model';

@Injectable()
export class AuthorsService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_KEY || '',
    );
  }

  // Chuyển đổi từ snake_case (database) sang camelCase (API response)
  private formatAuthor(author: any): Author {
    return {
      id: author.id,
      name: author.name,
      biography: author.biography,
      birthDate: author.birth_date ? new Date(author.birth_date) : undefined,
      nationality: author.nationality,
      photo: author.photo,
      createdAt: new Date(author.created_at),
      updatedAt: new Date(author.updated_at),
    };
  }

  // Lấy tất cả tác giả
  async findAll(params: any = {}): Promise<{
    authors: Author[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      let query = this.supabase.from('authors').select('*', { count: 'exact' });

      // Tìm kiếm theo tên
      if (params.search) {
        query = query.ilike('name', `%${params.search}%`);
      }

      // Lọc theo quốc tịch
      if (params.nationality) {
        query = query.eq('nationality', params.nationality);
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
        throw new BadRequestException(`Lỗi khi truy vấn tác giả: ${error.message}`);
      }

      const authors = data?.map(author => this.formatAuthor(author)) || [];

      return {
        authors,
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      throw new BadRequestException(`Lỗi khi lấy danh sách tác giả: ${error.message}`);
    }
  }

  // Lấy tác giả theo ID
  async findById(id: string): Promise<Author> {
    try {
      const { data, error } = await this.supabase
        .from('authors')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        throw new NotFoundException(`Không tìm thấy tác giả với ID: ${id}`);
      }

      return this.formatAuthor(data);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Lỗi khi lấy thông tin tác giả: ${error.message}`);
    }
  }

  // Tạo tác giả mới
  async create(createAuthorDto: CreateAuthorDto): Promise<Author> {
    try {
      // Kiểm tra trùng tên
      const { data: existing } = await this.supabase
        .from('authors')
        .select('id')
        .eq('name', createAuthorDto.name)
        .single();

      if (existing) {
        throw new BadRequestException('Tên tác giả đã tồn tại');
      }

      const { data, error } = await this.supabase
        .from('authors')
        .insert([{
          name: createAuthorDto.name,
          biography: createAuthorDto.biography,
          birth_date: createAuthorDto.birthDate?.toISOString(),
          nationality: createAuthorDto.nationality,
          photo: createAuthorDto.photo,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        throw new BadRequestException(`Lỗi khi tạo tác giả: ${error.message}`);
      }

      return this.formatAuthor(data);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Lỗi khi tạo tác giả: ${error.message}`);
    }
  }

  // Cập nhật tác giả
  async update(id: string, updateAuthorDto: UpdateAuthorDto): Promise<Author> {
    try {
      // Kiểm tra tác giả tồn tại
      await this.findById(id);

      // Kiểm tra trùng tên (nếu có thay đổi tên)
      if (updateAuthorDto.name) {
        const { data: existing } = await this.supabase
          .from('authors')
          .select('id')
          .eq('name', updateAuthorDto.name)
          .neq('id', id)
          .single();

        if (existing) {
          throw new BadRequestException('Tên tác giả đã tồn tại');
        }
      }

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (updateAuthorDto.name !== undefined) updateData.name = updateAuthorDto.name;
      if (updateAuthorDto.biography !== undefined) updateData.biography = updateAuthorDto.biography;
      if (updateAuthorDto.birthDate !== undefined) updateData.birth_date = updateAuthorDto.birthDate?.toISOString();
      if (updateAuthorDto.nationality !== undefined) updateData.nationality = updateAuthorDto.nationality;
      if (updateAuthorDto.photo !== undefined) updateData.photo = updateAuthorDto.photo;

      const { data, error } = await this.supabase
        .from('authors')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new BadRequestException(`Lỗi khi cập nhật tác giả: ${error.message}`);
      }

      return this.formatAuthor(data);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Lỗi khi cập nhật tác giả: ${error.message}`);
    }
  }

  // Xóa tác giả
  async remove(id: string): Promise<{ success: boolean; message: string }> {
    try {
      // Kiểm tra tác giả tồn tại
      await this.findById(id);

      // Kiểm tra xem có sách nào của tác giả này không
      const { data: books, error: booksError } = await this.supabase
        .from('books')
        .select('id')
        .eq('author_id', id)
        .limit(1);

      if (booksError) {
        console.warn('Không thể kiểm tra sách của tác giả:', booksError);
      }

      if (books && books.length > 0) {
        throw new BadRequestException('Không thể xóa tác giả đang có sách');
      }

      const { error } = await this.supabase
        .from('authors')
        .delete()
        .eq('id', id);

      if (error) {
        throw new BadRequestException(`Lỗi khi xóa tác giả: ${error.message}`);
      }

      return {
        success: true,
        message: 'Xóa tác giả thành công',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Lỗi khi xóa tác giả: ${error.message}`);
    }
  }
}