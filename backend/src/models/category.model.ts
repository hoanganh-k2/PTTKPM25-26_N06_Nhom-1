// src/models/category.model.ts
import { IsNotEmpty } from 'class-validator';

export class Category {
  id: string;

  @IsNotEmpty()
  name: string;

  description?: string;

  createdAt: Date;
  updatedAt: Date;
}

export class CreateCategoryDto {
  @IsNotEmpty()
  name: string;

  description?: string;
}

export class UpdateCategoryDto {
  name?: string;
  description?: string;
}
