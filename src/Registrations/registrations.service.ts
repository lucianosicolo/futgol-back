import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  DataSource,
  In,
  Repository,
} from 'typeorm';

import * as bcrypt from 'bcrypt';

import {
  CategoryEntity,
} from 'src/Categories/category.entity';

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
  StudentRegistrationAccountInput,
  StudentRegistrationDto,
  StudentRegistrationResponsibleInput,
} from './student-registration.dto';


@Injectable()
export class RegistrationsService {


  constructor(
    private readonly dataSource:
      DataSource,
  ) {}


  private requireText(
    value:
      string | undefined,

    field:
      string,
  ):
    string {

    const normalized =
      value
        ?.trim();


    if (!normalized) {

      throw new BadRequestException(
        `${field} is required`,
      );

    }


    return normalized;

  }


  private async createResponsibleUser(

    repo:
      Repository<UserEntity>,

    data:
      StudentRegistrationResponsibleInput,

  ):
    Promise<UserEntity> {

    const name =
      this.requireText(
        data.name,
        'Responsible name',
      );

    const lastName =
      this.requireText(
        data.last_name,
        'Responsible last name',
      );

    const email =
      this.requireText(
        data.email,
        'Responsible email',
      )
        .toLowerCase();

    const phone =
      this.requireText(
        data.phone,
        'Responsible phone',
      );

    const password =
      this.requireText(
        data.password,
        'Responsible password',
      );


    const existing =
      await repo.findOne({

        where: {
          email,
        },

      });


    if (existing) {

      throw new ConflictException(
        'User already exists',
      );

    }


    const hash =
      await bcrypt.hash(
        password,
        10,
      );


    const user =
      repo.create({

        name,

        last_name:
          lastName,

        email,

        phone,

        password:
          hash,

        role:
          UserRole.RESPONSIBLE,

        active:
          true,

        students:
          [],

      });


    return await repo.save(
      user,
    );

  }


  private async createSelfUser(

    repo:
      Repository<UserEntity>,

    student: {
      name:
        string;

      last_name:
        string;
    },

    data:
      StudentRegistrationAccountInput,

  ):
    Promise<UserEntity> {

    return this.createResponsibleUser(
      repo,
      {
        name:
          student.name,

        last_name:
          student.last_name,

        email:
          data.email,

        phone:
          data.phone,

        password:
          data.password,
      },
    );

  }


  private sanitizeUser(
    user:
      UserEntity | null,
  ) {

    if (!user) {
      return null;
    }


    const {
      password:
        _password,

      ...safeUser
    } =
      user as UserEntity & {
        password:
          string;
      };


    return safeUser;

  }


  async registerStudent(
    type:
      StudentRegistrationDto,
  ) {

    if (
      !type ||
      !type.student
    ) {

      throw new BadRequestException(
        'Student data is required',
      );

    }


    const validModes = [
      'none',
      'self',
      'responsible',
    ];


    if (
      !validModes.includes(
        type.access_mode,
      )
    ) {

      throw new BadRequestException(
        'Invalid access mode',
      );

    }


    try {

      return await this.dataSource
        .transaction(

          async manager => {

            const studentRepo =
              manager.getRepository(
                StudentEntity,
              );

            const userRepo =
              manager.getRepository(
                UserEntity,
              );

            const categoryRepo =
              manager.getRepository(
                CategoryEntity,
              );


            const name =
              this.requireText(
                type.student.name,
                'Student name',
              );

            const lastName =
              this.requireText(
                type.student.last_name,
                'Student last name',
              );

            const document =
              this.requireText(
                type.student.document,
                'Student document',
              );

            const birthDate =
              this.requireText(
                type.student.birth_date,
                'Student birth date',
              );

            const categoryId =
              this.requireText(
                type.student.category_id,
                'Category',
              );


            const existingStudent =
              await studentRepo.findOne({

                where: {
                  document,
                },

              });


            if (existingStudent) {

              throw new ConflictException(
                'Student already exists',
              );

            }


            const category =
              await categoryRepo.findOne({

                where: {
                  id:
                    categoryId,

                  active:
                    true,
                },

              });


            if (!category) {

              throw new NotFoundException(
                'Active category not found',
              );

            }


            let directUser:
              UserEntity | null =
              null;

            let responsible:
              UserEntity | null =
              null;


            if (
              type.access_mode ===
              'self'
            ) {

              if (!type.self_account) {

                throw new BadRequestException(
                  'Self account data is required',
                );

              }


              directUser =
                await this.createSelfUser(

                  userRepo,

                  {
                    name,
                    last_name:
                      lastName,
                  },

                  type.self_account,

                );

            }


            if (
              type.access_mode ===
              'responsible'
            ) {

              if (
                type.responsible_mode ===
                'existing'
              ) {

                const responsibleId =
                  this.requireText(
                    type.responsible_user_id,
                    'Responsible user',
                  );


                responsible =
                  await userRepo.findOne({

                    where: {
                      id:
                        responsibleId,

                      role:
                        UserRole.RESPONSIBLE,

                      active:
                        true,
                    },

                    relations: {
                      students:
                        true,
                    },

                  });


                if (!responsible) {

                  throw new NotFoundException(
                    'Active responsible user not found',
                  );

                }

              } else if (
                type.responsible_mode ===
                'new'
              ) {

                if (
                  !type.responsible_account
                ) {

                  throw new BadRequestException(
                    'Responsible account data is required',
                  );

                }


                responsible =
                  await this.createResponsibleUser(

                    userRepo,

                    type.responsible_account,

                  );

              } else {

                throw new BadRequestException(
                  'Invalid responsible mode',
                );

              }

            }


            let dependents:
              StudentEntity[] =
              [];


            if (
              type.access_mode ===
                'self' &&
              (
                type.dependent_student_ids
                  ?.length ??
                0
              ) > 0
            ) {

              const dependentIds =
                [
                  ...new Set(
                    type.dependent_student_ids,
                  ),
                ]
                  .filter(
                    id =>
                      !!id,
                  );


              if (
                dependentIds.length !==
                type.dependent_student_ids!
                  .length
              ) {

                throw new BadRequestException(
                  'Invalid dependent students',
                );

              }


              dependents =
                await studentRepo.find({

                  where: {
                    id:
                      In(
                        dependentIds,
                      ),

                    active:
                      true,
                  },

                });


              if (
                dependents.length !==
                  dependentIds.length
              ) {

                throw new NotFoundException(
                  'One or more dependent students were not found',
                );

              }

            }


            const student =
              studentRepo.create({

                name,

                last_name:
                  lastName,

                document,

                birth_date:
                  birthDate as any,

                address:
                  type.student.address
                    ?.trim() ??
                  '',

                avatar:
                  '',

                active:
                  true,

                category,

                user:
                  directUser,

              });


            const savedStudent =
              await studentRepo.save(
                student,
              );


            if (
              directUser &&
              dependents.length > 0
            ) {

              directUser.students =
                dependents;


              await userRepo.save(
                directUser,
              );

            }


            if (responsible) {

              responsible.students =
                [
                  ...(
                    responsible.students ??
                    []
                  ),

                  savedStudent,
                ];


              await userRepo.save(
                responsible,
              );

            }


            return {

              student:
                savedStudent,

              user:
                this.sanitizeUser(
                  directUser,
                ),

              responsible:
                this.sanitizeUser(
                  responsible,
                ),

            };

          },

        );

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
