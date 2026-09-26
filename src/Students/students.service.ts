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
  FindManyOptions,
  FindOptionsWhere,
  Like,
  Repository,
} from 'typeorm';
import { StudentEntity } from './students.entity';
import { CategoriesService } from 'src/Categories/categories.service';
import { StudentDto } from './students.dto';




@Injectable()
export class StudentsService {


  constructor(

    @InjectRepository(StudentEntity)
    private repo: Repository<StudentEntity>,

    private readonly categoriesService:
      CategoriesService,

  ) {}


  //! GET ALL --------------------------------------------------------->

  async getAll(

    name?: string,

    document?: string,

    category?: string,

    active?: boolean,

  ): Promise<StudentDto[]> {

    try {

      const conditions:
        FindOptionsWhere<StudentEntity> = {};


      if (name) {

        conditions.name =
          Like(`%${name}%`);

      }


      if (document) {

        conditions.document =
          Like(`%${document}%`);

      }


      if (category) {

        conditions.category = {
          id: category,
        };

      }


      if (active !== undefined) {

        conditions.active =
          active;

      }


      const findOptions:
        FindManyOptions<StudentEntity> = {

          where:
            conditions,

          relations: {
            category: true,
          },

          order: {
            last_name: 'ASC',
            name: 'ASC',
          },

        };


      return await this.repo.find(
        findOptions,
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


  //! GET ONE --------------------------------------------------------->

 async getOne(
  id: string,
): Promise<StudentEntity> {

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

          relations: {
            category: true,
          },

        });


      if (!entity) {

        throw new NotFoundException(
          'Student not found',
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
    type: StudentDto,
  ): Promise<StudentDto> {

    try {

      /*
       * Evitamos alumnos duplicados
       * por documento.
       */

      const entry =
        await this.repo.findOne({

          where: {
            document:
              type.document,
          },

        });


      if (entry) {

        throw new ConflictException(
          'Student already exists',
        );

      }


      /*
       * La categoría es obligatoria.
       */

      if (
        !type.category ||
        !type.category.id
      ) {

        throw new BadRequestException(
          'Category is required',
        );

      }


      /*
       * Buscamos la categoría real
       * en base de datos.
       */

      const category =
        await this.categoriesService.getOne(
          type.category.id,
        );


      /*
       * Creamos alumno.
       */

      const newType =
        this.repo.create({

          name:
            type.name,

          last_name:
            type.last_name,

          document:
            type.document,

          birth_date:
            type.birth_date,

          address:
            type.address,

          avatar:
            type.avatar,

          active:
            true,

          category:
            category,

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

    type:
      Partial<StudentDto>,

  ): Promise<StudentDto> {

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

          relations: {
            category: true,
          },

        });


      if (!entity) {

        throw new NotFoundException(
          'Student not found',
        );

      }


      /*
       * Si cambia documento,
       * verificamos que no exista.
       */

      if (
        type.document &&
        type.document !== entity.document
      ) {

        const existingStudent =
          await this.repo.findOne({

            where: {
              document:
                type.document,
            },

          });


        if (
          existingStudent &&
          existingStudent.id !== id
        ) {

          throw new ConflictException(
            'Student already exists',
          );

        }

      }


      /*
       * Si cambia categoría,
       * buscamos la nueva.
       */

      if (
        type.category &&
        type.category.id
      ) {

        const category =
          await this.categoriesService
            .getOne(
              type.category.id,
            );


        entity.category =
          category;

      }


      /*
       * Evitamos meter el objeto DTO
       * de category directamente
       * en el merge.
       */

      const {
        category,
        ...studentData
      } = type;


      const mergeEntity =
        this.repo.merge(

          entity,

          studentData,

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
  ): Promise<StudentDto> {

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

          relations: {
            category: true,
          },

        });


      if (!entity) {

        throw new NotFoundException(
          'Student not found',
        );

      }


      /*
       * Baja lógica.
       * No borramos al alumno.
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