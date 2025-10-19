import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';

@Entity('tien_trinh_hoc_tap')
export class LearningProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  user_id: number;

  @Column({ nullable: true })
  course_id: number;

  @Column({ type: 'date', nullable: true })
  lesson_date: Date;

  @Column({ type: 'text', nullable: true })
  lesson_content: string;

  @Column({ type: 'text', nullable: true })
  skills_learned: string;

  @Column({ type: 'text', nullable: true })
  homework: string;

  @Column({ type: 'text', nullable: true })
  coach_notes: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.learning_progress)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Course, (course) => course.learning_progress)
  @JoinColumn({ name: 'course_id' })
  course: Course;
}
