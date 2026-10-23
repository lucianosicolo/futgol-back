import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  StudentEntity,
} from 'src/Students/students.entity';

import {
  UserEntity,
} from 'src/Users/users.entity';

import {
  NoticeEntity,
} from './notice.entity';

import {
  NoticesController,
} from './notices.controller';

import {
  NoticesService,
} from './notices.service';


@Module({

  imports: [

    TypeOrmModule.forFeature([

      NoticeEntity,
      StudentEntity,
      UserEntity,

    ]),

  ],

  controllers: [
    NoticesController,
  ],

  providers: [
    NoticesService,
  ],

})
export class NoticesModule {}
