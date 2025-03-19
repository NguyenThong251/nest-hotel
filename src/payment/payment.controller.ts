import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Query,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentRequestDto } from './dto/payment-request.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { AuthGuard } from '@nestjs/passport';
import { UsePipes, ValidationPipe } from '@nestjs/common';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe({ transform: true }))
  async createPayment(
    @Request() req,
    @Body() paymentRequestDto: PaymentRequestDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.createPaymentUrl(
      req.user.userId,
      paymentRequestDto,
    );
  }

  @Get('vnpay-return')
  async handleVNPayReturn(@Query() query: any): Promise<any> {
    return this.paymentService.handleVNPayReturn(query);
  }

  @Get('momo-return')
  async handleMoMoReturn(@Query() query: any): Promise<any> {
    // Xử lý MoMo return tương tự VNPay nếu cần
    return { message: 'MoMo return received', query };
  }
}
