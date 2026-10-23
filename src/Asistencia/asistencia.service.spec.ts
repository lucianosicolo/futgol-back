import {
  AsistenciaService,
} from './asistencia.service';


describe(
  'AsistenciaService',
  () => {

    const repo = {

      findOne:
        jest.fn(),

      save:
        jest.fn(),

      create:
        jest.fn(),

    };


    const studentsRepo = {

      findOne:
        jest.fn(),

    };


    let service:
      AsistenciaService;


    beforeEach(
      () => {

        jest.clearAllMocks();


        service =
          new AsistenciaService(

            repo as any,

            studentsRepo as any,

          );

      },
    );


    it(
      'updates the existing student/date record instead of creating another one',
      async () => {

        const student = {

          id:
            'student-1',

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


        studentsRepo
          .findOne
          .mockResolvedValue(
            student,
          );


        repo
          .findOne
          .mockResolvedValue(
            existing,
          );


        repo
          .save
          .mockImplementation(
            async value =>
              value,
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
          repo.create,
        ).not.toHaveBeenCalled();


        expect(
          repo.save,
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

  },
);
