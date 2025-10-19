import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Club } from '../../clubs/entities/club.entity';
import { User } from '../../users/entities/user.entity';
import { Coach } from '../../coaches/entities/coach.entity';
import { Course } from '../../courses/entities/course.entity';
import { BranchManager } from './branch-manager.entity';
import { BranchAssistant } from './branch-assistant.entity';

@Entity('chi_nhanh')
export class Branch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'club_id' })
  club_id: number;

  @Column({ length: 20, unique: true })
  branch_code: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255, nullable: true })
  address: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Club, (club) => club.branches)
  @JoinColumn({ name: 'club_id' })
  club: Club;

  @OneToMany(() => User, (user) => user.chi_nhanh)
  users: User[];

  @OneToMany(() => Coach, (coach) => coach.branch)
  coaches: Coach[];

  @OneToMany(() => Course, (course) => course.branch)
  courses: Course[];

  @OneToMany(() => BranchManager, (manager) => manager.branch)
  managers: BranchManager[];

  @OneToMany(() => BranchAssistant, (assistant) => assistant.branch)
  assistants: BranchAssistant[];
}
