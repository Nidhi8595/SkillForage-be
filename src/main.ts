import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

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

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('SkillForge API')
    .setDescription(
      'AI-Driven Skill Gap Analyzer and Micro-Learning Roadmap Generator. ' +
      'Upload a resume, analyze skill gaps against any job role, and get a personalized learning roadmap.'
    )
    .setVersion('1.0')
    .addTag('users', 'User management')
    .addTag('resume', 'Resume upload and parsing')
    .addTag('analysis', 'Skill gap analysis engine')
    .addTag('progress', 'Learning progress tracking')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Serve at /docs (outside the /api prefix)
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,   // shows how long each call takes
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
  SkillForge Backend running
  API:   http://localhost:${port}/api
  Docs:  http://localhost:${port}/docs
  `);
}
bootstrap();
