import {
  RegistrationsService,
} from './registrations.service';

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


describe(
  'RegistrationsService',
  () => {

    const studentRepo = {
      findOne:
        jest.fn(),
      find:
        jest.fn(),
      create:
        jest.fn(),
      save:
        jest.fn(),
    };

    const userRepo = {
      findOne:
        jest.fn(),
      create:
        jest.fn(),
      save:
        jest.fn(),
    };

    const categoryRepo = {
      findOne:
        jest.fn(),
    };

    const manager = {
      getRepository:
        jest.fn(),
    };

    const dataSource = {
      transaction:
        jest.fn(),
    };

    let service:
      RegistrationsService;


    beforeEach(
      () => {

        jest.clearAllMocks();


        manager.getRepository
          .mockImplementation(
            entity => {

              if (
                entity ===
                StudentEntity
              ) {
                return studentRepo;
              }

              if (
                entity ===
                UserEntity
              ) {
                return userRepo;
              }

              if (
                entity ===
                CategoryEntity
              ) {
                return categoryRepo;
              }

              throw new Error(
                'Unexpected repository',
              );

            },
          );


        dataSource.transaction
          .mockImplementation(
            async callback =>
              callback(
                manager,
              ),
          );


        studentRepo.create
          .mockImplementation(
            value =>
              value,
          );

        studentRepo.save
          .mockImplementation(
            async value => ({
              id:
                'student-new',
              ...value,
            }),
          );

        userRepo.create
          .mockImplementation(
            value =>
              value,
          );

        userRepo.save
          .mockImplementation(
            async value => ({
              id:
                value.id ??
                'user-new',
              ...value,
            }),
          );


        service =
          new RegistrationsService(
            dataSource as any,
          );

      },
    );


    it(
      'creates self account and student inside the same transaction',
      async () => {

        studentRepo.findOne
          .mockResolvedValue(
            null,
          );

        categoryRepo.findOne
          .mockResolvedValue({
            id:
              'category-1',
            active:
              true,
          });

        userRepo.findOne
          .mockResolvedValue(
            null,
          );


        const result =
          await service
            .registerStudent({

              student: {
                name:
                  'Juan',
                last_name:
                  'Perez',
                document:
                  '123',
                birth_date:
                  '2012-01-01',
                address:
                  '',
                category_id:
                  'category-1',
              },

              access_mode:
                'self',

              self_account: {
                email:
                  'juan@test.com',
                phone:
                  '123',
                password:
                  'secret123',
              },

            });


        expect(
          dataSource.transaction,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          userRepo.save,
        ).toHaveBeenCalled();

        expect(
          studentRepo.save,
        ).toHaveBeenCalledWith(

          expect.objectContaining({

            user:
              expect.objectContaining({

                role:
                  UserRole.RESPONSIBLE,

              }),

          }),

        );

        expect(
          result.student.id,
        ).toBe(
          'student-new',
        );

      },
    );


    it(
      'links a new student to an existing active responsible',
      async () => {

        studentRepo.findOne
          .mockResolvedValue(
            null,
          );

        categoryRepo.findOne
          .mockResolvedValue({
            id:
              'category-1',
            active:
              true,
          });

        const responsible = {
          id:
            'responsible-1',
          role:
            UserRole.RESPONSIBLE,
          active:
            true,
          students:
            [],
        };

        userRepo.findOne
          .mockResolvedValue(
            responsible,
          );


        await service
          .registerStudent({

            student: {
              name:
                'Alumno',
              last_name:
                'Dos',
              document:
                '456',
              birth_date:
                '2013-02-02',
              address:
                '',
              category_id:
                'category-1',
            },

            access_mode:
              'responsible',

            responsible_mode:
              'existing',

            responsible_user_id:
              'responsible-1',

          });


        expect(
          userRepo.save,
        ).toHaveBeenCalledWith(

          expect.objectContaining({

            id:
              'responsible-1',

            students:
              expect.arrayContaining([

                expect.objectContaining({
                  id:
                    'student-new',
                }),

              ]),

          }),

        );

      },
    );


    it(
      'does not save anything when the category is not active',
      async () => {

        studentRepo.findOne
          .mockResolvedValue(
            null,
          );

        categoryRepo.findOne
          .mockResolvedValue(
            null,
          );


        await expect(

          service.registerStudent({

            student: {
              name:
                'Alumno',
              last_name:
                'Tres',
              document:
                '789',
              birth_date:
                '2014-03-03',
              address:
                '',
              category_id:
                'category-off',
            },

            access_mode:
              'none',

          }),

        ).rejects.toMatchObject({
          status:
            404,
        });


        expect(
          userRepo.save,
        ).not.toHaveBeenCalled();

        expect(
          studentRepo.save,
        ).not.toHaveBeenCalled();

      },
    );

  },
);
