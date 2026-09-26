import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  StudentsModule,
} from 'src/Students/students.module';

import {
  FeeEntity,
} from './fees.entity';

import {
  FeesController,
} from './fees.controller';

import {
  FeesService,
} from './fees.service';


@Module({

  imports: [

    TypeOrmModule.forFeature([
      FeeEntity,
    ]),

    StudentsModule,

  ],

  controllers: [
    FeesController,
  ],

  providers: [
    FeesService,
  ],

  exports: [
    FeesService,
  ],

})
export class FeesModule {}