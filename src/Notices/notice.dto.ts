export class NoticeCreateDto {

  type:
    'payment' |
    'training' |
    'general';

  message:
    string;

  categoryId?:
    string;

  studentId?:
    string;

}
