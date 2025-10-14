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
import { BeltLevel } from '../../belt-levels/entities/belt-level.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { News } from '../../news/entities/news.entity';
import { BeltPromotion } from '../../belt-promotions/entities/belt-promotion.entity';
import { TestRegistration } from '../../test-registrations/entities/test-registration.entity';
import { Certificate } from '../../certificates/entities/certificate.entity';
import { StudentEvaluation } from '../../student-evaluations/entities/student-evaluation.entity';
import { Feedback } from '../../feedbacks/entities/feedback.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { LearningProgress } from '../../learning-progress/entities/learning-progress.entity';
import { EventRegistration } from '../../event-registrations/entities/event-registration.entity';
import { StudentParent } from '../../student-parents/entities/student-parent.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'student', 'HLV'],
    default: 'student',
  })
  role: 'admin' | 'student' | 'HLV';

  @Column({ length: 20, unique: true, nullable: true })
  student_code: string;

  @Column({ nullable: true })
  belt_level_id: number;

  @Column({ nullable: true })
  club_id: number;

  @Column({ length: 15, nullable: true })
  phone: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({
    type: 'enum',
    enum: ['male', 'female', 'other'],
    nullable: true,
  })
  gender: 'male' | 'female' | 'other';

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Club, (club) => club.users)
  @JoinColumn({ name: 'club_id' })
  club: Club;

  @ManyToOne(() => BeltLevel, (beltLevel) => beltLevel.users)
  @JoinColumn({ name: 'belt_level_id' })
  belt_level: BeltLevel;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.user)
  enrollments: Enrollment[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @OneToMany(() => News, (news) => news.author)
  news: News[];

  @OneToMany(() => BeltPromotion, (promotion) => promotion.user)
  belt_promotions: BeltPromotion[];

  @OneToMany(() => TestRegistration, (registration) => registration.user)
  test_registrations: TestRegistration[];

  @OneToMany(() => Certificate, (certificate) => certificate.user)
  certificates: Certificate[];

  @OneToMany(() => StudentEvaluation, (evaluation) => evaluation.user)
  student_evaluations: StudentEvaluation[];

  @OneToMany(() => Feedback, (feedback) => feedback.user)
  feedbacks: Feedback[];

  @OneToMany(() => Attendance, (attendance) => attendance.user)
  attendance: Attendance[];

  @OneToMany(() => LearningProgress, (progress) => progress.user)
  learning_progress: LearningProgress[];

  @OneToMany(() => EventRegistration, (registration) => registration.user)
  event_registrations: EventRegistration[];

  @OneToMany(() => StudentParent, (studentParent) => studentParent.student)
  student_parents: StudentParent[];
}
