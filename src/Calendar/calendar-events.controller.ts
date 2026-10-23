import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
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
  CalendarEventCreateDto,
} from './calendar-event.dto';

import {
  CalendarEventsService,
} from './calendar-events.service';


@Controller('calendar-events')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles(
  UserRole.ADMIN,
  UserRole.TEACHER,
)
export class CalendarEventsController {


  constructor(
    private readonly service:
      CalendarEventsService,
  ) {}


  @Get()
  async getAll(

    @Query('date')
    date:
      string | undefined,

    @Res()
    res:
      Response,

  ) {

    const result =
      await this.service
        .getAll(
          date,
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


  @Post()
  async create(

    @Req()
    req:
      any,

    @Body()
    body:
      CalendarEventCreateDto,

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
        'Calendar event created',

    });

  }


  @Delete(':id')
  async delete(

    @Param('id')
    id:
      string,

    @Res()
    res:
      Response,

  ) {

    const result =
      await this.service
        .delete(
          id,
        );


    res.status(
      HttpStatus.OK,
    ).json({

      ok:
        true,

      result,

      msg:
        'Calendar event deleted',

    });

  }

}
