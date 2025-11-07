import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ContactMessagesService } from './contact-messages.service';
import { CreateContactMessageDto, UpdateContactMessageDto } from './dto';

@Controller('contact-messages')
export class ContactMessagesController {
  constructor(
    private readonly contactMessagesService: ContactMessagesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createContactMessageDto: CreateContactMessageDto) {
    const message = await this.contactMessagesService.create(createContactMessageDto);
    return {
      success: true,
      message: 'Contact message created successfully',
      data: message,
    };
  }

  @Get()
  async findAll() {
    const messages = await this.contactMessagesService.findAll();
    return messages; // Return array directly for frontend compatibility
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const message = await this.contactMessagesService.findOne(id);
    return message; // Return object directly for frontend compatibility
  }

  @Get('status/:status')
  async findByStatus(@Param('status') status: string) {
    const messages = await this.contactMessagesService.findByStatus(status);
    return messages; // Return array directly for frontend compatibility
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContactMessageDto: UpdateContactMessageDto,
  ) {
    const message = await this.contactMessagesService.update(id, updateContactMessageDto);
    return {
      success: true,
      message: 'Contact message updated successfully',
      data: message,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.contactMessagesService.remove(id);
    return {
      success: true,
      message: 'Contact message deleted successfully',
    };
  }
}
