import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS
  const corsOrigins = configService
    .get('CORS_ORIGIN', 'http://localhost:3000,http://localhost:3001')
    .split(',');
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // Set global prefix for all routes
  app.setGlobalPrefix('api');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle(
      configService.get('SWAGGER_TITLE', 'Taekwondo Club Management API'),
    )
    .setDescription(
      configService.get(
        'SWAGGER_DESCRIPTION',
        'API documentation for Taekwondo Club Management System',
      ),
    )
    .setVersion(configService.get('SWAGGER_VERSION', '1.0'))
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('clubs', 'Club management')
    .addTag('coaches', 'Coach management')
    .addTag('courses', 'Course management')
    .addTag('enrollments', 'Enrollment management')
    .addTag('payments', 'Payment management')
    .addTag('events', 'Event management')
    .addTag('notifications', 'Notification management')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:3001', 'Development server')
    .addServer('https://api.taekwondoclub.com', 'Production server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
    customSiteTitle: 'Taekwondo Club API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #2c3e50; }
      .swagger-ui .scheme-container { background: #f8f9fa; padding: 10px; border-radius: 5px; }
    `,
  });

  const port = configService.get('PORT', 3001);
  await app.listen(port);

  console.log(` Application is running on: http://localhost:${port}`);
  console.log(` API Base URL: http://localhost:${port}/api`);
  console.log(` Swagger documentation: http://localhost:${port}/docs`);
  console.log(` Environment: ${configService.get('NODE_ENV', 'development')}`);
}

bootstrap();
