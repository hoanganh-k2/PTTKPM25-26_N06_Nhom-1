import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global Prefix cho API
  app.setGlobalPrefix('api');

  // Cho phép CORS
  app.enableCors();

  // Cấu hình validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Loại bỏ các thuộc tính không được định nghĩa trong DTO
      transform: true, // Tự động chuyển đổi kiểu dữ liệu
      forbidNonWhitelisted: true, // Báo lỗi nếu có thuộc tính không được định nghĩa
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
