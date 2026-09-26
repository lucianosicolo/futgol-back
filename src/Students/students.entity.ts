
import { CategoryEntity } from 'src/Categories/category.entity';
import { UserEntity } from 'src/Users/users.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';


@Entity('students')
export class StudentEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;


  @Column('varchar', {
    length: 100,
    nullable: false,
  })
  name: string;


  @Column('varchar', {
    length: 100,
    nullable: false,
  })
  last_name: string;


  @Column('varchar', {
    length: 30,
    nullable: false,
    unique: true,
  })
  document: string;


  @Column('date', {
    nullable: false,
  })
  birth_date: Date;


  @Column('varchar', {
    length: 255,
    nullable: true,
  })
  address: string;


  @Column('varchar', {
    length: 255,
    nullable: true,
  })
  avatar: string;


  @Column('bool', {
    default: true,
  })
  active: boolean;


  @ManyToOne(
    () => CategoryEntity,
    {
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'category_id',
  })
  category: CategoryEntity;
 @ManyToMany(
  () => UserEntity,
  (user) => user.students,
)
responsibles: UserEntity[];
}