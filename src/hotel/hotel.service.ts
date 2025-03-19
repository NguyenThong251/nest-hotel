import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hotel } from './entities/hotel.entity';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { HotelResponseDto } from './dto/hotel-response.dto';
import { HotelTranslation } from './entities/hotel-translation.entity';
import * as XLSX from 'xlsx';

@Injectable()
export class HotelService {
  constructor(
    @InjectRepository(Hotel)
    private hotelRepository: Repository<Hotel>,
    @InjectRepository(HotelTranslation)
    private hotelTranslationRepository: Repository<HotelTranslation>,
  ) {}

  async importFromExcel(file: Express.Multer.File): Promise<string> {
    // Đọc file Excel
    const workbook = XLSX.readFile(file.path);
    const sheetName = workbook.SheetNames[0]; // Lấy sheet đầu tiên
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet); // Chuyển sheet thành JSON

    if (!data.length) {
      throw new BadRequestException('File Excel không chứa dữ liệu');
    }

    // Duyệt qua từng dòng trong file Excel
    for (const row of data as any[]) {
      const hotel = this.hotelRepository.create({
        pricePerNight: row['PricePerNight'] || 0,
        isAvailable:
          row['IsAvailable'] !== undefined ? Boolean(row['IsAvailable']) : true,
      });

      // Lưu hotel trước để lấy ID
      const savedHotel = await this.hotelRepository.save(hotel);

      // Xử lý bản dịch
      const translations: HotelTranslation[] = [];
      if (row['Name_EN'] && row['Address_EN']) {
        const translationEn = this.hotelTranslationRepository.create({
          language: 'en',
          name: row['Name_EN'],
          address: row['Address_EN'],
          hotel: savedHotel,
        });
        translations.push(translationEn);
      }
      if (row['Name_VI'] && row['Address_VI']) {
        const translationVi = this.hotelTranslationRepository.create({
          language: 'vi',
          name: row['Name_VI'],
          address: row['Address_VI'],
          hotel: savedHotel,
        });
        translations.push(translationVi);
      }

      if (translations.length === 0) {
        throw new BadRequestException(
          `Dòng dữ liệu thiếu bản dịch: ${JSON.stringify(row)}`,
        );
      }

      // Lưu các bản dịch
      await this.hotelTranslationRepository.save(translations);
    }

    return `Đã import thành công ${data.length} khách sạn`;
  }
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
