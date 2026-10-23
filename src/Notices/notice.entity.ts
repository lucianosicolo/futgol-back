import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import {
  CategoryEntity,
} from 'src/Categories/category.entity';

import {
  StudentEntity,
} from 'src/Students/students.entity';

import {
  UserEntity,
} from 'src/Users/users.entity';


@Entity('notices')
export class NoticeEntity {


  @PrimaryGeneratedColumn('uuid')
  id:
    string;


  @Column('varchar', {
    length:
      30,
    nullable:
      false,
  })
  type:
    'payment' |
    'training' |
    'general';


  @Column('varchar', {
    length:
      500,
    nullable:
      false,
  })
  message:
    string;


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


  @ManyToOne(
    () => StudentEntity,
    {
      nullable:
        true,
      onDelete:
        'SET NULL',
    },
  )
  @JoinColumn({
    name:
      'student_id',
  })
  student:
    StudentEntity | null;


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


  @ManyToMany(
    () => UserEntity,
  )
  @JoinTable({
    name:
      'notice_recipients',

    joinColumn: {
      name:
        'notice_id',
      referencedColumnName:
        'id',
    },

    inverseJoinColumn: {
      name:
        'user_id',
      referencedColumnName:
        'id',
    },
  })
  recipients:
    UserEntity[];


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

}
