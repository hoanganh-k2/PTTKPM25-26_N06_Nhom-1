// src/models/author.model.ts
import { IsNotEmpty } from 'class-validator';

export class Author {
  id: string;

  @IsNotEmpty()
  name: string;

  biography?: string;
  birthDate?: Date;
  nationality?: string;
  photo?: string;

  createdAt: Date;
  updatedAt: Date;
}

export class CreateAuthorDto {
  @IsNotEmpty()
  name: string;

  biography?: string;
  birthDate?: Date;
  nationality?: string;
  photo?: string;
}

export class UpdateAuthorDto {
  name?: string;
  biography?: string;
  birthDate?: Date;
  nationality?: string;
  photo?: string;
}
