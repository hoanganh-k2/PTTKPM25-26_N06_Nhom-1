// src/models/cart.model.ts
import { IsNotEmpty, IsNumber, Min, IsOptional, IsUUID } from 'class-validator';

export class Cart {
  id: string;
  
  @IsUUID()
  @IsNotEmpty()
  userId: string;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Thông tin liên quan
  items?: CartItem[];
  totalItems?: number;
  totalAmount?: number;
}

export class CartItem {
  id: string;
  
  @IsUUID()
  @IsNotEmpty()
  cartId: string;
  
  @IsUUID()
  @IsNotEmpty()
  bookId: string;
  
  @IsNumber()
  @Min(1)
  quantity: number;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Thông tin liên quan (từ Book)
  book?: {
    id: string;
    title: string;
    price: number;
    coverImage?: string;
    stock: number;
  };
}

export class CreateCartDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}

export class AddToCartDto {
  @IsUUID()
  @IsNotEmpty()
  bookId: string;
  
  @IsNumber()
  @Min(1)
  quantity: number = 1;
}

export class UpdateCartItemDto {
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CartResponseDto {
  id: string;
  userId: string;
  items: CartItemResponseDto[];
  totalItems: number;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class CartItemResponseDto {
  id: string;
  cartId: string;
  bookId: string;
  quantity: number;
  book: {
    id: string;
    title: string;
    price: number;
    coverImage?: string;
    stock: number;
  };
  createdAt: Date;
  updatedAt: Date;
}