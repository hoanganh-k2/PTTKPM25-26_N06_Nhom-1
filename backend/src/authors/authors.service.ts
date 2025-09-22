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
      console.log('AuthorsService - findAll params:', params);
      
      let query = this.supabase.from('authors').select('*', { count: 'exact' });

      // Tìm kiếm theo tên và tiểu sử
      if (params.search && params.search.trim()) {
        const searchTerm = params.search.trim();
        query = query.or(`name.ilike.%${searchTerm}%,biography.ilike.%${searchTerm}%,nationality.ilike.%${searchTerm}%`);
      }

      // Lọc theo quốc tịch
      if (params.nationality) {
        query = query.eq('nationality', params.nationality);
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

      console.log('AuthorsService - executing query...');
      const { data, error, count } = await query;

      if (error) {
        console.error('AuthorsService - query error:', error);
        throw new BadRequestException(`Lỗi khi truy vấn tác giả: ${error.message}`);
      }

      console.log('AuthorsService - query result:', { count, dataLength: data?.length });

      const authors = data?.map(author => this.formatAuthor(author)) || [];

      return {
        authors,
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      console.error('AuthorsService - findAll error:', error);
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
      console.log('AuthorsService - create author:', createAuthorDto);

      // Validation cơ bản
      if (!createAuthorDto.name || createAuthorDto.name.trim() === '') {
        throw new BadRequestException('Tên tác giả không được để trống');
      }

      // Kiểm tra trùng tên
      const { data: existing } = await this.supabase
        .from('authors')
        .select('id')
        .eq('name', createAuthorDto.name.trim())
        .single();

      if (existing) {
        throw new BadRequestException('Tên tác giả đã tồn tại');
      }

      const authorData = {
        name: createAuthorDto.name.trim(),
        biography: createAuthorDto.biography?.trim() || null,
        birth_date: createAuthorDto.birthDate?.toISOString() || null,
        nationality: createAuthorDto.nationality?.trim() || null,
        photo: createAuthorDto.photo?.trim() || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('AuthorsService - inserting author data:', authorData);

      const { data, error } = await this.supabase
        .from('authors')
        .insert([authorData])
        .select()
        .single();

      if (error) {
        console.error('AuthorsService - create error:', error);
        throw new BadRequestException(`Lỗi khi tạo tác giả: ${error.message}`);
      }

      console.log('AuthorsService - author created successfully:', data);
      return this.formatAuthor(data);
    } catch (error) {
      console.error('AuthorsService - create error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Lỗi khi tạo tác giả: ${error.message}`);
    }
  }

  // Cập nhật tác giả
  async update(id: string, updateAuthorDto: UpdateAuthorDto): Promise<Author> {
    try {
      console.log('AuthorsService - update author:', { id, updateAuthorDto });

      // Kiểm tra tác giả tồn tại
      await this.findById(id);

      // Validation cơ bản
      if (updateAuthorDto.name !== undefined) {
        if (!updateAuthorDto.name || updateAuthorDto.name.trim() === '') {
          throw new BadRequestException('Tên tác giả không được để trống');
        }

        // Kiểm tra trùng tên (nếu có thay đổi tên)
        const { data: existing } = await this.supabase
          .from('authors')
          .select('id')
          .eq('name', updateAuthorDto.name.trim())
          .neq('id', id)
          .single();

        if (existing) {
          throw new BadRequestException('Tên tác giả đã tồn tại');
        }
      }

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (updateAuthorDto.name !== undefined) updateData.name = updateAuthorDto.name.trim();
      if (updateAuthorDto.biography !== undefined) updateData.biography = updateAuthorDto.biography?.trim() || null;
      if (updateAuthorDto.birthDate !== undefined) updateData.birth_date = updateAuthorDto.birthDate?.toISOString() || null;
      if (updateAuthorDto.nationality !== undefined) updateData.nationality = updateAuthorDto.nationality?.trim() || null;
      if (updateAuthorDto.photo !== undefined) updateData.photo = updateAuthorDto.photo?.trim() || null;

      console.log('AuthorsService - updating author data:', updateData);

      const { data, error } = await this.supabase
        .from('authors')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('AuthorsService - update error:', error);
        throw new BadRequestException(`Lỗi khi cập nhật tác giả: ${error.message}`);
      }

      console.log('AuthorsService - author updated successfully:', data);
      return this.formatAuthor(data);
    } catch (error) {
      console.error('AuthorsService - update error:', error);
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