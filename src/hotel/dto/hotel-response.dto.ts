export class HotelResponseDto {
  id: number;
  name: string;
  address: string;
  pricePerNight: number;
  isAvailable: boolean;

  constructor(partial: Partial<HotelResponseDto>) {
    Object.assign(this, partial);
  }
}
