import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto, UpdateEventDto } from './dto';
import { IEventService } from './interfaces';

@Injectable()
export class EventsService implements IEventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const event = this.eventRepository.create(createEventDto);
    return await this.eventRepository.save(event);
  }

  async findAll(): Promise<Event[]> {
    return await this.eventRepository.find({
      relations: ['club'],
      order: { start_date: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['club'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async findByClub(club_id: number): Promise<Event[]> {
    return await this.eventRepository.find({
      where: { club_id },
      relations: ['club'],
      order: { start_date: 'ASC' },
    });
  }

  async findByType(event_type: string): Promise<Event[]> {
    return await this.eventRepository.find({
      where: { event_type: event_type as any },
      relations: ['club'],
      order: { start_date: 'ASC' },
    });
  }

  async findByStatus(status: string): Promise<Event[]> {
    return await this.eventRepository.find({
      where: { status: status as any },
      relations: ['club'],
      order: { start_date: 'ASC' },
    });
  }

  async update(id: number, updateEventDto: UpdateEventDto): Promise<Event> {
    await this.findOne(id);
    await this.eventRepository.update(id, updateEventDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const event = await this.findOne(id);
    await this.eventRepository.remove(event);
  }
}
