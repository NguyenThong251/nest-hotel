import { Hotel } from '@app/hotel/entities/hotel.entity';
import { User } from '@app/user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @ManyToOne(() => Hotel, (hotel) => hotel.id)
  hotel: Hotel;
  @Column()
  checkInDate: Date;
  @Column()
  checkOutDate: Date;
  @Column('decimal')
  totalPrice: number;
  @Column({ default: 'pending' })
  status: string;
}
