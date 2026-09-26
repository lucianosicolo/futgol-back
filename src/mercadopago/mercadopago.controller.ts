import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import {
  WebhookSignatureValidator,
} from 'mercadopago';

import {
  MercadoPagoService,
} from './mercadopago.service';


@Controller('mercadopago')
export class MercadoPagoController {


  constructor(

    private readonly mercadoPagoService:
      MercadoPagoService,

    private readonly configService:
      ConfigService,

  ) {}


  /* ================================= */
  /* WEBHOOK MERCADO PAGO              */
  /* ================================= */

  @Post('webhook')
  @HttpCode(200)
  async webhook(

    @Body()
    body: {

      id?: string;

      action?: string;

      type?: string;

      status?: string;

      data?: {
        id?: string;
      };

    },


    @Headers('x-signature')
    xSignature?: string,


    @Headers('x-request-id')
    xRequestId?: string,


    @Query('data.id')
    dataId?: string,


    @Query('type')
    queryType?: string,

  ) {


    /* ================================= */
    /* TIPO DE EVENTO                    */
    /* ================================= */

    const type =
      queryType ??
      body.type;


    /*
     * Ignoramos cualquier evento
     * que no nos interese.
     */

    if (
      type !== 'payment' &&
      type !== 'topic_merchant_order_wh' &&
      type !== 'merchant_order'
    ) {

      return {
        received: true,
      };

    }


    /* ================================= */
    /* ID DEL RECURSO                    */
    /* ================================= */

    const resourceId =
      dataId ??
      body.data?.id ??
      body.id;


    if (!resourceId) {

    


      return {
        received: true,
      };

    }


 

    /* ================================= */
    /* PAYMENT                           */
    /* ================================= */

    if (
      type === 'payment'
    ) {


      /*
       * Los eventos payment
       * sí requieren firma válida.
       */

      const secret =
        this.configService.get<string>(
          'MERCADOPAGO_WEBHOOK_SECRET',
        )?.trim();


      if (!secret) {

        throw new Error(
          'Falta MERCADOPAGO_WEBHOOK_SECRET',
        );

      }


      try {

        WebhookSignatureValidator.validate({

          xSignature,

          xRequestId,

          dataId:
            resourceId,

          secret,

        });


       


      } catch (error) {

        console.error(
          'PAYMENT WEBHOOK RECHAZADO',
        );


        throw new UnauthorizedException(
          'Webhook inválido',
        );

      }


      /*
       * Respondemos sin esperar
       * todo el procesamiento.
       */

      void this.mercadoPagoService

        .processPayment(
          String(
            resourceId,
          ),
        )

        .then(
          payment => {

      

          },
        )

        .catch(
          error => {

            console.error(
              'ERROR PROCESANDO PAGO:',
              error,
            );

          },
        );


      return {

        received:
          true,

        type,

        paymentId:
          resourceId,

      };

    }


    /* ================================= */
    /* MERCHANT ORDER                    */
    /* ================================= */

    if (
      type ===
        'topic_merchant_order_wh' ||
      type ===
        'merchant_order'
    ) {


      /*
       * Este evento legacy no lo usamos
       * como fuente de verdad.
       *
       * Solamente usamos su ID y luego
       * consultamos Mercado Pago
       * directamente desde el service.
       */

  


      /*
       * Cuando está abierta todavía
       * no hay nada que procesar.
       */

      if (
        body.status !== 'closed'
      ) {

       

        return {

          received:
            true,

          type,

          merchantOrderId:
            resourceId,

          status:
            body.status,

        };

      }


      /*
       * Cuando la orden está cerrada,
       * consultamos la orden real
       * directamente contra Mercado Pago.
       */

   


      void this.mercadoPagoService

        .processMerchantOrder(
          String(
            resourceId,
          ),
        )

        .then(
          result => {

    

          },
        )

        .catch(
          error => {

            console.error(
              'ERROR PROCESANDO MERCHANT ORDER:',
              error,
            );

          },
        );


      return {

        received:
          true,

        type,

        merchantOrderId:
          resourceId,

        status:
          body.status,

      };

    }


    return {
      received: true,
    };

  }


  /* ================================= */
  /* CREAR PREFERENCIA                 */
  /* ================================= */

  @Post('preference')
  createPreference(

    @Body()
    body: {

      feeId: string;

    },

  ) {


    return this.mercadoPagoService
      .createPreference({

        feeId:
          body.feeId,

      });

  }

}