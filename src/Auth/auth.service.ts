import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import {
  JwtService,
} from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import {
  UsersService,
} from 'src/Users/users.service';

import {
  AuthDto,
} from './auth.dto';


@Injectable()
export class AuthService {


  constructor(

    private readonly usersService:
      UsersService,

    private readonly jwtService:
      JwtService,

  ) {}


  //! LOGIN ----------------------------------------------------------->

  async login(
    type: AuthDto,
  ) {

    try {


      if (
        !type.email ||
        !type.password
      ) {

        throw new BadRequestException(
          'Email and password are required',
        );

      }


      /* ================================= */
      /* BUSCAR USUARIO                    */
      /* ================================= */

      const user =
        await this.usersService
          .getByEmailWithPassword(
            type.email
              .trim()
              .toLowerCase(),
          );


      if (!user) {

        throw new UnauthorizedException(
          'Invalid email or password',
        );

      }


      /* ================================= */
      /* USUARIO ACTIVO                    */
      /* ================================= */

      if (!user.active) {

        throw new UnauthorizedException(
          'User is inactive',
        );

      }


      /* ================================= */
      /* PASSWORD                          */
      /* ================================= */

      const validPassword =
        await bcrypt.compare(

          type.password,

          user.password,

        );


      if (!validPassword) {

        throw new UnauthorizedException(
          'Invalid email or password',
        );

      }


      /* ================================= */
      /* PAYLOAD JWT                       */
      /* ================================= */

      const payload = {

        sub:
          user.id,

        email:
          user.email,

        role:
          user.role,

      };


      /* ================================= */
      /* TOKEN                             */
      /* ================================= */

      const accessToken =
        await this.jwtService.signAsync(
          payload,
        );


      /* ================================= */
      /* RESPONSE                          */
      /* ================================= */

      return {

        access_token:
          accessToken,

        user: {

          id:
            user.id,

          name:
            user.name,

          last_name:
            user.last_name,

          email:
            user.email,

          phone:
            user.phone,

          role:
            user.role,

          active:
            user.active,

        },

      };


    } catch (error: any) {

      throw new HttpException(

        error.response ??
        error.message,

        error.status ??
        HttpStatus.INTERNAL_SERVER_ERROR,

      );

    }

  }

}