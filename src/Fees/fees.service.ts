import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  FindManyOptions,
  FindOptionsWhere,
  Like,
  Repository,
} from 'typeorm';

import {
  FeeEntity,
} from './fees.entity';

import {
  FeeDto,
} from './fees.dto';

import {
  StudentsService,
} from 'src/Students/students.service';


@Injectable()
export class FeesService {


  constructor(

    @InjectRepository(FeeEntity)
    private repo: Repository<FeeEntity>,

    private readonly studentsService:
      StudentsService,

  ) {}


  //! GET ALL --------------------------------------------------------->

  async getAll(

    student?: string,

    period?: string,

    status?: string,

    active?: boolean,

  ): Promise<FeeDto[]> {

    try {

      const conditions:
        FindOptionsWhere<FeeEntity> = {};


      if (student) {

        conditions.student = {
          id: student,
        };

      }


      if (period) {

        conditions.period =
          Like(`%${period}%`);

      }


      if (status) {

        conditions.status =
          status;

      }


      if (active !== undefined) {

        conditions.active =
          active;

      }


      const findOptions:
        FindManyOptions<FeeEntity> = {

          where:
            conditions,

          relations: {
            student: true,
          },

          order: {
            due_date: 'DESC',
          },

        };


      return await this.repo.find(
        findOptions,
      );

    } catch (error: any) {

      throw new HttpException(

        error.response ??
        error.message,

        error.status ??
        HttpStatus.INTERNAL_SERVER_ERROR,

      );

    }

  }


  //! GET ONE --------------------------------------------------------->

  async getOne(
    id: string,
  ): Promise<FeeEntity> {

    if (!id) {

      throw new BadRequestException(
        'Invalid id parameter',
      );

    }


    try {

      const entity =
        await this.repo.findOne({

          where: {
            id,
          },

          relations: {
            student: true,
          },

        });


      if (!entity) {

        throw new NotFoundException(
          'Fee not found',
        );

      }


      return entity;

    } catch (error: any) {

      throw new HttpException(

        error.response ??
        error.message,

        error.status ??
        HttpStatus.INTERNAL_SERVER_ERROR,

      );

    }

  }


  //! INSERT ---------------------------------------------------------->

  async insert(
    type: FeeDto,
  ): Promise<FeeDto> {

    try {

      /*
       * La cuota tiene que pertenecer
       * a un alumno.
       */

      if (
        !type.student ||
        !type.student.id
      ) {

        throw new BadRequestException(
          'Student is required',
        );

      }


      /*
       * Buscamos al alumno real.
       */

      const student =
        await this.studentsService.getOne(
          type.student.id,
        );


      /*
       * Evitamos tener dos cuotas
       * del mismo período para
       * el mismo alumno.
       */

      const entry =
        await this.repo.findOne({

          where: {

            student: {
              id: type.student.id,
            },

            period:
              type.period,

          },

        });


      if (entry) {

        throw new ConflictException(
          'Fee already exists for this student and period',
        );

      }


      /*
       * Creamos la cuota.
       */

      const newType =
        this.repo.create({

          student,

          period:
            type.period,

          amount:
            type.amount,

          due_date:
            type.due_date,

          status:
            'due',

          paid_at:
            null,

          active:
            true,

        });


      return await this.repo.save(
        newType,
      );

    } catch (error: any) {

      throw new HttpException(

        error.response ??
        error.message,

        error.status ??
        HttpStatus.INTERNAL_SERVER_ERROR,

      );

    }

  }


  //! UPDATE ---------------------------------------------------------->

  async update(

    id: string,

    type:
      Partial<FeeDto>,

  ): Promise<FeeDto> {

    if (!id) {

      throw new BadRequestException(
        'Invalid id parameter',
      );

    }


    try {

      const entity =
        await this.repo.findOne({

          where: {
            id,
          },

          relations: {
            student: true,
          },

        });


      if (!entity) {

        throw new NotFoundException(
          'Fee not found',
        );

      }


      /*
       * Si cambia el alumno,
       * buscamos el nuevo alumno.
       */

      if (
        type.student &&
        type.student.id
      ) {

        const student =
          await this.studentsService.getOne(
            type.student.id,
          );


        entity.student =
          student;

      }


      /*
       * Permitimos únicamente
       * due o paid.
       */

      if (
        type.status &&
        type.status !== 'due' &&
        type.status !== 'paid'
      ) {

        throw new BadRequestException(
          'Invalid fee status',
        );

      }


      /*
       * Si pasa a paid,
       * guardamos la fecha del pago.
       */

      if (
        type.status === 'paid' &&
        !entity.paid_at
      ) {

        entity.paid_at =
          new Date();

      }


      /*
       * Si vuelve a due,
       * eliminamos la fecha de pago.
       */

      if (
        type.status === 'due'
      ) {

        entity.paid_at =
          null;

      }


      /*
       * Sacamos student porque
       * ya lo tratamos arriba.
       */

      const {
        student,
        ...feeData
      } = type;


      const mergeEntity =
        this.repo.merge(

          entity,

          feeData,

        );


      return await this.repo.save(
        mergeEntity,
      );

    } catch (error: any) {

      throw new HttpException(

        error.response ??
        error.message,

        error.status ??
        HttpStatus.INTERNAL_SERVER_ERROR,

      );

    }

  }


  //! DELETE ---------------------------------------------------------->

  async delete(
    id: string,
  ): Promise<FeeDto> {

    if (!id) {

      throw new BadRequestException(
        'Invalid id parameter',
      );

    }


    try {

      const entity =
        await this.repo.findOne({

          where: {
            id,
          },

          relations: {
            student: true,
          },

        });


      if (!entity) {

        throw new NotFoundException(
          'Fee not found',
        );

      }


      /*
       * Baja lógica.
       */

      entity.active =
        false;


      return await this.repo.save(
        entity,
      );

    } catch (error: any) {

      throw new HttpException(

        error.response ??
        error.message,

        error.status ??
        HttpStatus.INTERNAL_SERVER_ERROR,

      );

    }

  }

}