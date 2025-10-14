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
import { Coach } from '../../coaches/entities/coach.entity';

@Entity('belt_promotions')
export class BeltPromotion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  user_id: number;

  @Column({ nullable: true })
  from_belt_id: number;

  @Column({ nullable: true })
  to_belt_id: number;

  @Column({ type: 'date', nullable: true })
  promotion_date: Date;

  @Column({ nullable: true })
  coach_id: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  test_score: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.belt_promotions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => BeltLevel, (beltLevel) => beltLevel.from_promotions)
  @JoinColumn({ name: 'from_belt_id' })
  from_belt: BeltLevel;

  @ManyToOne(() => BeltLevel, (beltLevel) => beltLevel.to_promotions)
  @JoinColumn({ name: 'to_belt_id' })
  to_belt: BeltLevel;

  @ManyToOne(() => Coach, (coach) => coach.belt_promotions)
  @JoinColumn({ name: 'coach_id' })
  coach: Coach;
}
