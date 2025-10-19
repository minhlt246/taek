import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Parent } from '../../parents/entities/parent.entity';

@Entity('hoc_vien_phu_huynh')
export class StudentParent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  student_id: number;

  @Column({ nullable: true })
  parent_id: number;

  @Column({ default: false })
  is_primary: boolean;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.student_parents)
  @JoinColumn({ name: 'student_id' })
  student: User;

  @ManyToOne(() => Parent, (parent) => parent.student_parents)
  @JoinColumn({ name: 'parent_id' })
  parent: Parent;
}
