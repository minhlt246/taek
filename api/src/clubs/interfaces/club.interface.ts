import { Club } from '../entities/club.entity';

export interface IClubService {
  create(createClubDto: any): Promise<Club>;
  findAll(): Promise<Club[]>;
  findOne(id: number): Promise<Club>;
  findByCode(club_code: string): Promise<Club>;
  update(id: number, updateClubDto: any): Promise<Club>;
  remove(id: number): Promise<void>;
}

export interface IClubRepository {
  create(club: Partial<Club>): Promise<Club>;
  findAll(): Promise<Club[]>;
  findOne(id: number): Promise<Club>;
  findByCode(club_code: string): Promise<Club>;
  update(id: number, club: Partial<Club>): Promise<Club>;
  remove(id: number): Promise<void>;
}
