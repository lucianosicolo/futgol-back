import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  FeesModule,
} from 'src/Fees/fees.module';

import {
  PaymentEntity,
} from './payments.entity';

import {
  PaymentsController,
} from './payments.controller';

import {
  PaymentsService,
} from './payments.service';


@Module({

  imports: [

    TypeOrmModule.forFeature([
      PaymentEntity,
    ]),

    FeesModule,

  ],

  controllers: [
    PaymentsController,
  ],

  providers: [
    PaymentsService,
  ],

  exports: [
    PaymentsService,
  ],

})
export class PaymentsModule {}