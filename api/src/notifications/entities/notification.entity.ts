import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Club } from '../../clubs/entities/club.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({
    type: 'enum',
    enum: ['general', 'payment', 'event', 'course', 'promotion'],
    default: 'general',
  })
  type: 'general' | 'payment' | 'event' | 'course' | 'promotion';

  @Column({
    type: 'enum',
    enum: ['all', 'students', 'coaches', 'admins', 'HLV'],
    default: 'all',
  })
  target_audience: 'all' | 'students' | 'coaches' | 'admins' | 'HLV';

  @Column({ nullable: true })
  club_id: number;

  @Column({ default: false })
  is_urgent: boolean;

  @Column({ type: 'datetime', nullable: true })
  published_at: Date;

  @Column({ type: 'datetime', nullable: true })
  expires_at: Date;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Club, (club) => club.notifications)
  @JoinColumn({ name: 'club_id' })
  club: Club;
}
