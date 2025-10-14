import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from '../../events/entities/event.entity';
import { User } from '../../users/entities/user.entity';

@Entity('event_registrations')
export class EventRegistration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  event_id: number;

  @Column({ nullable: true })
  user_id: number;

  @CreateDateColumn()
  registration_date: Date;

  @Column({
    type: 'enum',
    enum: ['paid', 'pending', 'free'],
    default: 'pending',
  })
  payment_status: 'paid' | 'pending' | 'free';

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Event, (event) => event.event_registrations)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => User, (user) => user.event_registrations)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
