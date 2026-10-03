import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/Auth/jwt-auth.guard';
import { Roles } from 'src/Auth/roles.decorator';
import { RolesGuard } from 'src/Auth/roles.guard';
import { UserRole } from 'src/Users/user-role.enum';
import { AsistenciaDto } from './asistencia.dto';
import { AsistenciaService } from './asistencia.service';



@Controller(
  'asistencia',
)
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles(
  UserRole.ADMIN,
  UserRole.TEACHER,
)
export class AsistenciaController {


  constructor(

    private readonly service:
      AsistenciaService,

  ) { }


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