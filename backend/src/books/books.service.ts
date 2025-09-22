// src/books/books.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

  // Chuyển đổi từ snake_case sang camelCase và lấy thông tin liên quan
  private async formatBook(book: any): Promise<Book> {
    const formattedBook: Book = {
      id: book.id,
      title: book.title,
      description: book.description,
      price: book.price,
      stock: book.stock,
      authorId: book.author_id,
      publisherId: book.publisher_id,
      categoryIds: book.category_ids || [],
      ISBN: book.isbn,
      publishYear: book.publish_year,
      language: book.language,
      pageCount: book.page_count,
      coverImage: book.cover_image,
      createdAt: new Date(book.created_at),
      updatedAt: new Date(book.updated_at),
    };

    // Thêm thông tin tác giả nếu có
    if (book.author_id) {
      try {
        const { data: author } = await this.supabase
          .from('authors')
          .select('id, name')
          .eq('id', book.author_id)
          .single();
        
        if (author) {
          (formattedBook as any).author = author;
        }
      } catch (error) {
        console.warn('Không thể lấy thông tin tác giả:', error);
      }
    }

    // Thêm thông tin publisher nếu có
    if (book.publisher_id) {
      try {
        const { data: publisher } = await this.supabase
          .from('publishers')
          .select('id, name')
          .eq('id', book.publisher_id)
          .single();
        
        if (publisher) {
          (formattedBook as any).publisher = publisher;
        }
      } catch (error) {
        console.warn('Không thể lấy thông tin nhà xuất bản:', error);
      }
    }

    // Thêm thông tin categories nếu có
    if (book.category_ids && book.category_ids.length > 0) {
      try {
        const { data: categories } = await this.supabase
          .from('categories')
          .select('id, name')
          .in('id', book.category_ids);
        
        if (categories) {
          (formattedBook as any).categories = categories;
        }
      } catch (error) {
        console.warn('Không thể lấy thông tin thể loại:', error);
      }
    }

    return formattedBook;
  }

  // Lấy tất cả sách với phân trang và lọc
  async findAll(params: any = {}): Promise<{ books: Book[]; total: number; page: number; totalPages: number }> {
    try {
      console.log('BooksService - findAll params:', params);
      
      let query = this.supabase.from('books').select('*', { count: 'exact' });

      // Tìm kiếm theo từ khóa
      if (params.search && params.search.trim()) {
        const searchTerm = params.search.trim();
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,isbn.ilike.%${searchTerm}%`);
      }

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

      console.log('BooksService - executing query...');
      const { data, error, count } = await query;

      if (error) {
        console.error('BooksService - query error:', error);
        throw new Error(`Không thể lấy danh sách sách: ${error.message}`);
      }

      console.log('BooksService - query result:', { count, dataLength: data?.length });

      // Chuyển đổi từ snake_case sang camelCase và thêm thông tin liên quan
      const books = await Promise.all(data?.map(book => this.formatBook(book)) || []);

      return { 
        books, 
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('BooksService - findAll error:', error);
      throw new Error(`Không thể lấy danh sách sách: ${error.message}`);
    }
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
    try {
      console.log('BooksService - create book:', createBookDto);

      // Lọc ra chỉ những field cần thiết, bỏ qua populated fields
      const cleanDto = {
        title: createBookDto.title,
        description: createBookDto.description,
        price: createBookDto.price,
        stock: createBookDto.stock,
        authorId: createBookDto.authorId,
        publisherId: createBookDto.publisherId,
        categoryIds: createBookDto.categoryIds,
        ISBN: createBookDto.ISBN,
        publishYear: createBookDto.publishYear,
        language: createBookDto.language,
        pageCount: createBookDto.pageCount,
        coverImage: createBookDto.coverImage,
      };

      // Validation đầy đủ
      if (!cleanDto.title || cleanDto.title.trim() === '') {
        throw new Error('Tiêu đề sách không được để trống');
      }
      if (!cleanDto.authorId) {
        throw new Error('Tác giả không được để trống');
      }
      if (!cleanDto.publisherId) {
        throw new Error('Nhà xuất bản không được để trống');
      }
      if (cleanDto.price === undefined || cleanDto.price < 0) {
        throw new Error('Giá sách phải lớn hơn hoặc bằng 0');
      }
      if (cleanDto.stock === undefined || cleanDto.stock < 0) {
        throw new Error('Số lượng phải lớn hơn hoặc bằng 0');
      }

      const bookData = {
        title: cleanDto.title.trim(),
        description: cleanDto.description?.trim() || null,
        price: Number(cleanDto.price) || 0,
        stock: Number(cleanDto.stock) || 0,
        author_id: cleanDto.authorId,
        publisher_id: cleanDto.publisherId,
        category_ids: cleanDto.categoryIds || [],
        isbn: cleanDto.ISBN?.trim() || null,
        publish_year: cleanDto.publishYear || null,
        language: cleanDto.language?.trim() || 'vi',
        page_count: cleanDto.pageCount || null,
        cover_image: cleanDto.coverImage?.trim() || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('BooksService - inserting book data:', bookData);

      const { data, error } = await this.supabase
        .from('books')
        .insert([bookData])
        .select()
        .single();

      if (error) {
        console.error('BooksService - create error:', error);
        throw new Error(`Không thể tạo sách: ${error.message}`);
      }

      console.log('BooksService - book created successfully:', data);
      return this.formatBook(data);
    } catch (error) {
      console.error('BooksService - create error:', error);
      throw error;
    }
  }

  // Cập nhật sách
  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    try {
      console.log('BooksService - update book:', { id, updateBookDto });

      // Kiểm tra sách có tồn tại không
      const existingBook = await this.findById(id);

      // Lọc ra chỉ những field cần thiết, bỏ qua populated fields
      const cleanDto = {
        title: updateBookDto.title,
        description: updateBookDto.description,
        price: updateBookDto.price,
        stock: updateBookDto.stock,
        authorId: updateBookDto.authorId,
        publisherId: updateBookDto.publisherId,
        categoryIds: updateBookDto.categoryIds,
        ISBN: updateBookDto.ISBN,
        publishYear: updateBookDto.publishYear,
        language: updateBookDto.language,
        pageCount: updateBookDto.pageCount,
        coverImage: updateBookDto.coverImage,
      };

      // Validation
      if (cleanDto.title !== undefined && (!cleanDto.title || cleanDto.title.trim() === '')) {
        throw new Error('Tiêu đề sách không được để trống');
      }
      if (cleanDto.price !== undefined && cleanDto.price < 0) {
        throw new Error('Giá sách phải lớn hơn hoặc bằng 0');
      }
      if (cleanDto.stock !== undefined && cleanDto.stock < 0) {
        throw new Error('Số lượng phải lớn hơn hoặc bằng 0');
      }

      // Chuẩn bị dữ liệu cập nhật
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (cleanDto.title !== undefined) updateData.title = cleanDto.title.trim();
      if (cleanDto.description !== undefined) updateData.description = cleanDto.description?.trim() || '';
      if (cleanDto.price !== undefined) updateData.price = cleanDto.price;
      if (cleanDto.stock !== undefined) updateData.stock = cleanDto.stock;
      if (cleanDto.authorId !== undefined) updateData.author_id = cleanDto.authorId;
      if (cleanDto.publisherId !== undefined) updateData.publisher_id = cleanDto.publisherId;
      if (cleanDto.categoryIds !== undefined) updateData.category_ids = cleanDto.categoryIds;
      if (cleanDto.ISBN !== undefined) updateData.isbn = cleanDto.ISBN?.trim() || null;
      if (cleanDto.publishYear !== undefined) updateData.publish_year = cleanDto.publishYear;
      if (cleanDto.language !== undefined) updateData.language = cleanDto.language?.trim() || 'vi';
      if (cleanDto.pageCount !== undefined) updateData.page_count = cleanDto.pageCount;
      if (cleanDto.coverImage !== undefined) updateData.cover_image = cleanDto.coverImage?.trim() || null;

      console.log('BooksService - updating book data:', updateData);

      const { data, error } = await this.supabase
        .from('books')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('BooksService - update error:', error);
        throw new Error(`Không thể cập nhật sách: ${error.message}`);
      }

      console.log('BooksService - book updated successfully:', data);
      return this.formatBook(data);
    } catch (error) {
      console.error('BooksService - update error:', error);
      throw error;
    }
  }

  // Xóa sách
  async remove(id: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('BooksService - remove book:', id);

      // Kiểm tra sách có tồn tại không
      await this.findById(id);

      // Kiểm tra xem sách có trong order_items không
      const { data: orderItems, error: orderError } = await this.supabase
        .from('order_items')
        .select('id')
        .eq('book_id', id)
        .limit(1);

      if (orderError) {
        console.error('BooksService - check order items error:', orderError);
        throw new BadRequestException('Lỗi khi kiểm tra đơn hàng liên quan');
      }

      if (orderItems && orderItems.length > 0) {
        throw new BadRequestException('Không thể xóa sách này vì đã có đơn hàng. Bạn có thể set stock = 0 để ẩn sách thay vì xóa.');
      }

      // Nếu không có order_items, tiến hành xóa
      const { error } = await this.supabase.from('books').delete().eq('id', id);

      if (error) {
        console.error('BooksService - remove error:', error);
        throw new Error(`Không thể xóa sách: ${error.message}`);
      }

      console.log('BooksService - book removed successfully');
      return {
        success: true,
        message: 'Xóa sách thành công',
      };
    } catch (error) {
      console.error('BooksService - remove error:', error);
      throw error;
    }
  }

  // Ẩn sách (soft delete) - set stock = 0 thay vì xóa
  async hideBook(id: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('BooksService - hide book:', id);

      // Kiểm tra sách có tồn tại không
      await this.findById(id);

      const { error } = await this.supabase
        .from('books')
        .update({ 
          stock: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('BooksService - hide book error:', error);
        throw new Error(`Không thể ẩn sách: ${error.message}`);
      }

      console.log('BooksService - book hidden successfully');
      return {
        success: true,
        message: 'Đã ẩn sách thành công (set stock = 0)',
      };
    } catch (error) {
      console.error('BooksService - hide book error:', error);
      throw error;
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

    return Promise.all(data.map((book) => this.formatBook(book)));
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

    return Promise.all(data.map((book) => this.formatBook(book)));
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
    const books = await Promise.all(data.map((book) => this.formatBook(book)));

    return { books, total: count || 0 };
  }
}
