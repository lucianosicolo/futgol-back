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


@Module({

  imports: [

    TypeOrmModule.forFeature([
      StudentEntity,
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