import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Club } from '../../clubs/entities/club.entity';
import { Branch } from '../../branches/entities/branch.entity';

@Entity('thu_vien')
export class Media {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 500 })
  file_url: string;

  @Column({
    type: 'enum',
    enum: ['image', 'video'],
    default: 'image',
  })
  file_type: 'image' | 'video';

  @Column({ length: 100, nullable: true })
  mime_type: string;

  @Column({ type: 'bigint', nullable: true, comment: 'File size in bytes' })
  file_size: number;

  @Column({ nullable: true })
  club_id: number;

  @Column({ nullable: true })
  branch_id: number;

  @Column({ nullable: true, comment: 'User ID who uploaded the media' })
  created_by: number;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Club, { nullable: true })
  @JoinColumn({ name: 'club_id' })
  club: Club;

  @ManyToOne(() => Branch, { nullable: true })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;
}

