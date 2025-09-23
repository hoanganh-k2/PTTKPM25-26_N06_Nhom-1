// src/cart/cart.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { 
  Cart, 
  CartItem, 
  AddToCartDto, 
  UpdateCartItemDto, 
  CartResponseDto,
  CartItemResponseDto 
} from '../models/cart.model';
import { CartCacheService } from './cart-cache.service';

@Injectable()
export class CartService {
  private supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_KEY || '',
  );

  constructor(private cacheService: CartCacheService) {}

  // Lấy hoặc tạo giỏ hàng cho user với cache
  async getOrCreateCart(userId: string): Promise<CartResponseDto> {
    try {
      
      // Kiểm tra cache trước
      const cachedCart = this.cacheService.get(userId);
      if (cachedCart) {
        return cachedCart;
      }


      // First, verify user exists
      const { data: userExists, error: userError } = await this.supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();
      
      
      if (userError || !userExists) {
        throw new BadRequestException('User không tồn tại');
      }
      
      // Kiểm tra xem user đã có cart chưa
      const { data: existingCart, error: cartError } = await this.supabase
        .from('carts')
        .select('*')
        .eq('user_id', userId)
        .single();

      let cartId: string;

      if (cartError && cartError.code === 'PGRST116') {
        // Cart chưa tồn tại, tạo mới
        const { data: newCart, error: createError } = await this.supabase
          .from('carts')
          .insert([{ user_id: userId }])
          .select()
          .single();

        if (createError) {
          throw new BadRequestException('Không thể tạo giỏ hàng');
        }

        cartId = newCart.id;
      } else if (cartError) {
        throw new BadRequestException('Lỗi khi lấy thông tin giỏ hàng');
      } else {
        cartId = existingCart.id;
      }

      // Lấy chi tiết giỏ hàng với các items
      const cart = await this.getCartWithItems(cartId);
      
      // Lưu vào cache
      this.cacheService.set(userId, cart);
      
      return cart;
    } catch (error) {
      // Return empty cart on error
      return {
        id: 'empty-cart-' + userId,
        userId: userId,
        items: [],
        totalItems: 0,
        totalAmount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  }

  // Lấy chi tiết giỏ hàng với các items (tối ưu với JOIN)
  async getCartWithItems(cartId: string): Promise<CartResponseDto> {
    try {
      // Sử dụng JOIN để lấy cart + items + books trong 1 query
      const { data: cartWithItems, error } = await this.supabase
        .from('carts')
        .select(`
          *,
          cart_items (
            *,
            books (
              id,
              title,
              price,
              cover_image,
              stock
            )
          )
        `)
        .eq('id', cartId)
        .single();

      if (error || !cartWithItems) {
        throw new NotFoundException('Không tìm thấy giỏ hàng');
      }

      // Tính tổng số lượng và tổng tiền
      let totalItems = 0;
      let totalAmount = 0;

      const formattedItems: CartItemResponseDto[] = (cartWithItems.cart_items || []).map(item => {
        totalItems += item.quantity;
        totalAmount += item.quantity * item.books.price;

        return {
          id: item.id,
          cartId: item.cart_id,
          bookId: item.book_id,
          quantity: item.quantity,
          book: {
            id: item.books.id,
            title: item.books.title,
            price: item.books.price,
            coverImage: item.books.cover_image,
            stock: item.books.stock,
          },
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at),
        };
      });

      return {
        id: cartWithItems.id,
        userId: cartWithItems.user_id,
        items: formattedItems,
        totalAmount: totalAmount,
        totalItems: totalItems,
        createdAt: new Date(cartWithItems.created_at),
        updatedAt: new Date(cartWithItems.updated_at),
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Có lỗi xảy ra khi lấy thông tin giỏ hàng');
    }
  }

  // Thêm sản phẩm vào giỏ hàng
  async addToCart(userId: string, addToCartDto: AddToCartDto): Promise<CartResponseDto> {
    try {
      // Lấy hoặc tạo cart
      const cart = await this.getOrCreateCart(userId);

      // Kiểm tra sản phẩm có tồn tại không
      const { data: book, error: bookError } = await this.supabase
        .from('books')
        .select('id, stock')
        .eq('id', addToCartDto.bookId)
        .single();

      if (bookError || !book) {
        throw new NotFoundException('Không tìm thấy sách');
      }

      // Kiểm tra tồn kho
      if (book.stock < addToCartDto.quantity) {
        throw new BadRequestException('Số lượng yêu cầu vượt quá tồn kho');
      }

      // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
      const { data: existingItem, error: existingError } = await this.supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cart.id)
        .eq('book_id', addToCartDto.bookId)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        throw new BadRequestException('Lỗi khi kiểm tra sản phẩm trong giỏ hàng');
      }

      if (existingItem) {
        // Cập nhật số lượng nếu sản phẩm đã có trong giỏ
        const newQuantity = existingItem.quantity + addToCartDto.quantity;
        
        if (newQuantity > book.stock) {
          throw new BadRequestException('Số lượng tổng vượt quá tồn kho');
        }

        const { error: updateError } = await this.supabase
          .from('cart_items')
          .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
          .eq('id', existingItem.id);

        if (updateError) {
          throw new BadRequestException('Không thể cập nhật số lượng sản phẩm');
        }
      } else {
        // Thêm sản phẩm mới vào giỏ hàng
        const { error: insertError } = await this.supabase
          .from('cart_items')
          .insert([{
            cart_id: cart.id,
            book_id: addToCartDto.bookId,
            quantity: addToCartDto.quantity,
          }]);

        if (insertError) {
          throw new BadRequestException('Không thể thêm sản phẩm vào giỏ hàng');
        }
      }

      // Trả về giỏ hàng đã cập nhật
      const updatedCart = await this.getCartWithItems(cart.id);
      
      // Invalidate cache
      this.cacheService.delete(userId);
      
      return updatedCart;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng');
    }
  }

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  async updateCartItem(userId: string, cartItemId: string, updateDto: UpdateCartItemDto): Promise<CartResponseDto> {
    try {
      // Lấy cart item
      const { data: cartItem, error: itemError } = await this.supabase
        .from('cart_items')
        .select(`
          *,
          carts!inner (
            id,
            user_id
          ),
          books (
            stock
          )
        `)
        .eq('id', cartItemId)
        .single();

      if (itemError || !cartItem) {
        throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng');
      }

      // Kiểm tra quyền sở hữu
      if (cartItem.carts.user_id !== userId) {
        throw new BadRequestException('Bạn không có quyền sửa đổi giỏ hàng này');
      }

      // Kiểm tra tồn kho
      if (updateDto.quantity > cartItem.books.stock) {
        throw new BadRequestException('Số lượng yêu cầu vượt quá tồn kho');
      }

      // Cập nhật số lượng
      const { error: updateError } = await this.supabase
        .from('cart_items')
        .update({ 
          quantity: updateDto.quantity, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', cartItemId);

      if (updateError) {
        throw new BadRequestException('Không thể cập nhật số lượng sản phẩm');
      }

      // Invalidate cache
      this.cacheService.delete(userId);

      // Trả về giỏ hàng đã cập nhật
      return await this.getCartWithItems(cartItem.cart_id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Có lỗi xảy ra khi cập nhật sản phẩm');
    }
  }

  // Xóa sản phẩm khỏi giỏ hàng
  async removeFromCart(userId: string, cartItemId: string): Promise<CartResponseDto> {
    try {
      // Lấy cart item
      const { data: cartItem, error: itemError } = await this.supabase
        .from('cart_items')
        .select(`
          *,
          carts!inner (
            id,
            user_id
          )
        `)
        .eq('id', cartItemId)
        .single();

      if (itemError || !cartItem) {
        throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng');
      }

      // Kiểm tra quyền sở hữu
      if (cartItem.carts.user_id !== userId) {
        throw new BadRequestException('Bạn không có quyền sửa đổi giỏ hàng này');
      }

      // Xóa cart item
      const { error: deleteError } = await this.supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (deleteError) {
        throw new BadRequestException('Không thể xóa sản phẩm khỏi giỏ hàng');
      }

      // Invalidate cache
      this.cacheService.delete(userId);

      // Trả về giỏ hàng đã cập nhật
      return await this.getCartWithItems(cartItem.cart_id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Có lỗi xảy ra khi xóa sản phẩm');
    }
  }

  // Xóa tất cả sản phẩm trong giỏ hàng
  async clearCart(userId: string): Promise<CartResponseDto> {
    try {
      // Lấy cart của user
      const { data: cart, error: cartError } = await this.supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (cartError || !cart) {
        throw new NotFoundException('Không tìm thấy giỏ hàng');
      }

      // Xóa tất cả cart items
      const { error: deleteError } = await this.supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cart.id);

      if (deleteError) {
        throw new BadRequestException('Không thể xóa giỏ hàng');
      }

      // Invalidate cache
      this.cacheService.delete(userId);

      // Trả về giỏ hàng trống
      return await this.getCartWithItems(cart.id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Có lỗi xảy ra khi xóa giỏ hàng');
    }
  }

  // Lấy giỏ hàng của user
  async getUserCart(userId: string): Promise<CartResponseDto> {
    return await this.getOrCreateCart(userId);
  }
}