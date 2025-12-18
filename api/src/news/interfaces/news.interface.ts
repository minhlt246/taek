import { News } from '../entities/news.entity';

export interface INewsService {
  create(createNewsDto: any): Promise<News>;
  findAll(
    page?: number,
    limit?: number,
  ): Promise<{
    docs: News[];
    totalDocs: number;
    limit: number;
    page: number;
    totalPages: number;
  }>;
  findOne(id: number): Promise<News>;
  findBySlug(slug: string): Promise<News>;
  findByAuthor(author_id: number): Promise<News[]>;
  findPublished(): Promise<News[]>;
  update(id: number, updateNewsDto: any): Promise<News>;
  remove(id: number): Promise<void>;
}

export interface INewsRepository {
  create(news: Partial<News>): Promise<News>;
  findAll(): Promise<News[]>;
  findOne(id: number): Promise<News>;
  findBySlug(slug: string): Promise<News>;
  findByAuthor(author_id: number): Promise<News[]>;
  findPublished(): Promise<News[]>;
  update(id: number, news: Partial<News>): Promise<News>;
  remove(id: number): Promise<void>;
}
