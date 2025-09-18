import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UserRole } from '../models/user.model';

@Injectable()
export class WarehouseManagerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // Kiểm tra xem người dùng có vai trò warehouse_manager hoặc admin không
    return request.user && 
           (request.user.role === UserRole.WAREHOUSE_MANAGER || request.user.role === UserRole.ADMIN);
  }
}
