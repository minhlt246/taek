import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto, UpdatePaymentDto } from './dto';
import { IPaymentService } from './interfaces';

@Injectable()
export class PaymentsService implements IPaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const payment = this.paymentRepository.create(createPaymentDto);
    return await this.paymentRepository.save(payment);
  }

  async findAll(): Promise<Payment[]> {
    return await this.paymentRepository.find({
      relations: ['user'],
    });
  }

  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async findByUser(user_id: number): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { user_id },
      relations: ['user'],
    });
  }

  async findByStatus(status: string): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { status: status as any },
      relations: ['user'],
    });
  }

  async findByMonthYear(month: number, year: number): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { month, year },
      relations: ['user'],
    });
  }

  async update(
    id: number,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<Payment> {
    await this.findOne(id);
    await this.paymentRepository.update(id, updatePaymentDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const payment = await this.findOne(id);
    await this.paymentRepository.remove(payment);
  }
}
