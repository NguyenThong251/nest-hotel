import { Hotel } from '../entities/hotel.entity';

export class HotelResponseDto {
  id: number;
  name: string;
  address: string;
  pricePerNight: number;
  isAvailable: boolean;

  // constructor(partial: Partial<HotelResponseDto>) {
  //   Object.assign(this, partial);
  // }
  constructor(hotel: Hotel, lang: 'en' | 'vi' = 'en') {
    this.id = hotel.id;
    this.pricePerNight = hotel.pricePerNight;
    this.isAvailable = hotel.isAvailable;

    // Tìm bản dịch phù hợp với ngôn ngữ yêu cầu
    const translation =
      hotel.translations.find((t) => t.language === lang) ||
      hotel.translations.find((t) => t.language === 'en'); // Mặc định tiếng Anh nếu không tìm thấy
    this.name = translation?.name || 'Unknown';
    this.address = translation?.address || 'Unknown';
  }
}
