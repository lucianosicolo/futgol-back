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
  DataSource,
  Repository,
} from 'typeorm';

import {
  StudentEntity,
} from 'src/Students/students.entity';

import {
  AsistenciaEntity,
} from './asistencia.entity';

import {
  AsistenciaDto,
} from './asistencia.dto';


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


    private readonly dataSource:
      DataSource,

  ) {}


  private validateDate(
    date:
      string,
  ):
    void {

    if (
      !/^\d{4}-\d{2}-\d{2}$/
        .test(
          date,
        )
    ) {

      throw new BadRequestException(
        'Date must use YYYY-MM-DD format',
      );

    }


    const [
      year,
      month,
      day,
    ] =
      date
        .split('-')
        .map(
          Number,
        );


    const parsed =
      new Date(
        Date.UTC(
          year,
          month - 1,
          day,
        ),
      );


    if (
      parsed.getUTCFullYear() !==
        year ||
      parsed.getUTCMonth() !==
        month - 1 ||
      parsed.getUTCDate() !==
        day
    ) {

      throw new BadRequestException(
        'Invalid date',
      );

    }

  }


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


    const studentIds =
      new Set<string>();

    let batchDate:
      string | null =
      null;


    /*
     * Validamos el lote completo antes
     * de tocar la base.
     */
    for (
      const attendance
      of attendances
    ) {

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


      this.validateDate(
        attendance.date,
      );


      if (
        typeof attendance.present !==
        'boolean'
      ) {

        throw new BadRequestException(
          'Present must be boolean',
        );

      }


      if (
        batchDate ===
        null
      ) {

        batchDate =
          attendance.date;

      } else if (
        attendance.date !==
        batchDate
      ) {

        throw new BadRequestException(
          'All attendances in the batch must use the same date',
        );

      }


      if (
        studentIds.has(
          attendance.student_id,
        )
      ) {

        throw new BadRequestException(
          'Duplicate student in attendance batch',
        );

      }


      studentIds.add(
        attendance.student_id,
      );

    }


    try {

      /*
       * Todo el lote se guarda dentro de
       * una sola transacción.
       *
       * Si falla un alumno, no queda
       * asistencia parcial del día.
       */
      return await this.dataSource
        .transaction(

          async manager => {

            const attendanceRepo =
              manager.getRepository(
                AsistenciaEntity,
              );

            const studentRepo =
              manager.getRepository(
                StudentEntity,
              );


            const result:
              AsistenciaEntity[] =
              [];


            for (
              const attendance
              of attendances
            ) {

              /*
               * Solo un alumno activo puede
               * recibir una asistencia nueva.
               */
              const student =
                await studentRepo
                  .findOne({

                    where: {

                      id:
                        attendance.student_id,

                      active:
                        true,

                    },

                  });


              if (!student) {

                throw new NotFoundException(
                  'Active student not found',
                );

              }


              const existing =
                await attendanceRepo
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


              if (existing) {

                existing.present =
                  attendance.present;


                result.push(

                  await attendanceRepo
                    .save(
                      existing,
                    ),

                );


                continue;

              }


              const newAttendance =
                attendanceRepo
                  .create({

                    student,

                    date:
                      attendance.date,

                    present:
                      attendance.present,

                  });


              result.push(

                await attendanceRepo
                  .save(
                    newAttendance,
                  ),

              );

            }


            return result;

          },

        );

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
    date:
      string,
  ): Promise<
    AsistenciaEntity[]
  > {


    if (!date) {

      throw new BadRequestException(
        'Date is required',
      );

    }


    this.validateDate(
      date,
    );


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
    studentId:
      string,
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


      /*
       * El historial se conserva aunque
       * el alumno hoy esté inactivo.
       */
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
