import { StudentParent } from '../entities/student-parent.entity';

export interface IStudentParentService {
  create(createStudentParentDto: any): Promise<StudentParent>;
  findAll(): Promise<StudentParent[]>;
  findOne(id: number): Promise<StudentParent>;
  findByStudent(student_id: number): Promise<StudentParent[]>;
  findByParent(parent_id: number): Promise<StudentParent[]>;
  update(id: number, updateStudentParentDto: any): Promise<StudentParent>;
  remove(id: number): Promise<void>;
}

export interface IStudentParentRepository {
  create(studentParent: Partial<StudentParent>): Promise<StudentParent>;
  findAll(): Promise<StudentParent[]>;
  findOne(id: number): Promise<StudentParent>;
  findByStudent(student_id: number): Promise<StudentParent[]>;
  findByParent(parent_id: number): Promise<StudentParent[]>;
  update(
    id: number,
    studentParent: Partial<StudentParent>,
  ): Promise<StudentParent>;
  remove(id: number): Promise<void>;
}
