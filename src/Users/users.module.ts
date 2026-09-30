import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';


import {
  UsersController,
} from './users.controller';

import {
  UsersService,
} from './users.service';
import { UserEntity } from './users.entity';
import { StudentEntity } from 'src/Students/students.entity';


@Module({

  imports: [

    TypeOrmModule.forFeature([
      UserEntity,
        StudentEntity,
    ]),

  ],

  controllers: [

    UsersController,

  ],

  providers: [

    UsersService,

  ],

  exports: [

    UsersService,

  ],

})
export class UsersModule {}