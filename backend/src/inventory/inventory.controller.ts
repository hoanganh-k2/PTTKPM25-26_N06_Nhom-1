import { Controller, Get, Post, Body, Param, Put, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WarehouseManagerGuard } from '../auth/warehouse-manager.guard';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  // @UseGuards(JwtAuthGuard, WarehouseManagerGuard)
  async getInventory(@Query() query: any) {
    return this.inventoryService.getInventory(query);
  }

  @Put('update-stock/:bookId')
  // @UseGuards(JwtAuthGuard, WarehouseManagerGuard)
  async updateStock(
    @Param('bookId') bookId: string,
    @Body('stock') stock: number,
  ) {
    return this.inventoryService.updateStock(bookId, stock);
  }

  @Post('confirm-order/:orderId')
  // @UseGuards(JwtAuthGuard, WarehouseManagerGuard)
  async confirmOrder(@Param('orderId') orderId: string) {
    return this.inventoryService.confirmOrder(orderId);
  }
}
