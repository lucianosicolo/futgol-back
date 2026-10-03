import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';


@Entity('categories')
export class CategoryEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;


  @Column('varchar', {
    length: 100,
    nullable: false,
    unique: true,
  })
  name: string;
 @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0,
  })
  monthly_fee: number;

  @Column('bool', {
    default: true,
  })
  active: boolean;

}