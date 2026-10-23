import {
  BadRequestException,
} from '@nestjs/common';

import {
  FeesService,
} from './fees.service';


describe(
  'FeesService monthly generation',
  () => {

    const repo = {

      findOne:
        jest.fn(),

      find:
        jest.fn(),

      save:
        jest.fn(),

      create:
        jest.fn(),

      merge:
        jest.fn(),

    };


    const studentsService = {

      getOne:
        jest.fn(),

      getAll:
        jest.fn(),

    };


    const feeRepo = {

      findOne:
        jest.fn(),

      create:
        jest.fn(),

      save:
        jest.fn(),

    };


    const studentRepo = {

      find:
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
      FeesService;


    beforeEach(
      () => {

        jest.clearAllMocks();


        service =
          new FeesService(

            repo as any,

            studentsService as any,

            dataSource as any,

          );


        manager
          .getRepository
          .mockReturnValueOnce(
            feeRepo,
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


        feeRepo
          .create
          .mockImplementation(
            value =>
              value,
          );


        feeRepo
          .save
          .mockImplementation(
            async value => ({
              id:
                'fee-created',
              ...value,
            }),
          );

      },
    );


    it(
      'creates only missing active-student fees and freezes the category amount',
      async () => {

        studentRepo
          .find
          .mockResolvedValue([

            {
              id:
                'student-1',
              name:
                'Uno',
              last_name:
                'Alumno',
              active:
                true,
              category: {
                id:
                  'category-1',
                name:
                  '2012',
                active:
                  true,
                monthly_fee:
                  65000,
              },
            },

            {
              id:
                'student-2',
              name:
                'Dos',
              last_name:
                'Alumno',
              active:
                true,
              category: {
                id:
                  'category-1',
                name:
                  '2012',
                active:
                  true,
                monthly_fee:
                  65000,
              },
            },

          ]);


        feeRepo
          .findOne
          .mockResolvedValueOnce(
            null,
          )
          .mockResolvedValueOnce({
            id:
              'existing-fee',
          });


        const result =
          await service.generatePeriod(
            'Octubre 2026',
            '2026-10-10',
          );


        expect(
          result.created,
        ).toBe(
          1,
        );

        expect(
          result.skipped,
        ).toBe(
          1,
        );

        expect(
          feeRepo.create,
        ).toHaveBeenCalledWith(

          expect.objectContaining({

            period:
              'Octubre 2026',

            amount:
              65000,

            due_date:
              '2026-10-10',

            status:
              'due',

          }),

        );

      },
    );


    it(
      'rejects generation before saving anything when a category has no valid price',
      async () => {

        studentRepo
          .find
          .mockResolvedValue([

            {
              id:
                'student-1',
              active:
                true,
              category: {
                id:
                  'category-1',
                name:
                  '2012',
                active:
                  true,
                monthly_fee:
                  0,
              },
            },

          ]);


        await expect(

          service.generatePeriod(
            'Octubre 2026',
            '2026-10-10',
          ),

        ).rejects.toMatchObject({
          status:
            400,
        });


        expect(
          feeRepo.save,
        ).not.toHaveBeenCalled();

      },
    );


    it(
      'rejects an invalid period before opening a transaction',
      async () => {

        await expect(

          service.generatePeriod(
            '10/2026',
            '2026-10-10',
          ),

        ).rejects.toBeInstanceOf(
          BadRequestException,
        );


        expect(
          dataSource.transaction,
        ).not.toHaveBeenCalled();

      },
    );


    it(
      'rejects a due date outside the selected period',
      async () => {

        await expect(

          service.generatePeriod(
            'Octubre 2026',
            '2026-11-10',
          ),

        ).rejects.toBeInstanceOf(
          BadRequestException,
        );


        expect(
          dataSource.transaction,
        ).not.toHaveBeenCalled();

      },
    );


    it(
      'does not allow deleting a paid fee',
      async () => {

        repo
          .findOne
          .mockResolvedValue({

            id:
              'fee-1',

            status:
              'paid',

            active:
              true,

            student: {
              id:
                'student-1',
            },

          });


        await expect(

          service.delete(
            'fee-1',
          ),

        ).rejects.toMatchObject({
          status:
            409,
        });


        expect(
          repo.save,
        ).not.toHaveBeenCalled();

      },
    );

  },
);
