import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config } from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import * as path from 'path';

config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true, // Loại bỏ các properties không được định nghĩa trong DTO
      forbidNonWhitelisted: false, // Cho phép các properties không được định nghĩa (để tránh lỗi khi frontend gửi thêm properties)
      transformOptions: {
        enableImplicitConversion: true, // Tự động convert types
      },
    }),
  );

  // CORS configuration
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? (process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'])
    : ['http://localhost:3000', 'http://localhost:4000', 'http://127.0.0.1:3000'];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, or server-side requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`[CORS] Blocked origin: ${origin}. Allowed origins:`, allowedOrigins);
        }
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'X-Requested-With',
      'Accept',
      'Authorization',
      'X-Custom-Header',
      'Origin',
    ],
    exposedHeaders: ['Authorization'],
    credentials: true,
    maxAge: 86400, // 24 hours
  });

  // Serve static files from uploads directory
  const express = require('express');
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  
  // Serve static files from client/images directory (for avatar and media files)
  // Đường dẫn này phù hợp với database schema: "đường dẫn bắt đầu từ client/images"
  app.use('/client', express.static(path.join(process.cwd(), 'client')));

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
