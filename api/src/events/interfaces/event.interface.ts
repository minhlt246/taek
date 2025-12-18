import { Event } from '../entities/event.entity';

export interface IEventService {
  create(createEventDto: any): Promise<Event>;
  findAll(
    page?: number,
    limit?: number,
  ): Promise<{
    docs: Event[];
    totalDocs: number;
    limit: number;
    page: number;
    totalPages: number;
  }>;
  findOne(id: number): Promise<Event>;
  findByClub(club_id: number): Promise<Event[]>;
  findByType(event_type: string): Promise<Event[]>;
  findByStatus(status: string): Promise<Event[]>;
  update(id: number, updateEventDto: any): Promise<Event>;
  remove(id: number): Promise<void>;
}

export interface IEventRepository {
  create(event: Partial<Event>): Promise<Event>;
  findAll(): Promise<Event[]>;
  findOne(id: number): Promise<Event>;
  findByClub(club_id: number): Promise<Event[]>;
  findByType(event_type: string): Promise<Event[]>;
  findByStatus(status: string): Promise<Event[]>;
  update(id: number, event: Partial<Event>): Promise<Event>;
  remove(id: number): Promise<void>;
}
