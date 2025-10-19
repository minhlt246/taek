import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Coach } from '../../coaches/entities/coach.entity';
import { Course } from '../../courses/entities/course.entity';

@Entity('phan_hoi')
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  user_id: number;

  @Column({ nullable: true })
  course_id: number;

  @Column({ nullable: true })
  coach_id: number;

  @Column({ type: 'int', nullable: true })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({
    type: 'enum',
    enum: ['course', 'coach', 'facility', 'general'],
    default: 'general',
  })
  feedback_type: 'course' | 'coach' | 'facility' | 'general';

  @Column({ default: false })
  is_anonymous: boolean;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.feedbacks)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Course, (course) => course.feedbacks)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => Coach, (coach) => coach.feedbacks)
  @JoinColumn({ name: 'coach_id' })
  coach: Coach;
}
