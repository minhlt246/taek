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
import { MediaService } from './media.service';
import { CreateMediaDto, UpdateMediaDto } from './dto';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createMediaDto: CreateMediaDto) {
    const media = await this.mediaService.create(createMediaDto);
    return {
      success: true,
      message: 'Media created successfully',
      data: media,
    };
  }

  @Get()
  async findAll(@Query('type') type?: 'image' | 'video') {
    if (type) {
      const media = await this.mediaService.findByType(type);
      return media; // Return array directly for frontend compatibility
    }
    const media = await this.mediaService.findAll();
    return media; // Return array directly for frontend compatibility
  }

  @Get('active')
  async findActive() {
    const media = await this.mediaService.findActive();
    return media; // Return array directly for frontend compatibility
  }

  @Get('type/:type')
  async findByType(@Param('type') type: 'image' | 'video') {
    const media = await this.mediaService.findByType(type);
    return media; // Return array directly for frontend compatibility
  }

  @Get('club/:club_id')
  async findByClub(@Param('club_id', ParseIntPipe) club_id: number) {
    const media = await this.mediaService.findByClub(club_id);
    return media; // Return array directly for frontend compatibility
  }

  @Get('branch/:branch_id')
  async findByBranch(@Param('branch_id', ParseIntPipe) branch_id: number) {
    const media = await this.mediaService.findByBranch(branch_id);
    return media; // Return array directly for frontend compatibility
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const media = await this.mediaService.findOne(id);
    return media; // Return object directly for frontend compatibility
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMediaDto: UpdateMediaDto,
  ) {
    const media = await this.mediaService.update(id, updateMediaDto);
    return {
      success: true,
      message: 'Media updated successfully',
      data: media,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.mediaService.remove(id);
    return {
      success: true,
      message: 'Media deleted successfully',
    };
  }
}

