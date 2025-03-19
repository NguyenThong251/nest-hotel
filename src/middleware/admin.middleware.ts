import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Vui lòng cung cấp token');
    }

    const token = authHeader.split(' ')[1]; // Lấy token từ "Bearer <token>"
    if (!token) {
      throw new UnauthorizedException('Token không hợp lệ');
    }

    try {
      const payload = this.jwtService.verify(token);
      const userRole = payload.role;

      console.log(payload);
      if (userRole !== 'admin') {
        throw new ForbiddenException(
          'Chỉ admin mới có quyền thực hiện hành động này',
        );
      }

      req['user'] = payload; // Gắn thông tin user vào request để dùng sau nếu cần
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Token không hợp lệ');
      }
      throw error; // Ném lại lỗi ForbiddenException hoặc các lỗi khác
    }
  }
}
