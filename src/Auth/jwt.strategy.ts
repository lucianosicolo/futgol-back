import {
  Injectable,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import {
  PassportStrategy,
} from '@nestjs/passport';

import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';

import {
  UserRole,
} from 'src/Users/user-role.enum';

import {
  UsersService,
} from 'src/Users/users.service';

import {
  resolveAuthenticatedUser,
} from './auth-user.validator';


@Injectable()
export class JwtStrategy
  extends PassportStrategy(
    Strategy,
  ) {


  constructor(

    configService:
      ConfigService,

    private readonly usersService:
      UsersService,

  ) {

    super({

      jwtFromRequest:
        ExtractJwt
          .fromAuthHeaderAsBearerToken(),

      ignoreExpiration:
        false,

      secretOrKey:
        configService
          .getOrThrow<string>(
            'JWT_SECRET',
          ),

    });

  }


  async validate(
    payload: {

      sub:
        string;

      email:
        string;

      role:
        UserRole;

    },
  ) {

    return resolveAuthenticatedUser(

      this.usersService,

      payload.sub,

    );

  }

}
