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
import { NewsService } from './news.service';
import { CreateNewsDto, UpdateNewsDto } from './dto';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createNewsDto: CreateNewsDto) {
    const news = await this.newsService.create(createNewsDto);
    return {
      success: true,
      message: 'News created successfully',
      data: news,
    };
  }

  @Get()
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 25;
    const result = await this.newsService.findAll(pageNum, limitNum);
    return result;
  }

  @Get('published')
  async findPublished() {
    const news = await this.newsService.findPublished();
    return news; // Return array directly for frontend compatibility
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const news = await this.newsService.findOne(id);
    return news; // Return object directly for frontend compatibility
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const news = await this.newsService.findBySlug(slug);
    return news; // Return object directly for frontend compatibility
  }

  @Get('author/:author_id')
  async findByAuthor(@Param('author_id', ParseIntPipe) author_id: number) {
    const news = await this.newsService.findByAuthor(author_id);
    return news; // Return array directly for frontend compatibility
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNewsDto: UpdateNewsDto,
  ) {
    const news = await this.newsService.update(id, updateNewsDto);
    return {
      success: true,
      message: 'News updated successfully',
      data: news,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.newsService.remove(id);
    return {
      success: true,
      message: 'News deleted successfully',
    };
  }
}
