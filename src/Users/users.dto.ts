import {
  StudentDto,
} from 'src/Students/students.dto';

import {
  UserRole,
} from './user-role.enum';


export class UserDto {

  id: string;

  name: string;

  last_name: string;

  email: string;

  password: string;

  phone: string;

  role: UserRole;

  active: boolean;

  /*
   * Alumnos que están
   * a cargo de este usuario.
   *
   * Para crear el usuario alcanza
   * con mandar el id de cada uno.
   */
  students?: StudentDto[];

}