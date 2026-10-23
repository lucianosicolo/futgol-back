import {
  ConfigService,
} from '@nestjs/config';

import {
  Test,
  TestingModule,
} from '@nestjs/testing';

import {
  MercadoPagoController,
} from './mercadopago.controller';

import {
  MercadoPagoService,
} from './mercadopago.service';


describe(
  'MercadoPagoController',
  () => {

    let controller:
      MercadoPagoController;


    beforeEach(
      async () => {

        const module:
          TestingModule =
          await Test
            .createTestingModule({

              controllers: [
                MercadoPagoController,
              ],

              providers: [

                {
                  provide:
                    MercadoPagoService,

                  useValue: {

                    createPreference:
                      jest.fn(),

                    processPayment:
                      jest.fn(),

                    processMerchantOrder:
                      jest.fn(),

                  },
                },

                {
                  provide:
                    ConfigService,

                  useValue: {

                    get:
                      jest.fn(),

                  },
                },

              ],

            })
            .compile();


        controller =
          module.get<
            MercadoPagoController
          >(
            MercadoPagoController,
          );

      },
    );


    it(
      'should be defined',
      () => {

        expect(
          controller,
        ).toBeDefined();

      },
    );

  },
);
