import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Автоматически удаляет лишние поля из запроса
      transform: true, // Преобразует типы (например, строку "123" в число)
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Country Insight API')
    .setDescription('API для платформы эксклюзивных городских событий')
    .setVersion('1.0')
    .addBearerAuth() // Для JWT-токенов
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Server running on http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
