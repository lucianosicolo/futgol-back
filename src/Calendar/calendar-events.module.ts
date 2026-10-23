import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  CategoryEntity,
} from 'src/Categories/category.entity';

import {
  UserEntity,
} from 'src/Users/users.entity';

import {
  CalendarEventEntity,
} from './calendar-event.entity';

import {
  CalendarEventsController,
} from './calendar-events.controller';

import {
  CalendarEventsService,
} from './calendar-events.service';


@Module({

  imports: [

    TypeOrmModule.forFeature([

      CalendarEventEntity,
      CategoryEntity,
      UserEntity,

    ]),

  ],

  controllers: [
    CalendarEventsController,
  ],

  providers: [
    CalendarEventsService,
  ],

})
export class CalendarEventsModule {}
