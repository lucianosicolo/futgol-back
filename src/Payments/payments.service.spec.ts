import {
  PaymentsService,
} from './payments.service';


describe(
  'PaymentsService',
  () => {

    const repo = {

      findOne:
        jest.fn(),

      create:
        jest.fn(),

      merge:
        jest.fn(),

      save:
        jest.fn(),

    };


    const feesService = {

      getOne:
        jest.fn(),

      update:
        jest.fn(),

    };


    const feeRepo = {

      findOne:
        jest.fn(),

      save:
        jest.fn(),

    };


    const paymentRepo = {

      create:
        jest.fn(),

      save:
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
      PaymentsService;


    beforeEach(
      () => {

        jest.clearAllMocks();


        service =
          new PaymentsService(

            repo as any,

            feesService as any,

            dataSource as any,

          );


        repo
          .findOne
          .mockResolvedValue(
            null,
          );


        repo
          .create
          .mockImplementation(
            value =>
              value,
          );


        repo
          .save
          .mockImplementation(
            async value =>
              value,
          );


        paymentRepo
          .create
          .mockImplementation(
            value =>
              value,
          );


        paymentRepo
          .save
          .mockImplementation(
            async value => ({
              id:
                'payment-1',
              ...value,
            }),
          );


        feeRepo
          .save
          .mockImplementation(
            async value =>
              value,
          );


        manager
          .getRepository
          .mockReturnValueOnce(
            feeRepo,
          )
          .mockReturnValueOnce(
            paymentRepo,
          );


        dataSource
          .transaction
          .mockImplementation(
            async callback =>
              callback(
                manager,
              ),
          );

      },
    );


    it(
      'registers a manual payment and marks the fee paid in one transaction',
      async () => {

        feeRepo
          .findOne
          .mockResolvedValue({

            id:
              'fee-1',

            amount:
              70000,

            status:
              'due',

            active:
              true,

            paid_at:
              null,

            student: {

              id:
                'student-1',

            },

          });


        const result =
          await service
            .saveManualPayment(

              'fee-1',

              'admin-1',

              'cash',

            );


        expect(
          paymentRepo.save,
        ).toHaveBeenCalledWith(

          expect.objectContaining({

            source:
              'manual',

            amount:
              70000,

            status:
              'approved',

            payment_method:
              'cash',

            registered_by:
              expect.objectContaining({

                id:
                  'admin-1',

              }),

          }),

        );


        expect(
          feeRepo.save,
        ).toHaveBeenCalledWith(

          expect.objectContaining({

            id:
              'fee-1',

            status:
              'paid',

            paid_at:
              expect.any(
                Date,
              ),

          }),

        );


        expect(
          result.source,
        ).toBe(
          'manual',
        );

      },
    );


    it(
      'marks the fee as paid only for an approved payment with the exact amount',
      async () => {

        feesService
          .getOne
          .mockResolvedValue({

            id:
              'fee-1',

            amount:
              70000,

            status:
              'due',

          });


        await service
          .saveMercadoPagoPayment({

            id:
              123,

            external_reference:
              'fee-1',

            transaction_amount:
              70000,

            currency_id:
              'ARS',

            status:
              'approved',

          });


        expect(
          feesService.update,
        ).toHaveBeenCalledWith(

          'fee-1',

          {
            status:
              'paid',
          },

        );

      },
    );


    it(
      'does not mark the fee as paid when the amount does not match',
      async () => {

        feesService
          .getOne
          .mockResolvedValue({

            id:
              'fee-1',

            amount:
              70000,

            status:
              'due',

          });


        await service
          .saveMercadoPagoPayment({

            id:
              124,

            external_reference:
              'fee-1',

            transaction_amount:
              69000,

            currency_id:
              'ARS',

            status:
              'approved',

          });


        expect(
          feesService.update,
        ).not.toHaveBeenCalled();

      },
    );

  },
);
