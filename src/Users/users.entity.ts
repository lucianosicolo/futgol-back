import { StudentEntity } from 'src/Students/students.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';


@Entity('users')
export class UserEntity {

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
    length: 150,
    nullable: false,
    unique: true,
  })
  email: string;


  @Column('varchar', {
    length: 255,
    nullable: false,
    select: false,
  })
  password: string;


  @Column('varchar', {
    length: 30,
    nullable: false,
  })
  phone: string;


  @Column('varchar', {
    length: 30,
    nullable: false,
  })
  role: string;


  @Column('bool', {
    default: true,
  })
  active: boolean;
@ManyToMany(
  () => StudentEntity,
  (student) => student.responsibles,
)
@JoinTable({
  name: 'responsible_students',
  joinColumn: {
    name: 'responsible_id',
    referencedColumnName: 'id',
  },
  inverseJoinColumn: {
    name: 'student_id',
    referencedColumnName: 'id',
  },
})
students: StudentEntity[];
}