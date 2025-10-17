import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Branch } from './branch.entity';
import { Coach } from '../../coaches/entities/coach.entity';

@Entity('branch_managers')
@Unique(['branch_id', 'manager_id'])
export class BranchManager {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'branch_id' })
  branch_id: number;

  @Column({ name: 'manager_id' })
  manager_id: number;

  @Column({
    type: 'enum',
    enum: ['main_manager', 'assistant_manager'],
    default: 'main_manager',
  })
  role: 'main_manager' | 'assistant_manager';

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  assigned_at: Date;

  // Relations
  @ManyToOne(() => Branch, (branch) => branch.managers)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ManyToOne(() => Coach, (coach) => coach.id)
  @JoinColumn({ name: 'manager_id' })
  manager: Coach;
}
