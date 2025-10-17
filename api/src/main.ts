import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config } from 'dotenv';
import { ValidationPipe } from '@nestjs/common';

config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.enableCors({
    origin: ['http://localhost:4000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'X-Requested-With',
      'Accept',
      'Authorization',
      'X-Custom-Header',
    ],
    exposedHeaders: ['Authorization'],
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Tên API')
    .setDescription('Mô tả API')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    // Deeply scan routes so endpoints without explicit Swagger decorators are still included
    deepScanRoutes: true,
  });
  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'API Documentation',
  });

  const port = process.env.PORT ?? 4000;
  if (process.env.NODE_ENV !== 'production') {
    await app.listen(port, () => {
      console.log(`Ứng dụng đang chạy tại: http://localhost:${port}`);
      console.log(`Swagger: http://localhost:${port}/swagger`);
    });
  } else {
    await app.listen(port);
  }
}

bootstrap();
