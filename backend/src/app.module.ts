import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/books.module';
import { InventoryModule } from './inventory/inventory.module'; 
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { SeedCommand } from './data/seed.command';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    BooksModule,
    InventoryModule,
    UsersModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeedCommand],
})
export class AppModule {}
