import {
  UnauthorizedException,
} from '@nestjs/common';

import {
  UserRole,
} from 'src/Users/user-role.enum';


interface AuthenticatedUserRecord {

  id:
    string;

  email:
    string;

  role:
    UserRole;

  active:
    boolean;

}


interface AuthenticatedUserLookup {

  getOne(
    id:
      string,
  ):
    Promise<AuthenticatedUserRecord>;

}


export async function resolveAuthenticatedUser(

  usersService:
    AuthenticatedUserLookup,

  userId:
    string,

) {

  try {

    const user =
      await usersService
        .getOne(
          userId,
        );


    if (
      !user ||
      !user.active
    ) {

      throw new UnauthorizedException(
        'User is inactive',
      );

    }


    return {

      id:
        user.id,

      email:
        user.email,

      role:
        user.role,

    };

  } catch {

    throw new UnauthorizedException(
      'Invalid or inactive user',
    );

  }

}
