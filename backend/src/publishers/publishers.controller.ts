// src/publishers/publishers.controller.ts
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
import { PublishersService } from './publishers.service';
import { CreatePublisherDto, UpdatePublisherDto, Publisher } from '../models/publisher.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('publishers')
export class PublishersController {
  constructor(private readonly publishersService: PublishersService) {}

  // Lấy tất cả nhà xuất bản (Public)
  @Get()
  async findAll(@Query() query) {
    return this.publishersService.findAll(query);
  }

  // Lấy nhà xuất bản theo ID (Public)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Publisher> {
    return this.publishersService.findById(id);
  }

  // Tạo nhà xuất bản mới (Admin only)
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  async create(@Body() createPublisherDto: CreatePublisherDto): Promise<Publisher> {
    return this.publishersService.create(createPublisherDto);
  }

  // Cập nhật nhà xuất bản (Admin only)
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePublisherDto: UpdatePublisherDto,
  ): Promise<Publisher> {
    return this.publishersService.update(id, updatePublisherDto);
  }

  // Xóa nhà xuất bản (Admin only)
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.publishersService.remove(id);
  }
}