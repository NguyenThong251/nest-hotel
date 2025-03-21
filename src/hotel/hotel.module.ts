import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { HotelService } from './hotel.service';
import { HotelController } from './hotel.controller';
import { Hotel } from './entities/hotel.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelTranslation } from './entities/hotel-translation.entity';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AdminMiddleware } from '@app/middleware/admin.middleware';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '@app/user/constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([Hotel, HotelTranslation]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads', // Thư mục lưu file tạm thời
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Chỉ chấp nhận file .xlsx hoặc .xls
        if (
          file.mimetype ===
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.mimetype === 'application/vnd.ms-excel'
        ) {
          cb(null, true);
        } else {
          cb(new Error('Chỉ hỗ trợ file Excel (.xlsx, .xls)'), false);
        }
      },
    }),
    JwtModule.register({
      secret: jwtConstants.secret, // Phải khớp với AuthModule
    }),
  ],
  controllers: [HotelController],
  providers: [HotelService],
  exports: [HotelService],
})
export class HotelModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AdminMiddleware)
      .forRoutes({ path: 'hotels/import', method: RequestMethod.POST });
  }
}
// export class HotelModule {}
