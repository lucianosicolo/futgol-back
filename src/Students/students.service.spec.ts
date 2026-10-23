import {
  StudentsService,
} from './students.service';

import {
  UserRole,
} from 'src/Users/user-role.enum';


describe(
  'StudentsService invariants',
  () => {

    const repo = {
      findOne:
        jest.fn(),
      find:
        jest.fn(),
      create:
        jest.fn(),
      save:
        jest.fn(),
      merge:
        jest.fn(),
      createQueryBuilder:
        jest.fn(),
    };

    const usersRepo = {
      findOne:
        jest.fn(),
    };

    const categoriesService = {
      getOne:
        jest.fn(),
    };

    let service:
      StudentsService;


    beforeEach(
      () => {

        jest.clearAllMocks();

        repo.create
          .mockImplementation(
            value =>
              value,
          );

        repo.merge
          .mockImplementation(
            (
              entity,
              data,
            ) => ({
              ...entity,
              ...data,
            }),
          );

        repo.save
          .mockImplementation(
            async value =>
              value,
          );

        service =
          new StudentsService(
            repo as any,
            usersRepo as any,
            categoriesService as any,
          );

      },
    );


    it(
      'rejects an inactive category when creating a student',
      async () => {

        repo.findOne
          .mockResolvedValue(
            null,
          );

        categoriesService
          .getOne
          .mockResolvedValue({
            id:
              'category-1',
            active:
              false,
          });


        await expect(

          service.insert({
            name:
              'Alumno',
            last_name:
              'Uno',
            document:
              '123',
            birth_date:
              new Date(
                '2012-01-01',
              ),
            address:
              '',
            avatar:
              '',
            active:
              true,
            category: {
              id:
                'category-1',
            } as any,
            responsibles:
              [],
          }),

        ).rejects.toMatchObject({
          status:
            400,
        });

      },
    );


    it(
      'rejects a non-responsible account linked directly to a student',
      async () => {

        repo.findOne
          .mockResolvedValue(
            null,
          );

        categoriesService
          .getOne
          .mockResolvedValue({
            id:
              'category-1',
            active:
              true,
          });

        usersRepo.findOne
          .mockResolvedValue({
            id:
              'teacher-1',
            active:
              true,
            role:
              UserRole.TEACHER,
          });


        await expect(

          service.insert({
            name:
              'Alumno',
            last_name:
              'Uno',
            document:
              '123',
            birth_date:
              new Date(
                '2012-01-01',
              ),
            address:
              '',
            avatar:
              '',
            active:
              true,
            category: {
              id:
                'category-1',
            } as any,
            user_id:
              'teacher-1',
            responsibles:
              [],
          }),

        ).rejects.toMatchObject({
          status:
            400,
        });

      },
    );


    it(
      'allows explicitly unlinking a student account',
      async () => {

        repo.findOne
          .mockResolvedValue({
            id:
              'student-1',
            document:
              '123',
            active:
              true,
            category: {
              id:
                'category-1',
              active:
                true,
            },
            user: {
              id:
                'responsible-1',
            },
          });


        const result =
          await service.update(
            'student-1',
            {
              user_id:
                null,
            },
          );


        expect(
          result.user,
        ).toBeNull();

      },
    );

  },
);
