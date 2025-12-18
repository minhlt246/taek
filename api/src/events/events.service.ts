import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
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
    // Validate date logic
    if (createEventDto.start_date && createEventDto.end_date) {
      const startDate = new Date(createEventDto.start_date);
      const endDate = new Date(createEventDto.end_date);

      if (startDate >= endDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    const event = this.eventRepository.create(createEventDto);
    return await this.eventRepository.save(event);
  }

  async findAll(
    page: number = 1,
    limit: number = 25,
  ): Promise<{
    docs: Event[];
    totalDocs: number;
    limit: number;
    page: number;
    totalPages: number;
  }> {
    // Get total count
    const totalDocs = await this.eventRepository.count();

    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(totalDocs / limit);

    const docs = await this.eventRepository.find({
      skip,
      take: limit,
      relations: ['club'],
      order: { start_date: 'ASC' },
    });

    return {
      docs,
      totalDocs,
      limit,
      page,
      totalPages,
    };
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
    const existingEvent = await this.findOne(id);

    // Validate date logic
    const startDate = updateEventDto.start_date
      ? new Date(updateEventDto.start_date)
      : existingEvent.start_date;
    const endDate = updateEventDto.end_date
      ? new Date(updateEventDto.end_date)
      : existingEvent.end_date;

    if (startDate && endDate && startDate >= endDate) {
      throw new BadRequestException('End date must be after start date');
    }

    await this.eventRepository.update(id, updateEventDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const event = await this.findOne(id);
    await this.eventRepository.remove(event);
  }
}
