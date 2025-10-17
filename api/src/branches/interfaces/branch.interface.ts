import { Branch, BranchManager, BranchAssistant } from '../entities';

export interface IBranchService {
  create(createBranchDto: any): Promise<Branch>;
  findAll(): Promise<Branch[]>;
  findOne(id: number): Promise<Branch>;
  findByClub(club_id: number): Promise<Branch[]>;
  findByCode(branch_code: string): Promise<Branch>;
  update(id: number, updateBranchDto: any): Promise<Branch>;
  remove(id: number): Promise<void>;

  // Manager methods
  assignManager(
    branch_id: number,
    assignManagerDto: any,
  ): Promise<BranchManager>;
  removeManager(branch_id: number, manager_id: number): Promise<void>;
  getBranchManagers(branch_id: number): Promise<BranchManager[]>;
  getManagerBranches(manager_id: number): Promise<BranchManager[]>;

  // Assistant methods
  assignAssistant(
    branch_id: number,
    assignAssistantDto: any,
  ): Promise<BranchAssistant>;
  removeAssistant(branch_id: number, assistant_id: number): Promise<void>;
  getBranchAssistants(branch_id: number): Promise<BranchAssistant[]>;
  getAssistantBranches(assistant_id: number): Promise<BranchAssistant[]>;
}

export interface IBranchRepository {
  create(branch: Partial<Branch>): Promise<Branch>;
  findAll(): Promise<Branch[]>;
  findOne(id: number): Promise<Branch>;
  findByClub(club_id: number): Promise<Branch[]>;
  findByCode(branch_code: string): Promise<Branch>;
  update(id: number, branch: Partial<Branch>): Promise<Branch>;
  remove(id: number): Promise<void>;
}
