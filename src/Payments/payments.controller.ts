import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';

import type {
  Response,
} from 'express';

import {
  JwtAuthGuard,
} from 'src/Auth/jwt-auth.guard';

import {
  Roles,
} from 'src/Auth/roles.decorator';

import {
  RolesGuard,
} from 'src/Auth/roles.guard';

import {
  UserRole,
} from 'src/Users/user-role.enum';

import {
  PaymentsService,
} from './payments.service';


@Controller('payments')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles(
  UserRole.ADMIN,
)
export class PaymentsController {


  constructor(
    private readonly service:
      PaymentsService,
  ) {}


  /* ============================= */
  /* HISTORIAL DE PAGOS            */
  /* ============================= */

  @Get()
  async getAll(

    @Query('fee')
    fee:
      string,

    @Query('status')
    status:
      string,

    @Res()
    res:
      Response,

  ) {

    const result =
      await this.service
        .getAll(
          fee,
          status,
        );


    res.status(
      HttpStatus.OK,
    ).json({

      ok:
        true,

      result,

      msg:
        'Approved',

    });

  }


  /* ============================= */
  /* DETALLE DE PAGO               */
  /* ============================= */

  @Get(':id')
  async getOne(

    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id:
      string,

    @Res()
    res:
      Response,

  ) {

    const result =
      await this.service
        .getOne(
          id,
        );


    res.status(
      HttpStatus.OK,
    ).json({

      ok:
        true,

      result,

      msg:
        'Approved',

    });

  }

}
