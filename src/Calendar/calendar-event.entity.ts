import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import {
  CategoryEntity,
} from 'src/Categories/category.entity';

import {
  UserEntity,
} from 'src/Users/users.entity';


@Entity('calendar_events')
export class CalendarEventEntity {


  @PrimaryGeneratedColumn('uuid')
  id:
    string;


  @Column('varchar', {
    length:
      120,
  })
  title:
    string;


  @Column('varchar', {
    length:
      20,
  })
  type:
    'training' |
    'match' |
    'general';


  @Column('date')
  date:
    string;


  @Column('varchar', {
    length:
      5,
  })
  time:
    string;


  @Column('int', {
    default:
      90,
  })
  duration_minutes:
    number;


  @ManyToOne(
    () => CategoryEntity,
    {
      nullable:
        true,
      onDelete:
        'SET NULL',
    },
  )
  @JoinColumn({
    name:
      'category_id',
  })
  category:
    CategoryEntity | null;


  @Column('varchar', {
    length:
      160,
    nullable:
      true,
  })
  location:
    string | null;


  @Column('varchar', {
    length:
      120,
    nullable:
      true,
  })
  opponent:
    string | null;


  @ManyToOne(
    () => UserEntity,
    {
      nullable:
        false,
      onDelete:
        'RESTRICT',
    },
  )
  @JoinColumn({
    name:
      'created_by_user_id',
  })
  created_by:
    UserEntity;


  @Column('bool', {
    default:
      true,
  })
  active:
    boolean;


  @CreateDateColumn({
    type:
      'datetime',
  })
  created_at:
    Date;


  @UpdateDateColumn({
    type:
      'datetime',
  })
  updated_at:
    Date;

}
