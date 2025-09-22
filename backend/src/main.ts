import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { cacheMiddleware } from './middleware/cache.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global Prefix cho API
  app.setGlobalPrefix('api');

  // Cho phép CORS
  app.enableCors();

  // Thêm cache middleware
  app.use(cacheMiddleware(300)); // 5 minutes cache

  // Cấu hình validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Chỉ giữ lại properties có validation decorators
      transform: true, // Tự động chuyển đổi kiểu dữ liệu
      forbidNonWhitelisted: false, // Cho phép extra properties để không báo lỗi
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
