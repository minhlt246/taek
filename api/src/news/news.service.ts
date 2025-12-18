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

  async findAll(
    page: number = 1,
    limit: number = 25,
  ): Promise<{
    docs: News[];
    totalDocs: number;
    limit: number;
    page: number;
    totalPages: number;
  }> {
    // Get total count
    const totalDocs = await this.newsRepository.count();

    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(totalDocs / limit);

    const docs = await this.newsRepository
      .createQueryBuilder('news')
      .leftJoin('news.author', 'author')
      .orderBy('news.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .addSelect([
        'author.id',
        'author.ho_va_ten',
        'author.ngay_thang_nam_sinh',
        'author.ma_hoi_vien',
        'author.ma_clb',
        'author.ma_don_vi',
        'author.quyen_so',
        'author.cap_dai_id',
        'author.gioi_tinh',
        'author.email',
        'author.phone',
        'author.address',
        'author.emergency_contact_name',
        'author.emergency_contact_phone',
        'author.active_status',
        'author.profile_image_url',
        'author.password',
        'author.created_at',
        'author.updated_at',
      ])
      .getMany();

    return {
      docs,
      totalDocs,
      limit,
      page,
      totalPages,
    };
  }

  async findOne(id: number): Promise<News> {
    const news = await this.newsRepository
      .createQueryBuilder('news')
      .leftJoin('news.author', 'author')
      .where('news.id = :id', { id })
      .addSelect([
        'author.id',
        'author.ho_va_ten',
        'author.ngay_thang_nam_sinh',
        'author.ma_hoi_vien',
        'author.ma_clb',
        'author.ma_don_vi',
        'author.quyen_so',
        'author.cap_dai_id',
        'author.gioi_tinh',
        'author.email',
        'author.phone',
        'author.address',
        'author.emergency_contact_name',
        'author.emergency_contact_phone',
        'author.active_status',
        'author.profile_image_url',
        'author.password',
        'author.created_at',
        'author.updated_at',
      ])
      .getOne();

    if (!news) {
      throw new NotFoundException(`News with ID ${id} not found`);
    }

    return news;
  }

  async findBySlug(slug: string): Promise<News> {
    const news = await this.newsRepository
      .createQueryBuilder('news')
      .leftJoin('news.author', 'author')
      .where('news.slug = :slug', { slug })
      .addSelect([
        'author.id',
        'author.ho_va_ten',
        'author.ngay_thang_nam_sinh',
        'author.ma_hoi_vien',
        'author.ma_clb',
        'author.ma_don_vi',
        'author.quyen_so',
        'author.cap_dai_id',
        'author.gioi_tinh',
        'author.email',
        'author.phone',
        'author.address',
        'author.emergency_contact_name',
        'author.emergency_contact_phone',
        'author.active_status',
        'author.profile_image_url',
        'author.password',
        'author.created_at',
        'author.updated_at',
      ])
      .getOne();

    if (!news) {
      throw new NotFoundException(`News with slug ${slug} not found`);
    }

    return news;
  }

  async findByAuthor(author_id: number): Promise<News[]> {
    return await this.newsRepository
      .createQueryBuilder('news')
      .leftJoin('news.author', 'author')
      .where('news.author_id = :author_id', { author_id })
      .orderBy('news.created_at', 'DESC')
      .addSelect([
        'author.id',
        'author.ho_va_ten',
        'author.ngay_thang_nam_sinh',
        'author.ma_hoi_vien',
        'author.ma_clb',
        'author.ma_don_vi',
        'author.quyen_so',
        'author.cap_dai_id',
        'author.gioi_tinh',
        'author.email',
        'author.phone',
        'author.address',
        'author.emergency_contact_name',
        'author.emergency_contact_phone',
        'author.active_status',
        'author.profile_image_url',
        'author.password',
        'author.created_at',
        'author.updated_at',
      ])
      .getMany();
  }

  async findPublished(): Promise<News[]> {
    const results = await this.newsRepository
      .createQueryBuilder('news')
      .leftJoin('vo_sinh', 'author', 'author.id = news.author_id')
      .where('news.is_published = :isPublished', { isPublished: true })
      .orderBy('news.published_at', 'DESC')
      .select([
        'news.id',
        'news.title',
        'news.slug',
        'news.content',
        'news.excerpt',
        'news.author_id',
        'news.featured_image_url',
        'news.images',
        'news.is_published',
        'news.published_at',
        'news.created_at',
        'news.updated_at',
        'author.id',
        'author.ho_va_ten',
        'author.ngay_thang_nam_sinh',
        'author.ma_hoi_vien',
        'author.ma_clb',
        'author.ma_don_vi',
        'author.quyen_so',
        'author.cap_dai_id',
        'author.gioi_tinh',
        'author.email',
        'author.phone',
        'author.address',
        'author.emergency_contact_name',
        'author.emergency_contact_phone',
        'author.active_status',
        'author.profile_image_url',
        'author.password',
        'author.created_at',
        'author.updated_at',
      ])
      .getRawAndEntities();

    // Map raw results to entities with author
    return results.entities.map((news, index) => {
      const raw = results.raw[index];
      if (raw && raw.author_id) {
        news.author = {
          id: raw.author_id,
          ho_va_ten: raw.author_ho_va_ten,
          ngay_thang_nam_sinh: raw.author_ngay_thang_nam_sinh,
          ma_hoi_vien: raw.author_ma_hoi_vien,
          ma_clb: raw.author_ma_clb,
          ma_don_vi: raw.author_ma_don_vi,
          quyen_so: raw.author_quyen_so,
          cap_dai_id: raw.author_cap_dai_id,
          gioi_tinh: raw.author_gioi_tinh,
          email: raw.author_email,
          phone: raw.author_phone,
          address: raw.author_address,
          emergency_contact_name: raw.author_emergency_contact_name,
          emergency_contact_phone: raw.author_emergency_contact_phone,
          active_status: raw.author_active_status,
          profile_image_url: raw.author_profile_image_url,
          password: raw.author_password,
          created_at: raw.author_created_at,
          updated_at: raw.author_updated_at,
        } as any;
      }
      return news;
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
