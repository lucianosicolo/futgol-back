import { StudentDto } from "src/Students/students.dto";


export class FeeDto {

  id: string;

  student: StudentDto;

  period: string;

  amount: number;

  status: string;

  due_date: Date;

 paid_at: Date | null;
  active: boolean;

}