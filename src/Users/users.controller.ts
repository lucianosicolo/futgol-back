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
  Res,
  UseGuards,
} from '@nestjs/common';

import type {
  Response,
} from 'express';

import {
  UsersService,
} from './users.service';
import { UserDto } from './users.dto';
import { JwtAuthGuard } from 'src/Auth/jwt-auth.guard';




@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {


  constructor(
    private service:
      UsersService,
  ) {}


  //! GET ALL --------------------------------------------------------->

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAll(

    @Query('name')
    name: string,

    @Query('email')
    email: string,

    @Query('role')
    role: string,

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

        email,

        role,

        activeBoolean,

      );


    res.status(
      HttpStatus.OK,
    ).json({

      ok: true,

      result,

      msg: 'Approved',

    });

  }


  //! GET ONE --------------------------------------------------------->

  @Get(':id')
  @UseGuards(JwtAuthGuard)
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
      await this.service.getOne(
        id,
      );


    res.status(
      HttpStatus.OK,
    ).json({

      ok: true,

      result,

      msg: 'Approved',

    });

  }



  @Post()
  @UseGuards(JwtAuthGuard)
  async insert(

    @Body()
    type: UserDto,

    @Res()
    res: Response,

  ) {

    const result =
      await this.service.insert(
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



  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(

    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id: string,

    @Body()
    type: Partial<UserDto>,

    @Res()
    res: Response,

  ) {

    const result =
      await this.service.update(
        id,
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


  //! DELETE ---------------------------------------------------------->

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
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
      await this.service.delete(
        id,
      );


    res.status(
      HttpStatus.OK,
    ).json({

      ok: true,

      result,

      msg: 'Approved',

    });

  }

}