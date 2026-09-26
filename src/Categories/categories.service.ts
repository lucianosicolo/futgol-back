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

import {
  CategoryDto,
} from './category.dto';

import {
  CategoryEntity,
} from './category.entity';


@Injectable()
export class CategoriesService {


  constructor(

    @InjectRepository(CategoryEntity)
    private repo: Repository<CategoryEntity>,

  ) {}


  //! GET ALL --------------------------------------------------------->

  async getAll(
    name?: string,
    active?: boolean,
  ): Promise<CategoryDto[]> {

    try {

      return await this.repo.find({

        where: {

          ...(name
            ? {
                name: Like(
                  `%${name}%`
                ),
              }
            : {}),

          ...(active !== undefined
            ? {
                active,
              }
            : {}),

        },

        order: {
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
  ): Promise<CategoryDto> {

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
          'Category not found',
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
    type: CategoryDto,
  ): Promise<CategoryDto> {

    try {

      /*
       * Evitamos crear dos categorías
       * con el mismo nombre.
       */

      const entry =
        await this.repo.findOne({

          where: {
            name: type.name,
          },

        });


      if (entry) {

        throw new ConflictException(
          'Category already exists',
        );

      }


      const newType =
        this.repo.create({

          ...type,

          active:
            type.active !== undefined
              ? type.active
              : true,

        });


      return await this.repo.save(
        newType,
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


  //! UPDATE ---------------------------------------------------------->

  async update(
    id: string,
    type: Partial<CategoryDto>,
  ): Promise<CategoryDto> {

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
          'Category not found',
        );

      }


      /*
       * Si cambia el nombre verificamos
       * que no exista otra categoría igual.
       */

      if (
        type.name &&
        type.name !== entity.name
      ) {

        const existingCategory =
          await this.repo.findOne({

            where: {
              name: type.name,
            },

          });


        if (
          existingCategory &&
          existingCategory.id !== id
        ) {

          throw new ConflictException(
            'Category already exists',
          );

        }

      }


      const mergeEntity =
        this.repo.merge(
          entity,
          type,
        );


      return await this.repo.save(
        mergeEntity,
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


  //! DELETE ---------------------------------------------------------->

  async delete(
    id: string,
  ): Promise<CategoryDto> {

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
          'Category not found',
        );

      }


      /*
       * Para FUTGOL prefiero NO borrar
       * físicamente la categoría.
       *
       * La dejamos inactiva.
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

}