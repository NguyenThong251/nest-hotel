import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: 'http://localhost:3000', // Cho phép FE từ port 3000
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Các phương thức được phép
    allowedHeaders: 'Content-Type, Accept', // Các header được phép
    credentials: true, // Nếu cần gửi cookie hoặc auth
  });
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
