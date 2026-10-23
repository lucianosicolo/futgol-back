import {
  BadRequestException,
  ConflictException,
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
  FindManyOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';

import {
  FeesService,
} from 'src/Fees/fees.service';

import {
  FeeEntity,
} from 'src/Fees/fees.entity';

import {
  UserEntity,
} from 'src/Users/users.entity';

import {
  PaymentEntity,
} from './payments.entity';

import {
  PaymentDto,
} from './payments.dto';


@Injectable()
export class PaymentsService {


  constructor(

    @InjectRepository(PaymentEntity)
    private repo:
      Repository<PaymentEntity>,

    private readonly feesService:
      FeesService,

    private readonly dataSource:
      DataSource,

  ) {}


  //! GET ALL --------------------------------------------------------->

  async getAll(

    fee?: string,

    status?: string,

  ): Promise<PaymentDto[]> {

    try {

      const conditions:
        FindOptionsWhere<PaymentEntity> = {};


      if (fee) {

        conditions.fee = {
          id: fee,
        };

      }


      if (status) {

        conditions.status =
          status;

      }


      const findOptions:
        FindManyOptions<PaymentEntity> = {

          where:
            conditions,

          relations: {
            fee: {
              student: true,
            },
          },

          order: {
            created_at: 'DESC',
          },

        };


      return await this.repo.find(
        findOptions,
      );

    } catch (error: any) {

      throw new HttpException(

        error.response ??
        error.message,

        error.status ??
        HttpStatus.INTERNAL_SERVER_ERROR,

      );

    }

  }


  //! GET ONE --------------------------------------------------------->

  async getOne(
    id: string,
  ): Promise<PaymentDto> {

    if (!id) {

      throw new BadRequestException(
        'Invalid id parameter',
      );

    }


    try {

      const entity =
        await this.repo.findOne({

          where: {
            id,
          },

          relations: {
            fee: {
              student: true,
            },
          },

        });


      if (!entity) {

        throw new NotFoundException(
          'Payment not found',
        );

      }


      return entity;

    } catch (error: any) {

      throw new HttpException(

        error.response ??
        error.message,

        error.status ??
        HttpStatus.INTERNAL_SERVER_ERROR,

      );

    }

  }


  //! SAVE MANUAL PAYMENT -------------------------------------------->

  async saveManualPayment(

    feeId:
      string,

    registeredByUserId:
      string,

    paymentMethod:
      'cash' | 'transfer',

  ): Promise<PaymentEntity> {


    if (!feeId) {

      throw new BadRequestException(
        'Fee id is required',
      );

    }


    if (
      paymentMethod !== 'cash' &&
      paymentMethod !== 'transfer'
    ) {

      throw new BadRequestException(
        'Invalid manual payment method',
      );

    }


    try {

      return await this.dataSource
        .transaction(

          async manager => {

            const feeRepo =
              manager.getRepository(
                FeeEntity,
              );

            const paymentRepo =
              manager.getRepository(
                PaymentEntity,
              );


            /*
             * Bloqueamos la cuota durante
             * la transacción para evitar que
             * dos confirmaciones manuales
             * generen pagos duplicados.
             */
            const fee =
              await feeRepo.findOne({

                where: {
                  id:
                    feeId,
                },

                relations: {
                  student:
                    true,
                },

                lock: {
                  mode:
                    'pessimistic_write',
                },

              });


            if (!fee) {

              throw new NotFoundException(
                'Fee not found',
              );

            }


            if (!fee.active) {

              throw new BadRequestException(
                'Fee is not active',
              );

            }


            if (
              fee.status === 'paid'
            ) {

              throw new ConflictException(
                'Fee is already paid',
              );

            }


            const approvedAt =
              new Date();


            const payment =
              paymentRepo.create({

                fee,

                source:
                  'manual',

                mercado_pago_payment_id:
                  null,

                registered_by: {
                  id:
                    registeredByUserId,
                } as UserEntity,

                external_reference:
                  fee.id,

                amount:
                  Number(
                    fee.amount,
                  ),

                currency:
                  'ARS',

                status:
                  'approved',

                status_detail:
                  'registered_by_admin',

                payment_method:
                  paymentMethod,

                payment_type:
                  'manual',

                date_approved:
                  approvedAt,

                raw_response:
                  null,

              });


            const savedPayment =
              await paymentRepo.save(
                payment,
              );


            fee.status =
              'paid';

            fee.paid_at =
              approvedAt;


            await feeRepo.save(
              fee,
            );


            return savedPayment;

          },

        );

    } catch (error: any) {

      throw new HttpException(

        error.response ??
        error.message,

        error.status ??
        HttpStatus.INTERNAL_SERVER_ERROR,

      );

    }

  }


  //! SAVE MERCADO PAGO PAYMENT -------------------------------------->

  async saveMercadoPagoPayment(
    data: any,
  ): Promise<PaymentEntity> {

    try {

      /*
       * Mercado Pago necesita traer
       * un ID de pago.
       */

      if (!data?.id) {

        throw new BadRequestException(
          'Mercado Pago payment id is required',
        );

      }


      /*
       * external_reference va a contener
       * el UUID de nuestra cuota.
       */

      if (!data?.external_reference) {

        throw new BadRequestException(
          'External reference is required',
        );

      }


      const paymentId =
        String(data.id);


      const fee =
        await this.feesService.getOne(
          data.external_reference,
        );


      /*
       * El webhook puede llegar
       * más de una vez.
       *
       * Por eso primero buscamos si
       * este pago ya existe.
       */

      const existingPayment =
        await this.repo.findOne({

          where: {
            mercado_pago_payment_id:
              paymentId,
          },

          relations: {
            fee: true,
          },

        });


      const paymentData = {

        fee,

        source:
          'mercadopago' as const,

        registered_by:
          null,

        mercado_pago_payment_id:
          paymentId,

        external_reference:
          data.external_reference,

        amount:
          Number(
            data.transaction_amount,
          ),

        currency:
          data.currency_id ??
          'ARS',

        status:
          data.status,

        status_detail:
          data.status_detail ??
          null,

        payment_method:
          data.payment_method_id ??
          null,

        payment_type:
          data.payment_type_id ??
          null,

        date_approved:
          data.date_approved
            ? new Date(
                data.date_approved,
              )
            : null,

        raw_response:
          data,

      };


      let payment:
        PaymentEntity;


      /*
       * Si ya existe:
       * actualizamos su información.
       */

      if (existingPayment) {

        const mergeEntity =
          this.repo.merge(

            existingPayment,

            paymentData,

          );


        payment =
          await this.repo.save(
            mergeEntity,
          );

      } else {

        /*
         * Si todavía no existe:
         * lo creamos.
         */

        const newPayment =
          this.repo.create(
            paymentData,
          );


        payment =
          await this.repo.save(
            newPayment,
          );

      }


      /*
       * Verificamos que el monto
       * pagado coincida con la cuota.
       */

      const correctAmount =
        Number(
          data.transaction_amount,
        ) ===
        Number(
          fee.amount,
        );


      /*
       * Solamente marcamos la cuota
       * como pagada cuando:
       *
       * 1. Mercado Pago dice approved
       * 2. El monto coincide
       */

      if (
        data.status === 'approved' &&
        correctAmount &&
        fee.status !== 'paid'
      ) {

        await this.feesService.update(

          fee.id,

          {
            status: 'paid',
          },

        );

      }


      return payment;

    } catch (error: any) {

      throw new HttpException(

        error.response ??
        error.message,

        error.status ??
        HttpStatus.INTERNAL_SERVER_ERROR,

      );

    }

  }

}