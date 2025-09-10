// src/auth/jwt-auth.guard.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    // Có thể xử lý thêm các trường hợp lỗi ở đây
    if (err || !user) {
      throw err || new UnauthorizedException('Vui lòng đăng nhập để tiếp tục');
    }
    return user;
  }
}
