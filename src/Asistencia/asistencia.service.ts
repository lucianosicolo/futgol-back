import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import {
  StudentEntity,
} from 'src/Students/students.entity';
import { AsistenciaEntity } from './asistencia.entity';
import { AsistenciaDto } from './asistencia.dto';




@Injectable()
export class AsistenciaService {


  constructor(

    @InjectRepository(
      AsistenciaEntity,
    )
    private readonly repo:
      Repository<AsistenciaEntity>,


    @InjectRepository(
      StudentEntity,
    )
    private readonly studentsRepo:
      Repository<StudentEntity>,

  ) {}


  /* ============================= */
  /* GUARDAR ASISTENCIAS           */
  /* ============================= */

  async save(
    attendances:
      AsistenciaDto[],
  ): Promise<
    AsistenciaEntity[]
  > {


    if (
      !Array.isArray(
        attendances,
      ) ||
      attendances.length === 0
    ) {

      throw new BadRequestException(
        'Attendances are required',
      );

    }


    try {


      const result:
        AsistenciaEntity[] =
        [];


      for (
        const attendance
        of attendances
      ) {


        /* ============================= */
        /* VALIDACIONES                  */
        /* ============================= */

        if (
          !attendance.student_id
        ) {

          throw new BadRequestException(
            'Student id is required',
          );

        }


        if (
          !attendance.date
        ) {

          throw new BadRequestException(
            'Date is required',
          );

        }


        if (
          typeof attendance.present !==
          'boolean'
        ) {

          throw new BadRequestException(
            'Present must be boolean',
          );

        }


        /* ============================= */
        /* BUSCAR ALUMNO                 */
        /* ============================= */

        const student =
          await this.studentsRepo
            .findOne({

              where: {

                id:
                  attendance.student_id,

              },

            });


        if (!student) {

          throw new NotFoundException(
            'Student not found',
          );

        }


        /* ============================= */
        /* BUSCAR SI YA EXISTE           */
        /* ============================= */

        const existing =
          await this.repo
            .findOne({

              where: {

                student: {

                  id:
                    attendance.student_id,

                },

                date:
                  attendance.date,

              },

              relations: {

                student:
                  true,

              },

            });


        /* ============================= */
        /* ACTUALIZAR                    */
        /* ============================= */

        if (existing) {

          existing.present =
            attendance.present;


          const updated =
            await this.repo.save(
              existing,
            );


          result.push(
            updated,
          );


          continue;

        }


        /* ============================= */
        /* CREAR                         */
        /* ============================= */

        const newAttendance =
          this.repo.create({

            student,

            date:
              attendance.date,

            present:
              attendance.present,

          });


        const saved =
          await this.repo.save(
            newAttendance,
          );


        result.push(
          saved,
        );

      }


      return result;


    } catch (
      error: any
    ) {


      throw new HttpException(

        error.response ??
        error.message,

        error.status ??
        HttpStatus
          .INTERNAL_SERVER_ERROR,

      );

    }

  }



  /* ============================= */
  /* BUSCAR POR FECHA              */
  /* ============================= */

  async getByDate(
    date: string,
  ): Promise<
    AsistenciaEntity[]
  > {


    if (!date) {

      throw new BadRequestException(
        'Date is required',
      );

    }


    try {


      return await this.repo.find({

        where: {

          date,

        },

        relations: {

          student: {

            category:
              true,

          },

        },

        order: {

          student: {

            last_name:
              'ASC',

            name:
              'ASC',

          },

        },

      });


    } catch (
      error: any
    ) {


      throw new HttpException(

        error.response ??
        error.message,

        error.status ??
        HttpStatus
          .INTERNAL_SERVER_ERROR,

      );

    }

  }



  /* ============================= */
  /* HISTORIAL DE ALUMNO           */
  /* ============================= */

  async getByStudent(
    studentId: string,
  ): Promise<
    AsistenciaEntity[]
  > {


    if (!studentId) {

      throw new BadRequestException(
        'Student id is required',
      );

    }


    try {


      const student =
        await this.studentsRepo
          .findOne({

            where: {

              id:
                studentId,

            },

          });


      if (!student) {

        throw new NotFoundException(
          'Student not found',
        );

      }


      return await this.repo.find({

        where: {

          student: {

            id:
              studentId,

          },

        },

        relations: {

          student: {

            category:
              true,

          },

        },

        order: {

          date:
            'DESC',

        },

      });


    } catch (
      error: any
    ) {


      throw new HttpException(

        error.response ??
        error.message,

        error.status ??
        HttpStatus
          .INTERNAL_SERVER_ERROR,

      );

    }

  }

}