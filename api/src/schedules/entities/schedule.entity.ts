import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Course } from '../../courses/entities/course.entity';

@Entity('lich_hoc')
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'course_id', nullable: true })
  courseId: number;

  @Column({ name: 'day_of_week', type: 'varchar', length: 255 })
  dayOfWeek: string;

  @Column({ name: 'start_time', type: 'time', nullable: true })
  startTime: string;

  @Column({ name: 'end_time', type: 'time', nullable: true })
  endTime: string;

  @Column({ length: 100, nullable: true })
  location: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Course, (course) => course.schedules)
  @JoinColumn({ name: 'course_id' })
  course: Course;
}
