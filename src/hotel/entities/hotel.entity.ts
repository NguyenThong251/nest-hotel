import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { HotelTranslation } from './hotel-translation.entity';

@Entity()
export class Hotel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal')
  pricePerNight: number;

  @Column({ default: true })
  isAvailable: boolean;
  @OneToMany(() => HotelTranslation, (translation) => translation.hotel, {
    cascade: true, // Tự động lưu các bản dịch khi lưu hotel
  })
  translations: HotelTranslation[];
}
