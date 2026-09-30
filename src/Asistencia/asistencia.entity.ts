import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import {
  StudentEntity,
} from 'src/Students/students.entity';


@Entity('asistencia')
@Index(
  [
    'student',
    'date',
  ],
  {
    unique: true,
  },
)
export class AsistenciaEntity {


  @PrimaryGeneratedColumn('uuid')
  id: string;


  /*
   * Alumno al que pertenece
   * esta asistencia.
   */
  @ManyToOne(
    () => StudentEntity,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'student_id',
  })
  student:
    StudentEntity;


  /*
   * Fecha del entrenamiento.
   *
   * Ejemplo:
   * 2026-09-28
   */
  @Column({
    type: 'date',
  })
  date:
    string;


  /*
   * true  = presente
   * false = ausente / sin marcar
   */
  @Column({
    type: 'boolean',
    default: false,
  })
  present:
    boolean;


  @CreateDateColumn({
    name: 'created_at',
  })
  created_at:
    Date;


  @UpdateDateColumn({
    name: 'updated_at',
  })
  updated_at:
    Date;

}