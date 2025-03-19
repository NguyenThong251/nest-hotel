import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hotel } from './entities/hotel.entity';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { HotelResponseDto } from './dto/hotel-response.dto';

@Injectable()
export class HotelService {
  constructor(
    @InjectRepository(Hotel)
    private hotelRepository: Repository<Hotel>,
  ) {}

  async create(createHotelDto: CreateHotelDto): Promise<HotelResponseDto> {
    const hotel = this.hotelRepository.create(createHotelDto);
    const savedHotel = await this.hotelRepository.save(hotel);
    return new HotelResponseDto(savedHotel);
  }

  async findAll(): Promise<HotelResponseDto[]> {
    const hotels = await this.hotelRepository.find();
    return hotels.map((hotel) => new HotelResponseDto(hotel));
  }

  async findOne(id: number): Promise<HotelResponseDto> {
    const hotel = await this.hotelRepository.findOneOrFail({ where: { id } });
    if (!hotel) {
      throw new NotFoundException('Khách sạn không tồn tại');
    }
    console.log('Hotel found:', hotel);
    return new HotelResponseDto(hotel);
  }
}
