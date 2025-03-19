// import { Injectable, BadRequestException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Booking } from './entities/booking.entity';
// import { CreateBookingDto } from './dto/create-booking.dto';
// import { BookingResponseDto } from './dto/booking-response.dto';
// import { HotelService } from '../hotel/hotel.service';
// import { User } from '@app/user/entities/user.entity';

// @Injectable()
// export class BookingService {
//   constructor(
//     @InjectRepository(Booking)
//     private bookingRepository: Repository<Booking>,
//     private hotelService: HotelService,
//   ) {}

//   // async create(
//   //   user: User,
//   //   createBookingDto: CreateBookingDto,
//   // ): Promise<BookingResponseDto> {
//   //   const { hotelId, checkInDate, checkOutDate } = createBookingDto;

//   //   // Kiểm tra khách sạn
//   //   const hotel = await this.hotelService.findOne(hotelId);
//   //   if (!hotel.isAvailable) {
//   //     throw new BadRequestException('Khách sạn không khả dụng');
//   //   }

//   //   // Tính tổng giá
//   //   const checkIn = new Date(checkInDate);
//   //   const checkOut = new Date(checkOutDate);
//   //   const nights =
//   //     (checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24);
//   //   if (nights <= 0) {
//   //     throw new BadRequestException('Ngày checkout phải sau ngày checkin');
//   //   }
//   //   const totalPrice = nights * hotel.pricePerNight;

//   //   // Tạo booking
//   //   const booking = this.bookingRepository.create({
//   //     user,
//   //     // hotel: { id: hotelId } as any,
//   //     hotel,
//   //     checkInDate: new Date(checkInDate),
//   //     checkOutDate: new Date(checkOutDate),
//   //     totalPrice,
//   //     status: 'pending',
//   //   });

//   //   const savedBooking = await this.bookingRepository.save(booking);
//   //   return new BookingResponseDto({
//   //     id: savedBooking.id,
//   //     userId: user.id,
//   //     hotelId: hotelId,
//   //     checkInDate: savedBooking.checkInDate,
//   //     checkOutDate: savedBooking.checkOutDate,
//   //     totalPrice: savedBooking.totalPrice,
//   //     status: savedBooking.status,
//   //   });
//   // }

//   // async findUserBookings(userId: number): Promise<BookingResponseDto[]> {
//   //   const bookings = await this.bookingRepository.find({
//   //     where: { user: { id: userId } },
//   //     relations: ['hotel'],
//   //   });
//   //   return bookings.map(
//   //     (booking) =>
//   //       new BookingResponseDto({
//   //         id: booking.id,
//   //         userId: booking.user.id,
//   //         hotelId: booking.hotel.id,
//   //         checkInDate: booking.checkInDate,
//   //         checkOutDate: booking.checkOutDate,
//   //         totalPrice: booking.totalPrice,
//   //         status: booking.status,
//   //       }),
//   //   );
//   // }

//   async create(
//     user: User,
//     createBookingDto: CreateBookingDto,
//   ): Promise<BookingResponseDto> {
//     const { hotelId, checkInDate, checkOutDate } = createBookingDto;
//     console.log('Creating booking with:', {
//       hotelId,
//       checkInDate,
//       checkOutDate,
//     });

//     const hotel = await this.hotelService.findOne(hotelId);
//     console.log('Hotel found:', hotel);
//     if (!hotel.isAvailable) {
//       throw new BadRequestException('Khách sạn không khả dụng');
//     }

//     const checkIn = new Date(checkInDate);
//     const checkOut = new Date(checkOutDate);
//     const nights =
//       (checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24);
//     if (nights <= 0) {
//       throw new BadRequestException('Ngày checkout phải sau ngày checkin');
//     }
//     const totalPrice = nights * hotel.pricePerNight;

//     const booking = this.bookingRepository.create({
//       user,
//       hotel,
//       checkInDate: new Date(checkInDate),
//       checkOutDate: new Date(checkOutDate),
//       totalPrice,
//       status: 'pending',
//     });
//     console.log('Booking before save:', booking);

//     const savedBooking = await this.bookingRepository.save(booking);
//     console.log('Saved booking:', savedBooking);
//     return new BookingResponseDto({
//       id: savedBooking.id,
//       userId: user.id,
//       hotelId: hotelId,
//       checkInDate: savedBooking.checkInDate,
//       checkOutDate: savedBooking.checkOutDate,
//       totalPrice: savedBooking.totalPrice,
//       status: savedBooking.status,
//     });
//   }

//   async findUserBookings(userId: number): Promise<BookingResponseDto[]> {
//     console.log('Finding bookings for user:', userId);
//     const bookings = await this.bookingRepository.find({
//       where: { user: { id: userId } },
//       relations: ['hotel'],
//     });
//     console.log('Bookings found:', bookings);
//     return bookings.map(
//       (booking) =>
//         new BookingResponseDto({
//           id: booking.id,
//           userId: booking.user.id,
//           hotelId: booking.hotel.id,
//           checkInDate: booking.checkInDate,
//           checkOutDate: booking.checkOutDate,
//           totalPrice: booking.totalPrice,
//           status: booking.status,
//         }),
//     );
//   }
// }

// ******
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
import { HotelService } from '../hotel/hotel.service';
import { User } from '@app/user/entities/user.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(User) // Thêm repository cho User
    private userRepository: Repository<User>,
    private hotelService: HotelService,
  ) {}

  async create(
    userPayload: any, // Đổi từ User sang any để nhận payload từ JWT
    createBookingDto: CreateBookingDto,
  ): Promise<BookingResponseDto> {
    const { hotelId, checkInDate, checkOutDate } = createBookingDto;

    // Lấy thực thể User từ database
    const user = await this.userRepository.findOne({
      where: { id: userPayload.userId },
    });
    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại');
    }

    const hotel = await this.hotelService.findOne(hotelId);
    console.log('Hotel found:', hotel);
    if (!hotel.isAvailable) {
      throw new BadRequestException('Khách sạn không khả dụng');
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights =
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24);
    if (nights <= 0) {
      throw new BadRequestException('Ngày checkout phải sau ngày checkin');
    }
    const totalPrice = nights * hotel.pricePerNight;

    const booking = this.bookingRepository.create({
      user, // Sử dụng thực thể User đầy đủ
      hotel, // Sử dụng thực thể Hotel đầy đủ
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      totalPrice,
      status: 'pending',
    });
    console.log('Booking before save:', booking);

    const savedBooking = await this.bookingRepository.save(booking);
    console.log('Saved booking:', savedBooking);
    return new BookingResponseDto({
      id: savedBooking.id,
      userId: user.id,
      hotelId: hotelId,
      checkInDate: savedBooking.checkInDate,
      checkOutDate: savedBooking.checkOutDate,
      totalPrice: savedBooking.totalPrice,
      status: savedBooking.status,
    });
  }

  async findUserBookings(userId: number): Promise<BookingResponseDto[]> {
    console.log('Finding bookings for user:', userId);
    const bookings = await this.bookingRepository.find({
      where: { user: { id: userId } },
      relations: ['hotel'],
    });
    console.log('Bookings found:', bookings);
    return bookings.map(
      (booking) =>
        new BookingResponseDto({
          id: booking.id,
          userId: booking.user.id,
          hotelId: booking.hotel.id,
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
          totalPrice: booking.totalPrice,
          status: booking.status,
        }),
    );
  }
}
