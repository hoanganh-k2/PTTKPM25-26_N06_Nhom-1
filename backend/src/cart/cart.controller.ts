// src/cart/cart.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto, CartResponseDto } from '../models/cart.model';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // Lấy giỏ hàng của user hiện tại
  @Get()
  async getCart(@Request() req): Promise<CartResponseDto> {
    try {
      const result = await this.cartService.getUserCart(req.user.id);
      return result;
    } catch (error) {
      // Return empty cart as fallback
      return {
        id: 'fallback-cart',
        userId: req.user.id,
        items: [],
        totalItems: 0,
        totalAmount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  }

  // Thêm sản phẩm vào giỏ hàng
  @Post('items')
  async addToCart(
    @Request() req,
    @Body() addToCartDto: AddToCartDto,
  ): Promise<CartResponseDto> {
    return await this.cartService.addToCart(req.user.id, addToCartDto);
  }

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  @Put('items/:cartItemId')
  async updateCartItem(
    @Request() req,
    @Param('cartItemId') cartItemId: string,
    @Body() updateDto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    return await this.cartService.updateCartItem(req.user.id, cartItemId, updateDto);
  }

  // Xóa sản phẩm khỏi giỏ hàng
  @Delete('items/:cartItemId')
  async removeFromCart(
    @Request() req,
    @Param('cartItemId') cartItemId: string,
  ): Promise<CartResponseDto> {
    return await this.cartService.removeFromCart(req.user.id, cartItemId);
  }

  // Xóa tất cả sản phẩm trong giỏ hàng
  @Delete('items')
  async clearCart(@Request() req): Promise<CartResponseDto> {
    return await this.cartService.clearCart(req.user.id);
  }
}