export class BookingResponseDto {
  id: number;
  userId: number;
  hotelId: number;
  checkInDate: Date;
  checkOutDate: Date;
  totalPrice: number;
  status: string;

  constructor(partial: Partial<BookingResponseDto>) {
    Object.assign(this, partial);
  }
}
