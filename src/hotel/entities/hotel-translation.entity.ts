import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Hotel } from './hotel.entity';

@Entity()
export class HotelTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  language: string; // Mã ngôn ngữ, ví dụ: 'en', 'vi'

  @Column()
  name: string; // Tên khách sạn theo ngôn ngữ

  @Column()
  address: string; // Địa chỉ theo ngôn ngữ

  @ManyToOne(() => Hotel, (hotel) => hotel.translations)
  hotel: Hotel;
}
