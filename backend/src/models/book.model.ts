// src/models/book.model.ts
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class Book {
  id: string;

  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  stock: number;

  // Foreign keys
  authorId: string;
  publisherId: string;
  categoryIds: string[];

  // Metadata
  ISBN: string;
  publishYear: number;
  language: string;
  pageCount: number;
  coverImage: string;

  createdAt: Date;
  updatedAt: Date;
}

export class CreateBookDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  stock: number;

  @IsNotEmpty()
  authorId: string;

  @IsNotEmpty()
  publisherId: string;

  @IsNotEmpty()
  categoryIds: string[];

  ISBN: string;
  publishYear: number;
  language: string;
  pageCount: number;
  coverImage: string;
}

export class UpdateBookDto {
  title?: string;
  description?: string;
  price?: number;
  stock?: number;
  authorId?: string;
  publisherId?: string;
  categoryIds?: string[];
  ISBN?: string;
  publishYear?: number;
  language?: string;
  pageCount?: number;
  coverImage?: string;
}
