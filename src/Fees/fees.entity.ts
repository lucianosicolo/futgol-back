
import { StudentEntity } from 'src/Students/students.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';


@Entity('fees')
export class FeeEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;


  @ManyToOne(
    () => StudentEntity,
    {
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'student_id',
  })
  student: StudentEntity;


  @Column('varchar', {
    length: 50,
    nullable: false,
  })
  period: string;


  @Column('decimal', {
    precision: 12,
    scale: 2,
    nullable: false,
  })
  amount: number;


  @Column('varchar', {
    length: 20,
    default: 'due',
    nullable: false,
  })
  status: string;


  @Column('date', {
    nullable: false,
  })
  due_date: Date;


  @Column('datetime', {
    nullable: true,
  })
  paid_at: Date | null;

  @Column('bool', {
    default: true,
  })
  active: boolean;

}