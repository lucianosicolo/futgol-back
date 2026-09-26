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
  FeesService,
} from './fees.service';
import { FeeDto } from './fees.dto';

import {
  JwtAuthGuard,
} from 'src/Auth/jwt-auth.guard';


@Controller('fees')
@UseGuards(JwtAuthGuard)
export class FeesController {


  constructor(
    private service:
      FeesService,
  ) {}


  //! GET ALL --------------------------------------------------------->

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAll(

    @Query('student')
    student: string,

    @Query('period')
    period: string,

    @Query('status')
    status: string,

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

        student,

        period,

        status,

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


  //! INSERT ---------------------------------------------------------->

  @Post()
  @UseGuards(JwtAuthGuard)
  async insert(

    @Body()
    type: FeeDto,

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


  //! UPDATE ---------------------------------------------------------->

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(

    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id: string,

    @Body()
    type:
      Partial<FeeDto>,

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