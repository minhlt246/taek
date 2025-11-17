import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BeltLevel } from '../../belt-levels/entities/belt-level.entity';
import { TestExam } from './test-exam.entity';

@Entity('dang_ky_thi')
export class TestRegistration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  test_id?: number;

  @Column({ nullable: true })
  user_id?: number;

  @Column({ nullable: true })
  current_belt_id?: number;

  @Column({ nullable: true })
  target_belt_id?: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  registration_date: Date;

  @Column({
    type: 'enum',
    enum: ['paid', 'pending'],
    default: 'pending',
  })
  payment_status: 'paid' | 'pending';

  @Column({
    type: 'enum',
    enum: ['pass', 'fail', 'pending'],
    default: 'pending',
  })
  test_result: 'pass' | 'fail' | 'pending';

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score?: number;

  @Column({ type: 'text', nullable: true })
  examiner_notes?: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => TestExam, (testExam) => testExam.registrations)
  @JoinColumn({ name: 'test_id' })
  test_exam: TestExam;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => BeltLevel)
  @JoinColumn({ name: 'current_belt_id' })
  current_belt: BeltLevel;

  @ManyToOne(() => BeltLevel)
  @JoinColumn({ name: 'target_belt_id' })
  target_belt: BeltLevel;
}

