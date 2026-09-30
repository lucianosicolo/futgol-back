import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { AsistenciaService } from './asistencia.service';
import { AsistenciaDto } from './asistencia.dto';



@Controller(
  'asistencia',
)
export class AsistenciaController {


  constructor(

    private readonly service:
      AsistenciaService,

  ) {}


  /* ============================= */
  /* GUARDAR                       */
  /* ============================= */

  @Post()
  async save(

    @Body()
    body:
      AsistenciaDto[],

  ) {


    const result =
      await this.service.save(
        body,
      );


    return {

      ok:
        true,

      result,

      msg:
        'Attendance saved successfully',

    };

  }



  /* ============================= */
  /* BUSCAR POR FECHA              */
  /* ============================= */

  @Get()
  async getByDate(

    @Query('date')
    date:
      string,

  ) {


    const result =
      await this.service
        .getByDate(
          date,
        );


    return {

      ok:
        true,

      result,

      msg:
        'Attendances retrieved successfully',

    };

  }



  /* ============================= */
  /* HISTORIAL DEL ALUMNO          */
  /* ============================= */

  @Get(
    'student/:studentId',
  )
  async getByStudent(

    @Param(
      'studentId',
    )
    studentId:
      string,

  ) {


    const result =
      await this.service
        .getByStudent(
          studentId,
        );


    return {

      ok:
        true,

      result,

      msg:
        'Student attendances retrieved successfully',

    };

  }

}