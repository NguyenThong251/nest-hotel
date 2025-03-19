import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { HotelModule } from './hotel/hotel.module';
import { BookingModule } from './booking/booking.module';
import { PaymentModule } from './payment/payment.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { dataSourceOptions } from 'provider/data-source.provider';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true cho port 465, false cho port 587
        auth: {
          user: 'ht01252004@gmail.com', // Email của bạn
          pass: 'bzmn cbnd yvog uewl', // Mật khẩu ứng dụng (App Password) từ Gmail
        },
      },
      defaults: {
        from: '"Hotel App" <ht01252004@gmail.com>',
      },
      template: {
        dir: join(__dirname, '..', 'templates'), // Thư mục chứa template email
        adapter: new HandlebarsAdapter(), // Sử dụng Handlebars để render template
        options: {
          strict: true,
        },
      },
    }),
    UserModule,
    HotelModule,
    BookingModule,
    PaymentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
