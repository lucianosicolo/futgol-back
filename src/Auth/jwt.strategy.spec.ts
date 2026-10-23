import {
  UnauthorizedException,
} from '@nestjs/common';

import {
  JwtStrategy,
} from './jwt.strategy';

import {
  UserRole,
} from 'src/Users/user-role.enum';


describe(
  'JwtStrategy',
  () => {

    const configService = {

      getOrThrow:
        jest.fn()
          .mockReturnValue(
            'test-secret',
          ),

    };


    const usersService = {

      getOne:
        jest.fn(),

    };


    let strategy:
      JwtStrategy;


    beforeEach(
      () => {

        jest.clearAllMocks();


        strategy =
          new JwtStrategy(

            configService as any,

            usersService as any,

          );

      },
    );


    it(
      'uses the current database role for an active user',
      async () => {

        usersService
          .getOne
          .mockResolvedValue({

            id:
              'user-1',

            email:
              'admin@futgol.com',

            role:
              UserRole.ADMIN,

            active:
              true,

          });


        const result =
          await strategy.validate({

            sub:
              'user-1',

            email:
              'old@futgol.com',

            role:
              UserRole.TEACHER,

          });


        expect(
          result,
        ).toEqual({

          id:
            'user-1',

          email:
            'admin@futgol.com',

          role:
            UserRole.ADMIN,

        });

      },
    );


    it(
      'rejects an inactive user even if the jwt is still valid',
      async () => {

        usersService
          .getOne
          .mockResolvedValue({

            id:
              'user-1',

            email:
              'user@futgol.com',

            role:
              UserRole.RESPONSIBLE,

            active:
              false,

          });


        await expect(

          strategy.validate({

            sub:
              'user-1',

            email:
              'user@futgol.com',

            role:
              UserRole.RESPONSIBLE,

          }),

        ).rejects.toBeInstanceOf(
          UnauthorizedException,
        );

      },
    );

  },
);
