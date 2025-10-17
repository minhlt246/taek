import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(input: CreateNotificationDto): Promise<Notification> {
    const entity: Notification = this.notificationRepository.create({
      ...input,
      published_at: input.published_at
        ? (new Date(input.published_at) as any)
        : undefined,
      expires_at: input.expires_at
        ? (new Date(input.expires_at) as any)
        : undefined,
    } as DeepPartial<Notification>);
    return await this.notificationRepository.save(entity);
  }

  async findAll(): Promise<Notification[]> {
    return await this.notificationRepository.find({
      relations: { club: true },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Notification> {
    const item = await this.notificationRepository.findOne({
      where: { id },
      relations: { club: true },
    });
    if (!item)
      throw new NotFoundException(`Notification with ID ${id} not found`);
    return item;
  }

  async findByClub(club_id: number): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { club_id },
      relations: { club: true },
      order: { created_at: 'DESC' },
    });
  }

  async findByType(type: string): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { type: type as any },
      relations: { club: true },
      order: { created_at: 'DESC' },
    });
  }

  async update(
    id: number,
    input: UpdateNotificationDto,
  ): Promise<Notification> {
    const existing = await this.findOne(id);
    const merged = this.notificationRepository.merge(existing, {
      ...input,
      published_at: input.published_at
        ? (new Date(input.published_at) as any)
        : existing.published_at,
      expires_at: input.expires_at
        ? (new Date(input.expires_at) as any)
        : existing.expires_at,
    } as any);
    await this.notificationRepository.save(merged);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    await this.notificationRepository.remove(existing);
  }
}
