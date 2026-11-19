import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm'; // <-- Импортируем ошибку TypeORM

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Внутренняя ошибка сервера';

    // 1. Обработка стандартных HTTP-ошибок NestJS (404, 400, 403 и т.д.)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } 
    // 2. Обработка ошибок базы данных (TypeORM)
    else if (exception instanceof QueryFailedError) {
      const pgCode = (exception as any).code;
      
      // Ошибка уникальности (дубликат поля)
      if (pgCode === '23505') {
        status = HttpStatus.CONFLICT; // 409
        message = 'Запись с такими уникальными данными уже существует (например, email или название)';
      } 
      // Ошибка внешнего ключа (нельзя удалить запись, на которую ссылаются)
      else if (pgCode === '23503') {
        status = HttpStatus.BAD_REQUEST; // 400
        message = 'Нельзя выполнить действие, так как запись уже используется';
      }
      // Другие ошибки БД
      else {
        this.logger.error(`Ошибка БД [${pgCode}]: ${exception.message}`, exception.stack);
        message = 'Ошибка при работе с базой данных';
      }
    } 
    // 3. Неизвестные ошибки (500)
    else if (exception instanceof Error) {
      this.logger.error(
        `[${request.method}] ${request.url} - ${exception.message}`,
        exception.stack,
      );
    }

    // Формируем красивый ответ
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: typeof message === 'object' && 'message' in message 
        ? (message as any).message 
        : message,
    };

    response.status(status).json(errorResponse);
  }
}