import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
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
  NoticeCreateDto,
} from './notice.dto';

import {
  NoticesService,
} from './notices.service';


@Controller('notices')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
export class NoticesController {


  constructor(
    private readonly service:
      NoticesService,
  ) {}


  @Post()
  @Roles(
    UserRole.ADMIN,
    UserRole.TEACHER,
  )
  async create(

    @Req()
    req:
      any,

    @Body()
    body:
      NoticeCreateDto,

    @Res()
    res:
      Response,

  ) {

    const result =
      await this.service
        .create(
          body,
          req.user.id,
        );


    res.status(
      HttpStatus.CREATED,
    ).json({

      ok:
        true,

      result,

      msg:
        'Notice published',

    });

  }


  @Get()
  @Roles(
    UserRole.ADMIN,
    UserRole.TEACHER,
  )
  async getAll(

    @Res()
    res:
      Response,

  ) {

    const result =
      await this.service
        .getAll();


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


  @Get('my')
  @Roles(
    UserRole.RESPONSIBLE,
  )
  async getMine(

    @Req()
    req:
      any,

    @Res()
    res:
      Response,

  ) {

    const result =
      await this.service
        .getMine(
          req.user.id,
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
