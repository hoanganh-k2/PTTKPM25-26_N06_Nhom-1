// src/models/order.model.ts
import { IsEnum, IsNotEmpty, IsNumber, Min, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PAYPAL = 'paypal',
  BANK_TRANSFER = 'bank_transfer',
  CASH_ON_DELIVERY = 'cash_on_delivery',
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

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
  
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;

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
  @IsNotEmpty()
  fullName: string;

  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  address: string;
}

export class CreateOrderItemDto {
  @IsNotEmpty()
  bookId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Address)
  shippingAddress: Address;

  @ValidateNested()
  @Type(() => Address)
  billingAddress?: Address;

  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;
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
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}
