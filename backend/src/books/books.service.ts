// src/books/books.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateBookDto, UpdateBookDto, Book } from '../models/book.model';
import { createClient } from '@supabase/supabase-js';
import { AdminCacheService } from '../cache/admin-cache.service';

@Injectable()
export class BooksService {
  private supabase;
  
  // Simple in-memory cache
  private cache = {
    authors: new Map(),
    publishers: new Map(),
    categories: new Map(),
    lastUpdated: {
      authors: 0,
      publishers: 0,
      categories: 0
    }
  };
  
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 phút

  constructor(private readonly cacheService: AdminCacheService) {
    // Khởi tạo Supabase client
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_KEY || '',
    );
  }

  // Cache helper methods
  private async getCachedCategories(categoryIds: string[]): Promise<Map<string, any>> {
    const now = Date.now();
    const isExpired = now - this.cache.lastUpdated.categories > this.CACHE_TTL;
    
    if (isExpired || this.cache.categories.size === 0) {
      // Refresh cache
      const { data: categories } = await this.supabase
        .from('categories')
        .select('id, name');
      
      this.cache.categories.clear();
      categories?.forEach(cat => this.cache.categories.set(cat.id, cat));
      this.cache.lastUpdated.categories = now;
    }
    
    // Return requested categories
    const result = new Map();
    categoryIds.forEach(id => {
      const category = this.cache.categories.get(id);
      if (category) {
        result.set(id, category);
      }
    });
    
    return result;
  }

  // Chuyển đổi từ snake_case sang camelCase và lấy thông tin liên quan (deprecated - use formatBookWithRelationships)
  private async formatBook(book: any): Promise<Book> {
    return this.formatBookWithRelationships(book);
  }

  // Format book với data từ many-to-many relationships
  private async formatBookWithRelationships(book: any): Promise<Book> {
    const formattedBook: Book = {
      id: book.id,
      title: book.title,
      description: book.description,
      price: book.price,
      stock: book.stock,
      publisherId: book.publisher_id,
      ISBN: book.isbn,
      publishYear: book.publish_year,
      language: book.language,
      pageCount: book.page_count,
      coverImage: book.cover_image,
      createdAt: new Date(book.created_at),
      updatedAt: new Date(book.updated_at),
    };

    // Lấy thông tin song song để tối ưu performance
    const [authorsResult, publisherResult, categoriesResult] = await Promise.allSettled([
      // Lấy authors từ book_authors table
      this.supabase
        .from('book_authors')
        .select(`
          role,
          authors!inner (id, name)
        `)
        .eq('book_id', book.id),
      
      // Lấy publisher thông tin
      book.publisher_id ? this.supabase
        .from('publishers')
        .select('id, name')
        .eq('id', book.publisher_id)
        .single() : Promise.resolve({ data: null }),
      
      // Lấy categories từ book_categories table
      this.supabase
        .from('book_categories')
        .select(`
          categories!inner (id, name)
        `)
        .eq('book_id', book.id)
    ]);

    // Xử lý authors
    if (authorsResult.status === 'fulfilled' && authorsResult.value.data && authorsResult.value.data.length > 0) {
      (formattedBook as any).authors = authorsResult.value.data.map(ba => ({
        id: ba.authors.id,
        name: ba.authors.name,
        role: ba.role
      }));
    }

    // Xử lý publisher
    if (publisherResult.status === 'fulfilled' && publisherResult.value.data) {
      (formattedBook as any).publisher = publisherResult.value.data;
    }

    // Xử lý categories
    if (categoriesResult.status === 'fulfilled' && categoriesResult.value.data && categoriesResult.value.data.length > 0) {
      (formattedBook as any).categories = categoriesResult.value.data.map(bc => ({
        id: bc.categories.id,
        name: bc.categories.name
      }));
    }

    return formattedBook;
  }

  // Lấy tất cả sách với phân trang và lọc - with cache
  async findAll(params: any = {}): Promise<{ books: Book[]; total: number; page: number; totalPages: number }> {
    try {
      // Generate cache key cho pagination và filtering
      const cacheKey = this.cacheService.generateKey('books:list', params);
      
      return await this.cacheService.getOrSet(
        cacheKey,
        async () => {
          // Query books table
          let query = this.supabase
            .from('books')
            .select('*', { count: 'exact' });

          // Tìm kiếm theo từ khóa
          if (params.search && params.search.trim()) {
            const searchTerm = params.search.trim();
            query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,isbn.ilike.%${searchTerm}%`);
          }

          // Lọc theo publisher
          if (params.publisherId) {
            query = query.eq('publisher_id', params.publisherId);
          }

          // Lọc theo categoryId - tìm books có relationship với category
          if (params.categoryId) {
            const { data: bookIds } = await this.supabase
              .from('book_categories')
              .select('book_id')
              .eq('category_id', params.categoryId);
            
            if (bookIds && bookIds.length > 0) {
              const bookIdList = bookIds.map(item => item.book_id);
              query = query.in('id', bookIdList);
            } else {
              // Không có sách nào cho category này
              return { 
                books: [], 
                total: 0,
                page: parseInt(params.page) || 1,
                totalPages: 0
              };
            }
          }

          // Lọc theo authorId - tìm books có relationship với author
          if (params.authorId) {
            const { data: bookIds } = await this.supabase
              .from('book_authors')
              .select('book_id')
              .eq('author_id', params.authorId);
            
            if (bookIds && bookIds.length > 0) {
              const bookIdList = bookIds.map(item => item.book_id);
              query = query.in('id', bookIdList);
            } else {
              // Không có sách nào cho author này
              return { 
                books: [], 
                total: 0,
                page: parseInt(params.page) || 1,
                totalPages: 0
              };
            }
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
          
          const { data, error, count } = await query;

          if (error) {
            throw new Error(`Không thể lấy danh sách sách: ${error.message}`);
          }

          // Format books với relationships
          const books = await Promise.all(
            (data || []).map(book => this.formatBookWithRelationships(book))
          );

          return { 
            books, 
            total: count || 0,
            page,
            totalPages: Math.ceil((count || 0) / limit)
          };
        }
      );
    } catch (error) {
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

    return this.formatBookWithRelationships(data);
  }

  // Tạo sách mới
  async create(createBookDto: CreateBookDto): Promise<Book> {
    try {
      // Validation đầy đủ
      if (!createBookDto.title || createBookDto.title.trim() === '') {
        throw new Error('Tiêu đề sách không được để trống');
      }
      if (!createBookDto.authorIds || createBookDto.authorIds.length === 0) {
        throw new Error('Tác giả không được để trống');
      }
      if (!createBookDto.publisherId) {
        throw new Error('Nhà xuất bản không được để trống');
      }
      if (createBookDto.price === undefined || createBookDto.price < 0) {
        throw new Error('Giá sách phải lớn hơn hoặc bằng 0');
      }
      if (createBookDto.stock === undefined || createBookDto.stock < 0) {
        throw new Error('Số lượng phải lớn hơn hoặc bằng 0');
      }

      // Tạo book record trước
      const { data: book, error: bookError } = await this.supabase
        .from('books')
        .insert({
          title: createBookDto.title,
          description: createBookDto.description,
          price: createBookDto.price,
          stock: createBookDto.stock,
          publisher_id: createBookDto.publisherId,
          isbn: createBookDto.ISBN,
          publish_year: createBookDto.publishYear,
          language: createBookDto.language,
          page_count: createBookDto.pageCount,
          cover_image: createBookDto.coverImage,
        })
        .select()
        .single();

      if (bookError || !book) {
        throw new Error(`Không thể tạo sách: ${bookError?.message}`);
      }

      // Tạo book_authors relationships
      if (createBookDto.authorIds && createBookDto.authorIds.length > 0) {
        const bookAuthors = createBookDto.authorIds.map(authorId => ({
          book_id: book.id,
          author_id: authorId,
          role: 'author'
        }));

        const { error: authorsError } = await this.supabase
          .from('book_authors')
          .insert(bookAuthors);

        if (authorsError) {
          console.error('Error creating book_authors:', authorsError);
        }
      }

      // Tạo book_categories relationships
      if (createBookDto.categoryIds && createBookDto.categoryIds.length > 0) {
        const bookCategories = createBookDto.categoryIds.map(categoryId => ({
          book_id: book.id,
          category_id: categoryId
        }));

        const { error: categoriesError } = await this.supabase
          .from('book_categories')
          .insert(bookCategories);

        if (categoriesError) {
          console.error('Error creating book_categories:', categoriesError);
        }
      }

      // Clear cache
      this.cacheService.clearByPattern('books:*');

      // Return formatted book với relationships
      return this.formatBookWithRelationships(book);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Không thể tạo sách'
      );
    }
  }

  // Cập nhật sách
  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    try {
      // Kiểm tra sách có tồn tại không
      const existingBook = await this.findById(id);

      // Validation
      if (updateBookDto.title !== undefined && (!updateBookDto.title || updateBookDto.title.trim() === '')) {
        throw new Error('Tiêu đề sách không được để trống');
      }
      if (updateBookDto.price !== undefined && updateBookDto.price < 0) {
        throw new Error('Giá sách phải lớn hơn hoặc bằng 0');
      }
      if (updateBookDto.stock !== undefined && updateBookDto.stock < 0) {
        throw new Error('Số lượng phải lớn hơn hoặc bằng 0');
      }

      // Chuẩn bị dữ liệu cập nhật cho books table
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (updateBookDto.title !== undefined) updateData.title = updateBookDto.title.trim();
      if (updateBookDto.description !== undefined) updateData.description = updateBookDto.description?.trim() || null;
      if (updateBookDto.price !== undefined) updateData.price = updateBookDto.price;
      if (updateBookDto.stock !== undefined) updateData.stock = updateBookDto.stock;
      if (updateBookDto.publisherId !== undefined) updateData.publisher_id = updateBookDto.publisherId;
      if (updateBookDto.ISBN !== undefined) updateData.isbn = updateBookDto.ISBN?.trim() || null;
      if (updateBookDto.publishYear !== undefined) updateData.publish_year = updateBookDto.publishYear;
      if (updateBookDto.language !== undefined) updateData.language = updateBookDto.language?.trim() || null;
      if (updateBookDto.pageCount !== undefined) updateData.page_count = updateBookDto.pageCount;
      if (updateBookDto.coverImage !== undefined) updateData.cover_image = updateBookDto.coverImage?.trim() || null;

      // Cập nhật book record
      const { data: book, error: bookError } = await this.supabase
        .from('books')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (bookError || !book) {
        throw new Error(`Không thể cập nhật sách: ${bookError?.message}`);
      }

      // Cập nhật book_authors relationships nếu có
      if (updateBookDto.authorIds !== undefined) {
        // Xóa relationships cũ
        await this.supabase
          .from('book_authors')
          .delete()
          .eq('book_id', id);

        // Thêm relationships mới
        if (updateBookDto.authorIds.length > 0) {
          const bookAuthors = updateBookDto.authorIds.map(authorId => ({
            book_id: id,
            author_id: authorId,
            role: 'author'
          }));

          const { error: authorsError } = await this.supabase
            .from('book_authors')
            .insert(bookAuthors);

          if (authorsError) {
            console.error('Error updating book_authors:', authorsError);
          }
        }
      }

      // Cập nhật book_categories relationships nếu có
      if (updateBookDto.categoryIds !== undefined) {
        // Xóa relationships cũ
        await this.supabase
          .from('book_categories')
          .delete()
          .eq('book_id', id);

        // Thêm relationships mới
        if (updateBookDto.categoryIds.length > 0) {
          const bookCategories = updateBookDto.categoryIds.map(categoryId => ({
            book_id: id,
            category_id: categoryId
          }));

          const { error: categoriesError } = await this.supabase
            .from('book_categories')
            .insert(bookCategories);

          if (categoriesError) {
            console.error('Error updating book_categories:', categoriesError);
          }
        }
      }

      // Clear cache
      this.cacheService.clearByPattern('books:*');

      // Return updated book với relationships
      return this.formatBookWithRelationships(book);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Không thể cập nhật sách'
      );
    }
  }

  // Xóa sách
  async remove(id: string): Promise<{ success: boolean; message: string }> {
    try {
      // Kiểm tra sách có tồn tại không
      await this.findById(id);

      // Kiểm tra xem sách có trong order_items không
      const { data: orderItems, error: orderError } = await this.supabase
        .from('order_items')
        .select('id')
        .eq('book_id', id)
        .limit(1);

      if (orderError) {
        throw new BadRequestException('Lỗi khi kiểm tra đơn hàng liên quan');
      }

      if (orderItems && orderItems.length > 0) {
        throw new BadRequestException('Không thể xóa sách này vì đã có đơn hàng. Bạn có thể set stock = 0 để ẩn sách thay vì xóa.');
      }

      // Xóa relationships trước
      await this.supabase.from('book_authors').delete().eq('book_id', id);
      await this.supabase.from('book_categories').delete().eq('book_id', id);

      // Nếu không có order_items, tiến hành xóa
      const { error } = await this.supabase.from('books').delete().eq('id', id);

      if (error) {
        throw new Error(`Không thể xóa sách: ${error.message}`);
      }

      // Invalidate cache after delete
      this.cacheService.clearByPattern('books:*');
      this.cacheService.clearByPattern('dashboard:*');

      return {
        success: true,
        message: 'Xóa sách thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  // Ẩn sách (soft delete) - set stock = 0 thay vì xóa
  async hideBook(id: string): Promise<{ success: boolean; message: string }> {
    try {
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
        throw new Error(`Không thể ẩn sách: ${error.message}`);
      }
      return {
        success: true,
        message: 'Đã ẩn sách thành công (set stock = 0)',
      };
    } catch (error) {
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

  // Method for dashboard stats - optimized queries
  async getStats() {
    try {
      // Tối ưu: chỉ lấy count thay vì toàn bộ dữ liệu
      const totalBooksQuery = this.supabase
        .from('books')
        .select('*', { count: 'exact', head: true });
      
      // Lấy sách có stock thấp
      const lowStockQuery = this.supabase
        .from('books')
        .select('id, title, stock, price, cover_image')
        .lt('stock', 10)
        .order('stock', { ascending: true })
        .limit(5);

      const [{ count: totalBooks }, { data: lowStockBooks }] = await Promise.all([
        totalBooksQuery,
        lowStockQuery
      ]);

      // Format low stock books với author information
      const formattedLowStockBooks = await Promise.all(
        (lowStockBooks || []).map(async (book) => {
          // Get first author for display
          const { data: bookAuthors } = await this.supabase
            .from('book_authors')
            .select(`
              authors!inner (name)
            `)
            .eq('book_id', book.id)
            .limit(1);

          return {
            id: book.id,
            title: book.title,
            stock: book.stock,
            price: book.price,
            coverImage: book.cover_image,
            authorName: bookAuthors?.[0]?.authors?.name || 'Chưa có tác giả'
          };
        })
      );

      return {
        total: totalBooks || 0,
        lowStockBooks: formattedLowStockBooks,
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy thống kê sách: ${error.message}`);
    }
  }
}
