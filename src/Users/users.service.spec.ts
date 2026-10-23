import {
  UsersService,
} from './users.service';

import {
  UserRole,
} from './user-role.enum';


describe(
  'UsersService invariants',
  () => {

    const repo = {
      findOne:
        jest.fn(),
      find:
        jest.fn(),
      count:
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

    const studentsRepo = {
      find:
        jest.fn(),
    };

    let service:
      UsersService;


    beforeEach(
      () => {

        jest.clearAllMocks();

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
          new UsersService(
            repo as any,
            studentsRepo as any,
          );

      },
    );


    it(
      'rejects student assignments for non-responsible users',
      async () => {

        repo.findOne
          .mockResolvedValue(
            null,
          );


        await expect(

          service.insert({
            name:
              'Profe',
            last_name:
              'Uno',
            email:
              'profe@futgol.test',
            password:
              'secret123',
            phone:
              '123',
            role:
              UserRole.TEACHER,
            active:
              true,
            students: [
              {
                id:
                  'student-1',
              } as any,
            ],
          } as any),

        ).rejects.toMatchObject({
          status:
            400,
        });


        expect(
          studentsRepo.find,
        ).not.toHaveBeenCalled();

      },
    );


    it(
      'prevents changing the last active admin to another role',
      async () => {

        repo.findOne
          .mockResolvedValue({
            id:
              'admin-1',
            name:
              'Admin',
            last_name:
              'Uno',
            email:
              'admin@futgol.test',
            phone:
              '123',
            role:
              UserRole.ADMIN,
            active:
              true,
            students:
              [],
          });

        repo.count
          .mockResolvedValue(
            1,
          );


        await expect(

          service.update(
            'admin-1',
            {
              role:
                UserRole.TEACHER,
            },
          ),

        ).rejects.toMatchObject({
          status:
            409,
        });


        expect(
          repo.save,
        ).not.toHaveBeenCalled();

      },
    );


    it(
      'clears dependents when a responsible changes role',
      async () => {

        repo.findOne
          .mockResolvedValue({
            id:
              'user-1',
            name:
              'Resp',
            last_name:
              'Uno',
            email:
              'resp@futgol.test',
            phone:
              '123',
            role:
              UserRole.RESPONSIBLE,
            active:
              true,
            students: [
              {
                id:
                  'student-1',
              },
            ],
          });


        const result =
          await service.update(
            'user-1',
            {
              role:
                UserRole.TEACHER,
            },
          );


        expect(
          result.role,
        ).toBe(
          UserRole.TEACHER,
        );

        expect(
          result.students,
        ).toEqual(
          [],
        );

      },
    );


    it(
      'prevents disabling the last active admin',
      async () => {

        repo.findOne
          .mockResolvedValue({
            id:
              'admin-1',
            role:
              UserRole.ADMIN,
            active:
              true,
          });

        repo.count
          .mockResolvedValue(
            1,
          );


        await expect(

          service.delete(
            'admin-1',
          ),

        ).rejects.toMatchObject({
          status:
            409,
        });

      },
    );

  },
);
