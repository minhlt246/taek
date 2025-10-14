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

@Entity('student_evaluations')
export class StudentEvaluation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  user_id: number;

  @Column({ nullable: true })
  coach_id: number;

  @Column({ nullable: true })
  course_id: number;

  @Column({ type: 'date', nullable: true })
  evaluation_date: Date;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  technique_score: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  attitude_score: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  progress_score: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  overall_score: number;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.student_evaluations)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Coach, (coach) => coach.student_evaluations)
  @JoinColumn({ name: 'coach_id' })
  coach: Coach;

  @ManyToOne(() => Course, (course) => course.student_evaluations)
  @JoinColumn({ name: 'course_id' })
  course: Course;
}
