import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BeltLevel } from '../../belt-levels/entities/belt-level.entity';

@Entity('chung_chi')
export class Certificate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  user_id: number;

  @Column({ nullable: true })
  belt_level_id: number;

  @Column({ length: 50, unique: true })
  certificate_number: string;

  @Column({ type: 'date', nullable: true })
  issue_date: Date;

  @Column({ type: 'date', nullable: true })
  expiry_date: Date;

  @Column({ length: 100, nullable: true })
  issued_by: string;

  @Column({ length: 255, nullable: true })
  certificate_image_url: string;

  @Column({ default: true })
  is_valid: boolean;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.certificates)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => BeltLevel, (beltLevel) => beltLevel.certificates)
  @JoinColumn({ name: 'belt_level_id' })
  belt_level: BeltLevel;
}
