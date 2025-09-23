// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { createClient } from '@supabase/supabase-js';
import { UserResponseDto } from '../models/user.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private supabase;

  constructor() {
    const jwtSecret = process.env.JWT_SECRET || 'bookstore-super-secret-key-2025-very-long-and-secure';
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });

    // Khởi tạo Supabase client
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_KEY || '',
    );
  }

  async validate(payload: any): Promise<UserResponseDto> {
    const { data: user, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', payload.sub)
      .single();

    if (error || !user) {
      throw new UnauthorizedException();
    }

    const userResponse = {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      isAdmin: user.role === 'admin',
      role: user.role || 'customer',
      createdAt: new Date(user.created_at),
      updatedAt: user.updated_at ? new Date(user.updated_at) : undefined,
      phone: user.phone,
    };

    return userResponse;
  }
}
