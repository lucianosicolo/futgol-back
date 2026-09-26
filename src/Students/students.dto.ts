import { CategoryDto } from "src/Categories/category.dto";
import { UserDto } from "src/Users/users.dto";


export class StudentDto {

  id: string;

  name: string;

  last_name: string;

  document: string;

  birth_date: Date;

  address: string;

  avatar: string;

  active: boolean;

  category: CategoryDto;
  responsibles: UserDto[];


}