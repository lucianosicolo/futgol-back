import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import type {
  Response,
} from 'express';

import {
  StudentsService,
} from './students.service';

import {
  StudentDto,
} from './students.dto';

import {
  JwtAuthGuard,
} from 'src/Auth/jwt-auth.guard';

import {
  UserRole,
} from 'src/Users/user-role.enum';

import {
  Roles,
} from 'src/Auth/roles.decorator';

import {
  RolesGuard,
} from 'src/Auth/roles.guard';


@Controller('students')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
export class StudentsController {


  constructor(
    private readonly service:
      StudentsService,
  ) {}


  /* ============================= */
  /* GET ALL                       */
  /* ============================= */

  @Get()
  @Roles(
    UserRole.ADMIN,
    UserRole.TEACHER,
  )
  async getAll(

    @Query('name')
    name: string,

    @Query('document')
    document: string,

    @Query('category')
    category: string,

    @Query('active')
    active: string,

    @Res()
    res: Response,

  ) {

    const activeBoolean =
      active !== undefined
        ? active === 'true'
        : undefined;


    const result =
      await this.service.getAll(

        name,

        document,

        category,

        activeBoolean,

      );


    res.status(
      HttpStatus.OK,
    ).json({

      ok: true,

      result,

      msg:
        'Approved',

    });

  }


  /* ============================= */
  /* MIS ALUMNOS                   */
  /* ============================= */

  @Get('my')
  @Roles(
    UserRole.RESPONSIBLE,
  )
  async getMyStudents(

    @Req()
    req: any,

    @Res()
    res: Response,

  ) {

    const result =
      await this.service
        .getMyStudents(
          req.user.id,
        );


    res.status(
      HttpStatus.OK,
    ).json({

      ok: true,

      result,

      msg:
        'Approved',

    });

  }


  /* ============================= */
  /* GET ONE                       */
  /* ============================= */

  @Get(':id')
  @Roles(
    UserRole.ADMIN,
    UserRole.TEACHER,
  )
  async getOne(

    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id: string,

    @Res()
    res: Response,

  ) {

    const result =
      await this.service
        .getOne(
          id,
        );


    res.status(
      HttpStatus.OK,
    ).json({

      ok: true,

      result,

      msg:
        'Approved',

    });

  }


  /* ============================= */
  /* CREAR                         */
  /* ============================= */

  @Post()
  @Roles(
    UserRole.ADMIN,
  )
  async insert(

    @Body()
    type: StudentDto,

    @Res()
    res: Response,

  ) {

    const result =
      await this.service
        .insert(
          type,
        );


    res.status(
      HttpStatus.OK,
    ).json({

      ok: true,

      result,

      msg:
        'Approved',

    });

  }


  /* ============================= */
  /* EDITAR                        */
  /* ============================= */

  @Put(':id')
  @Roles(
    UserRole.ADMIN,
  )
  async update(

    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id: string,

    @Body()
    type:
      Partial<StudentDto>,

    @Res()
    res: Response,

  ) {

    const result =
      await this.service
        .update(
          id,
          type,
        );


    res.status(
      HttpStatus.OK,
    ).json({

      ok: true,

      result,

      msg:
        'Approved',

    });

  }


  /* ============================= */
  /* ELIMINAR                      */
  /* ============================= */

  @Delete(':id')
  @Roles(
    UserRole.ADMIN,
  )
  async delete(

    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id: string,

    @Res()
    res: Response,

  ) {

    const result =
      await this.service
        .delete(
          id,
        );


    res.status(
      HttpStatus.OK,
    ).json({

      ok: true,

      result,

      msg:
        'Approved',

    });

  }

}