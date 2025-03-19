import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { UserModule } from '@app/user/user.module';
import { HotelModule } from '@app/hotel/hotel.module';
import { User } from '@app/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, User]),
    HotelModule, // Để truy cập HotelService
    UserModule, // Để sử dụng AuthGuard
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
