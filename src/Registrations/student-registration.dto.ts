export type StudentRegistrationAccessMode =
  | 'none'
  | 'self'
  | 'responsible';


export type StudentRegistrationResponsibleMode =
  | 'existing'
  | 'new';


export interface StudentRegistrationStudentInput {

  name:
    string;

  last_name:
    string;

  document:
    string;

  birth_date:
    string;

  address?:
    string;

  category_id:
    string;

}


export interface StudentRegistrationAccountInput {

  email:
    string;

  phone:
    string;

  password:
    string;

}


export interface StudentRegistrationResponsibleInput
  extends StudentRegistrationAccountInput {

  name:
    string;

  last_name:
    string;

}


export class StudentRegistrationDto {

  student:
    StudentRegistrationStudentInput;

  access_mode:
    StudentRegistrationAccessMode;

  self_account?:
    StudentRegistrationAccountInput;

  responsible_mode?:
    StudentRegistrationResponsibleMode;

  responsible_user_id?:
    string;

  responsible_account?:
    StudentRegistrationResponsibleInput;

}
