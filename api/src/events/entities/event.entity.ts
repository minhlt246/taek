import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Club } from '../../clubs/entities/club.entity';
import { EventRegistration } from '../../event-registrations/entities/event-registration.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['tournament', 'seminar', 'graduation', 'social', 'other'],
    default: 'other',
  })
  event_type: 'tournament' | 'seminar' | 'graduation' | 'social' | 'other';

  @Column({ type: 'datetime', nullable: true })
  start_date: Date;

  @Column({ type: 'datetime', nullable: true })
  end_date: Date;

  @Column({ length: 255, nullable: true })
  location: string;

  @Column({ nullable: true })
  club_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  registration_fee: number;

  @Column({ nullable: true })
  max_participants: number;

  @Column({ default: 0 })
  current_participants: number;

  @Column({
    type: 'enum',
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming',
  })
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Club, (club) => club.events)
  @JoinColumn({ name: 'club_id' })
  club: Club;

  @OneToMany(() => EventRegistration, (registration) => registration.event)
  event_registrations: EventRegistration[];
}
