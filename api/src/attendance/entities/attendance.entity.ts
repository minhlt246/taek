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

@Entity('diem_danh')
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  user_id: number;

  @Column({ nullable: true })
  course_id: number;

  @Column({ type: 'date', nullable: true })
  attendance_date: Date;

  @Column({
    type: 'enum',
    enum: ['present', 'absent', 'late', 'excused'],
    default: 'present',
  })
  status: 'present' | 'absent' | 'late' | 'excused';

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.attendance)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Course, (course) => course.attendance)
  @JoinColumn({ name: 'course_id' })
  course: Course;
}
