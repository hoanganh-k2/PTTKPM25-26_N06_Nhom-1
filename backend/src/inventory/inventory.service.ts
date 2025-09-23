import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { Book } from '../models/book.model';

@Injectable()
export class InventoryService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_KEY || '',
    );
  }

  // Lấy thông tin tồn kho của tất cả sách
  async getInventory(params: any = {}): Promise<{ books: any[]; total: number }> {
    let query = this.supabase.from('books').select('*', { count: 'exact' });

    // Lọc theo tồn kho thấp nếu có
    if (params.lowStock) {
      query = query.lt('stock', parseInt(params.lowStock));
    }

    // Sắp xếp theo tồn kho từ thấp đến cao
    query = query.order('stock', { ascending: true });

    // Phân trang
    const page = params.page ? parseInt(params.page) : 1;
    const limit = params.limit ? parseInt(params.limit) : 10;
    const startIndex = (page - 1) * limit;
    query = query.range(startIndex, startIndex + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Không thể lấy thông tin tồn kho: ${error.message}`);
    }

    // Format dữ liệu với relationships mới
    const books = await Promise.all(
      (data || []).map(async book => {
        // Lấy authors
        const { data: authorRelations } = await this.supabase
          .from('book_authors')
          .select('authors(*)')
          .eq('book_id', book.id);

        // Lấy categories  
        const { data: categoryRelations } = await this.supabase
          .from('book_categories') 
          .select('categories(*)')
          .eq('book_id', book.id);

        // Lấy publisher
        const { data: publisher } = await this.supabase
          .from('publishers')
          .select('*')
          .eq('id', book.publisher_id)
          .single();

        return {
          id: book.id,
          title: book.title,
          description: book.description,
          price: book.price,
          stock: book.stock,
          ISBN: book.isbn,
          publishYear: book.publish_year,
          language: book.language,
          pageCount: book.page_count,
          coverImage: book.cover_image,
          authors: authorRelations?.map(rel => rel.authors) || [],
          categories: categoryRelations?.map(rel => rel.categories) || [],
          publisher: publisher || null,
          createdAt: new Date(book.created_at),
          updatedAt: new Date(book.updated_at),
        };
      })
    );

    return {
      books,
      total: count || 0,
    };
  }

  // Cập nhật số lượng tồn kho cho một sách
  async updateStock(bookId: string, stock: number): Promise<any> {
    if (stock < 0) {
      throw new BadRequestException('Số lượng tồn kho không thể âm');
    }

    // Kiểm tra sách có tồn tại không
    const { data: existingBook, error: findError } = await this.supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single();

    if (findError || !existingBook) {
      throw new NotFoundException(`Không tìm thấy sách với ID: ${bookId}`);
    }

    // Cập nhật số lượng tồn kho
    const { data: updatedBook, error: updateError } = await this.supabase
      .from('books')
      .update({ stock, updated_at: new Date() })
      .eq('id', bookId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Cập nhật tồn kho thất bại: ${updateError.message}`);
    }

    // Lấy relationships mới sau khi update
    const [authorsResult, categoriesResult, publisherResult] = await Promise.allSettled([
      this.supabase
        .from('book_authors')
        .select('authors(*)')
        .eq('book_id', updatedBook.id),
      this.supabase
        .from('book_categories')
        .select('categories(*)')
        .eq('book_id', updatedBook.id),
      this.supabase
        .from('publishers')
        .select('*')
        .eq('id', updatedBook.publisher_id)
        .single()
    ]);

    // Format dữ liệu với relationships mới
    return {
      id: updatedBook.id,
      title: updatedBook.title,
      description: updatedBook.description,
      price: updatedBook.price,
      stock: updatedBook.stock,
      ISBN: updatedBook.isbn,
      publishYear: updatedBook.publish_year,
      language: updatedBook.language,
      pageCount: updatedBook.page_count,
      coverImage: updatedBook.cover_image,
      authors: authorsResult.status === 'fulfilled' 
        ? (authorsResult.value.data?.map(rel => rel.authors) || [])
        : [],
      categories: categoriesResult.status === 'fulfilled'
        ? (categoriesResult.value.data?.map(rel => rel.categories) || [])
        : [],
      publisher: publisherResult.status === 'fulfilled' 
        ? publisherResult.value.data
        : null,
      createdAt: new Date(updatedBook.created_at),
      updatedAt: new Date(updatedBook.updated_at),
    };
  }

  // Xác nhận đơn hàng và cập nhật trạng thái
  async confirmOrder(orderId: string): Promise<any> {
    // Kiểm tra đơn hàng có tồn tại không
    const { data: existingOrder, error: findError } = await this.supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();

    if (findError || !existingOrder) {
      throw new NotFoundException(`Không tìm thấy đơn hàng với ID: ${orderId}`);
    }

    // Kiểm tra trạng thái đơn hàng
    if (existingOrder.status !== 'pending' && existingOrder.status !== 'processing') {
      throw new BadRequestException(
        `Không thể xác nhận đơn hàng có trạng thái: ${existingOrder.status}`,
      );
    }

    // Cập nhật trạng thái đơn hàng thành "shipped" (đã giao cho đơn vị vận chuyển)
    const { data: updatedOrder, error: updateError } = await this.supabase
      .from('orders')
      .update({ status: 'shipped', updated_at: new Date() })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Xác nhận đơn hàng thất bại: ${updateError.message}`);
    }

    return {
      message: 'Xác nhận đơn hàng thành công',
      order: updatedOrder,
    };
  }
}
