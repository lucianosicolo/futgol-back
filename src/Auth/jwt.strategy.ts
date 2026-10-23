import {
  Injectable,
  UnauthorizedException,
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

      sub: string;

      email: string;

      role: UserRole;

    },
  ) {

    try {

      /*
       * No confiamos solamente en los datos
       * que quedaron dentro del token.
       *
       * Volvemos a consultar al usuario para
       * que una baja o cambio de rol tenga
       * efecto aunque el JWT todavía no haya
       * vencido.
       */
      const user =
        await this.usersService
          .getOne(
            payload.sub,
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

}
