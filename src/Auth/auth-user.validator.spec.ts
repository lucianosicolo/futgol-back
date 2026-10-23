import {
  UnauthorizedException,
} from '@nestjs/common';

import {
  UserRole,
} from 'src/Users/user-role.enum';

import {
  resolveAuthenticatedUser,
} from './auth-user.validator';


describe(
  'resolveAuthenticatedUser',
  () => {

    const usersService = {

      getOne:
        jest.fn(),

    };


    beforeEach(
      () => {

        jest.clearAllMocks();

      },
    );


    it(
      'returns the current database role for an active user',
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


        await expect(

          resolveAuthenticatedUser(

            usersService,

            'user-1',

          ),

        ).resolves.toEqual({

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
      'rejects an inactive user even if an old jwt still exists',
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

          resolveAuthenticatedUser(

            usersService,

            'user-1',

          ),

        ).rejects.toBeInstanceOf(
          UnauthorizedException,
        );

      },
    );

  },
);
