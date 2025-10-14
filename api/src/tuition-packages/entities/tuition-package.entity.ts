import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Club } from '../../clubs/entities/club.entity';
import { PaymentDetail } from '../../payment-details/entities/payment-detail.entity';

@Entity('tuition_packages')
export class TuitionPackage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  duration_months: number;

  @Column({ nullable: true })
  classes_per_week: number;

  @Column({ nullable: true })
  club_id: number;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Club, (club) => club.tuition_packages)
  @JoinColumn({ name: 'club_id' })
  club: Club;

  @OneToMany(() => PaymentDetail, (detail) => detail.tuition_package)
  payment_details: PaymentDetail[];
}
