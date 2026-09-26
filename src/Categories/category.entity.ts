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


  @Column('bool', {
    default: true,
  })
  active: boolean;

}