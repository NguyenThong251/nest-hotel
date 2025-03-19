export class PaymentResponseDto {
  paymentUrl: string;
  bookingId: number;

  constructor(partial: Partial<PaymentResponseDto>) {
    Object.assign(this, partial);
  }
}
