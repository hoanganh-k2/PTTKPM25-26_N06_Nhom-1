// src/models/book.model.ts
import { IsNotEmpty, IsNumber, Min, IsOptional, IsString, IsArray } from 'class-validator';

export class Book {
  id: string;

  @IsNotEmpty()
  title: string;

  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  stock: number;

  // Foreign keys
  publisherId: string;

  // Metadata
  ISBN?: string;
  publishYear?: number;
  language?: string;
  pageCount?: number;
  coverImage?: string;

  // Chi tiết sản phẩm mở rộng (giống Shopee)
  highlights?: string[]; // Điểm nổi bật
  detailedDescription?: string; // Mô tả chi tiết (HTML/Markdown)
  suitableFor?: string[]; // Phù hợp với đối tượng nào
  specifications?: { [key: string]: string }; // Thông số kỹ thuật
  
  // Thông tin bổ sung
  brand?: string; // Thương hiệu
  coverType?: string; // Loại bìa (bìa mềm, bìa cứng)
  dimensions?: string; // Kích thước (cm)
  weight?: number; // Trọng lượng (gram)
  distributor?: string; // Nhà phân phối
  tags?: string[]; // Tags/từ khóa

  createdAt: Date;
  updatedAt: Date;

  // Many-to-many relationships (populated từ book_authors và book_categories)
  authors?: { id: string; name: string; role?: string }[];
  publisher?: { id: string; name: string };
  categories?: { id: string; name: string }[];
}

export class CreateBookDto {
  @IsNotEmpty()
  title: string;

  description?: string;

  @IsNumber()
  @Min(0)
  price?: number;

  @IsNumber()
  @Min(0)
  stock?: number;

  @IsNotEmpty()
  publisherId: string;

  // Arrays cho many-to-many relationships
  @IsArray()
  authorIds: string[];

  @IsArray()
  categoryIds?: string[];

  ISBN?: string;
  publishYear?: number;
  language?: string;
  pageCount?: number;
  coverImage?: string;

  // Chi tiết sản phẩm mở rộng
  @IsOptional()
  @IsArray()
  highlights?: string[];

  @IsOptional()
  @IsString()
  detailedDescription?: string;

  @IsOptional()
  @IsArray()
  suitableFor?: string[];

  @IsOptional()
  specifications?: { [key: string]: string };

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  coverType?: string;

  @IsOptional()
  @IsString()
  dimensions?: string;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsString()
  distributor?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  // Cho phép các populated fields từ frontend (sẽ bị ignore)
  authors?: any[];
  publisher?: any; 
  categories?: any[];
}

export class UpdateBookDto {
  @IsOptional()
  @IsString()
  title?: string;
  
  @IsOptional()
  @IsString()
  description?: string;
  
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
  
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;
  
  @IsOptional()
  @IsString()
  publisherId?: string;
  
  @IsOptional()
  @IsArray()
  authorIds?: string[];
  
  @IsOptional()
  @IsArray()
  categoryIds?: string[];
  
  @IsOptional()
  @IsString()
  ISBN?: string;
  
  @IsOptional()
  @IsNumber()
  publishYear?: number;
  
  @IsOptional()
  @IsString()
  language?: string;
  
  @IsOptional()
  @IsNumber()
  pageCount?: number;
  
  @IsOptional()
  @IsString()
  coverImage?: string;

  // Chi tiết sản phẩm mở rộng
  @IsOptional()
  @IsArray()
  highlights?: string[];

  @IsOptional()
  @IsString()
  detailedDescription?: string;

  @IsOptional()
  @IsArray()
  suitableFor?: string[];

  @IsOptional()
  specifications?: { [key: string]: string };

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  coverType?: string;

  @IsOptional()
  @IsString()
  dimensions?: string;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsString()
  distributor?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  // Cho phép các populated fields từ frontend (sẽ bị ignore)
  @IsOptional()
  authors?: any[];
  
  @IsOptional()
  publisher?: any; 
  
  @IsOptional()
  categories?: any[];
}
