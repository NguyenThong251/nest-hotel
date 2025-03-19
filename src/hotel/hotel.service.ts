import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hotel } from './entities/hotel.entity';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { HotelResponseDto } from './dto/hotel-response.dto';
import { HotelTranslation } from './entities/hotel-translation.entity';

@Injectable()
export class HotelService {
  constructor(
    @InjectRepository(Hotel)
    private hotelRepository: Repository<Hotel>,
  ) {}

  // async create(createHotelDto: CreateHotelDto): Promise<HotelResponseDto> {
  //   const hotel = this.hotelRepository.create(createHotelDto);
  //   const savedHotel = await this.hotelRepository.save(hotel);
  //   return new HotelResponseDto(savedHotel);
  // }
  async create(hotelData: {
    pricePerNight: number;
    isAvailable?: boolean;
    translations: { language: string; name: string; address: string }[];
  }): Promise<HotelResponseDto> {
    const hotel = this.hotelRepository.create({
      pricePerNight: hotelData.pricePerNight,
      isAvailable: hotelData.isAvailable ?? true,
      translations: hotelData.translations.map((t) =>
        Object.assign(new HotelTranslation(), t),
      ),
    });
    const savedHotel = await this.hotelRepository.save(hotel);
    return new HotelResponseDto(savedHotel, 'en');
  }
  async findAll(lang: 'en' | 'vi' = 'en'): Promise<HotelResponseDto[]> {
    const hotels = await this.hotelRepository.find({
      relations: ['translations'], // Lấy các bản dịch
    });
    return hotels.map((hotel) => new HotelResponseDto(hotel, lang));
  }

  async findOne(
    id: number,
    lang: 'en' | 'vi' = 'en',
  ): Promise<HotelResponseDto> {
    const hotel = await this.hotelRepository.findOneOrFail({
      where: { id },
      relations: ['translations'],
    });
    if (!hotel) {
      throw new NotFoundException('Khách sạn không tồn tại');
    }
    console.log('Hotel found:', hotel);
    return new HotelResponseDto(hotel, lang);
  }
}
