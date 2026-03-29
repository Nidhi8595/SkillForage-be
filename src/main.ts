import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

    app.enableCors();

     // Global validation — validates all DTOs automatically
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,        // strips properties not in DTO
    forbidNonWhitelisted: true, // throws error for unknown properties
    transform: true,        // auto-converts types (string → number etc)
  }));

  // API prefix — all routes become /api/...
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
