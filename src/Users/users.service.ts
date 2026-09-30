import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  In,
  Like,
  Repository,
} from 'typeorm';

import * as bcrypt from 'bcrypt';
import { UserEntity } from './users.entity';
import { UserDto } from './users.dto';
import { UserRole } from './user-role.enum';
import { StudentEntity } from 'src/Students/students.entity';




@Injectable()
export class UsersService {


  constructor(

    @InjectRepository(UserEntity)
    private repo:
      Repository<UserEntity>,

    @InjectRepository(StudentEntity)
    private studentsRepo:
      Repository<StudentEntity>,

  ) { }


  //! GET ALL --------------------------------------------------------->

  async getAll(
    name?: string,
    email?: string,
    role?: UserRole,
    active?: boolean,
  ): Promise<UserDto[]> {

    try {

      return await this.repo.find({
relations:{
   students: true,
},
        where: {

          ...(name
            ? {
              name: Like(
                `%${name}%`,
              ),
            }
            : {}),

          ...(email
            ? {
              email: Like(
                `%${email}%`,
              ),
            }
            : {}),

          ...(role
            ? {
              role,
            }
            : {}),

          ...(active !== undefined
            ? {
              active,
            }
            : {}),

        },

        order: {
          last_name: 'ASC',
          name: 'ASC',
        },

      });

    } catch (error: any) {

      throw new HttpException(
        error.response ??
        error.message,

        error.status ??
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    }

  }


  //! GET ONE --------------------------------------------------------->

  async getOne(
    id: string,
  ): Promise<UserDto> {

    if (!id) {

      throw new BadRequestException(
        'Invalid id parameter',
      );

    }


    try {

      const entity =
        await this.repo.findOne({

          where: {
            id,
          },

        });


      if (!entity) {

        throw new NotFoundException(
          'User not found',
        );

      }


      return entity;

    } catch (error: any) {

      throw new HttpException(
        error.response ??
        error.message,

        error.status ??
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    }

  }


  //! INSERT ---------------------------------------------------------->
  //! INSERT ---------------------------------------------------------->

  async insert(
    type: UserDto,
  ): Promise<UserDto> {

    try {

      /*
       * Normalizamos email.
       */

      const email =
        type.email
          .trim()
          .toLowerCase();


      /*
       * Evitamos usuarios duplicados.
       */

      const entry =
        await this.repo.findOne({

          where: {
            email,
          },

        });


      if (entry) {

        throw new ConflictException(
          'User already exists',
        );

      }


      /*
       * Validamos rol.
       */

      const validRoles:
        UserRole[] = [

          UserRole.ADMIN,
          UserRole.TEACHER,
          UserRole.RESPONSIBLE,

        ];


      if (
        !validRoles.includes(
          type.role,
        )
      ) {

        throw new BadRequestException(
          'Invalid user role',
        );

      }


      /*
       * Hasheamos contraseña.
       */

      const password =
        await bcrypt.hash(
          type.password,
          10,
        );


      /*
       * Alumnos a cargo.
       */

      let students:
        StudentEntity[] =
        [];


      if (
        type.students &&
        type.students.length > 0
      ) {

        const studentIds =
          [
            ...new Set(

              type.students
                .map(
                  student =>
                    student.id,
                )
                .filter(
                  id => !!id,
                ),

            ),
          ];


        if (
          studentIds.length === 0
        ) {

          throw new BadRequestException(
            'Invalid students',
          );

        }


        students =
          await this.studentsRepo.find({

            where: {

              id:
                In(
                  studentIds,
                ),

              active:
                true,

            },

          });


        if (
          students.length !==
          studentIds.length
        ) {

          throw new NotFoundException(
            'One or more students were not found',
          );

        }

      }


      /*
       * Creamos usuario.
       *
       * Esto tiene que estar FUERA
       * del if anterior.
       */

      const newType =
        this.repo.create({

          name:
            type.name,

          last_name:
            type.last_name,

          email,

          password,

          phone:
            type.phone,

          role:
            type.role,

          active:
            true,

          students,

        });


      const result =
        await this.repo.save(
          newType,
        );


      /*
       * No devolvemos password.
       */

      delete (
        result as Partial<UserEntity>
      ).password;


      return result;


    } catch (error: any) {

      throw new HttpException(

        error.response ??
        error.message,

        error.status ??
        HttpStatus.INTERNAL_SERVER_ERROR,

      );

    }

  }


  //! UPDATE ---------------------------------------------------------->
//! UPDATE ---------------------------------------------------------->

async update(

  id: string,

  type:
    Partial<UserDto>,

): Promise<UserDto> {

  if (!id) {

    throw new BadRequestException(
      'Invalid id parameter',
    );

  }


  try {

    /*
     * Traemos también los alumnos
     * actualmente asociados.
     */

    const entity =
      await this.repo.findOne({

        where: {
          id,
        },

        relations: {
          students: true,
        },

      });


    if (!entity) {

      throw new NotFoundException(
        'User not found',
      );

    }


    /* ============================= */
    /* EMAIL                         */
    /* ============================= */

    if (type.email) {

      const email =
        type.email
          .trim()
          .toLowerCase();


      const existingUser =
        await this.repo.findOne({

          where: {
            email,
          },

        });


      if (
        existingUser &&
        existingUser.id !== id
      ) {

        throw new ConflictException(
          'User already exists',
        );

      }


      type.email =
        email;

    }


    /* ============================= */
    /* ROL                           */
    /* ============================= */

    if (type.role) {

      const validRoles:
        UserRole[] = [

          UserRole.ADMIN,
          UserRole.TEACHER,
          UserRole.RESPONSIBLE,

        ];


      if (
        !validRoles.includes(
          type.role,
        )
      ) {

        throw new BadRequestException(
          'Invalid user role',
        );

      }

    }


    /* ============================= */
    /* PASSWORD                      */
    /* ============================= */

    if (type.password) {

      type.password =
        await bcrypt.hash(
          type.password,
          10,
        );

    }


    /* ============================= */
    /* ALUMNOS A CARGO               */
    /* ============================= */

    let students:
      StudentEntity[] | undefined =
      undefined;


    /*
     * Importante:
     *
     * undefined
     * → no tocar relaciones
     *
     * []
     * → eliminar todas
     *
     * [{ id: ... }]
     * → reemplazar por esas
     */

    if (
      type.students !== undefined
    ) {

      /*
       * Solamente un responsable
       * debería tener alumnos
       * asociados a cargo.
       */

      const finalRole =
        type.role ??
        entity.role;


      if (
        finalRole !==
        UserRole.RESPONSIBLE
      ) {

        if (
          type.students.length > 0
        ) {

          throw new BadRequestException(
            'Only responsible users can have students assigned',
          );

        }

      }


      if (
        type.students.length === 0
      ) {

        students =
          [];

      } else {

        const studentIds =
          [
            ...new Set(

              type.students
                .map(
                  student =>
                    student.id,
                )
                .filter(
                  id => !!id,
                ),

            ),
          ];


        if (
          studentIds.length === 0
        ) {

          throw new BadRequestException(
            'Invalid students',
          );

        }


        students =
          await this.studentsRepo.find({

            where: {

              id:
                In(
                  studentIds,
                ),

              active:
                true,

            },

          });


        if (
          students.length !==
          studentIds.length
        ) {

          throw new NotFoundException(
            'One or more students were not found',
          );

        }

      }

    }


    /* ============================= */
    /* DATOS NORMALES                */
    /* ============================= */

    const {
      students:
        ignoredStudents,

      ...userData

    } = type;


    const mergeEntity =
      this.repo.merge(

        entity,

        userData,

      );


    /*
     * Solo reemplazamos la relación
     * cuando students vino en el PUT.
     */

    if (
      students !== undefined
    ) {

      mergeEntity.students =
        students;

    }


    const result =
      await this.repo.save(
        mergeEntity,
      );


    delete (
      result as Partial<UserEntity>
    ).password;


    return result;


  } catch (error: any) {

    throw new HttpException(

      error.response ??
      error.message,

      error.status ??
      HttpStatus.INTERNAL_SERVER_ERROR,

    );

  }

}


  //! DELETE ---------------------------------------------------------->

  async delete(
    id: string,
  ): Promise<UserDto> {

    if (!id) {

      throw new BadRequestException(
        'Invalid id parameter',
      );

    }


    try {

      const entity =
        await this.repo.findOne({

          where: {
            id,
          },

        });


      if (!entity) {

        throw new NotFoundException(
          'User not found',
        );

      }


      /*
       * No eliminamos físicamente
       * al usuario.
       */

      entity.active =
        false;


      return await this.repo.save(
        entity,
      );

    } catch (error: any) {

      throw new HttpException(
        error.response ??
        error.message,

        error.status ??
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    }

  }


  //! GET BY EMAIL ---------------------------------------------------->
  /*
   * Este método después lo vamos
   * a usar para el LOGIN.
   *
   * Acá sí necesitamos traer password.
   */

  async getByEmailWithPassword(
    email: string,
  ): Promise<UserEntity | null> {

    try {

      return await this.repo
        .createQueryBuilder('user')

        .addSelect(
          'user.password',
        )

        .where(
          'LOWER(user.email) = LOWER(:email)',
          {
            email,
          },
        )

        .getOne();

    } catch (error: any) {

      throw new HttpException(
        error.response ??
        error.message,

        error.status ??
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    }

  }

}