import { Parent } from '../entities/parent.entity';

export interface IParentService {
  create(createParentDto: any): Promise<Parent>;
  findAll(): Promise<Parent[]>;
  findOne(id: number): Promise<Parent>;
  findByRelationship(relationship: string): Promise<Parent[]>;
  update(id: number, updateParentDto: any): Promise<Parent>;
  remove(id: number): Promise<void>;
}

export interface IParentRepository {
  create(parent: Partial<Parent>): Promise<Parent>;
  findAll(): Promise<Parent[]>;
  findOne(id: number): Promise<Parent>;
  findByRelationship(relationship: string): Promise<Parent[]>;
  update(id: number, parent: Partial<Parent>): Promise<Parent>;
  remove(id: number): Promise<void>;
}
