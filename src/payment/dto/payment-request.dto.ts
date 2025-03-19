import { IsNumber, IsEnum } from 'class-validator';

export enum PaymentMethod {
  VNPAY = 'vnpay',
  MOMO = 'momo',
}

export class PaymentRequestDto {
  @IsNumber()
  bookingId: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
