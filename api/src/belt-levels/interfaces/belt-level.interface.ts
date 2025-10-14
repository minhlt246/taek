import { BeltLevel } from '../entities/belt-level.entity';

export interface IBeltLevelService {
  create(createBeltLevelDto: any): Promise<BeltLevel>;
  findAll(): Promise<BeltLevel[]>;
  findOne(id: number): Promise<BeltLevel>;
  findByName(name: string): Promise<BeltLevel>;
  update(id: number, updateBeltLevelDto: any): Promise<BeltLevel>;
  remove(id: number): Promise<void>;
}

export interface IBeltLevelRepository {
  create(beltLevel: Partial<BeltLevel>): Promise<BeltLevel>;
  findAll(): Promise<BeltLevel[]>;
  findOne(id: number): Promise<BeltLevel>;
  findByName(name: string): Promise<BeltLevel>;
  update(id: number, beltLevel: Partial<BeltLevel>): Promise<BeltLevel>;
  remove(id: number): Promise<void>;
}
