import { Payment } from '../entities/payment.entity';

export interface IPaymentService {
  create(createPaymentDto: any): Promise<Payment>;
  findAll(): Promise<Payment[]>;
  findOne(id: number): Promise<Payment>;
  findByUser(user_id: number): Promise<Payment[]>;
  findByStatus(status: string): Promise<Payment[]>;
  findByMonthYear(month: number, year: number): Promise<Payment[]>;
  update(id: number, updatePaymentDto: any): Promise<Payment>;
  remove(id: number): Promise<void>;
}

export interface IPaymentRepository {
  create(payment: Partial<Payment>): Promise<Payment>;
  findAll(): Promise<Payment[]>;
  findOne(id: number): Promise<Payment>;
  findByUser(user_id: number): Promise<Payment[]>;
  findByStatus(status: string): Promise<Payment[]>;
  findByMonthYear(month: number, year: number): Promise<Payment[]>;
  update(id: number, payment: Partial<Payment>): Promise<Payment>;
  remove(id: number): Promise<void>;
}
