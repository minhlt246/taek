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

@Entity('tro_giang_chi_nhanh')
@Unique(['branch_id', 'assistant_id'])
export class BranchAssistant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'branch_id' })
  branch_id: number;

  @Column({ name: 'assistant_id' })
  assistant_id: number;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  assigned_at: Date;

  // Relations
  @ManyToOne(() => Branch, (branch) => branch.assistants)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ManyToOne(() => Coach, (coach) => coach.id)
  @JoinColumn({ name: 'assistant_id' })
  assistant: Coach;
}
