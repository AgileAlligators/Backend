import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (request.originalUrl.endsWith('health')) {
      response.send(exception.getResponse());
      return;
    }

    const status = exception.getStatus();
    let message = (exception.getResponse() as any).message || exception.message;

    if (status === 401 && message === 'Unauthorized') {
      message = 'Bitte melde dich an, um diesen Endpunkt zu benutzen';
    }

    if (status === 404 && `${message}`.startsWith('Cannot')) {
      message = 'Unbekannter Endpunkt';
    }

    response.status(status).json({
      statusCode: status,
      messages: [message].flat(),
      timestamp: new Date().toString(),
      path: request.url,
    });
  }
}
