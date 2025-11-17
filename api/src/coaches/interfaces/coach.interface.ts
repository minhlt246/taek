import { Coach } from '../entities/coach.entity';

export interface ICoachService {
  create(createCoachDto: any): Promise<Coach>;
  findAll(): Promise<Coach[]>;
  findOne(id: number): Promise<Coach>;
  findByClub(club_id: number): Promise<Coach[]>;
  update(id: number, updateCoachDto: any): Promise<Coach>;
  remove(id: number): Promise<void>;
}

export interface ICoachRepository {
  create(coach: Partial<Coach>): Promise<Coach>;
  findAll(): Promise<Coach[]>;
  findOne(id: number): Promise<Coach>;
  findByClub(club_id: number): Promise<Coach[]>;
  update(id: number, coach: Partial<Coach>): Promise<Coach>;
  remove(id: number): Promise<void>;
}
