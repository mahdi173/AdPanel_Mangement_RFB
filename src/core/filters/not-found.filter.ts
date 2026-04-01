import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { join } from 'path';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const acceptHeader = request.headers.accept || '';
    
    // For browser requests (GET and accepts HTML) that are 401, 403, or 404, serve 404.html
    // We use sendFile with process.cwd() to ensure it works in all environments
    if (
      request.method === 'GET' && 
      acceptHeader.includes('text/html') &&
      [401, 403, 404].includes(status)
    ) {
      return response.status(status).render('404', { title: '404 - Not Found' });
    }

    // For other requests (e.g., API) or other statuses, return standard JSON
    response.status(status).json(exception.getResponse());
  }
}
