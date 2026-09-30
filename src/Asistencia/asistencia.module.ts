import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  StudentEntity,
} from 'src/Students/students.entity';
import { AsistenciaEntity } from './asistencia.entity';
import { AsistenciaService } from './asistencia.service';
import { AsistenciaController } from './asistencia.controller';



@Module({

  imports: [

    TypeOrmModule.forFeature([
      AsistenciaEntity,
      StudentEntity,
    ]),

  ],

  controllers: [

    AsistenciaController,

  ],

  providers: [

    AsistenciaService,

  ],

  exports: [

    AsistenciaService,

  ],

})
export class AsistenciaModule { }