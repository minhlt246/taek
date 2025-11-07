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
import { Branch } from '../../branches/entities/branch.entity';
import { BeltLevel } from '../../belt-levels/entities/belt-level.entity';
import { Course } from '../../courses/entities/course.entity';
import { BeltPromotion } from '../../belt-promotions/entities/belt-promotion.entity';
import { StudentEvaluation } from '../../student-evaluations/entities/student-evaluation.entity';
import { Feedback } from '../../feedbacks/entities/feedback.entity';
// import { BeltTest } from '../../belt-tests/entities/belt-test.entity';

@Entity('huan_luyen_vien')
export class Coach {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, nullable: true })
  coach_code: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255, nullable: true })
  photo_url: string;

  @Column({ type: 'text', nullable: true })
  images: string;

  @Column({ length: 15, nullable: true })
  phone: string;

  @Column({ length: 100, unique: true, nullable: true })
  email: string;

  @Column({ length: 255, nullable: true })
  password: string;

  @Column({
    type: 'enum',
    enum: ['head_coach', 'main_manager', 'assistant_manager', 'assistant'],
    default: 'assistant',
  })
  role: 'head_coach' | 'main_manager' | 'assistant_manager' | 'assistant';

  @Column({ nullable: true })
  belt_level_id: number;

  @Column({ nullable: true })
  experience_years: number;

  @Column({ length: 100, nullable: true })
  specialization: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  club_id: number;

  @Column({ nullable: true })
  branch_id: number;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Club, (club) => club.coaches)
  @JoinColumn({ name: 'club_id' })
  club: Club;

  @ManyToOne(() => Branch, (branch) => branch.coaches)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ManyToOne(() => BeltLevel, (beltLevel) => beltLevel.coaches)
  @JoinColumn({ name: 'belt_level_id' })
  belt_level: BeltLevel;

  @OneToMany(() => Course, (course) => course.coach)
  courses: Course[];

  @OneToMany(() => BeltPromotion, (promotion) => promotion.coach)
  belt_promotions: BeltPromotion[];

  @OneToMany(() => StudentEvaluation, (evaluation) => evaluation.coach)
  student_evaluations: StudentEvaluation[];

  @OneToMany(() => Feedback, (feedback) => feedback.coach)
  feedbacks: Feedback[];

  // @OneToMany(() => BeltTest, (test) => test.examiner)
  // belt_tests: BeltTest[];
}
