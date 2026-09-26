import {
  Module,
} from '@nestjs/common';

import {
  FeesModule,
} from 'src/Fees/fees.module';

import {
  PaymentsModule,
} from 'src/Payments/payments.module';

import {
  MercadoPagoController,
} from './mercadopago.controller';

import {
  MercadoPagoService,
} from './mercadopago.service';


@Module({

  imports: [

    FeesModule,

    PaymentsModule,

  ],

  controllers: [

    MercadoPagoController,

  ],

  providers: [

    MercadoPagoService,

  ],

  exports: [

    MercadoPagoService,

  ],

})
export class MercadopagoModule {}