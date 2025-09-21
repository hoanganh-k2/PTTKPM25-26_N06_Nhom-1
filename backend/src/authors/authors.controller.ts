// src/authors/authors.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto, UpdateAuthorDto, Author } from '../models/author.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  // Lấy tất cả tác giả (Public)
  @Get()
  async findAll(@Query() query) {
    return this.authorsService.findAll(query);
  }

  // Lấy tác giả theo ID (Public)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Author> {
    return this.authorsService.findById(id);
  }

  // Tạo tác giả mới (Admin only)
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  async create(@Body() createAuthorDto: CreateAuthorDto): Promise<Author> {
    return this.authorsService.create(createAuthorDto);
  }

  // Cập nhật tác giả (Admin only)
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAuthorDto: UpdateAuthorDto,
  ): Promise<Author> {
    return this.authorsService.update(id, updateAuthorDto);
  }

  // Xóa tác giả (Admin only)
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.authorsService.remove(id);
  }
}