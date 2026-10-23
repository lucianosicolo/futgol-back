import {
  NestFactory,
} from '@nestjs/core';

import {
  AppModule,
} from './app.module';


async function bootstrap() {

  const app =
    await NestFactory.create(
      AppModule,
    );


  const frontendOrigins =
    (
      process.env.FRONTEND_URL ??
      ''
    )
      .split(',')
      .map(
        origin =>
          origin.trim(),
      )
      .filter(
        origin =>
          origin.length > 0,
      );


  app.enableCors({

    origin: [
      'http://localhost:8100',
      ...frontendOrigins,
    ],

    credentials:
      true,

  });


  await app.listen(
    process.env.PORT ?? 3000,
  );

}


bootstrap();