// src/models/user.model.ts
import { IsEmail, IsNotEmpty, MinLength, IsEnum } from 'class-validator';

// Định nghĩa enum cho các vai trò
export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  WAREHOUSE_MANAGER = 'warehouse_manager'
}

export class User {
  id: string;

  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  isAdmin: boolean;
  
  @IsEnum(UserRole)
  role: UserRole;

  createdAt: Date;
  updatedAt: Date;

  // Các trường khác có thể cần thiết
  phone?: string;
  address?: string;
}

export class CreateUserDto {
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  role?: UserRole;

  phone?: string;
  address?: string;
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class UpdateUserDto {
  @IsNotEmpty()
  fullName?: string;

  @IsEmail()
  email?: string;

  @MinLength(6)
  password?: string;

  @IsEnum(UserRole)
  role?: UserRole;

  phone?: string;
  address?: string;
}

export class UserResponseDto {
  id: string;
  fullName: string;
  email: string;
  isAdmin: boolean;
  role: string; // Changed from UserRole to string to match actual usage
  createdAt: Date;
  updatedAt?: Date; // Made optional since it's not always populated
  phone?: string;
  address?: string;
}
