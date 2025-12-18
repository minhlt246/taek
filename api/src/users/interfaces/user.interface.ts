import { User } from '../entities/user.entity';

export interface IUserService {
  create(createUserDto: any): Promise<User>;
  findAll(
    page?: number,
    limit?: number,
  ): Promise<{
    docs: User[];
    totalDocs: number;
    limit: number;
    page: number;
    totalPages: number;
  }>;
  findOne(id: number): Promise<User>;
  findByEmail(email: string): Promise<User>;
  update(id: number, updateUserDto: any): Promise<User>;
  remove(id: number): Promise<void>;
}

export interface IUserRepository {
  create(user: Partial<User>): Promise<User>;
  findAll(): Promise<User[]>;
  findOne(id: number): Promise<User>;
  findByEmail(email: string): Promise<User>;
  update(id: number, user: Partial<User>): Promise<User>;
  remove(id: number): Promise<void>;
}
