import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreateHotelDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsNumber()
  pricePerNight: number;

  @IsBoolean()
  isAvailable?: boolean;
}
