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
  Query,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createEventDto: CreateEventDto) {
    const event = await this.eventsService.create(createEventDto);
    return {
      success: true,
      message: 'Event created successfully',
      data: event,
    };
  }

  @Get()
  async findAll(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('club_id') club_id?: string,
  ) {
    let events;
    if (type) {
      events = await this.eventsService.findByType(type);
    } else if (status) {
      events = await this.eventsService.findByStatus(status);
    } else if (club_id) {
      events = await this.eventsService.findByClub(parseInt(club_id));
    } else {
      events = await this.eventsService.findAll();
    }
    return events; // Return array directly for frontend compatibility
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const event = await this.eventsService.findOne(id);
    return event; // Return object directly for frontend compatibility
  }

  @Get('club/:club_id')
  async findByClub(@Param('club_id', ParseIntPipe) club_id: number) {
    const events = await this.eventsService.findByClub(club_id);
    return events; // Return array directly for frontend compatibility
  }

  @Get('type/:event_type')
  async findByType(@Param('event_type') event_type: string) {
    const events = await this.eventsService.findByType(event_type);
    return events; // Return array directly for frontend compatibility
  }

  @Get('status/:status')
  async findByStatus(@Param('status') status: string) {
    const events = await this.eventsService.findByStatus(status);
    return events; // Return array directly for frontend compatibility
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    const event = await this.eventsService.update(id, updateEventDto);
    return {
      success: true,
      message: 'Event updated successfully',
      data: event,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.eventsService.remove(id);
    return {
      success: true,
      message: 'Event deleted successfully',
    };
  }
}
