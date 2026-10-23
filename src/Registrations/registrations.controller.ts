import {
  Body,
  Controller,
  HttpStatus,
  Post,
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
  RegistrationsService,
} from './registrations.service';

import {
  StudentRegistrationDto,
} from './student-registration.dto';


@Controller('registrations')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles(
  UserRole.ADMIN,
)
export class RegistrationsController {


  constructor(
    private readonly service:
      RegistrationsService,
  ) {}


  @Post('student')
  async registerStudent(

    @Body()
    type:
      StudentRegistrationDto,

    @Res()
    res:
      Response,

  ) {

    const result =
      await this.service
        .registerStudent(
          type,
        );


    res.status(
      HttpStatus.CREATED,
    ).json({

      ok:
        true,

      result,

      msg:
        'Student registration created',

    });

  }

}
