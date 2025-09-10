// src/auth/admin.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // User được thêm bởi JwtAuthGuard

    // Kiểm tra quyền admin
    if (user && user.isAdmin) {
      return true;
    }

    throw new ForbiddenException(
      'Bạn không có quyền truy cập vào tài nguyên này',
    );
  }
}
