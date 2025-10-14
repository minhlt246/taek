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
import { Coach } from '../../coaches/entities/coach.entity';
import { Club } from '../../clubs/entities/club.entity';
import { TestRegistration } from '../../test-registrations/entities/test-registration.entity';

@Entity('belt_tests')
export class BeltTest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  test_name: string;

  @Column({ type: 'date', nullable: true })
  test_date: Date;

  @Column({ length: 255, nullable: true })
  location: string;

  @Column({ nullable: true })
  examiner_id: number;

  @Column({ nullable: true })
  club_id: number;

  @Column({ nullable: true })
  max_participants: number;

  @Column({ type: 'date', nullable: true })
  registration_deadline: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  test_fee: number;

  @Column({
    type: 'enum',
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming',
  })
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Coach, (coach) => coach.belt_tests)
  @JoinColumn({ name: 'examiner_id' })
  examiner: Coach;

  @ManyToOne(() => Club, (club) => club.belt_tests)
  @JoinColumn({ name: 'club_id' })
  club: Club;

  @OneToMany(() => TestRegistration, (registration) => registration.test)
  test_registrations: TestRegistration[];
}
