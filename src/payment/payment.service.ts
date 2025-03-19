import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../booking/entities/booking.entity';
import { PaymentRequestDto, PaymentMethod } from './dto/payment-request.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import * as crypto from 'crypto';
import axios from 'axios';

interface MoMoPaymentResponse {
  payUrl: string;
}

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  async createPaymentUrl(
    userId: number,
    paymentRequest: PaymentRequestDto,
  ): Promise<PaymentResponseDto> {
    const { bookingId, paymentMethod } = paymentRequest;
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, user: { id: userId } },
      relations: ['hotel'],
    });

    if (!booking || booking.status !== 'pending') {
      throw new BadRequestException(
        'Booking không hợp lệ hoặc đã được thanh toán',
      );
    }

    const amount = booking.totalPrice;
    const orderId = `${bookingId}_${Date.now()}`;

    if (paymentMethod === PaymentMethod.VNPAY) {
      return this.createVNPayUrl(bookingId, amount, orderId);
    } else if (paymentMethod === PaymentMethod.MOMO) {
      return this.createMoMoUrl(bookingId, amount, orderId);
    } else {
      throw new BadRequestException('Phương thức thanh toán không hỗ trợ');
    }
  }

  private async createVNPayUrl(
    bookingId: number,
    amount: number,
    orderId: string,
  ): Promise<PaymentResponseDto> {
    const vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    const vnpParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: process.env.VNPAY_TMN_CODE,
      vnp_Amount: amount * 100,
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
      vnp_OrderType: '250000',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: 'http://localhost:3001/payment/vnpay-return',
      vnp_IpAddr: '127.0.0.1',
      vnp_CreateDate: new Date()
        .toISOString()
        .replace(/[-:T.]/g, '')
        .slice(0, 14),
    };

    const sortedParams = Object.keys(vnpParams)
      .sort()
      .reduce((result, key) => {
        result[key] = vnpParams[key];
        return result;
      }, {} as any);

    const signData = new URLSearchParams(sortedParams).toString();
    if (!process.env.VNPAY_HASH_SECRET) {
      throw new Error('VNPAY_HASH_SECRET is not defined');
    }
    const secureHash = crypto
      .createHmac('sha512', process.env.VNPAY_HASH_SECRET)
      .update(signData)
      .digest('hex');

    sortedParams['vnp_SecureHash'] = secureHash;

    const paymentUrl = `${vnpUrl}?${new URLSearchParams(sortedParams).toString()}`;
    return new PaymentResponseDto({ paymentUrl, bookingId });
  }

  private async createMoMoUrl(
    bookingId: number,
    amount: number,
    orderId: string,
  ): Promise<PaymentResponseDto> {
    // Kiểm tra số tiền hợp lệ cho MoMo
    if (amount < 1000 || amount > 50000000) {
      throw new BadRequestException(
        'Số tiền phải từ 1000 VND đến 50,000,000 VND khi thanh toán bằng MoMo',
      );
    }

    const requestId = `${orderId}_req`;
    const momoParams = {
      partnerCode: process.env.MOMO_PARTNER_CODE,
      accessKey: process.env.MOMO_ACCESS_KEY,
      requestId: requestId,
      amount: amount.toString(),
      orderId: orderId,
      orderInfo: `Thanh toan don hang ${orderId}`,
      redirectUrl: 'http://localhost:3001/payment/momo-return',
      ipnUrl: 'http://localhost:3001/payment/momo-ipn',
      requestType: 'captureWallet',
      extraData: '',
    };

    const rawSignature = `accessKey=${momoParams.accessKey}&amount=${momoParams.amount}&extraData=${momoParams.extraData}&ipnUrl=${momoParams.ipnUrl}&orderId=${momoParams.orderId}&orderInfo=${momoParams.orderInfo}&partnerCode=${momoParams.partnerCode}&redirectUrl=${momoParams.redirectUrl}&requestId=${momoParams.requestId}&requestType=${momoParams.requestType}`;
    if (!process.env.MOMO_SECRET_KEY) {
      throw new Error('MOMO_SECRET_KEY is not defined');
    }
    const signature = crypto
      .createHmac('sha256', process.env.MOMO_SECRET_KEY)
      .update(rawSignature)
      .digest('hex');

    try {
      const response = await axios.post<MoMoPaymentResponse>(
        'https://test-payment.momo.vn/v2/gateway/api/create',
        { ...momoParams, signature },
      );
      return new PaymentResponseDto({
        paymentUrl: response.data.payUrl,
        bookingId,
      });
    } catch (error) {
      console.error('MoMo API error:', error.response?.data || error.message);
      if (error.response?.data?.resultCode === 22) {
        throw new BadRequestException(
          'Số tiền phải từ 1000 VND đến 50,000,000 VND khi thanh toán bằng MoMo',
        );
      }
      throw new BadRequestException('Không thể tạo URL thanh toán MoMo');
    }
  }

  async handleVNPayReturn(vnpParams: any): Promise<any> {
    const secureHash = vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHashType;

    const sortedParams = Object.keys(vnpParams)
      .sort()
      .reduce((result, key) => {
        result[key] = vnpParams[key];
        return result;
      }, {} as any);

    const signData = new URLSearchParams(sortedParams).toString();
    if (!process.env.VNPAY_HASH_SECRET) {
      throw new Error('VNPAY_HASH_SECRET is not defined');
    }
    const checkHash = crypto
      .createHmac('sha512', process.env.VNPAY_HASH_SECRET)
      .update(signData)
      .digest('hex');

    if (secureHash === checkHash && vnpParams.vnp_ResponseCode === '00') {
      const bookingId = parseInt(vnpParams.vnp_TxnRef.split('_')[0]);
      // Kiểm tra và cập nhật trạng thái booking
      console.log('Updating booking:', bookingId, 'to status: confirmed');
      const updateResult = await this.bookingRepository.update(
        bookingId,
        { status: 'confirmed' }, // Đảm bảo truyền giá trị cập nhật
      );
      if (updateResult.affected === 0) {
        throw new BadRequestException('Không tìm thấy booking để cập nhật');
      }
      return { message: 'Thanh toán thành công', bookingId };
    }
    throw new BadRequestException('Thanh toán thất bại');
  }
}
