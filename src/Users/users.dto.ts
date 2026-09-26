import { StudentDto } from "src/Students/students.dto";

export class UserDto {

  id: string;

  name: string;

  last_name: string;

  email: string;

  password: string;

  phone: string;

  role: string;

  active: boolean;
  students: StudentDto[];

}