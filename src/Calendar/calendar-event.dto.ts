export class CalendarEventCreateDto {

  title:
    string;

  type:
    'training' |
    'match' |
    'general';

  date:
    string;

  time:
    string;

  duration_minutes:
    number;

  categoryId?:
    string;

  location?:
    string;

  opponent?:
    string;

}
