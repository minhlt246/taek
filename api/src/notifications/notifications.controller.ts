import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() input: CreateNotificationDto) {
    const notification = await this.notificationsService.create(input);
    return {
      success: true,
      message: 'Notification created successfully',
      data: notification,
    };
  }

  @Get()
  async findAll() {
    const notifications = await this.notificationsService.findAll();
    return notifications; // Return array directly for frontend compatibility
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const notification = await this.notificationsService.findOne(id);
    return notification; // Return object directly for frontend compatibility
  }

  @Get('club/:club_id')
  async findByClub(@Param('club_id', ParseIntPipe) club_id: number) {
    const notifications = await this.notificationsService.findByClub(club_id);
    return notifications; // Return array directly for frontend compatibility
  }

  @Get('type/:type')
  async findByType(@Param('type') type: string) {
    const notifications = await this.notificationsService.findByType(type);
    return notifications; // Return array directly for frontend compatibility
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdateNotificationDto,
  ) {
    const notification = await this.notificationsService.update(id, input);
    return {
      success: true,
      message: 'Notification updated successfully',
      data: notification,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.notificationsService.remove(id);
    return {
      success: true,
      message: 'Notification deleted successfully',
    };
  }
}
