import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import {
  FeeEntity,
} from 'src/Fees/fees.entity';


@Entity('payments')
export class PaymentEntity {


  @PrimaryGeneratedColumn('uuid')
  id: string;


  @ManyToOne(
    () => FeeEntity,
    {
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'fee_id',
  })
  fee: FeeEntity;


  @Column('varchar', {
    length: 100,
    nullable: false,
    unique: true,
  })
  mercado_pago_payment_id: string;


  @Column('varchar', {
    length: 255,
    nullable: true,
  })
  external_reference: string | null;


  @Column('decimal', {
    precision: 12,
    scale: 2,
    nullable: false,
  })
  amount: number;


  @Column('varchar', {
    length: 10,
    nullable: false,
    default: 'ARS',
  })
  currency: string;


  @Column('varchar', {
    length: 50,
    nullable: false,
  })
  status: string;


  @Column('varchar', {
    length: 100,
    nullable: true,
  })
  status_detail: string | null;


  @Column('varchar', {
    length: 100,
    nullable: true,
  })
  payment_method: string | null;


  @Column('varchar', {
    length: 100,
    nullable: true,
  })
  payment_type: string | null;


  @Column('datetime', {
    nullable: true,
  })
  date_approved: Date | null;


  @Column('json', {
    nullable: true,
  })
  raw_response: any;


  @CreateDateColumn({
    type: 'datetime',
  })
  created_at: Date;

}