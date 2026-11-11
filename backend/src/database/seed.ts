import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { DataSource } from 'typeorm';
import { seedDictionaries } from './seeds/dictionaries.seed.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    await seedDictionaries(dataSource);
  } catch (error) {
    console.error('Ошибка при заполнении:', error);
  } finally {
    await app.close();
  }
}

bootstrap();