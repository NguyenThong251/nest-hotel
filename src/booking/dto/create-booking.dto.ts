import { IsDateString, IsNumber } from 'class-validator';

export class CreateBookingDto {
  @IsNumber()
  hotelId: number;

  @IsDateString()
  checkInDate: string; // ISO format: "2025-03-20"

  @IsDateString()
  checkOutDate: string; // ISO format: "2025-03-25"
}
