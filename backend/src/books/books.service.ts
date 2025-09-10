// src/books/books.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookDto, UpdateBookDto, Book } from '../models/book.model';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class BooksService {
  private supabase;

  constructor() {
    // Khởi tạo Supabase client
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_KEY || '',
    );
  }

  // Chuyển đổi từ snake_case sang camelCase
  private formatBook(book: any): Book {
    return {
      id: book.id,
      title: book.title,
      description: book.description,
      price: book.price,
      stock: book.stock,
      authorId: book.author_id,
      publisherId: book.publisher_id,
      categoryIds: book.category_ids,
      ISBN: book.isbn,
      publishYear: book.publish_year,
      language: book.language,
      pageCount: book.page_count,
      coverImage: book.cover_image,
      createdAt: new Date(book.created_at),
      updatedAt: new Date(book.updated_at),
    };
  }

  // Lấy tất cả sách với phân trang và lọc
  async findAll(params: any = {}): Promise<{ books: Book[]; total: number }> {
    let query = this.supabase.from('books').select('*', { count: 'exact' });

    // Lọc theo category
    if (params.categoryId) {
      query = query.contains('category_ids', [params.categoryId]);
    }

    // Lọc theo author
    if (params.authorId) {
      query = query.eq('author_id', params.authorId);
    }

    // Lọc theo publisher
    if (params.publisherId) {
      query = query.eq('publisher_id', params.publisherId);
    }

    // Phân trang
    const page = params.page ? parseInt(params.page) : 1;
    const limit = params.limit ? parseInt(params.limit) : 10;
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

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Không thể lấy danh sách sách: ${error.message}`);
    }

    // Chuyển đổi từ snake_case sang camelCase
    const books = data.map((book) => this.formatBook(book));

    return { books, total: count || 0 };
  }

  // Lấy sách theo ID
  async findById(id: string): Promise<Book> {
    const { data, error } = await this.supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Không tìm thấy sách với ID: ${id}`);
    }

    return this.formatBook(data);
  }

  // Tạo sách mới
  async create(createBookDto: CreateBookDto): Promise<Book> {
    const { data, error } = await this.supabase
      .from('books')
      .insert([
        {
          title: createBookDto.title,
          description: createBookDto.description,
          price: createBookDto.price,
          stock: createBookDto.stock,
          author_id: createBookDto.authorId,
          publisher_id: createBookDto.publisherId,
          category_ids: createBookDto.categoryIds,
          isbn: createBookDto.ISBN,
          publish_year: createBookDto.publishYear,
          language: createBookDto.language,
          page_count: createBookDto.pageCount,
          cover_image: createBookDto.coverImage,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Không thể tạo sách: ${error.message}`);
    }

    return this.formatBook(data);
  }

  // Cập nhật sách
  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    // Kiểm tra sách có tồn tại không
    const book = await this.findById(id);

    // Chuẩn bị dữ liệu cập nhật
    const updateData = {};

    if (updateBookDto.title !== undefined)
      updateData['title'] = updateBookDto.title;
    if (updateBookDto.description !== undefined)
      updateData['description'] = updateBookDto.description;
    if (updateBookDto.price !== undefined)
      updateData['price'] = updateBookDto.price;
    if (updateBookDto.stock !== undefined)
      updateData['stock'] = updateBookDto.stock;
    if (updateBookDto.authorId !== undefined)
      updateData['author_id'] = updateBookDto.authorId;
    if (updateBookDto.publisherId !== undefined)
      updateData['publisher_id'] = updateBookDto.publisherId;
    if (updateBookDto.categoryIds !== undefined)
      updateData['category_ids'] = updateBookDto.categoryIds;
    if (updateBookDto.ISBN !== undefined)
      updateData['isbn'] = updateBookDto.ISBN;
    if (updateBookDto.publishYear !== undefined)
      updateData['publish_year'] = updateBookDto.publishYear;
    if (updateBookDto.language !== undefined)
      updateData['language'] = updateBookDto.language;
    if (updateBookDto.pageCount !== undefined)
      updateData['page_count'] = updateBookDto.pageCount;
    if (updateBookDto.coverImage !== undefined)
      updateData['cover_image'] = updateBookDto.coverImage;

    const { data, error } = await this.supabase
      .from('books')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Không thể cập nhật sách: ${error.message}`);
    }

    return this.formatBook(data);
  }

  // Xóa sách
  async remove(id: string): Promise<void> {
    // Kiểm tra sách có tồn tại không
    await this.findById(id);

    const { error } = await this.supabase.from('books').delete().eq('id', id);

    if (error) {
      throw new Error(`Không thể xóa sách: ${error.message}`);
    }
  }

  // Lấy sách mới nhất
  async getLatestBooks(limit: number = 8): Promise<Book[]> {
    const { data, error } = await this.supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Không thể lấy sách mới nhất: ${error.message}`);
    }

    return data.map((book) => this.formatBook(book));
  }

  // Lấy sách bán chạy (giả lập bằng sách có stock thấp nhất)
  async getBestsellerBooks(limit: number = 8): Promise<Book[]> {
    const { data, error } = await this.supabase
      .from('books')
      .select('*')
      .order('stock', { ascending: true })
      .limit(limit);

    if (error) {
      throw new Error(`Không thể lấy sách bán chạy: ${error.message}`);
    }

    return data.map((book) => this.formatBook(book));
  }

  // Tìm kiếm sách
  async searchBooks(
    query: string,
    params: any = {},
  ): Promise<{ books: Book[]; total: number }> {
    // Tìm kiếm bằng cách sử dụng toán tử ilike (case insensitive like) của PostgreSQL
    let supabaseQuery = this.supabase
      .from('books')
      .select('*', { count: 'exact' })
      .or(`title.ilike.%${query}%, description.ilike.%${query}%`);

    // Thêm phân trang
    const page = params.page ? parseInt(params.page) : 1;
    const limit = params.limit ? parseInt(params.limit) : 10;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    supabaseQuery = supabaseQuery.range(start, end);

    const { data, error, count } = await supabaseQuery;

    if (error) {
      throw new Error(`Tìm kiếm thất bại: ${error.message}`);
    }

    // Chuyển đổi từ snake_case sang camelCase
    const books = data.map((book) => this.formatBook(book));

    return { books, total: count || 0 };
  }
}
