import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from './entities/contact-message.entity';
import { CreateContactMessageDto, UpdateContactMessageDto } from './dto';
import { IContactMessageService } from './interfaces';

@Injectable()
export class ContactMessagesService implements IContactMessageService {
  constructor(
    @InjectRepository(ContactMessage)
    private readonly contactMessageRepository: Repository<ContactMessage>,
  ) {}

  async create(
    createContactMessageDto: CreateContactMessageDto,
  ): Promise<ContactMessage> {
    const contactMessage = this.contactMessageRepository.create(
      createContactMessageDto,
    );
    return await this.contactMessageRepository.save(contactMessage);
  }

  async findAll(): Promise<ContactMessage[]> {
    return await this.contactMessageRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<ContactMessage> {
    const contactMessage = await this.contactMessageRepository.findOne({
      where: { id },
    });

    if (!contactMessage) {
      throw new NotFoundException(`Contact message with ID ${id} not found`);
    }

    return contactMessage;
  }

  async findByStatus(status: string): Promise<ContactMessage[]> {
    return await this.contactMessageRepository.find({
      where: { status: status as any },
      order: { created_at: 'DESC' },
    });
  }

  async update(
    id: number,
    updateContactMessageDto: UpdateContactMessageDto,
  ): Promise<ContactMessage> {
    await this.findOne(id);
    await this.contactMessageRepository.update(id, updateContactMessageDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const contactMessage = await this.findOne(id);
    await this.contactMessageRepository.remove(contactMessage);
  }
}
