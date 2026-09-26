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
  AuthDto,
} from './auth.dto';

import {
  AuthService,
} from './auth.service';

import {
  JwtAuthGuard,
} from './jwt-auth.guard';


@Controller('auth')
export class AuthController {


  constructor(
    private service:
      AuthService,
  ) {}


  //! LOGIN ----------------------------------------------------------->

  @Post('login')
  async login(

    @Body()
    type: AuthDto,

    @Res()
    res: Response,

  ) {


    const result =
      await this.service.login(
        type,
      );


    res.status(
      HttpStatus.OK,
    ).json({

      ok: true,

      result,

      msg: 'Approved',

    });

  }


  //! ME -------------------------------------------------------------->

  @Get('me')
  @UseGuards(
    JwtAuthGuard,
  )
  async me(

    @Req()
    req: any,

    @Res()
    res: Response,

  ) {


    res.status(
      HttpStatus.OK,
    ).json({

      ok: true,

      result:
        req.user,

      msg: 'Approved',

    });

  }

}