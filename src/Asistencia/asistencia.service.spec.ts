import {
  BadRequestException,
} from '@nestjs/common';

import {
  AsistenciaService,
} from './asistencia.service';


describe(
  'AsistenciaService',
  () => {

    const readRepo = {

      find:
        jest.fn(),

      findOne:
        jest.fn(),

    };


    const readStudentsRepo = {

      findOne:
        jest.fn(),

    };


    const attendanceRepo = {

      findOne:
        jest.fn(),

      save:
        jest.fn(),

      create:
        jest.fn(),

    };


    const studentRepo = {

      findOne:
        jest.fn(),

    };


    const manager = {

      getRepository:
        jest.fn(),

    };


    const dataSource = {

      transaction:
        jest.fn(),

    };


    let service:
      AsistenciaService;


    beforeEach(
      () => {

        jest.clearAllMocks();


        manager
          .getRepository
          .mockReturnValueOnce(
            attendanceRepo,
          )
          .mockReturnValueOnce(
            studentRepo,
          );


        dataSource
          .transaction
          .mockImplementation(
            async callback =>
              callback(
                manager,
              ),
          );


        attendanceRepo
          .save
          .mockImplementation(
            async value =>
              value,
          );


        attendanceRepo
          .create
          .mockImplementation(
            value =>
              value,
          );


        service =
          new AsistenciaService(

            readRepo as any,

            readStudentsRepo as any,

            dataSource as any,

          );

      },
    );


    it(
      'updates the existing student/date record instead of creating another one',
      async () => {

        const student = {

          id:
            'student-1',

          active:
            true,

        };


        const existing = {

          id:
            'attendance-1',

          student,

          date:
            '2026-10-22',

          present:
            false,

        };


        studentRepo
          .findOne
          .mockResolvedValue(
            student,
          );


        attendanceRepo
          .findOne
          .mockResolvedValue(
            existing,
          );


        const result =
          await service.save([

            {

              student_id:
                'student-1',

              date:
                '2026-10-22',

              present:
                true,

            },

          ]);


        expect(
          attendanceRepo.create,
        ).not.toHaveBeenCalled();


        expect(
          attendanceRepo.save,
        ).toHaveBeenCalledWith(

          expect.objectContaining({

            id:
              'attendance-1',

            present:
              true,

          }),

        );


        expect(
          result[0].present,
        ).toBe(
          true,
        );

      },
    );


    it(
      'rejects inactive students before creating attendance',
      async () => {

        studentRepo
          .findOne
          .mockResolvedValue(
            null,
          );


        await expect(

          service.save([

            {

              student_id:
                'inactive-1',

              date:
                '2026-10-22',

              present:
                false,

            },

          ]),

        ).rejects.toMatchObject({
          status:
            404,
        });


        expect(
          attendanceRepo.save,
        ).not.toHaveBeenCalled();

      },
    );


    it(
      'rejects duplicate students inside the same attendance batch',
      async () => {

        await expect(

          service.save([

            {

              student_id:
                'student-1',

              date:
                '2026-10-22',

              present:
                true,

            },

            {

              student_id:
                'student-1',

              date:
                '2026-10-22',

              present:
                false,

            },

          ]),

        ).rejects.toBeInstanceOf(
          BadRequestException,
        );


        expect(
          dataSource.transaction,
        ).not.toHaveBeenCalled();

      },
    );


    it(
      'rejects mixed dates in the same attendance batch',
      async () => {

        await expect(

          service.save([

            {

              student_id:
                'student-1',

              date:
                '2026-10-22',

              present:
                true,

            },

            {

              student_id:
                'student-2',

              date:
                '2026-10-23',

              present:
                false,

            },

          ]),

        ).rejects.toBeInstanceOf(
          BadRequestException,
        );

      },
    );


    it(
      'rejects invalid calendar dates',
      async () => {

        await expect(

          service.getByDate(
            '2026-02-31',
          ),

        ).rejects.toBeInstanceOf(
          BadRequestException,
        );

      },
    );

  },
);
