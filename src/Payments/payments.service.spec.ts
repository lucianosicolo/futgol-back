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


    let service:
      PaymentsService;


    beforeEach(
      () => {

        jest.clearAllMocks();


        service =
          new PaymentsService(

            repo as any,

            feesService as any,

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
