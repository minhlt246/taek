import { ContactMessage } from '../entities/contact-message.entity';

export interface IContactMessageService {
  create(createContactMessageDto: any): Promise<ContactMessage>;
  findAll(): Promise<ContactMessage[]>;
  findOne(id: number): Promise<ContactMessage>;
  findByStatus(status: string): Promise<ContactMessage[]>;
  update(id: number, updateContactMessageDto: any): Promise<ContactMessage>;
  remove(id: number): Promise<void>;
}

export interface IContactMessageRepository {
  create(contactMessage: Partial<ContactMessage>): Promise<ContactMessage>;
  findAll(): Promise<ContactMessage[]>;
  findOne(id: number): Promise<ContactMessage>;
  findByStatus(status: string): Promise<ContactMessage[]>;
  update(
    id: number,
    contactMessage: Partial<ContactMessage>,
  ): Promise<ContactMessage>;
  remove(id: number): Promise<void>;
}
