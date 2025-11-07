import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, UpdatePaymentDto } from './dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    const payment = await this.paymentsService.create(createPaymentDto);
    return {
      success: true,
      message: 'Payment created successfully',
      data: payment,
    };
  }

  @Get()
  async findAll() {
    const payments = await this.paymentsService.findAll();
    return payments; // Return array directly for frontend compatibility
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const payment = await this.paymentsService.findOne(id);
    return payment; // Return object directly for frontend compatibility
  }

  @Get('user/:user_id')
  async findByUser(@Param('user_id', ParseIntPipe) user_id: number) {
    const payments = await this.paymentsService.findByUser(user_id);
    return payments; // Return array directly for frontend compatibility
  }

  @Get('status/:status')
  async findByStatus(@Param('status') status: string) {
    const payments = await this.paymentsService.findByStatus(status);
    return payments; // Return array directly for frontend compatibility
  }

  @Get('month/:month/year/:year')
  async findByMonthYear(
    @Param('month', ParseIntPipe) month: number,
    @Param('year', ParseIntPipe) year: number,
  ) {
    const payments = await this.paymentsService.findByMonthYear(month, year);
    return payments; // Return array directly for frontend compatibility
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    const payment = await this.paymentsService.update(id, updatePaymentDto);
    return {
      success: true,
      message: 'Payment updated successfully',
      data: payment,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.paymentsService.remove(id);
    return {
      success: true,
      message: 'Payment deleted successfully',
    };
  }
}
