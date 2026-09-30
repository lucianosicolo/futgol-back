import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  CategoriesModule,
} from 'src/Categories/categories.module';

import {
  StudentEntity,
} from './students.entity';

import {
  StudentsController,
} from './students.controller';

import {
  StudentsService,
} from './students.service';
import { UserEntity } from 'src/Users/users.entity';


@Module({

  imports: [

    TypeOrmModule.forFeature([
      StudentEntity,
        UserEntity,
    ]),

    CategoriesModule,

  ],

  controllers: [
    StudentsController,
  ],

  providers: [
    StudentsService,
  ],

  exports: [
    StudentsService,
  ],

})
export class StudentsModule {}