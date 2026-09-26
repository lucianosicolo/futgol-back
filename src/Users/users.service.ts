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
  Like,
  Repository,
} from 'typeorm';

import * as bcrypt from 'bcrypt';
import { UserEntity } from './users.entity';
import { UserDto } from './users.dto';




@Injectable()
export class UsersService {


  constructor(

    @InjectRepository(UserEntity)
    private repo: Repository<UserEntity>,

  ) {}


  //! GET ALL --------------------------------------------------------->

  async getAll(
    name?: string,
    email?: string,
    role?: string,
    active?: boolean,
  ): Promise<UserDto[]> {

    try {

      return await this.repo.find({

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

  async insert(
    type: UserDto,
  ): Promise<UserDto> {

    try {

      /*
       * Normalizamos email para evitar:
       *
       * usuario@gmail.com
       * Usuario@gmail.com
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
       * Validamos el rol.
       */

      const validRoles = [
        'admin',
        'teacher',
        'responsible',
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
       * Creamos usuario.
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

        });


      const result =
        await this.repo.save(
          newType,
        );


      /*
       * No devolvemos la contraseña.
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

  async update(
    id: string,
    type: Partial<UserDto>,
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
       * Si cambia email,
       * verificamos duplicados.
       */

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


      /*
       * Si cambia rol,
       * validamos.
       */

      if (type.role) {

        const validRoles = [
          'admin',
          'teacher',
          'responsible',
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


      /*
       * Si mandan nueva contraseña,
       * la volvemos a hashear.
       */

      if (type.password) {

        type.password =
          await bcrypt.hash(
            type.password,
            10,
          );

      }


      const mergeEntity =
        this.repo.merge(
          entity,
          type,
        );


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