import {
  Module,
} from '@nestjs/common';
import {
  ConfigService,
} from '@nestjs/config';
import type {
  SignOptions,
} from 'jsonwebtoken';

import {
  JwtModule,
} from '@nestjs/jwt';

import {
  PassportModule,
} from '@nestjs/passport';

import {
  UsersModule,
} from 'src/Users/users.module';

import {
  AuthController,
} from './auth.controller';

import {
  AuthService,
} from './auth.service';

import {
  JwtStrategy,
} from './jwt.strategy';

import {
  JwtAuthGuard,
} from './jwt-auth.guard';


@Module({

  imports: [

    UsersModule,

    PassportModule,

    JwtModule.registerAsync({

      inject: [
        ConfigService,
      ],

      useFactory: (
        configService:
          ConfigService,
      ) => ({

        secret:
          configService
            .getOrThrow<string>(
              'JWT_SECRET',
            ),

        signOptions: {

          expiresIn:
            configService
              .get<
                SignOptions['expiresIn']
              >(
                'JWT_EXPIRES_IN',
              ) ??
            '1d',

        },

      }),

    }),

  ],

  controllers: [

    AuthController,

  ],

  providers: [

    AuthService,

    JwtStrategy,

    JwtAuthGuard,

  ],

  exports: [

    AuthService,

    JwtAuthGuard,

    JwtModule,

  ],

})
export class AuthModule { }