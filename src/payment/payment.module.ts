import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Booking } from '@app/booking/entities/booking.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingModule } from '@app/booking/booking.module';
import { UserModule } from '@app/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Booking]), BookingModule, UserModule],
  providers: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
