import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import {
  MercadoPagoConfig,
  Payment,
  Preference,
} from 'mercadopago';

import {
  FeesService,
} from 'src/Fees/fees.service';

import {
  PaymentsService,
} from 'src/Payments/payments.service';


interface CreatePreferenceData {

  feeId: string;

}


@Injectable()
export class MercadoPagoService {


  private readonly payment: Payment;

  private readonly preference: Preference;


  constructor(

    private readonly configService:
      ConfigService,

    private readonly feesService:
      FeesService,

    private readonly paymentsService:
      PaymentsService,

  ) {


    const accessToken =
      this.configService.get<string>(
        'MERCADOPAGO_ACCESS_TOKEN',
      );


    if (!accessToken) {

      throw new Error(
        'No se encontró MERCADOPAGO_ACCESS_TOKEN',
      );

    }


    const client =
      new MercadoPagoConfig({
        accessToken,
      });


    this.preference =
      new Preference(client);


    this.payment =
      new Payment(client);

  }


  /* ============================= */
  /* CREAR PREFERENCIA             */
  /* ============================= */

  async createPreference(
    data: CreatePreferenceData,
  ) {

    try {


      /* ============================= */
      /* BUSCAR CUOTA EN BDD            */
      /* ============================= */

      if (!data.feeId) {

        throw new BadRequestException(
          'Fee id is required',
        );

      }


      const fee =
        await this.feesService.getOne(
          data.feeId,
        );


      /* ============================= */
      /* VALIDAR CUOTA                  */
      /* ============================= */

      if (!fee.active) {

        throw new BadRequestException(
          'Fee is not active',
        );

      }


      if (fee.status === 'paid') {

        throw new BadRequestException(
          'Fee is already paid',
        );

      }


      /*
       * La referencia externa ahora
       * es directamente el UUID
       * de nuestra cuota.
       */

      const externalReference =
        fee.id;


      /* ============================= */
      /* BACK URLS                     */
      /* ============================= */

      const successUrl =
        this.configService.get<string>(
          'MERCADOPAGO_SUCCESS_URL',
        );


      const pendingUrl =
        this.configService.get<string>(
          'MERCADOPAGO_PENDING_URL',
        );


      const failureUrl =
        this.configService.get<string>(
          'MERCADOPAGO_FAILURE_URL',
        );


      if (
        !successUrl ||
        !pendingUrl ||
        !failureUrl
      ) {

        throw new Error(
          'Faltan configurar las URLs de retorno de Mercado Pago',
        );

      }


      /* ============================= */
      /* VALIDAR HTTPS                 */
      /* ============================= */

      if (
        !successUrl.startsWith('https://') ||
        !pendingUrl.startsWith('https://') ||
        !failureUrl.startsWith('https://')
      ) {

        throw new Error(
          'Las URLs de retorno de Mercado Pago deben usar HTTPS',
        );

      }




      /* ============================= */
      /* CREAR PREFERENCIA             */
      /* ============================= */

      const result =
        await this.preference.create({

          body: {


            /* PRODUCTO */

            items: [

              {

                id:
                  fee.id,

                title:
                  `Cuota ${fee.period} - ` +
                  `${fee.student.name} ` +
                  `${fee.student.last_name}`,

                quantity:
                  1,

                currency_id:
                  'ARS',

                unit_price:
                  Number(
                    fee.amount,
                  ),

              },

            ],


            /* ============================= */
            /* REFERENCIA FUTGOL             */
            /* ============================= */

            external_reference:
              externalReference,


            /* ============================= */
            /* DATA FUTGOL                   */
            /* ============================= */

            metadata: {

              feeId:
                fee.id,

              studentId:
                fee.student.id,

              studentName:
                `${fee.student.name} ${fee.student.last_name}`,

              period:
                fee.period,

            },


            /* ============================= */
            /* RETORNO AL FRONT              */
            /* ============================= */

            back_urls: {

              success:
                successUrl,

              pending:
                pendingUrl,

              failure:
                failureUrl,

            },


            /* ============================= */
            /* VOLVER AUTOMÁTICAMENTE        */
            /* ============================= */

            auto_return:
              'approved',

          },

        });


     


      /* ============================= */
      /* RESPUESTA AL FRONT            */
      /* ============================= */

      return {

        preferenceId:
          result.id,

        checkoutUrl:
          result.sandbox_init_point ??
          result.init_point,

        externalReference,

        fee: {

          id:
            fee.id,

          period:
            fee.period,

          amount:
            Number(
              fee.amount,
            ),

          student:
            `${fee.student.name} ${fee.student.last_name}`,

        },

      };


    } catch (error) {


      console.error(
        'Error creando preferencia:',
        error,
      );


      /*
       * Si es un error nuestro
       * de validación, lo dejamos pasar.
       */

      if (
        error instanceof
        BadRequestException
      ) {

        throw error;

      }


      throw new InternalServerErrorException(
        'No se pudo crear el pago de Mercado Pago',
      );

    }

  }


  /* ============================= */
  /* BUSCAR PAGO EN MERCADO PAGO  */
  /* ============================= */

  async processPayment(
    paymentId: string,
  ) {

    try {


      /* ============================= */
      /* CONSULTAR MERCADO PAGO        */
      /* ============================= */

      const mpPayment =
        await this.payment.get({

          id:
            paymentId,

        });




    

   


    

      /* ============================= */
      /* VALIDAR REFERENCIA            */
      /* ============================= */

      if (
        !mpPayment.external_reference
      ) {

        throw new BadRequestException(
          'Mercado Pago payment has no external reference',
        );

      }


      /* ============================= */
      /* GUARDAR PAGO EN MYSQL         */
      /* ============================= */

      const payment =
        await this.paymentsService
          .saveMercadoPagoPayment(
            mpPayment,
          );



   

      /*
       * PaymentsService se encarga de:
       *
       * - crear Payment si no existe
       * - actualizarlo si ya existe
       * - verificar el monto
       * - verificar status approved
       * - cambiar Fee de due a paid
       */


      return payment;


    } catch (error) {


      console.error(
        'Error obteniendo pago:',
        error,
      );


      if (
        error instanceof
        BadRequestException
      ) {

        throw error;

      }


      throw new InternalServerErrorException(
        'No se pudo obtener el pago de Mercado Pago',
      );

    }

  }
  /* ================================= */
/* PROCESAR ORDEN COMERCIAL          */
/* ================================= */

async processMerchantOrder(
  merchantOrderId: string,
) {

  try {


    const accessToken =
      this.configService.get<string>(
        'MERCADOPAGO_ACCESS_TOKEN',
      );


    if (!accessToken) {

      throw new Error(
        'No se encontró MERCADOPAGO_ACCESS_TOKEN',
      );

    }


    /* ================================= */
    /* CONSULTAR MERCHANT ORDER          */
    /* ================================= */

    const response =
      await fetch(

        `https://api.mercadopago.com/merchant_orders/${merchantOrderId}`,

        {

          method:
            'GET',

          headers: {

            Authorization:
              `Bearer ${accessToken}`,

            'Content-Type':
              'application/json',

          },

        },

      );


    if (!response.ok) {

      const errorText =
        await response.text();


      throw new Error(
        `Error consultando merchant order: ${response.status} ${errorText}`,
      );

    }


    const merchantOrder: any =
      await response.json();


 
   


    /* ================================= */
    /* BUSCAR PAGOS                      */
    /* ================================= */

    const payments =
      merchantOrder.payments ?? [];


    if (
      payments.length === 0
    ) {

    

      return {
        merchantOrderId,
        payments: [],
      };

    }



    /* ================================= */
    /* PROCESAR PAGOS REALES             */
    /* ================================= */

    const processedPayments:
      any[] = [];


    for (
      const payment of payments
    ) {

      if (!payment.id) {
        continue;
      }


      /*
       * Usamos el mismo método
       * que ya tenemos para payment.
       */

      const processedPayment =
        await this.processPayment(
          String(
            payment.id,
          ),
        );


      processedPayments.push(
        processedPayment,
      );

    }


    return {

      merchantOrderId,

      status:
        merchantOrder.status,

      externalReference:
        merchantOrder.external_reference,

      payments:
        processedPayments,

    };


  } catch (error) {


    console.error(
      'Error procesando merchant order:',
      error,
    );


    throw new InternalServerErrorException(
      'No se pudo procesar la orden comercial de Mercado Pago',
    );

  }

}

}