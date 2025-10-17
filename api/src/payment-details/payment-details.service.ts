import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { PaymentDetail } from './entities/payment-detail.entity';
import { CreatePaymentDetailDto } from './dto/create-payment-detail.dto';
import { UpdatePaymentDetailDto } from './dto/update-payment-detail.dto';

@Injectable()
export class PaymentDetailsService {
  constructor(
    @InjectRepository(PaymentDetail)
    private readonly paymentDetailRepository: Repository<PaymentDetail>,
  ) {}

  async create(input: CreatePaymentDetailDto): Promise<PaymentDetail> {
    const entity: PaymentDetail = this.paymentDetailRepository.create(
      input as DeepPartial<PaymentDetail>,
    );
    return await this.paymentDetailRepository.save(entity);
  }

  async findAll(): Promise<PaymentDetail[]> {
    return await this.paymentDetailRepository.find({
      relations: { payment: true, tuition_package: true },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<PaymentDetail> {
    const item = await this.paymentDetailRepository.findOne({
      where: { id },
      relations: { payment: true, tuition_package: true },
    });
    if (!item)
      throw new NotFoundException(`PaymentDetail with ID ${id} not found`);
    return item;
  }

  async findByPayment(payment_id: number): Promise<PaymentDetail[]> {
    return await this.paymentDetailRepository.find({
      where: { payment_id },
      relations: { payment: true, tuition_package: true },
      order: { created_at: 'DESC' },
    });
  }

  async update(
    id: number,
    input: UpdatePaymentDetailDto,
  ): Promise<PaymentDetail> {
    const existing = await this.findOne(id);
    const merged = this.paymentDetailRepository.merge(existing, input as any);
    await this.paymentDetailRepository.save(merged);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    await this.paymentDetailRepository.remove(existing);
  }
}
