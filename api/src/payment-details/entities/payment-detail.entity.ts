import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Payment } from '../../payments/entities/payment.entity';
import { TuitionPackage } from '../../tuition-packages/entities/tuition-package.entity';

@Entity('payment_details')
export class PaymentDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  payment_id: number;

  @Column({ nullable: true })
  tuition_package_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  final_amount: number;

  @Column({
    type: 'enum',
    enum: ['cash', 'bank_transfer', 'card', 'other'],
    default: 'cash',
  })
  payment_method: 'cash' | 'bank_transfer' | 'card' | 'other';

  @Column({ length: 100, nullable: true })
  transaction_id: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Payment, (payment) => payment.payment_details)
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;

  @ManyToOne(
    () => TuitionPackage,
    (tuitionPackage) => tuitionPackage.payment_details,
  )
  @JoinColumn({ name: 'tuition_package_id' })
  tuition_package: TuitionPackage;
}
