import {
  ConfigService,
} from '@nestjs/config';

import {
  Test,
  TestingModule,
} from '@nestjs/testing';

import {
  FeesService,
} from 'src/Fees/fees.service';

import {
  PaymentsService,
} from 'src/Payments/payments.service';

import {
  MercadoPagoService,
} from './mercadopago.service';


describe(
  'MercadoPagoService',
  () => {

    let service:
      MercadoPagoService;


    beforeEach(
      async () => {

        const module:
          TestingModule =
          await Test
            .createTestingModule({

              providers: [

                MercadoPagoService,

                {
                  provide:
                    ConfigService,

                  useValue: {

                    get:
                      jest.fn(
                        (
                          key:
                            string,
                        ) => {

                          if (
                            key ===
                            'MERCADOPAGO_ACCESS_TOKEN'
                          ) {

                            return 'TEST-token';

                          }


                          return undefined;

                        },
                      ),

                  },
                },

                {
                  provide:
                    FeesService,

                  useValue: {

                    getOneForUser:
                      jest.fn(),

                  },
                },

                {
                  provide:
                    PaymentsService,

                  useValue: {

                    saveMercadoPagoPayment:
                      jest.fn(),

                  },
                },

              ],

            })
            .compile();


        service =
          module.get<
            MercadoPagoService
          >(
            MercadoPagoService,
          );

      },
    );


    it(
      'should be defined',
      () => {

        expect(
          service,
        ).toBeDefined();

      },
    );

  },
);
