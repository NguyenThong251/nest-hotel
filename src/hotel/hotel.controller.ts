import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { HotelResponseDto } from './dto/hotel-response.dto';
import { HotelService } from './hotel.service';

@Controller('hotels')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  // @Post()
  // @UsePipes(new ValidationPipe({ transform: true }))
  // async create(
  //   @Body() createHotelDto: CreateHotelDto,
  // ): Promise<HotelResponseDto> {
  //   return this.hotelService.create(createHotelDto);
  // }

  // @Get()
  // async findAll(): Promise<HotelResponseDto[]> {
  //   return this.hotelService.findAll();
  // }

  // @Get(':id')
  // async findOne(@Param('id') id: number): Promise<HotelResponseDto> {
  //   return this.hotelService.findOne(id);
  // }
  @Get()
  async findAll(
    @Query('lang') lang: 'en' | 'vi' = 'en',
  ): Promise<HotelResponseDto[]> {
    return this.hotelService.findAll(lang);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('lang') lang: 'en' | 'vi' = 'en',
  ): Promise<HotelResponseDto> {
    return this.hotelService.findOne(+id, lang);
  }

  @Post()
  async create(
    @Body()
    hotelData: {
      pricePerNight: number;
      isAvailable?: boolean;
      translations: { language: string; name: string; address: string }[];
    },
    @Query('lang') lang: 'en' | 'vi' = 'en',
  ): Promise<HotelResponseDto> {
    return this.hotelService.create(hotelData);
  }
}
