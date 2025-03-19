import { Module } from '@nestjs/common';
import { HotelService } from './hotel.service';
import { HotelController } from './hotel.controller';
import { Hotel } from './entities/hotel.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelTranslation } from './entities/hotel-translation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Hotel, HotelTranslation])],
  controllers: [HotelController],
  providers: [HotelService],
  exports: [HotelService],
})
export class HotelModule {}
