// src/models/publisher.model.ts
import { IsNotEmpty } from 'class-validator';

export class Publisher {
  id: string;

  @IsNotEmpty()
  name: string;

  description?: string;
  foundedYear?: number;
  logo?: string;
  website?: string;

  createdAt: Date;
  updatedAt: Date;
}

export class CreatePublisherDto {
  @IsNotEmpty()
  name: string;

  description?: string;
  foundedYear?: number;
  logo?: string;
  website?: string;
}

export class UpdatePublisherDto {
  name?: string;
  description?: string;
  foundedYear?: number;
  logo?: string;
  website?: string;
}
