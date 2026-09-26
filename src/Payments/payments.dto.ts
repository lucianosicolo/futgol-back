import {
  FeeDto,
} from 'src/Fees/fees.dto';


export class PaymentDto {

  id: string;

  fee: FeeDto;

  mercado_pago_payment_id: string;

  external_reference: string | null;

  amount: number;

  currency: string;

  status: string;

  status_detail: string | null;

  payment_method: string | null;

  payment_type: string | null;

  date_approved: Date | null;

  raw_response: any;

  created_at: Date;

}