import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { HotelResponseDto } from './dto/hotel-response.dto';
import { HotelService } from './hotel.service';

@Controller('hotels')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() createHotelDto: CreateHotelDto,
  ): Promise<HotelResponseDto> {
    return this.hotelService.create(createHotelDto);
  }

  @Get()
  async findAll(): Promise<HotelResponseDto[]> {
    return this.hotelService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<HotelResponseDto> {
    return this.hotelService.findOne(id);
  }
}
