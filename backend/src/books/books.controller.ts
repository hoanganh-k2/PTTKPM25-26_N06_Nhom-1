// src/books/books.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto, UpdateBookDto, Book } from '../models/book.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  async findAll(@Query() query): Promise<{ books: Book[]; total: number; page: number; totalPages: number }> {
    return this.booksService.findAll(query);
  }

  @Get('latest')
  async getLatestBooks(@Query('limit') limit: string): Promise<Book[]> {
    return this.booksService.getLatestBooks(limit ? parseInt(limit) : 8);
  }

  @Get('bestseller')
  async getBestsellerBooks(@Query('limit') limit: string): Promise<Book[]> {
    return this.booksService.getBestsellerBooks(limit ? parseInt(limit) : 8);
  }

  @Get('search')
  async searchBooks(
    @Query('query') searchQuery: string,
    @Query() query,
  ): Promise<{ books: Book[]; total: number }> {
    return this.booksService.searchBooks(searchQuery, query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Book> {
    return this.booksService.findById(id);
  }

  @Post()
  // @UseGuards(JwtAuthGuard, AdminGuard)
  async create(@Body() createBookDto: CreateBookDto): Promise<Book> {
    return this.booksService.create(createBookDto);
  }

  @Put(':id')
  // @UseGuards(JwtAuthGuard, AdminGuard)
  async update(
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<Book> {
    return this.booksService.update(id, updateBookDto);
  }

  @Delete(':id')
  // @UseGuards(JwtAuthGuard, AdminGuard)
  async remove(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    return this.booksService.remove(id);
  }

  @Put(':id/hide')
  // @UseGuards(JwtAuthGuard, AdminGuard)
  async hideBook(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    return this.booksService.hideBook(id);
  }
}
