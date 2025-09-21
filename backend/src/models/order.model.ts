// src/models/order.model.ts
import { IsEnum, IsNotEmpty, IsNumber, Min } from 'class-validator';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export class Order {
  id: string;

  userId: string;

  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsNumber()
  @Min(0)
  totalAmount: number;

  items: OrderItem[];

  shippingAddress: Address;
  billingAddress?: Address;

  paymentMethod: string;
  paymentStatus: string;

  createdAt: Date;
  updatedAt: Date;
}

export class OrderItem {
  id: string;
  orderId: string;
  bookId: string;

  @IsNotEmpty()
  bookTitle: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;
}

export class Address {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export class CreateOrderDto {
  @IsNotEmpty()
  items: {
    bookId: string;
    quantity: number;
  }[];

  @IsNotEmpty()
  shippingAddress: Address;

  billingAddress?: Address;

  @IsNotEmpty()
  paymentMethod: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export class UpdateOrderDto {
  @IsEnum(OrderStatus)
  status?: OrderStatus;
  
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;
}

export interface OrderItemResponse {
  bookId: string;
  bookTitle: string;
  quantity: number;
  price: number;
}

export interface OrderUserResponse {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
}

export class OrderResponseDto implements Omit<Order, 'items'> {
  id: string;
  userId: string;
  user?: OrderUserResponse; // Thông tin user được join từ bảng users
  status: OrderStatus;
  totalAmount: number;
  items: OrderItemResponse[];
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: Date;
  updatedAt: Date;
}
