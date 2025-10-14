import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from './entities/news.entity';
import { CreateNewsDto, UpdateNewsDto } from './dto';
import { INewsService } from './interfaces';

@Injectable()
export class NewsService implements INewsService {
  constructor(
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
  ) {}

  async create(createNewsDto: CreateNewsDto): Promise<News> {
    // Check if slug already exists
    const existingNews = await this.newsRepository.findOne({
      where: { slug: createNewsDto.slug },
    });

    if (existingNews) {
      throw new ConflictException('News slug already exists');
    }

    const news = this.newsRepository.create(createNewsDto);
    return await this.newsRepository.save(news);
  }

  async findAll(): Promise<News[]> {
    return await this.newsRepository.find({
      relations: ['author'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<News> {
    const news = await this.newsRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!news) {
      throw new NotFoundException(`News with ID ${id} not found`);
    }

    return news;
  }

  async findBySlug(slug: string): Promise<News> {
    const news = await this.newsRepository.findOne({
      where: { slug },
      relations: ['author'],
    });

    if (!news) {
      throw new NotFoundException(`News with slug ${slug} not found`);
    }

    return news;
  }

  async findByAuthor(author_id: number): Promise<News[]> {
    return await this.newsRepository.find({
      where: { author_id },
      relations: ['author'],
      order: { created_at: 'DESC' },
    });
  }

  async findPublished(): Promise<News[]> {
    return await this.newsRepository.find({
      where: { is_published: true },
      relations: ['author'],
      order: { published_at: 'DESC' },
    });
  }

  async update(id: number, updateNewsDto: UpdateNewsDto): Promise<News> {
    const news = await this.findOne(id);

    // Check if slug already exists (if being updated)
    if (updateNewsDto.slug && updateNewsDto.slug !== news.slug) {
      const existingNews = await this.newsRepository.findOne({
        where: { slug: updateNewsDto.slug },
      });

      if (existingNews) {
        throw new ConflictException('News slug already exists');
      }
    }

    await this.newsRepository.update(id, updateNewsDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const news = await this.findOne(id);
    await this.newsRepository.remove(news);
  }
}
