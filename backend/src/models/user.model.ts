// src/models/user.model.ts
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

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
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class UserResponseDto {
  id: string;
  fullName: string;
  email: string;
  isAdmin: boolean;
  createdAt: Date;
}
