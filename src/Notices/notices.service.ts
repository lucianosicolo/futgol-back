import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import {
  StudentEntity,
} from 'src/Students/students.entity';

import {
  UserRole,
} from 'src/Users/user-role.enum';

import {
  UserEntity,
} from 'src/Users/users.entity';

import {
  NoticeCreateDto,
} from './notice.dto';

import {
  NoticeEntity,
} from './notice.entity';


@Injectable()
export class NoticesService {


  constructor(

    @InjectRepository(
      NoticeEntity,
    )
    private readonly repo:
      Repository<NoticeEntity>,

    @InjectRepository(
      StudentEntity,
    )
    private readonly studentsRepo:
      Repository<StudentEntity>,

    @InjectRepository(
      UserEntity,
    )
    private readonly usersRepo:
      Repository<UserEntity>,

  ) {}


  private normalizeMessage(
    message:
      string,
  ):
    string {

    const normalized =
      message
        ?.trim();


    if (
      !normalized
    ) {

      throw new BadRequestException(
        'Message is required',
      );

    }


    if (
      normalized.length >
      500
    ) {

      throw new BadRequestException(
        'Message is too long',
      );

    }


    return normalized;

  }


  private validateType(
    type:
      NoticeCreateDto['type'],
  ):
    void {

    if (
      type !== 'payment' &&
      type !== 'training' &&
      type !== 'general'
    ) {

      throw new BadRequestException(
        'Invalid notice type',
      );

    }

  }


  private collectRecipients(
    students:
      StudentEntity[],
  ):
    UserEntity[] {

    const byId =
      new Map<
        string,
        UserEntity
      >();


    for (
      const student
      of students
    ) {

      if (
        student.user &&
        student.user.active &&
        student.user.role ===
          UserRole.RESPONSIBLE
      ) {

        byId.set(
          student.user.id,
          student.user,
        );

      }


      for (
        const responsible
        of student.responsibles ??
        []
      ) {

        if (
          responsible.active &&
          responsible.role ===
            UserRole.RESPONSIBLE
        ) {

          byId.set(
            responsible.id,
            responsible,
          );

        }

      }

    }


    return [
      ...byId.values(),
    ];

  }


  async create(

    type:
      NoticeCreateDto,

    createdByUserId:
      string,

  ) {

    this.validateType(
      type.type,
    );


    const message =
      this.normalizeMessage(
        type.message,
      );


    if (
      type.studentId &&
      type.categoryId
    ) {

      throw new BadRequestException(
        'Choose student or category, not both',
      );

    }


    try {

      const creator =
        await this.usersRepo
          .findOne({

            where: {
              id:
                createdByUserId,
              active:
                true,
            },

          });


      if (
        !creator
      ) {

        throw new NotFoundException(
          'Creator not found',
        );

      }


      if (
        creator.role !==
          UserRole.ADMIN &&
        creator.role !==
          UserRole.TEACHER
      ) {

        throw new ForbiddenException(
          'User cannot create notices',
        );

      }


      const query =
        this.studentsRepo
          .createQueryBuilder(
            'student',
          )

          .leftJoinAndSelect(
            'student.category',
            'category',
          )

          .leftJoinAndSelect(
            'student.user',
            'studentUser',
          )

          .leftJoinAndSelect(
            'student.responsibles',
            'responsibles',
          )

          .where(
            'student.active = :active',
            {
              active:
                true,
            },
          );


      if (
        type.studentId
      ) {

        query.andWhere(
          'student.id = :studentId',
          {
            studentId:
              type.studentId,
          },
        );

      }


      if (
        type.categoryId
      ) {

        query.andWhere(
          'category.id = :categoryId',
          {
            categoryId:
              type.categoryId,
          },
        );

      }


      const students =
        await query
          .getMany();


      if (
        students.length ===
        0
      ) {

        throw new NotFoundException(
          'No active students found for this audience',
        );

      }


      const recipients =
        this.collectRecipients(
          students,
        );


      if (
        recipients.length ===
        0
      ) {

        throw new BadRequestException(
          'No active responsible users found for this audience',
        );

      }


      const selectedStudent =
        type.studentId
          ? students[0]
          : null;


      const selectedCategory =
        type.categoryId
          ? students[0]
              ?.category ??
            null
          : null;


      const notice =
        this.repo.create({

          type:
            type.type,

          message,

          category:
            selectedCategory,

          student:
            selectedStudent,

          created_by:
            creator,

          recipients,

          active:
            true,

        });


      const saved =
        await this.repo.save(
          notice,
        );


      return {

        ...saved,

        recipientCount:
          recipients.length,

      };

    } catch (
      error: any
    ) {

      throw new HttpException(

        error.response ??
        error.message,

        error.status ??
        HttpStatus
          .INTERNAL_SERVER_ERROR,

      );

    }

  }


  async getAll() {

    try {

      return await this.repo
        .createQueryBuilder(
          'notice',
        )

        .leftJoinAndSelect(
          'notice.category',
          'category',
        )

        .leftJoinAndSelect(
          'notice.student',
          'student',
        )

        .leftJoinAndSelect(
          'notice.created_by',
          'createdBy',
        )

        .leftJoinAndSelect(
          'notice.recipients',
          'recipients',
        )

        .where(
          'notice.active = :active',
          {
            active:
              true,
          },
        )

        .orderBy(
          'notice.created_at',
          'DESC',
        )

        .getMany();

    } catch (
      error: any
    ) {

      throw new HttpException(

        error.response ??
        error.message,

        error.status ??
        HttpStatus
          .INTERNAL_SERVER_ERROR,

      );

    }

  }


  async getMine(
    userId:
      string,
  ) {

    try {

      return await this.repo
        .createQueryBuilder(
          'notice',
        )

        .leftJoinAndSelect(
          'notice.category',
          'category',
        )

        .leftJoinAndSelect(
          'notice.student',
          'student',
        )

        .leftJoinAndSelect(
          'notice.created_by',
          'createdBy',
        )

        .innerJoin(
          'notice.recipients',
          'recipient',
          'recipient.id = :userId',
          {
            userId,
          },
        )

        .where(
          'notice.active = :active',
          {
            active:
              true,
          },
        )

        .orderBy(
          'notice.created_at',
          'DESC',
        )

        .getMany();

    } catch (
      error: any
    ) {

      throw new HttpException(

        error.response ??
        error.message,

        error.status ??
        HttpStatus
          .INTERNAL_SERVER_ERROR,

      );

    }

  }

}
