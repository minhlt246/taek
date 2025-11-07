import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { PaymentDetailsService } from './payment-details.service';
import { CreatePaymentDetailDto } from './dto/create-payment-detail.dto';
import { UpdatePaymentDetailDto } from './dto/update-payment-detail.dto';

@Controller('payment-details')
export class PaymentDetailsController {
  constructor(private readonly paymentDetailsService: PaymentDetailsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() input: CreatePaymentDetailDto) {
    const detail = await this.paymentDetailsService.create(input);
    return {
      success: true,
      message: 'Payment detail created successfully',
      data: detail,
    };
  }

  @Get()
  async findAll() {
    const details = await this.paymentDetailsService.findAll();
    return details; // Return array directly for frontend compatibility
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const detail = await this.paymentDetailsService.findOne(id);
    return detail; // Return object directly for frontend compatibility
  }

  @Get('payment/:payment_id')
  async findByPayment(@Param('payment_id', ParseIntPipe) payment_id: number) {
    const details = await this.paymentDetailsService.findByPayment(payment_id);
    return details; // Return array directly for frontend compatibility
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdatePaymentDetailDto,
  ) {
    const detail = await this.paymentDetailsService.update(id, input);
    return {
      success: true,
      message: 'Payment detail updated successfully',
      data: detail,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.paymentDetailsService.remove(id);
    return {
      success: true,
      message: 'Payment detail deleted successfully',
    };
  }
}
