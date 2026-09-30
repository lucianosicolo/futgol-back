import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
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
import { UserRole } from 'src/Users/user-role.enum';


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
  student: {
    category: true,
    user: true,
    responsibles: true,
  },
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

//! GET MY FEES ------------------------------------------------------>
//! GET MY FEES ------------------------------------------------------>
//! GET ONE FOR USER -------------------------------------------------->

async getOneForUser(

  feeId: string,

  userId: string,

  role: UserRole,

): Promise<FeeEntity> {


  /*
   * Admin y profesor pueden
   * trabajar con cualquier cuota.
   */

  if (
    role === UserRole.ADMIN ||
    role === UserRole.TEACHER
  ) {

    return await this.getOne(
      feeId,
    );

  }


  /*
   * Cualquier otro rol que llegue
   * hasta acá debe ser Mi FUTGOL.
   */

  if (
    role !== UserRole.RESPONSIBLE
  ) {

    throw new ForbiddenException(
      'User cannot access this fee',
    );

  }


  try {


    const fee =
      await this.repo
        .createQueryBuilder(
          'fee',
        )

        .leftJoinAndSelect(
          'fee.student',
          'student',
        )

        .leftJoin(
          'student.user',
          'studentUser',
        )

        .leftJoin(
          'student.responsibles',
          'responsible',
        )

        .where(
          'fee.id = :feeId',
          {
            feeId,
          },
        )

        .andWhere(
          `(
            studentUser.id = :userId
            OR
            responsible.id = :userId
          )`,
          {
            userId,
          },
        )

        .distinct(
          true,
        )

        .getOne();


    if (!fee) {

      throw new ForbiddenException(
        'You cannot access this fee',
      );

    }


    return fee;


  } catch (error: any) {


    if (
      error instanceof
      ForbiddenException
    ) {

      throw error;

    }


    throw new HttpException(

      error.response ??
      error.message,

      error.status ??
      HttpStatus.INTERNAL_SERVER_ERROR,

    );

  }

}
async getMyFees(
  userId: string,
): Promise<FeeEntity[]> {

  try {

    return await this.repo
      .createQueryBuilder(
        'fee',
      )

      .leftJoinAndSelect(
        'fee.student',
        'student',
      )

      .leftJoinAndSelect(
        'student.category',
        'category',
      )

      /*
       * ¿La cuota pertenece
       * al propio usuario?
       */
      .leftJoin(
        'student.user',
        'studentUser',
      )

      /*
       * ¿La cuota pertenece
       * a un hijo del responsable?
       */
      .leftJoin(
        'student.responsibles',
        'responsible',
      )

      .where(
        `(
          studentUser.id = :userId
          OR
          responsible.id = :userId
        )`,
        {
          userId,
        },
      )

      .andWhere(
        'fee.active = :active',
        {
          active: true,
        },
      )

      .distinct(
        true,
      )

      .orderBy(
        'fee.due_date',
        'DESC',
      )

      .getMany();

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